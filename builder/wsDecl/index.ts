import { Workspace } from '../typesDecl';
import { readdir, writeLines } from '../sys';
import { genapp } from './app';

export async function wsDecl (ws: Workspace) {
  const files = await readdir(ws.rootDir)
  const packagenames = files.reduce<string[]>((ret, f) => {
    const m = /^(\w*)\.pkg\.ts$/.exec(f)
    if (m) ret.push(m[1])
    return ret
  }, [])
  await genapp(
    ws,
    packagenames.map((p) => '"' + p + '"').join(','),
    Object.keys(ws.builders).map((b) => '"' + b + '": BuilderConfig').join(',')
  )
}
