import { DefWorkspace } from '../typesDef';
import { readdir, writeLines } from '../sys';
import { genapp } from './app';
import { genpkg } from './pkg';

export async function wsDecl (ws: DefWorkspace) {
  let lines: string[] = []
  const packagenames = Object.keys(ws.pkgs)

  lines = lines.concat(await genapp(
    packagenames.map((p) => '"' + p + '"').join(','),
    Object.keys(ws.builders).map((b) => '"' + b + '": BuilderConfig').join(',')
  ))

  for (const packagename of packagenames) {
    const pkg = ws.pkgs[packagename]
    lines = lines.concat(await genpkg(pkg))
  }

  await writeLines(ws.tempDir + '/wsdecl/app.d.ts', lines)

}
