import { BuilderImpl, Package, I18N, Lang, Ast, Field } from "../typesDef";
import { join } from 'path'
import { createSourceWriter, writeFile, SourcePartWriter } from '../sys';
import { fail } from 'assert';

export const quasarMongo: BuilderImpl = {
  async buildApp (ws, app, info) {
    const appDir = join(ws.rootDir, info.config.rootDir, '/src/components/archol')
    const w = createSourceWriter(appDir + '/index.ts')
    w.writeln('import { Type, Document, Process } from \'../archollib\'')

    app.packageList.forEach(savePackage)

    w.save()

    function saveI18N<T> (obj: T, prop: keyof T, allowParams: boolean) {
      if (allowParams) throw new Error('todo')
      const val: I18N = obj[prop]
      w.writeln(prop + ': {')
      w.ident()
      for (const lang of app.langs) save(lang)
      w.identBack()
      w.writeln('},')
      function save (lang: Lang) {
        const lval = val[lang]
        if (!lval) throw new Error('falta traducao')
        w.writeln(lang + ': () => \'' + lval.msg + '\',')
      }
    }

    function saveAST<T> (obj: T, prop: keyof T) {
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

    function vboolean (b: boolean) {
      return b ? 'true' : 'false'
    }

    function savePackage (pkg: Package) {
      saveTypes()
      saveDocs()
      saveProcesses()

      function saveProcesses () {
        w.writeln('')
        for (const p of pkg.processes) {
          w.writeln('export const ' + pkg.uri.id + '_p_' + p.name + ' = {')
          w.ident()
          w.writeln('pId: \'' + pkg.uri.full + '/' + p.name + '\',')
          saveI18N(p, 'title', false)
          saveI18N(p, 'caption', false)
          w.writeln('icon: \'' + p.icon + '\',')
          w.writeln('volatile: ' + (p.volatile ? 'true' : 'false') + ',')
          w.identBack()
          w.writeln('}')
        }
        w.writeln('export const allProcesses: Process[] = [' + pkg.processes.map((p) => pkg.uri.id + '_p_' + p.name).join(',') + ']')
      }

      function saveTypes () {
        w.writeln('')
        for (const t of pkg.types) {
          w.writeln('export const ' + pkg.uri.id + '_t_' + t.name + ' = {')
          w.ident()
          w.writeln('tId: \'' + pkg.uri.full + '/' + t.name + '\',')
          w.writeln('base: \'' + t.base + '\',')

          saveAST(t, 'validate')
          saveAST(t, 'format')
          saveAST(t, 'parse')

          w.identBack()
          w.writeln('}')
        }
        w.writeln('export const allTypes: Type[] = [' + pkg.types.map((t) => pkg.uri.id + '_t_' + t.name).join(',') + ']')
      }

      function saveDocs () {
        w.writeln('')
        for (const d of pkg.documents) {
          w.writeln('export const ' + pkg.uri.id + '_d_' + d.name + ' = (()=> {')
          w.ident()
          d.fields.forEach((f) => {
            w.writeln('const ' + f.name + ' = {')
            w.ident()
            w.writeln('name: \'' + f.name + '\',')
            w.writeln('primary: ' + vboolean(f.primary) + ',')
            w.writeln('type: ' + pkg.uri.id + '_t_' + f.type.name + ',')
            w.identBack()
            w.writeln('}')
          })
          w.writeln('return {')
          w.ident()
          w.writeln('dId: \'' + pkg.uri.full + '/' + d.name + '\',')
          w.writeln('volatile: ' + vboolean(d.persistence === 'session') + ',')
          w.writeln('fields: [' + d.fields.map((f) => f.name).join(',') + '],')
          w.writeln('indexes: [')
          w.ident()
          d.indexes.map((i) => {
            w.writeln('{')
            w.ident()
            if (i.name) w.writeln('name: \'' + i.name + '\',')
            w.writeln('fields: [')
            w.ident()
            i.fields.map((fi) => {
              w.writeln('{')
              w.ident()
              w.writeln('field: ' + fi.field.name + ',')
              w.writeln('flag: \'' + fi.flag + '\',')
              w.identBack()
              w.writeln('},')
            })
            w.identBack()
            w.writeln(']')
            w.identBack()
            w.writeln('},')
          })
          w.identBack()
          w.writeln(']')
          w.identBack()
          w.writeln('}')
          w.identBack()
          w.writeln('})()')
        }
        w.writeln('export const allDocuments: Document[] = [' + pkg.documents.map((d) => pkg.uri.id + '_d_' + d.name).join(',') + ']')
      }
    }
  }
}
