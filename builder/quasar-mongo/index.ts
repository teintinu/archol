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
        w.writeln('')
        w.writeln('export const allProcesses: Process[] = [' + pkg.processes.map((p) => pkg.uri.id + '_p_' + p.name).join(',') + ']')
        w.save()
      }

      function saveTypes () {
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
        w.writeln('')
        w.writeln('export const allTypes: Type[] = [' + pkg.types.map((t) => pkg.uri.id + '_t_' + t.name).join(',') + ']')
        w.save()
      }

      function saveDocs () {
        for (const d of pkg.documents) {
          w.writeln('export const ' + pkg.uri.id + '_d_' + d.name + ' = {')
          w.ident()
          w.writeln('dId: \'' + pkg.uri.full + '/' + d.name + '\',')
          w.writeln('volatile: ' + vboolean(d.persistence === 'session') + ',')
          w.writeln('validation: {')
          w.ident()
          d.primaryFields.forEach(validateField)
          w.identBack()
          w.writeln('}')
          w.identBack()
          w.writeln('}')
        }
        w.writeln('')
        w.writeln('export const allDocuments: Document[] = [' + pkg.documents.map((d) => pkg.uri.id + '_d_' + d.name).join(',') + ']')
        w.save()
      }

      function validateField (f: Field) {
        if (f.type.validate)
          w.writeln(f.name + ': (val:any) => ' + pkg.uri.id + '_t_' + f.type.name + '.validate(val),')
        else
          w.writeln(f.name + ': false')
      }
    }
  }
}
