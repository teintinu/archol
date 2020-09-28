import { DefWorkspace, BuilderImpl } from '../typesDef';
import * as decl from '../typesDecl'
import { createSourceWriter } from '../sys';
import { genapp } from './app';
import { genpkg } from './pkg';

export const wsDecl: BuilderImpl = {
  async buildApp (ws, app) {
    const w = createSourceWriter(ws.rootDir + '/decl.d.ts')
    w.writeln('/* eslint-disable */')

    const packageuris: decl.PackageURI[] = Object.keys(ws.decl.pkgs) as any

    await genapp(
      w,
      ws,
      app,
      packageuris.map((p) => '"' + p + '"'),
      Object.keys(ws.builders).map((b) => '"' + b + '": BuilderConfig').join(',')
    )

    for (const pkguri of packageuris) {
      const pkg = ws.decl.pkgs[pkguri]
      await genpkg(w, pkg)
    }

    const maps: string[] = []
    Object.keys(app.mappings).forEach((muri) => {
      const mstr = app.mappings[muri]
      if (maps.indexOf(mstr) >= -1) app.archErrors['Mapeamento duplicado: ' + mstr] = true
      maps.push(mstr)
    })

    await w.save()
  }
}
