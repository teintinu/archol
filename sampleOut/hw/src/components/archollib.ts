
export interface Process {
  pid: string,
  title: I18N,
  caption: I18N,
  icon: string,
}

export type I18N = {
  [lang: string]: (...args: any) => string
}

export function newInstance (process: Process) {
  alert('ok:' + process.pid)
}
