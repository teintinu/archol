import { Process } from '../../archollib'
export const askAndShowName: Process = {
  pId: 'test.archol.com/hw/askAndShowName',
  title: {
    pt: () => 'Olá mundo',
    },
  caption: {
    pt: () => 'Pergunta nome e cumprimenta',
    },
  icon: 'scholl',
  volatile: true,
}

export const allProcesses = [askAndShowName]
