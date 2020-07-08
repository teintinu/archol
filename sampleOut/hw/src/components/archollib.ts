import { reactive } from "@vue/composition-api"
import { navigate } from "src/router"

export interface Type {
  tId: string,
  base: string,
  validate?(val: any): false | string
  format?(val: any): string
  parse?(txt: string): any
}
export interface Process {
  pId: string,
  title: I18N,
  caption: I18N,
  icon: string,
  volatile: boolean,
}
export interface Document {
  dId: string,
  volatile: boolean,
  validation: {
    [field: string]: (val: any) => false | string
  }
}

export type I18N = {
  [lang: string]: (...args: any) => string
}

let volatileInstanceGen = 0

interface VolatileInstances {
  [instId: string]: VolatileInstance
}

interface VolatileInstance {
  def: Process,
  vars: any,
  step?: any
  view?: any
}

let volatileInstances: VolatileInstances

export function newInstance (process: Process) {
  if (process.volatile) {
    if (!volatileInstances) volatileInstances = reactive<VolatileInstances>({})
    const s = (volatileInstanceGen++).toString(16)
    volatileInstances[s] = {
      def: process,
      vars: reactive({})
    }
    navigate('/p/' + process.pId + '/' + s)
  }
}

export interface ProcInfo {
  defId: string
  instId: string
}

let currentProcess: ProcInfo

export function setCurrentProcess (area: 'content', info: ProcInfo) {
  if (!currentProcess) currentProcess = reactive<ProcInfo>({ defId: '', instId: '' })
  currentProcess.defId = info.defId
  currentProcess.instId = info.instId
}

export function getCurrentProcess (area: 'content'): ProcInfo {
  return currentProcess
}
