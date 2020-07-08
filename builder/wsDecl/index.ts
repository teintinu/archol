import { DefWorkspace } from '../typesDef';
import * as decl from '../typesDecl'
import { createSourceWriter } from '../sys';
import { genapp } from './app';
import { genpkg } from './pkg';

export async function wsDecl (ws: DefWorkspace) {
  const w=createSourceWriter(ws.rootDir + '/decl.d.ts')
  w.writeln('/* eslint-disable */')

  const packageuris: decl.PackageURI[] = Object.keys(ws.pkgs) as any

  await genapp(
    w,
    packageuris.map((p) => '"' + p + '"').join(','),
    Object.keys(ws.builders).map((b) => '"' + b + '": BuilderConfig').join(',')
  )

  for (const packagename of packageuris) {
    const pkg = ws.pkgs[packagename]
    
    await genpkg(w, pkg)
  }

  await w.save()
}
