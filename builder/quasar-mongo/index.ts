import { BuilderImpl, Package, I18N, Lang, Ast } from "../typesDef";
import { join } from 'path'
import { createSourceWriter, writeFile, SourcePartWriter } from '../sys';
import { fail } from 'assert';

export const quasarMongo: BuilderImpl = {
  async buildApp (ws, app, info) {
    const appDir = join(ws.rootDir, info.config.rootDir, '/src/components/archol')
    const appIndex = createSourceWriter(appDir + '/index.ts')
    const pkgnames: string[] = []
    for (const pkg of app.packageList) {
      appIndex.writeln('import * as ' + pkg.uri.id + ' from \'./' + pkg.uri.id + '\'')
      const pkgIndex = createSourceWriter(appDir + '/' + pkg.uri.id + '/index.ts')
      pkgnames.push(pkg.uri.id)
      pkgIndex.writeln('import * as types from \'./types\'')
      pkgIndex.writeln('import * as documents from \'./documents\'')
      pkgIndex.writeln('import * as processes from \'./processes\'')
      saveTypes(pkg)
      saveDocs(pkg)
      saveProcesses(pkg)
      pkgIndex.save()
    }

    appIndex.writeln('export {' + app.packageList.map((p) => p.uri.id + '}'))
    appIndex.save()

    function saveI18N<T> (w: SourcePartWriter, obj: T, prop: keyof T, allowParams: boolean) {
      if (allowParams) throw new Error('todo')
      const val: I18N = obj[prop]
      w.writeln(prop + ': {')
      w.ident()
      for (const lang of app.langs) save(lang)
      w.writeln('},')
      w.identBack()
      function save (lang: Lang) {
        const lval = val[lang]
        if (!lval) throw new Error('falta traducao')
        w.writeln(lang + ': () => \'' + lval.msg + '\',')
      }
    }

    function saveAST<T> (w: SourcePartWriter, obj: T, prop: keyof T) {
      const ast: Ast = obj[prop] as any
      if (ast) {
        const m = ast.func
        const params = m.getParameters().map((p) => p.getName() + ':' + p.getType().getText())
        const code = m.getBodyText()
        if (code) {
          w.writeln(m.getName() + '(' + params.join(',') + ') {');
          w.ident()
          w.writeln(code)
          w.identBack()
          w.writeln('}')
        } else fail('AST inválido')
      }
    }

    function saveProcesses (pkg: Package) {
      const w = createSourceWriter(appDir + '/' + pkg.uri.id + '/processes.ts')
      w.writeln('import { Process } from \'../../archollib\'')
      for (const p of pkg.processes) {
        w.writeln('export const ' + p.name + ': Process = {')
        w.ident()
        w.writeln('pid: \'' + pkg.uri.id + '.' + p.name + '\',')
        saveI18N(w, p, 'title', false)
        saveI18N(w, p, 'caption', false)
        w.writeln('icon: \'' + p.icon + '\',')
        w.writeln('volatile: ' + (p.volatile ? 'true' : 'false') + ',')
        w.identBack()
        w.writeln('}')
      }
      w.writeln('')
      w.writeln('export const allProcesses = [' + pkg.processes.map((p) => p.name).join(',') + ']')
      w.save()
    }

    function saveTypes (pkg: Package) {
      const w = createSourceWriter(appDir + '/' + pkg.uri.id + '/types.ts')
      w.writeln('import { Type } from \'../../archollib\'')
      for (const t of pkg.types) {
        w.writeln('export const ' + t.name + ': Type = {')
        w.ident()
        w.writeln('tid: \'' + pkg.uri.id + '.' + t.name + '\',')
        w.writeln('base: \'' + t.base + '\',')

        saveAST(w, t, 'validate')
        saveAST(w, t, 'format')
        saveAST(w, t, 'parse')

        w.identBack()
        w.writeln('}')
      }
      w.writeln('')
      w.writeln('export const allTypes = [' + pkg.types.map((p) => p.name).join(',') + ']')
      w.save()
    }

    function saveDocs (pkg: Package) {
      return
    }
  }
}
