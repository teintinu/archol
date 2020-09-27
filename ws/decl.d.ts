/* eslint-disable */


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
    
  declare interface IAction<T> {
    caption: I18N,
    icon?: Icon,
    run: "next" | ((data: T) => Promise<void>)
  }  

  declare type PackageUses = {
    [alias: string]: PackageUrls
  }
  
  declare type PackageUrls = "test.archol.com/hw"     

  declare type BasicTypes = "string"|"number"|"boolean"|"date"

  declare type DocPersistence = 'session' | 'persistent'
  declare interface DocState {
    icon: Icon
    description: I18N    
  }

  declare type FunctionLevel = 'cpu' | 'io'| 'proc'

  declare interface Builders {"node-tsx-mongo": BuilderConfig}

  declare function declareApplication (name: 'hw', opts: {
    description: I18N,
    icon: Icon,
    uses: PackageUses,
    langs: Lang[],
    builders: Builders
    mappings: IMappingshw
  }): void

  declare type IMappinghw = 'test.archol.com/hw#partnome.type'|'test.archol.com/hw#nomes.doc'|'test.archol.com/hw#askAndShowName.proc'
  declare type IMappingshw = {
    [uri in IMappinghw]?:string
  } 

  declare function declarePackage (ns: 'test.archol.com', path: 'hw'): Itest_archol_com_hwUses
  declare interface Itest_archol_com_hwUses {
    uses (packages: PackageUses): Itest_archol_com_hwRoles
  }
  
  declare interface Itest_archol_com_hwRoles {
    roles (roles: Roles): Itest_archol_com_hwProcesses
  }
  
  declare type Itest_archol_com_hwRole = "public"
  declare type Itest_archol_com_hwUseRoles = Itest_archol_com_hwRole[]

  declare type Itest_archol_com_hwProcesses = {
    processes (processes: {
      askAndShowName: Itest_archol_com_hwProcessaskAndShowName,
    }): Itest_archol_com_hwFunctions
  }

  declare type Itest_archol_com_hwViewNames = "askFirstName"|"askLastName"|"showFullName"

  declare type Itest_archol_com_hwFields = {
    [fieldName: string]: Itest_archol_com_hwField
  }
  
  declare interface Itest_archol_com_hwField {
    type: Itest_archol_com_hwTypeName
  }
  
  declare type Itest_archol_com_hwTypeName = 'string'|'number'|'boolean'|'date'|'partnome'
  
  declare interface Itest_archol_com_hwFunctions {
    functions (functions: {
      concatname: Itest_archol_com_hwOPTconcatname,
      usefirst: Itest_archol_com_hwOPTusefirst,
    }): Itest_archol_com_hwViews
  }

  declare interface Itest_archol_com_hwViews {
    views (views: {
      askFirstName: Itest_archol_com_hwVOPTaskFirstName,
      askLastName: Itest_archol_com_hwVOPTaskLastName,
      showFullName: Itest_archol_com_hwVOPTshowFullName,      
    }): Itest_archol_com_hwTypes
  }

  declare interface Itest_archol_com_hwTypes {
    types (types: {
      partnome: Itest_archol_com_hwTOPTpartnome,      
    }): Itest_archol_com_hwDocs
  }

  declare interface Itest_archol_com_hwDocs {
    documents (documents: {
      nomes: Itest_archol_com_hwDOPTnomes,      
    }): void
  }
  


  declare interface Itest_archol_com_hwProcessaskAndShowName {
    title: I18N,
    caption: I18N,
    icon: Icon,
    start: Itest_archol_com_hwTaskNameaskAndShowName,
    volatile: true,
    roles: Itest_archol_com_hwUseRoles[],
    vars: Itest_archol_com_hwVarsaskAndShowName
    tasks: Itest_archol_com_hwTasksaskAndShowName,
  }
    
  declare interface Itest_archol_com_hwVarsaskAndShowName {
    input: Itest_archol_com_hwFields
    output: Itest_archol_com_hwFields
    local: Itest_archol_com_hwFields
  }
  
  declare interface Itest_archol_com_hwScopeaskAndShowName {
    input: {

    }
    output: {

    }
    local: {
      firstName: string,      lastName: string,      fullName: string      
    }
  }
  
  declare type Itest_archol_com_hwScopePathaskAndShowName = "local.firstName"|"local.lastName"|"local.fullName"      
  
  declare type Itest_archol_com_hwTaskNameaskAndShowName = "askFirst"|"askLast"|"concatName"|"useFirst"|"showFull"
  
  declare type Itest_archol_com_hwTasksaskAndShowName = {
    [taskName: string]: Itest_archol_com_hwTaskaskAndShowName
  }
  
  declare type Itest_archol_com_hwNextTaskaskAndShowName = Itest_archol_com_hwTaskNameaskAndShowName | {
    [task in Itest_archol_com_hwTaskNameaskAndShowName]?: (vars: Itest_archol_com_hwScopeaskAndShowName) => boolean
  }

  declare type Itest_archol_com_hwUseFunctionaskAndShowName = {


   
    function: 'concatname',
    input: {
      first: Itest_archol_com_hwScopePathaskAndShowName
      last: Itest_archol_com_hwScopePathaskAndShowName
    },
    output: {
            full: Itest_archol_com_hwScopePathaskAndShowName
    }
    
  } | {
   
    function: 'usefirst',
    input: {
      first: Itest_archol_com_hwScopePathaskAndShowName
    },
    output: {
            full: Itest_archol_com_hwScopePathaskAndShowName
    }
    
  }

    declare interface Itest_archol_com_hwOPTconcatname {
      level: FunctionLevel
      input: Itest_archol_com_hwFields,
      output: Itest_archol_com_hwFields,
      code (vars: { input: Itest_archol_com_hwINPUTconcatname, output: Itest_archol_com_hwOUTPUTconcatname }): void
    }
    
    declare interface Itest_archol_com_hwINPUTconcatname {
      first: string,      last: string
    }
    
    declare interface Itest_archol_com_hwOUTPUTconcatname {
      full: string
    }

    declare interface Itest_archol_com_hwOPTusefirst {
      level: FunctionLevel
      input: Itest_archol_com_hwFields,
      output: Itest_archol_com_hwFields,
      code (vars: { input: Itest_archol_com_hwINPUTusefirst, output: Itest_archol_com_hwOUTPUTusefirst }): void
    }
    
    declare interface Itest_archol_com_hwINPUTusefirst {
      first: string
    }
    
    declare interface Itest_archol_com_hwOUTPUTusefirst {
      full: string
    }
   
  
      declare interface Itest_archol_com_hwVOPTaskFirstName {
        content: Itest_archol_com_hwVCONTENTaskFirstName
        primaryAction?: IAction<Itest_archol_com_hwVDATAaskFirstName>
        secondaryAction?: IAction<Itest_archol_com_hwVDATAaskFirstName>
        otherActions?: Array<IAction<Itest_archol_com_hwVDATAaskFirstName>>
      }
      
      declare interface Itest_archol_com_hwVDATAaskFirstName {
        firstName: string
      }

      declare type Itest_archol_com_hwVBINDaskFirstName<S> ={
                firstName: S
      }
        
      declare type Itest_archol_com_hwVCONTENTaskFirstName = Array<{
        kind: 'show' | 'entry'
        field: string
        type: Itest_archol_com_hwTypeName
      }>    
      
   
  
      declare interface Itest_archol_com_hwVOPTaskLastName {
        content: Itest_archol_com_hwVCONTENTaskLastName
        primaryAction?: IAction<Itest_archol_com_hwVDATAaskLastName>
        secondaryAction?: IAction<Itest_archol_com_hwVDATAaskLastName>
        otherActions?: Array<IAction<Itest_archol_com_hwVDATAaskLastName>>
      }
      
      declare interface Itest_archol_com_hwVDATAaskLastName {
        lastName: string
      }

      declare type Itest_archol_com_hwVBINDaskLastName<S> ={
                lastName: S
      }
        
      declare type Itest_archol_com_hwVCONTENTaskLastName = Array<{
        kind: 'show' | 'entry'
        field: string
        type: Itest_archol_com_hwTypeName
      }>    
      
   
  
      declare interface Itest_archol_com_hwVOPTshowFullName {
        content: Itest_archol_com_hwVCONTENTshowFullName
        primaryAction?: IAction<Itest_archol_com_hwVDATAshowFullName>
        secondaryAction?: IAction<Itest_archol_com_hwVDATAshowFullName>
        otherActions?: Array<IAction<Itest_archol_com_hwVDATAshowFullName>>
      }
      
      declare interface Itest_archol_com_hwVDATAshowFullName {
        fullName: string
      }

      declare type Itest_archol_com_hwVBINDshowFullName<S> ={
                fullName: S
      }
        
      declare type Itest_archol_com_hwVCONTENTshowFullName = Array<{
        kind: 'show' | 'entry'
        field: string
        type: Itest_archol_com_hwTypeName
      }>    
      
