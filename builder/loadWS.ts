import * as decl from './typesDecl';
import * as def from './typesDef';

import { readFile } from './sys';

export async function loadWorkspace (ws: def.Workspace) {

  const apps: { [appName: string]: decl.Application } = {}
  const pkgs: { [pkgName: string]: decl.Package } = {}
  const ret: def.DefWorkspace = { ...ws, apps, pkgs }

  const decl = await readFile(ws.tempDir + '/ws.js', { encoding: 'utf-8' })
  const fn = new Function('declareApp', 'declarePackage', decl)
  fn(declareApp, declarePackage)
  return ret

  async function declareApp (name: string, opts: Exclude<decl.Application, 'name'>) {
    if (apps[name]) throw new Error('Duplicated application name: ' + name)
    apps[name] = { ...opts, name }
  }

  function declarePackage (name: string) {
    if (pkgs[name]) throw new Error('Duplicated package name: ' + name)
    const pkg: decl.Package = pkgs[name] = { name } as any
    return { uses }
    function uses (usedpackages: []) {
      pkg.uses = usedpackages
      return { roles }
    }
    function roles (rolesDecl: decl.Roles) {
      pkg.roles = rolesDecl
      return { processes }
    }
    function processes (processesDecl: decl.Processes) {
      pkg.processes = processesDecl
      return { functions }
    }
    function functions (functionsDecl: decl.Functions) {
      pkg.functions = functionsDecl
      return { views }
    }
    function views (viewsDecl: decl.Views) {
      pkg.views = viewsDecl
      return { types }
    }
    function types (typesDecl: decl.Types) {
      pkg.types = typesDecl
      return { documents }
    }
    function documents (docsDecl: decl.Documents) {
      pkg.documents = docsDecl
      return {  }
    }
  }
}