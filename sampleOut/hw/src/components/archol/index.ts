import { Type, Document, Process, DocIdentification } from '../archollib'
export const identificationGUID: DocIdentification = {
  gen: 'TODO'
}

export const test_archol_com_hw_t_partnome = {
  tId: 'test.archol.com/hw/partnome',
  base: 'string',
  validate(this: void,val:string): false | "parte de nome inválida" {
    if(! /^\w+/g.test(val)) return 'parte de nome inválida'
    return false
  }
}
export const allTypes: Type[] = [test_archol_com_hw_t_partnome]

export interface Itest_archol_com_hw_d_nomes {
  fname: string
  lname: string
}
export const test_archol_com_hw_d_nomes = (()=> {
  const ffname = {
    name: 'fname',
    primary: true,
    type: test_archol_com_hw_t_partnome,
  }
  const flname = {
    name: 'lname',
    primary: true,
    type: test_archol_com_hw_t_partnome,
  }
  const spartial = {
    name: 'partial',
    icon: 'partial',
    description: {
      pt: () => 'Parcialmente preenchido',
    },
  }
  const scomplete = {
    name: 'complete',
    icon: 'complete',
    description: {
      pt: () => 'Complemente preenchido',
    },
  }
  return {
    dId: 'test.archol.com/hw/nomes',
    identification: identificationGUID,
    volatile: true,
    states: [spartial,scomplete],
    fields: [ffname,flname],
    indexes: [
      {
        fields: [
          {
            field: ffname,
            flag: 'text',
          },
          {
            field: flname,
            flag: 'text',
          },
        ]
      },
      {
        name: 'porUltimoNome',
        fields: [
          {
            field: flname,
            flag: 'asc',
          },
        ]
      },
    ],
    actions: [
      {
        name: 'startHw',
        to: [spartial],
        icon: 'novo',
        description: {
          pt: () => 'Iniciar novo',
        },
        async run(this: Itest_archol_com_hw_d_nomes,fn:string): Promise<void> {
          this.fname=fn
        }
      },
      {
        name: 'finishHw',
        from: [spartial],
        to: [scomplete],
        icon: 'finish',
        description: {
          pt: () => 'Completar',
        },
        async run(this: Itest_archol_com_hw_d_nomes,ln:string): Promise<void> {
          this.lname = ln
        }
      },
    ],
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
