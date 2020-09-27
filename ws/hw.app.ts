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
  mappings:{
    "test.archol.com/hw#askAndShowName.proc": 'askAndShowNameProc',
    "test.archol.com/hw#nomes.doc": 'nomesDoc',
    "test.archol.com/hw#partnome.type": 'partnomeType'
  }
})
