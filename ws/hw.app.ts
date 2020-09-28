declareApplication("hw", {
  description: {
    "pt": "Olá",
    "en": "Hello"
  },
  icon: "school",
  uses: {
    hw: 'test.archol.com/hw'
  },
  langs: ["pt"],
  builders: {
    'node-tsx-mongo': {
      "rootDir": "../sampleOut/hw"
    }
  },
  pagelets: {
    menu: {
      drawer: true,
      left: 50
    },
    appbar: {
      top: 50
    },
    content: {
      content: true
    }
  },
  routes: {
    'hwpkg/...': 'hw',
    '/hw/{fnome}/{lname}' (app, fnome: string, lnome: string) {
      const instance = app.hw.askAndShowName.start()
      instance.vars.local.firstName = fnome
      instance.vars.local.lastName = lnome
    },
  },
  // menu: [
  //   {
  //     caption: 'new',
  //     icon: 'new'
  //   }
  // ],
  mappings: {
    "test.archol.com/hw#askAndShowName.proc": 'askAndShowNameProc',
    "test.archol.com/hw#nomes.doc": 'nomesDoc',
    "test.archol.com/hw#partnome.type": 'partnomeType'
  }
})
