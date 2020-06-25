import { Workspace, Application, Lang } from "./typesDef";

export async function buildApp(ws: Workspace, app: Application, onlyLang?: Lang) {
  const buildxers = Object.keys(app.builders)
  const all = builders.map(async (builderName) => {
    const cfg = app.builders[builderName]
    const builder = ws.builders[builderName]
    if (builder) {
      console.log(new Date().toISOString(),' ', builderName + ': building ' + builderName)
      await builder.buildApp(ws, app, cfg, onlyLang)
      console.log(new Date().toISOString(),' ',builderName + ': built ' + builderName)
    }
    else console.log(new Date().toISOString(),' ',builderName + ': invalid builder: ' + builderName)
  })
  await Promise.all(all)
}