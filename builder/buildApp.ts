import { Workspace } from "./ws";
import { Application } from "./types";

export async function buildApp(ws: Workspace, app: Application) {
  for (const builderName of app.builders) {
    const builder = ws.builders[builderName]
    if (!builder) throw new Error('invalid builder: ' + builderName)
    await builder.build(app)
  }
}