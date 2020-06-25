import { reactive, ref } from "@vue/composition-api"
import { navigate } from "src/router"

export interface Process {
  pid: string,
  title: I18N,
  caption: I18N,
  icon: string,
  volatile: boolean,
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

const volatileInstances = reactive<VolatileInstances>({})

export function newInstance (process: Process) {
  if (process.volatile) {
    const s = (volatileInstanceGen++).toString(16)
    volatileInstances[s] = {
      def: process,
      vars: reactive({})
    }
    navigate('/p/' + process.pid + '/' + s)
  }
}
