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

export const test_archol_com_hw_d_nomes = (()=> {
  const fname = {
    name: 'fname',
    primary: true,
    type: test_archol_com_hw_t_partnome,
  }
  const lname = {
    name: 'lname',
    primary: true,
    type: test_archol_com_hw_t_partnome,
  }
  return {
    dId: 'test.archol.com/hw/nomes',
    volatile: true,
    fields: [fname,lname],
    indexes: [
      {
        fields: [
          {
            field: fname,
            flag: 'text',
          },
          {
            field: lname,
            flag: 'text',
          },
        ]
      },
      {
        name: 'porUltimoNome',
        fields: [
          {
            field: lname,
            flag: 'asc',
          },
        ]
      },
    ]
  }
})()
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