declare type Itest_archol_com_hwTaskaskAndShowName =
  {
        useFunction: Itest_archol_com_hwUseFunctionaskAndShowName,
        next: Itest_archol_com_hwNextTaskaskAndShowName,
      }
 | {
        useFunction: Itest_archol_com_hwUseFunctionaskAndShowName,
        next: Itest_archol_com_hwNextTaskaskAndShowName,
      }

        | {
          useView: {
            view: 'askFirstName'
            bind: Itest_archol_com_hwVBINDaskFirstName<Itest_archol_com_hwScopePathaskAndShowName>
          },
          next: Itest_archol_com_hwNextTaskaskAndShowName,
          roles: Itest_archol_com_hwUseRoles
        }
      

        | {
          useView: {
            view: 'askLastName'
            bind: Itest_archol_com_hwVBINDaskLastName<Itest_archol_com_hwScopePathaskAndShowName>
          },
          next: Itest_archol_com_hwNextTaskaskAndShowName,
          roles: Itest_archol_com_hwUseRoles
        }
      

        | {
          useView: {
            view: 'showFullName'
            bind: Itest_archol_com_hwVBINDshowFullName<Itest_archol_com_hwScopePathaskAndShowName>
          },
          next: Itest_archol_com_hwNextTaskaskAndShowName,
          roles: Itest_archol_com_hwUseRoles
        }
      

    declare interface Itest_archol_com_hwTOPTpartnome {
      base: BasicTypes
      validate? (this: void, val: string): string|false
      format? (this: void, val: string): string
      parse? (this: void, str: string): string
    }
    

  declare type Itest_archol_com_hwSomeFields = {
    [fieldName: string]: Itest_archol_com_hwSomeField
  }
  
  declare interface Itest_archol_com_hwSomeField {
    description: string
    type: Itest_archol_com_hwTypeName
  }

    declare type Itest_archol_com_hwDOCOLNAMEnomes = "fname"|"lname"
    declare interface Itest_archol_com_hwDOPTnomes {
      persistence: DocPersistence
      identification: 'GUID'
      states: {
        partial: DocState
        complete: DocState
      }
      primaryFields: Itest_archol_com_hwSomeFields
      secondaryFields: Itest_archol_com_hwSomeFields
      indexes: {[name:string]:Itest_archol_com_hwDOCOLNAMEnomes[]}
      actions: Itest_archol_com_hwDOCACTIONSnomes
    }
    
    declare type Itest_archol_com_hwSTATENAMESnomes = "partial"|"complete"
    declare interface Itest_archol_com_hwDOCDATAnomes {
      fname: string
      lname: string
    }
    declare interface Itest_archol_com_hwDOCACTIONSnomes {

        startHw: {
          from?: Itest_archol_com_hwSTATENAMESnomes|Itest_archol_com_hwSTATENAMESnomes[],
          to: Itest_archol_com_hwSTATENAMESnomes|Itest_archol_com_hwSTATENAMESnomes[],
          icon: Icon,
          description: I18N,
          run (this: Itest_archol_com_hwDOCDATAnomes, fn: string): Promise<any>
        }
      

        finishHw: {
          from?: Itest_archol_com_hwSTATENAMESnomes|Itest_archol_com_hwSTATENAMESnomes[],
          to: Itest_archol_com_hwSTATENAMESnomes|Itest_archol_com_hwSTATENAMESnomes[],
          icon: Icon,
          description: I18N,
          run (this: Itest_archol_com_hwDOCDATAnomes, fn: string): Promise<any>
        }
      
}
