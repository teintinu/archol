import { Builder, Package, I18N, Lang } from "../typesDef";
import { join, resolve } from 'path'
import { Project } from "ts-morph";
import { writeFile, writeLines } from '../sys';

export const quasarMongo: Builder = {
  async buildApp (ws, app, cfg, onlyLang) {
    const appDir = join(ws.rootDir, cfg.rootDir, '/src/components/archol')
    const indexlines: string[] = []
    const pkgnamesx: string[] = []
    for (const pkgname of app.uses) {
      const pkg = await ws.getPkg(pkgname)
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

    function saveI18N<T extends object> (lines: string[], ident: string, obj: T, prop: keyof T, allowParams: boolean) {
      if (allowParams) throw new Error('todo')
      const val = i18n(obj, prop)
      lines.push(ident + prop + ': {')
      if (onlyLang) save(onlyLang)
      else for (const lang of app.langs) save(lang)
      lines.push(ident + '},')
      function save (lang: Lang) {
        const lval = val[lang]
        if (!lval) throw new Error('no translation')
        lines.push(ident + '  ' + lang + ': () => \'' + lval + '\',')
      }
    }

    function saveProcesses (pkg: Package) {
      const lines: string[] = ['import { Process } from \'../../archollib\'']
      const processes = Object.keys(pkg.processes)
      for (const processName of processes) {
        const p = pkg.processes[processName]
        lines.push(
          'export const ' + processName + ': Process = {',
          '  pid: \'' + pkg.name + '.' + processName + '\',',
        )
        saveI18N(lines, '  ', p, 'title', false)
        saveI18N(lines, '  ', p, 'caption', false)
        lines.push('  icon: \'' + p.icon + '\',')
        lines.push('  volatile: ' + (p.volatile ? 'true' : 'false') + ',')
        lines.push('}')
      }
      lines.push('')
      lines.push('export const processes = [' + processes.join(',') + ']')
      writeLines(appDir + '/' + pkg.name + '/processes.ts', lines)
    }
  }
}
