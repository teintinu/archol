import { BuilderImpl, Package, I18N, Lang, Ast, Field } from "../typesDef";
import { join } from 'path'
import { createSourceWriter, writeFile, SourcePartWriter } from '../sys';
import { fail } from 'assert';

export const quasarNodeTsx: BuilderImpl = {
  async buildApp (ws, app, info) {

    await generate(join(ws.rootDir, info.config.rootDir, '/server'), { isServer: true })
    await generate(join(ws.rootDir, info.config.rootDir, '/client'), { isClient: true })

    async function generate (appDir: string, { }: { isServer?: boolean, isClient?: boolean }) {
      const w = createSourceWriter(appDir + '/arch.ts')
      w.writeln('import { Type, Document, Process, DocIdentification } from \'../archollib\'')

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

      function saveAST<T> (obj: T, thistype: string, prop: keyof T) {
        const ast: Ast = obj[prop] as any
        if (ast) {
          const m = ast.func
          const params = m.getParameters().map((p) => p.getName() + ':' + p.getType().getText())
          if (thistype) params.unshift('this: ' + thistype)
          const code = m.getBodyText()
          if (code) {
            w.writeln((m.getAsyncKeyword() ? 'async ' : '') + m.getName() + '(' + params.join(',') + '): ' + m.getReturnType().getText() + ' {');
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
        saveGlobals()
        saveTypes()
        saveDocs()
        saveProcesses()

        function saveGlobals () {
          w.writeln('export const identificationGUID: DocIdentification = {')
          w.ident()
          w.writeln('gen: \'TODO\'')
          w.identBack()
          w.writeln('}')
        }

        function saveProcesses () {
          w.writeln('')
          for (const p of pkg.processes) {
            w.writeln('export const ' + p.getMappedId(app) + ' = {')
            w.ident()
            w.writeln('pId: \'' + p.getMappedId(app) + '\',')
            w.writeln('uri: \'' + pkg.uri.full + '#' + p.name + '\',')
            saveI18N(p, 'title', false)
            saveI18N(p, 'caption', false)
            w.writeln('icon: \'' + p.icon + '\',')
            w.writeln('volatile: ' + (p.volatile ? 'true' : 'false') + ',')
            w.identBack()
            w.writeln('}')
          }
          w.writeln('export const allProcesses: Process[] = [' + pkg.processes.map((p) => p.getMappedId(app)).join(',') + ']')
        }

        function saveTypes () {
          w.writeln('')
          for (const t of pkg.types) {
            w.writeln('export const ' + t.getMappedId(app) + ' = {')
            w.ident()
            w.writeln('tId: \'' + t.getMappedId(app) + '\',')
            w.writeln('uri: \'' + pkg.uri.full + '#' + t.name + '\',')
            w.writeln('base: \'' + t.base + '\',')

            saveAST(t, 'void', 'validate')
            saveAST(t, 'void', 'format')
            saveAST(t, 'void', 'parse')

            w.identBack()
            w.writeln('}')
          }
          w.writeln('export const allTypes: Type[] = [' + pkg.types.map((t) => t.getMappedId(app)).join(',') + ']')
        }

        function saveDocs () {
          w.writeln('')
          for (const d of pkg.documents) {
            w.writeln('export interface I' + d.getMappedId(app) + ' {')
            w.ident()
            d.fields.forEach((f) => w.writeln(f.name + ': ' + f.type.base))
            w.identBack()
            w.writeln('}')
            w.writeln('export const ' + d.getMappedId(app) + ' = (()=> {')
            w.ident()
            d.fields.forEach((f) => {
              w.writeln('const f' + f.name + ' = {')
              w.ident()
              w.writeln('name: \'' + f.name + '\',')
              w.writeln('primary: ' + vboolean(f.primary) + ',')
              w.writeln('type: ' + f.type.getMappedId(app) + ',')
              w.identBack()
              w.writeln('}')
            })
            d.states.forEach((st) => {
              w.writeln('const s' + st.name + ' = {')
              w.ident()
              w.writeln('name: \'' + st.name + '\',')
              w.writeln('icon: \'' + st.icon + '\',')
              saveI18N(st, "description", false)
              w.identBack()
              w.writeln('}')
            })
            w.writeln('return {')
            w.ident()
            w.writeln('dId: \'' + d.getMappedId(app) + '\',')
            w.writeln('uri: \'' + pkg.uri.full + '/' + d.name + '\',')
            w.writeln('identification: identification' + d.identification + ',')
            w.writeln('volatile: ' + vboolean(d.persistence === 'session') + ',')
            w.writeln('states: [' + d.states.map((st) => 's' + st.name).join(',') + '],')
            w.writeln('fields: [' + d.fields.map((f) => 'f' + f.name).join(',') + '],')

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
                w.writeln('field: f' + fi.field.name + ',')
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
            w.writeln('],')

            w.writeln('actions: [')
            w.ident()
            d.actions.map((a) => {
              w.writeln('{')
              w.ident()
              w.writeln('name: \'' + a.name + '\',')
              if (a.from)
                w.writeln('from: [' + a.from.map((asn) => 's' + asn.name).join() + '],')
              if (a.to)
                w.writeln('to: [' + a.to.map((asn) => 's' + asn.name).join() + '],')
              w.writeln('icon: \'' + a.icon + '\',')
              saveI18N(a, "description", false)
              saveAST(a, 'I' + d.getMappedId(app), 'run')
              w.identBack()
              w.writeln('},')
            })
            w.identBack()
            w.writeln('],')

            w.identBack()
            w.writeln('}')
            w.identBack()
            w.writeln('})()')
          }
          w.writeln('export const allDocuments: Document[] = [' + pkg.documents.map((d) => d.getMappedId(app)).join(',') + ']')
        }
      }
    }
  }
}
