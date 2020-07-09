import { reactive } from "@vue/composition-api"
import { navigate } from "src/router"
import { type } from "os"

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
export interface DocumentField {
  name: string
  primary: boolean
  type: Type
}
export type DocumentIndexFlag = 'asc' | 'desc' | 'text'
export interface DocumentIndex {
  name: string
  fields: Array<{
    field: DocumentField,
    flag: DocumentIndexFlag,
  }>
}

export interface DocumentState {
  name: string
  icon: string
  description: I18N
}

export interface DocumentAction {
  name: string
  from: string[]
  to: string[]
  icon: string
  description: I18N
  run(data: any): Promise<void>
}

export interface Document {
  dId: string,
  volatile: boolean,
  fields: DocumentField[],
  identification: 'GUID'
  persistence: 'session' | 'persistent'
  states: DocumentState[]
  actions: DocumentAction[]  
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
