import { DefWorkspace } from '../typesDef';
import * as decl from '../typesDecl'
import { writeLines } from '../sys';
import { genapp } from './app';
import { genpkg } from './pkg';

export async function wsDecl (ws: DefWorkspace) {
  let lines: string[] = []
  const packageuris: decl.PackageURI[] = Object.keys(ws.pkgs) as any

  lines = lines.concat(await genapp(
    packageuris.map((p) => '"' + p + '"').join(','),
    Object.keys(ws.builders).map((b) => '"' + b + '": BuilderConfig').join(',')
  ))

  for (const packagename of packageuris) {
    const pkg = ws.pkgs[packagename]
    lines = lines.concat(await genpkg(pkg))
  }

  await writeLines(ws.rootDir + '/decl.d.ts', lines)

}
