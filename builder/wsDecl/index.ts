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

    for (const packagename of packageuris) {
      const pkg = ws.decl.pkgs[packagename]
      await genpkg(w, pkg)
    }

    await w.save()
  }
}
