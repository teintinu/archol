import { DefWorkspace, Application, Lang } from "./typesDef";

export async function buildApp (ws: DefWorkspace, app: Application, onlyLang?: Lang) {
  const all = app.builders.map(async (builderInfo) => {
    const builder = ws.builders[builderInfo.builderName]
    if (builder) {
      console.log(new Date().toISOString(), ' ', builderInfo.builderName + ': building ' + builderInfo.builderName)
      await builder.buildApp(ws, app, builderInfo)
      console.log(new Date().toISOString(), ' ', builderInfo.builderName + ': built ' + builderInfo.builderName)
    } else console.log(new Date().toISOString(), ' ', builderInfo.builderName + ': invalid builder: ' + builderInfo.builderName)
  })
  await Promise.all(all)
}
