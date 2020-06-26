import * as decl from './typesDecl';
import * as def from './typesDef';

import { readFile } from './sys';

export async function loadWorkspace (ws: def.Workspace) {

  const apps: { [appName: string]: decl.Application } = {}
  const pkgs: { [pkgName: string]: decl.Package } = {}
  const ret: def.DefWorkspace = { ...ws, apps, pkgs }

  const decl = await readFile(ws.tempDir + '/ws.js', { encoding: 'utf-8' })
  const fn = new Function('declareApp', 'declarePkg', decl)
  fn(declareApp, declarePkg)
  return ret

  async function declareApp (name: string, opts: Exclude<decl.Application, 'name'>) {
    if (apps[name]) throw new Error('Duplicated application name: ' + name)
    apps[name] = { ...opts, name }
  }

  function declarePkg (name: string, opts: Exclude<decl.Package, 'name'>) {
    if (pkgs[name]) throw new Error('Duplicated package name: ' + name)
    pkgs[name] = { ...opts, name }
  }
}