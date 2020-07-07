

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
    uses: PackageUrls[],
    langs: Lang[],
    builders: Builders
  }): void
  
  declare interface IAction<T> {
    caption: I18N,
    icon?: Icon,
    run: "next" | ((data: T) => Promise<void>)
  }  
  declare type PackageUrls = "hw"
      
  declare type BasicTypes = "string"|"number"|"boolean"|"date"

  declare type DocPersistence = 'session' | 'persistent'
  declare interface DocState {
    icon: Icon
    description: I18N    
  }

  declare type FunctionLevel = 'cpu' | 'io'| 'proc'

  declare interface Builders {
    "quasar-mongo": BuilderConfig
  }
  


  declare function declarePackage (name: 'hw'): IhwUses
  declare interface IhwUses {
    uses (packages: PackageUrls[]): IhwRoles
  }
  
  declare interface IhwRoles {
    roles (roles: Roles): IhwProcesses
  }
  
  declare type IhwRole = "public"
  declare type IhwUseRoles = IhwRole[]

  declare type IhwProcesses = {
    processes (processes: {
      askAndShowName: IhwProcessaskAndShowName,
    }): IhwFunctions
  }

  declare type IhwViewNames = "askFirstName"|"askLastName"|"showFullName"

  declare type IhwFields = {
    [fieldName: string]: IhwField
  }
  
  declare interface IhwField {
    type: IhwTypeName
  }
  
  declare type IhwTypeName = 'string'|'number'|'boolean'|'date'|'partnome'
  
  declare interface IhwFunctions {
    functions (functions: {
      concatname: IhwOPTconcatname,
      usefirst: IhwOPTusefirst,
    }): IhwViews
  }

  declare interface IhwViews {
    views (views: {
      askFirstName: IhwVOPTaskFirstName,
      askLastName: IhwVOPTaskLastName,
      showFullName: IhwVOPTshowFullName,      
    }): IhwTypes
  }

  declare interface IhwTypes {
    types (types: {
      partnome: IhwTOPTpartnome,      
    }): IhwDocs
  }

  declare interface IhwDocs {
    documents (documents: {
      nomes: IhwDOPTnomes,      
    }): void
  }
  


  declare interface IhwProcessaskAndShowName {
    title: I18N,
    caption: I18N,
    icon: Icon,
    start: IhwTaskNameaskAndShowName,
    volatile: true,
    roles: IhwUseRoles[],
    vars: IhwVarsaskAndShowName
    tasks: IhwTasksaskAndShowName,
  }
    
  declare interface IhwVarsaskAndShowName {
    input: IhwFields
    output: IhwFields
    local: IhwFields
  }
  
  declare interface IhwScopeaskAndShowName {
    input: {

    }
    output: {

    }
    local: {
      firstName: string,      lastName: string,      fullName: string      
    }
  }
  
  declare type IhwScopePathaskAndShowName = "local.firstName"|"local.lastName"|"local.fullName"      
  
  declare type IhwTaskNameaskAndShowName = "askFirst"|"askLast"|"concatName"|"useFirst"|"showFull"
  
  declare type IhwTasksaskAndShowName = {
    [taskName: string]: IhwTaskaskAndShowName
  }
  
  declare type IhwNextTaskaskAndShowName = IhwTaskNameaskAndShowName | {
    [task in IhwTaskNameaskAndShowName]?: (vars: IhwScopeaskAndShowName) => boolean
  }

  declare type IhwUseFunctionaskAndShowName = {


   
    function: 'concatname',
    input: {
      first: IhwScopePathaskAndShowName
      last: IhwScopePathaskAndShowName
    },
    output: {
            full: IhwScopePathaskAndShowName
    }
    
  } | {
   
    function: 'usefirst',
    input: {
      first: IhwScopePathaskAndShowName
    },
    output: {
            full: IhwScopePathaskAndShowName
    }
    
  }

    declare interface IhwOPTconcatname {
      level: FunctionLevel
      input: IhwFields,
      output: IhwFields,
      code (vars: { input: IhwINPUTconcatname, output: IhwOUTPUTconcatname }): void
    }
    
    declare interface IhwINPUTconcatname {
      first: string,      last: string
    }
    
    declare interface IhwOUTPUTconcatname {
      full: string
    }

    declare interface IhwOPTusefirst {
      level: FunctionLevel
      input: IhwFields,
      output: IhwFields,
      code (vars: { input: IhwINPUTusefirst, output: IhwOUTPUTusefirst }): void
    }
    
    declare interface IhwINPUTusefirst {
      first: string
    }
    
    declare interface IhwOUTPUTusefirst {
      full: string
    }
   
  
      declare interface IhwVOPTaskFirstName {
        content: IhwVCONTENTaskFirstName
        primaryAction?: IAction<IhwVDATAaskFirstName>
        secondaryAction?: IAction<IhwVDATAaskFirstName>
        otherActions?: Array<IAction<IhwVDATAaskFirstName>>
      }
      
      declare interface IhwVDATAaskFirstName {
        firstName: string
      }

      declare type IhwVBINDaskFirstName<S> ={
                firstName: S
      }
        
      declare type IhwVCONTENTaskFirstName = Array<{
        kind: 'show' | 'entry'
        field: string
        type: IhwTypeName
      }>    
      
   
  
      declare interface IhwVOPTaskLastName {
        content: IhwVCONTENTaskLastName
        primaryAction?: IAction<IhwVDATAaskLastName>
        secondaryAction?: IAction<IhwVDATAaskLastName>
        otherActions?: Array<IAction<IhwVDATAaskLastName>>
      }
      
      declare interface IhwVDATAaskLastName {
        lastName: string
      }

      declare type IhwVBINDaskLastName<S> ={
                lastName: S
      }
        
      declare type IhwVCONTENTaskLastName = Array<{
        kind: 'show' | 'entry'
        field: string
        type: IhwTypeName
      }>    
      
   
  
      declare interface IhwVOPTshowFullName {
        content: IhwVCONTENTshowFullName
        primaryAction?: IAction<IhwVDATAshowFullName>
        secondaryAction?: IAction<IhwVDATAshowFullName>
        otherActions?: Array<IAction<IhwVDATAshowFullName>>
      }
      
      declare interface IhwVDATAshowFullName {
        fullName: string
      }

      declare type IhwVBINDshowFullName<S> ={
                fullName: S
      }
        
      declare type IhwVCONTENTshowFullName = Array<{
        kind: 'show' | 'entry'
        field: string
        type: IhwTypeName
      }>    
      
