import { Workspace, getAppDef } from "./typesDef";
import { resolve, join } from 'path'
import { buildApp } from './buildApp';
import { quasarNodeTsx } from './node-tsx';
import { loadWorkspace } from './loadWS';
import { wsDecl } from './wsDecl';

const rootDir = resolve(__dirname + '../../../../ws')

const ws: Workspace = {
  rootDir: rootDir,
  tempDir: resolve(rootDir, '../.temp'),
  builders: {
    "node-tsx-mongo": quasarNodeTsx
  }
}

async function build_ws () {
  const loadedWS = loadWorkspace(ws)
  const hw = await getAppDef(loadedWS, 'hw', 'pt')
  await buildApp(loadedWS, hw, 'pt')
}

build_ws().then(() => console.log('built'), (e)=>{
  console.log(e.stack);
})
