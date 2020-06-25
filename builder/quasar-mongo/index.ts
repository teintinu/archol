import { Builder } from "../types";
import { join, resolve } from 'path'
import { Project } from "ts-morph";
import { writeFile } from '../sys';

export const quasarMongo: Builder = {
  async build(ws, app, cfg) {
    const outDir = join(ws.rootDir, cfg.rootDir, app.name, 'server')
    indexTs()
    indexHtml()
    function indexTs() {
      const project = new Project({ compilerOptions: { outDir } });
      const index = project.createSourceFile('index.ts')
      index.addStatements(`
const express = require('express')
const path = require('path')

const httpPort = process.ENV.PORT || 3000

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.listen(httpPort, function () {
  console.log('Listening on port ', httpPort)
})    
`)
      project.emit();
    }
    function indexHtml() {
      writeFile(outDir + '?',
        `
<html>
  <body>
    <span>This example is for the article of progressive web apps written for LogRocket</span>
    <br>
    <span>You are now</span> <span><b class="page-status">online</b></span>
    <script src="/js/pwa.js"></script>
  </body>
</html>
`, { encoding: 'utf-8' }
      )
    }
  }
}
