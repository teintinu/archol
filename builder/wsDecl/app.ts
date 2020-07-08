import { basicTypes } from '../typesDecl';
import { SourcePartWriter } from '../sys';

export async function genapp (w: SourcePartWriter, packageUrls: string, builders: string) {
  w.write(`

  declare type Icon = string

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
  
  declare function declareApp (name: string, opts: {
    description: I18N,
    icon: Icon,
    uses: PackageUses,
    langs: Lang[],
    builders: Builders
  }): void
  
  declare interface IAction<T> {
    caption: I18N,
    icon?: Icon,
    run: "next" | ((data: T) => Promise<void>)
  }  

  declare type PackageUses = {
    [alias: string]: PackageUrls
  }
  
  declare type PackageUrls = ${packageUrls}     

  declare type BasicTypes = ${Object.keys(basicTypes||{}).map((b) => '"' + b + '"').join('|')}

  declare type DocPersistence = 'session' | 'persistent'
  declare interface DocState {
    icon: Icon
    description: I18N    
  }

  declare type FunctionLevel = 'cpu' | 'io'| 'proc'

  declare interface Builders {`,
    builders
  ,`}`)
}
