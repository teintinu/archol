declarePackage('hw')
  .uses([])
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
          useView: 'askFirstName',
          next: "askLast",
          roles: [
            "user"
          ]
        },
        askLast: {
          useView: "askLastName",
          roles: [
            "user"
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
          useView: "showFullName",
          roles: ["user"],
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
