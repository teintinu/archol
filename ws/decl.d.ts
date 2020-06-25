
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

declare type PackageUrls = 'hw'

declare interface Builders {
  'quasar-mongo': BuilderConfig
}

declare function declarePackage (name: 'hw'): IhwUses
declare interface IhwUses {
  uses (packages: PackageUrls[]): IhwRoles
}

declare interface IhwRoles {
  roles (roles: Roles): IhwProcesses
}

declare type IhwProcesses = {
  processes (processes: {
    askAndShowName: IhwProcessaskAndShowName
  }): IhwFunctions
}

declare interface IhwProcessaskAndShowName {
  title: string,
  caption: string,
  icon: Icon,
  start: IhwTaskNameaskAndShowName,
  volatile: true,
  roles: IhwUseRoles[],
  vars: IhwVarsaskAndShowName
  tasks: IhwTasksaskAndShowName,
}

declare type IhwRole = 'user'
declare type IhwUseRoles = IhwRole[]

declare interface IhwVarsaskAndShowName {
  input: IhwFields
  output: IhwFields
  local: IhwFields
}

declare interface IhwScopeaskAndShowName {
  input: {}
  output: {}
  local: {
    firstName: string
    lastName: string
    fullName: string
  }
}

declare type IhwScopePathaskAndShowName = 'local.firstName' | 'local.lastName' | 'local.fullName'

declare type IhwTaskNameaskAndShowName = 'askFirst' | 'askLast' | 'concatName' | 'useFirst' | 'showFull'

declare type IhwTasksaskAndShowName = {
  [taskName: string]: IhwTaskaskAndShowName
}

declare type IhwTaskaskAndShowName = {
  useView: IhwUseView,
  next: IhwNextTaskaskAndShowName,
  roles: IhwUseRoles
} | {
  useFunction: IhwUseFunctionaskAndShowName,
  next: IhwNextTaskaskAndShowName,
}

declare type IhwNextTaskaskAndShowName = IhwTaskNameaskAndShowName | {
  [task in IhwTaskNameaskAndShowName]?: (vars: IhwScopeaskAndShowName) => boolean
}

declare type IhwUseView = 'askFirstName' | 'askLastName' | 'showFullName'
declare type IhwUseFunctionaskAndShowName = {
  function: 'concatname',
  input: {
    first: IhwScopePathaskAndShowName,
    last: IhwScopePathaskAndShowName
  },
  output: {
    full: IhwScopePathaskAndShowName
  }
} | {
  function: 'usefirst',
  input: {
    first: IhwScopePathaskAndShowName,
  },
  output: {
    full: IhwScopePathaskAndShowName
  }
}

declare type IhwFields = {
  [fieldName: string]: IhwField
}

declare interface IhwField {
  type: IhwTypes
}

declare type IhwTypes = 'string'

declare interface IhwFunctions {
  functions (functions: {
    concatname: IhwOPTconcatname
    usefirst: IhwOPTusefirst
  }): IhwViews
}

declare interface IhwOPTconcatname {
  level: 'cpu'
  input: IhwFields,
  output: IhwFields,
  code (vars: { input: IhwINPUTconcatname, output: IhwOUTPUTconcatname }): void
}

declare interface IhwINPUTconcatname {
  first: string
  last: string
}

declare interface IhwOUTPUTconcatname {
  full: string
}

declare interface IhwOPTusefirst {
  level: 'cpu'
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

declare interface IhwViews {
  views (functions: {
    askFirstName: IhwVOPTaskFirstName,
    askLastName: IhwVOPTaskLastName,
    showFullName: IhwVOPTshowFullName,
  }): IhwFunctions
}

declare interface IhwAction<T> {
  caption: "Continuar",
  icon?: Icon,
  run: "next" | ((data: T) => Promise<void>)
}

declare interface IhwVOPTaskFirstName {
  content: IhwVCONTENTaskFirstName
  primaryAction: IhwAction<IhwVDATAaskFirstName>
  secondaryAction?: IhwAction<IhwVDATAaskFirstName>
  otherActions?: Array<IhwAction<IhwVDATAaskFirstName>>
}

declare interface IhwVDATAaskFirstName {
  firstName: string
}

declare type IhwVCONTENTaskFirstName = Array<{
  kind: 'show' | 'entry'
  field: string
  type: IhwTypes
}>

declare interface IhwOUTPUTusefirst {
  full: string
}

declare interface IhwVOPTaskLastName {
  content: IhwVCONTENTaskLastName
  primaryAction?: IhwAction<IhwVDATAaskLastName>
  secondaryAction?: IhwAction<IhwVDATAaskLastName>
  otherActions?: Array<IhwAction<IhwVDATAaskLastName>>
}

declare interface IhwVDATAaskLastName {
  LastName: string
}

declare type IhwVCONTENTaskLastName = Array<{
  kind: 'show' | 'entry'
  field: string
  type: IhwTypes
}>

declare interface IhwOUTPUTusefirst {
  full: string
}

declare interface IhwVOPTshowFullName {
  content: IhwVCONTENTshowFullName
  primaryAction?: IhwAction<IhwVDATAshowFullName>
  secondaryAction?: IhwAction<IhwVDATAshowFullName>
  otherActions?: Array<IhwAction<IhwVDATAshowFullName>>
}

declare interface IhwVDATAshowFullName {
  FullName: string
}

declare type IhwVCONTENTshowFullName = Array<{
  kind: 'show' | 'entry'
  field: string
  type: IhwTypes
}>

declare interface IhwOUTPUTusefirst {
  full: string
}
