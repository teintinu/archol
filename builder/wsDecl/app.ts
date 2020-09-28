import { basicTypes, defaultRoles } from '../typesDecl';
import { SourcePartWriter } from '../sys';
import { Application, DefWorkspace, getAppDef } from '../typesDef';

export async function genapp (w: SourcePartWriter, ws: DefWorkspace, app: Application, packageUrls: string[], builders: string) {
  w.write(`

  declare type Icon = string
  declare type GUID = '$GUID'

  declare type I18N = string | {
    [lang in Lang]?: string
  }
  
  declare type Lang = 'pt' | 'en'
  
  declare interface BuilderConfig {
    rootDir: string
  }
  
  declare type Roles = {
    [typeName: string]: Role
  }
    
  declare interface Role {
    description: I18N,
    icon: Icon
  }
    
  declare interface IAction<T> {
    caption: I18N,
    icon?: Icon,
    run: "next" | ((data: T) => Promise<void>)
  }  

  declare type PackageUses = {
    [alias: string]: PackageUrls
  }
  
  declare type PackageNames = ${Object.keys(app.uses).map((u) => '"' + u + '"').join('|')}     
  declare type PackageUrls = ${packageUrls.join('|')}     

  declare type BasicTypes = ${Object.keys(basicTypes || {}).map((b) => '"' + b + '"').join('|')}

  declare type DocPersistence = 'session' | 'persistent'
  declare interface DocState {
    icon: Icon
    description: I18N    
  }

  declare type FunctionLevel = 'cpu' | 'io'| 'proc'

  declare interface Builders {`,
    builders
    , `}`)

  for (const appname of Object.keys(ws.decl.apps)) {
    const app = await getAppDef(ws, appname)
    const mappings = app.packageList.reduce<string[]>((ret, pkg) => ret.concat(pkg.uri.mappables), [])
    w.writeln(`

declare function declareApplication (name: '${appname}', opts: {
  description: I18N,
  icon: Icon,
  uses: PackageUses,
  langs: Lang[],
  builders: Builders
  pagelets: {
    [name: string]: IPagelet
  }
  routes: {
    [name: string]: AppRoute | PackageNames
  }
  roles: {`)
    w.writelines(defaultRoles.map((r) => '  '+r + ": Omit<Role, 'name'>,"), true)
    w.writeln(`  }
  mappings: IMappings${appname}
}): void

declare type IPagelet = {
  drawer?: true,
  left: number
} | {
  drawer?: true,
  top: number
} | {
  drawer?: true,
  bottom: number
} | {
  drawer?: true,
  right: number
} | {
  content: true,
}

declare type AppRoute = (app: AppRef, ...args: any[]) => void

declare interface AppRef {`)
    w.ident()
    Object.keys(app.uses).forEach((pr: string) => {
      const pkg = app.uses[pr]
      w.writeln(pr + ': ' + pkg.uri.id + '$Ref, ')
    })
    w.identBack()
    w.writeln(`}

declare type IMapping${appname} = ${mappings.map((m) => '\'' + m + '\'').join('|') || '?'}
declare type IMappings${appname} = {
  [uri in IMapping${appname}]?:string
} `)
  }
}
