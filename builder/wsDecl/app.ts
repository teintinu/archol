import { writeLines } from '../sys';
import { Workspace } from '../typesDecl';

export async function genapp (ws: Workspace, packages: string, builders: string) {
  const lines: string[] = `
  declare function declareApp(name: string, opts: {
    description: I18N,
    icon: Icon,
    uses: Package[],
    langs: Lang[],
    builders: Builders
  }): void
  
  declare type Icon = string
  
  declare type I18N = string | {
    [lang in Lang]?: string
  }
  
  declare type Lang = 'pt' | 'en'
  
  declare interface BuilderConfig{
    rootDir: string
  }
  
  declare type Package = ${packages}
  
  declare interface Builders {
    ${builders}
  }
  `.split('\n')
  await writeLines(ws.tempDir + '/wsdecl/app.d.ts', lines)
}