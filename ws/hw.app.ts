declareApp("hw", {
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
    'quasar-mongo': {
      "rootDir": "../sampleOut/hw"
    }
  }
})
