import { Process } from '../../archollib'
export const askAndShowName: Process = {
  pid: 'hw.askAndShowName',
  title: {
    pt: () => 'Olá mundo'
  },
  caption: {
    pt: () => 'Pergunta nome e cumprimenta'
  },
  icon: 'scholl'
}

export const processes = [askAndShowName]
