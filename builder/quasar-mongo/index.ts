import { BuilderImpl, Package, I18N, Lang, Ast } from "../typesDef";
import { join } from 'path'
import { writeLines } from '../sys';

export const quasarMongo: BuilderImpl = {
  async buildApp (ws, app, info) {
    const appDir = join(ws.rootDir, info.config.rootDir, '/src/components/archol')
    const indexlines: string[] = []
    const pkgnames: string[] = []
    // for (const pkguri of app.uses) {
    //   pkgnames.push(pkg.uri.id)
    //   indexlines.push('import * as types from \'./' + pkg.uri.id + '/types\'')
    //   indexlines.push('import * as documents from \'./' + pkg.uri.id + '/documents\'')
    //   indexlines.push('import * as processes from \'./' + pkg.uri.id + '/processes\'')
    //   saveTypes(pkg)
    //   saveDocs(pkg)
    //   saveProcesses(pkg)
    // }
    saveAppIndex()
    function saveAppIndex () {
      indexlines.push('export {types, documents, processes}')
      writeLines(appDir + '/index.ts', indexlines)
    }

    function saveI18N<T> (lines: string[], ident: string, obj: T, prop: keyof T, allowParams: boolean) {
      if (allowParams) throw new Error('todo')
      const val: I18N = obj[prop]
      lines.push(ident + prop + ': {')
      for (const lang of app.langs) save(lang)
      lines.push(ident + '},')
      function save (lang: Lang) {
        const lval = val[lang]
        if (!lval) throw new Error('falta traducao')
        lines.push(ident + '  ' + lang + ': () => \'' + lval.msg + '\',')
      }
    }

    function saveAST<T> (lines: string[], ident: string, obj: T, prop: keyof T) {
      const ast: Ast = obj[prop] as any
      if (ast) {
        const m = ast.func
        const params = m.getParameters().map((p) => p.getName() + ':' + p.getType().getText())
        lines.push(ident + m.getName() + '(' + params.join(',') + ') {' + m.getBodyText() + '}')
      }
    }

    function saveProcesses (pkg: Package) {
      const lines: string[] = ['import { Process } from \'../../archollib\'']
      for (const p of pkg.processes) {
        lines.push(
          'export const ' + p.name + ': Process = {',
          '  pid: \'' + pkg.uri.id + '.' + p.name + '\',',
        )
        saveI18N(lines, '  ', p, 'title', false)
        saveI18N(lines, '  ', p, 'caption', false)
        lines.push('  icon: \'' + p.icon + '\',')
        lines.push('  volatile: ' + (p.volatile ? 'true' : 'false') + ',')
        lines.push('}')
      }
      lines.push('')
      lines.push('export const allProcesses = [' + pkg.processes.map((p) => p.name).join(',') + ']')
      writeLines(appDir + '/' + pkg.uri.id + '/processes.ts', lines)
    }

    function saveTypes (pkg: Package) {
      const lines: string[] = ['import { Type } from \'../../archollib\'']
      for (const t of pkg.types) {
        lines.push(
          'export const ' + t.name + ': Type = {',
          '  tid: \'' + pkg.uri.id + '.' + t.name + '\',',
          '  base: \'' + t.base + '\',',
        )

        saveAST(lines, '  ', t, 'validate')
        saveAST(lines, '  ', t, 'format')
        saveAST(lines, '  ', t, 'parse')

        lines.push('}')
      }
      lines.push('')
      lines.push('export const allTypes = [' + pkg.types.map((p) => p.name).join(',') + ']')
      writeLines(appDir + '/' + pkg.uri.id + '/types.ts', lines)
    }

    function saveDocs (pkg: Package) {
      return
      const lines: string[] = ['import { Document } from \'../../archollib\'']
      for (const d of pkg.documents) {
        lines.push(
          'export const ' + d.name + ': Process = {',
          '  did: \'' + pkg.uri.id + '.' + d.name + '\',',
        )
        lines.push('}')
      }
      lines.push('')
      lines.push('export const processes = [' + pkg.processes.map((p) => p.name).join(',') + ']')
      writeLines(appDir + '/' + pkg.uri.id + '/docs.ts', lines)
    }
  }
}
