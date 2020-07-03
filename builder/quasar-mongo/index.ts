import { BuilderImpl, Package, I18N, Lang, Process } from "../typesDef";
import { join, resolve } from 'path'
import { Project } from "ts-morph";
import { writeFile, writeLines } from '../sys';

export const quasarMongo: BuilderImpl = {
  async buildApp (ws, app, info) {
    const appDir = join(ws.rootDir, info.config.rootDir, '/src/components/archol')
    const indexlines: string[] = []
    const pkgnames: string[] = []
    for (const pkg of app.uses) {
      pkgnames.push(pkg.name)
      indexlines.push('import { processes as ' + pkg.name + ' } from \'./' + pkg.name + '/processes\'')
      saveProcesses(pkg)
    }
    saveAppIndex()
    function saveAppIndex () {
      indexlines.push('export const allProcesses = [' +
        pkgnames.map((p) => '...' + p).join(',') + ']'
      )
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

    function saveProcesses (pkg: Package) {
      const lines: string[] = ['import { Process } from \'../../archollib\'']
      for (const p of pkg.processes) {
        lines.push(
          'export const ' + p.name + ': Process = {',
          '  pid: \'' + pkg.name + '.' + p.name + '\',',
        )
        saveI18N(lines, '  ', p, 'title', false)
        saveI18N(lines, '  ', p, 'caption', false)
        lines.push('  icon: \'' + p.icon + '\',')
        lines.push('  volatile: ' + (p.volatile ? 'true' : 'false') + ',')
        lines.push('}')
      }
      lines.push('')
      lines.push('export const processes = [' + pkg.processes.map((p) => p.name).join(',') + ']')
      writeLines(appDir + '/' + pkg.name + '/processes.ts', lines)
    }
  }
}
