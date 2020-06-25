
export interface Process {
  name: string,
  title: I18N,
  caption: I18N,
  icon: string,
}

export type I18N = {
  [lang: string]: string
}

export function newInstance (process: Process) {
  alert('ok:' + process.name)
}
