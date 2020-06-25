import { Workspace, Application } from "./types";

export async function buildApp(ws: Workspace, app: Application) {
  const all = app.builders.map(async (builderName) => {
    const builder = ws.builders[builderName]
    if (builder) {
      console.log(builderName + ': building ' + builderName)
      await builder.build(ws, app)
      console.log(builderName + ': built ' + builderName)
    }
    else console.log(builderName + ': invalid builder: ' + builderName)
  })
  await Promise.all(all)
}