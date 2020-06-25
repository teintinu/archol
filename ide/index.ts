import { watch } from 'chokidar'
import { watchBuilders } from './watchBuilders'
import { resolve, join } from 'path'

const rootDir = resolve(__dirname + '../')

watchBuilders(rootDir+'/builder')
//watchWorkspace(root+'/ws')
