import { Workspace, Application } from "./types";

export async function buildApp(ws: Workspace, app: Application) {
  const builders = Object.keys(app.builders)
  const all = builders.map(async (builderName) => {
    const cfg = app.builders[builderName]
    const builder = ws.builders[builderName]
    if (builder) {
      console.log(builderName + ': building ' + builderName)
      await builder.build(ws, app, cfg)
      console.log(builderName + ': built ' + builderName)
    }
    else console.log(builderName + ': invalid builder: ' + builderName)
  })
  await Promise.all(all)
}