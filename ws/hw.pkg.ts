declarePackage('test.archol.com', 'hw')
  .uses({})
  .roles({
    public: {
      description: 'Todos usuários',
      icon: 'public'
    }
  })
  .processes({
    askAndShowName: {
      title: {
        pt: "Olá mundo"
      },
      caption: "Pergunta nome e cumprimenta",
      icon: "scholl",
      start: "askFirst",
      volatile: true,
      roles: [],
      vars: {
        input: {},
        output: {},
        local: {
          firstName: {
            type: "string"
          },
          lastName: {
            type: "string"
          },
          fullName: {
            type: "string"
          }
        }
      },
      tasks: {
        askFirst: {
          useView: {
            view: 'askFirstName',
            bind: {
              firstName: 'local.firstName'
            }
          },
          next: "askLast",
          roles: [
            "public"
          ]
        },
        askLast: {
          useView: {
            view: 'askLastName',
            bind: {
              lastName: 'local.lastName'
            }
          },
          roles: [
            "public"
          ],
          next: {
            concatName ({ local }) {
              return local.lastName.length > 0
            },
            useFirst ({ local }) {
              return local.lastName.length === 0
            }
          }
        },
        concatName: {
          useFunction: {
            function: 'concatname',
            input: {
              first: "local.firstName",
              last: "local.lastName"
            },
            output: {
              full: "local.fullName"
            }
          },
          next: "showFull"
        },
        useFirst: {
          useFunction: {
            function: 'usefirst',
            input: {
              first: "local.firstName"
            },
            output: {
              full: "local.fullName"
            }
          },
          next: "showFull"
        },
        showFull: {
          useView: {
            view: 'showFullName',
            bind: {
              fullName: 'local.fullName'
            }
          },
          roles: ["public"],
          next: {}
        }
      }
    }
  })
  .functions({
    concatname: {
      level: 'cpu',
      input: {
        first: {
          type: "string"
        },
        last: {
          type: "string"
        }
      },
      output: {
        full: {
          type: "string"
        }
      },
      code ({ input, output }) {
        output.full = input.first + ' ' + input.last
      }
    },
    usefirst: {
      level: 'cpu',
      input: {
        first: {
          type: "string"
        }
      },
      output: {
        full: {
          type: "string"
        }
      },
      code ({ input, output }) {
        output.full = input.first
      }
    }
  })
  .views({
    askFirstName: {
      content: [
        {
          kind: "entry",
          field: "firstName",
          type: "string"
        }
      ],
      primaryAction: {
        caption: "Continuar",
        run: "next"
      }
    },
    askLastName: {
      content: [
        {
          kind: "entry",
          field: "lastName",
          type: "string"
        }
      ],
      primaryAction: {
        caption: "Continuar",
        run: "next"
      }
    },
    showFullName: {
      content: [
        {
          kind: "show",
          field: "fullName",
          type: 'string'
        }
      ]
    }
  })
  .types({
    partnome: {
      base: 'string',
      validate (val) {
        if(! /^\w+/g.test(val)) return 'parte de nome inválida'
        return false
      }
    }
  })
  .documents({
    nomes: {
      persistence: 'session',
      states: {
        partial: {
          description: 'Parcialmente preenchido',
          icon: 'partial',
        },
        complete: {
          description: 'Complemente preenchido',
          icon: 'complete',
        }
      },
      collection: {
        fname: {
          description: 'Primeiro nome',
          type: 'partnome'
        },
        lname: {
          description: 'Ultimo nome',
          type: 'partnome'
        },
      },
      indexes: {
        text: ['fname', 'lname'],
        porUltimoNome: ['lname']
      },
      actions: {
        startHw: {
          from: 'newDoc',
          to: 'partial',
          icon: 'novo',
          description: 'Iniciar novo',
          async run (fn: string) {
             this.fname=fn
          }
        },
        finishHw: {
          from: 'partial',
          to: 'complete',
          icon: 'finish',
          description: 'Completar',
          async run (ln: string) {
            this.lname = ln 
          }
        }
      }
    }
  })