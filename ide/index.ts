import { watch } from 'chokidar'
import { watchBuilders } from './watchBuilders'
import { resolve, join } from 'path'
import { spawn, ChildProcess } from 'child_process'

const rootDir = resolve(__dirname, '../../..')
const buildDir = resolve(rootDir, '.temp/dist/builder')

console.log({ rootDir, buildDir })

watch([
  buildDir,
  rootDir + '/ws'
], {
  awaitWriteFinish: true
}).on("all", workspaceRebuilder())
// watchBuilders(rootDir+'/builder')
//watchWorkspace(root+'/ws')

function workspaceRebuilder () {
  let tm: any
  let building: ChildProcess | 0
  return () => {
    if (tm) clearTimeout(tm)
    if (building) building.kill('SIGKILL')
    building = 0
    tm = setTimeout(run, 300)
  }
  function run () {
    tm = 0
    building = spawn('node', [buildDir + '/index'], {
      stdio: 'inherit'
    })
    building.on("close", () => {
      building = 0
    })
  }
}