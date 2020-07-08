import { Type, Document, Process } from '../archollib'
export const test_archol_com_hw_t_partnome = {
  tId: 'test.archol.com/hw/partnome',
  base: 'string',
  validate(val:string) {
    if(! /^\w+/g.test(val)) return 'parte de nome inválida'
    return false
  }
}

export const allTypes: Type[] = [test_archol_com_hw_t_partnome]
export const test_archol_com_hw_d_nomes = {
  dId: 'test.archol.com/hw/nomes',
  volatile: true,
  validation: {
    fname: (val:any) => test_archol_com_hw_t_partnome.validate(val),
    lname: (val:any) => test_archol_com_hw_t_partnome.validate(val),
  }
}

export const allDocuments: Document[] = [test_archol_com_hw_d_nomes]
export const test_archol_com_hw_p_askAndShowName = {
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

export const allProcesses: Process[] = [test_archol_com_hw_p_askAndShowName]
