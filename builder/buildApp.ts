import { DefWorkspace, Application, Lang } from "./typesDef";
import { wsDecl } from './wsDecl';

export async function buildApp (ws: DefWorkspace, app: Application, onlyLang?: Lang) {

  const builders = app.builders.map((builderInfo) => ({ builderInfo, builder: ws.builders[builderInfo.builderName] }))
  builders.unshift({
    builderInfo: { builderName: 'wsDecl', config: { rootDir: '' }, ws, onlyLang },
    builder: wsDecl
  })

  await Promise.all(builders.map(async ({ builderInfo, builder }) => {
    if (builder) {
      console.log(new Date().toISOString(), ' ', builderInfo.builderName + ': building ' + builderInfo.builderName)
      await builder.buildApp(ws, app, builderInfo)
      console.log(new Date().toISOString(), ' ', builderInfo.builderName + ': built ' + builderInfo.builderName)
    } else console.log(new Date().toISOString(), ' ', builderInfo.builderName + ': invalid builder: ' + builderInfo.builderName)
  }))
}
