import { Process } from '../../archollib'
export const askAndShowName: Process = {
  pid: 'hw.askAndShowName',
  title: {
    pt: () => '[object Object]',
  },
  caption: {
    pt: () => '[object Object]',
  },
  icon: 'scholl',
  volatile: true,
}

export const processes = [askAndShowName]
