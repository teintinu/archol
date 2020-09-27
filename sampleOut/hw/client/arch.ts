export const identificationGUID: DocIdentification = {
  gen: 'TODO'
}

export const partnomeType = {
  tId: 'partnomeType',
  uri: 'test.archol.com/hw#partnome',
  base: 'string',
  validate(this: void,val:string): false | "parte de nome inválida" {
    if (! /^\w+/g.test(val)) return 'parte de nome inválida'
    return false
  }
}
export const allTypes: Type[] = [partnomeType]

export interface InomesDoc {
  fname: string
  lname: string
}
export const nomesDoc = (()=> {
  const ffname = {
    name: 'fname',
    primary: true,
    type: partnomeType,
  }
  const flname = {
    name: 'lname',
    primary: true,
    type: partnomeType,
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
    dId: 'nomesDoc',
    uri: 'test.archol.com/hw/nomes',
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
        async run(this: InomesDoc,fn:string): Promise<void> {
          this.fname = fn
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
        async run(this: InomesDoc,ln:string): Promise<void> {
          this.lname = ln
        }
      },
    ],
  }
})()
export const allDocuments: Document[] = [nomesDoc]

export const askAndShowNameProc = {
  pId: 'askAndShowNameProc',
  uri: 'test.archol.com/hw#askAndShowName',
  title: {
    pt: () => 'Olá mundo',
  },
  caption: {
    pt: () => 'Pergunta nome e cumprimenta',
  },
  icon: 'scholl',
  volatile: true,
}
export const allProcesses: Process[] = [askAndShowNameProc]