declare type IhwTaskaskAndShowName =
  {
        useFunction: IhwUseFunctionaskAndShowName,
        next: IhwNextTaskaskAndShowName,
      }
 | {
        useFunction: IhwUseFunctionaskAndShowName,
        next: IhwNextTaskaskAndShowName,
      }

        | {
          useView: {
            view: 'askFirstName'
            bind: IhwVBINDaskFirstName<IhwScopePathaskAndShowName>
          },
          next: IhwNextTaskaskAndShowName,
          roles: IhwUseRoles
        }
      

        | {
          useView: {
            view: 'askLastName'
            bind: IhwVBINDaskLastName<IhwScopePathaskAndShowName>
          },
          next: IhwNextTaskaskAndShowName,
          roles: IhwUseRoles
        }
      

        | {
          useView: {
            view: 'showFullName'
            bind: IhwVBINDshowFullName<IhwScopePathaskAndShowName>
          },
          next: IhwNextTaskaskAndShowName,
          roles: IhwUseRoles
        }
      

    declare interface IhwTOPTpartnome {
      base: BasicTypes
      validate? (val: string): string|false
      format? (val: string): string
      parse? (str: string): string
    }
    

  declare type IhwColFields = {
    [fieldName: string]: IhwColField
  }
  
  declare interface IhwColField {
    description: string
    type: IhwTypeName
  }

    declare type IhwDOCOLNAMEnomes = "fname"|"lname"
    declare interface IhwDOPTnomes {
      persistence: DocPersistence
      states: {
        partial: DocState
        complete: DocState
      }
      collection: IhwColFields
      indexes: {[name:string]:IhwDOCOLNAMEnomes[]}
      actions: IhwDOCACTIONSnomes
    }
    
    declare interface IhwDOCACTIONSnomes {

        startHw: {
          from: 'newDoc'|"partial"|"complete",
          to: "partial"|"complete",
          icon: Icon,
          description: I18N,
          run (fn: string): Promise<any>
        }
      

        finishHw: {
          from: 'newDoc'|"partial"|"complete",
          to: "partial"|"complete",
          icon: Icon,
          description: I18N,
          run (fn: string): Promise<any>
        }
      
}
