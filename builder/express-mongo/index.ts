import { Builder } from "../types";
import { Project } from "ts-morph";

export const expressMongo: Builder = {
  async build(ws, app) {
    const project = new Project({ compilerOptions: { outDir: ws.outDir + '/' + app.name } });
    const index = project.createSourceFile('index.ts')
    index.addImportDeclaration({
      moduleSpecifier: 'express',
      defaultImport: 'express'
    })
    index.addStatements('const app=express()')
    index.addStatements('app.get("/", (req, res) => res.send("' + app.name + '"')
    project.emit();
  }
}
