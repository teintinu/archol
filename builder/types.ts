
export interface Application {
  name: string
  description: I18N,
  uses: string[]
  lang: string
  rules: string[]
  builders: {
    [builderName: string]: BuilderConfig
  }
}

export type I18N = string | {
  [lang in Lang]: string
}

export type Lang = 'pt' | 'en'

export interface Package {
  name: string
  uses: string[]
  types: Types,
  collections: Collections,
  documents: Documents,
  processes: Processes,
  views: Views,
  functions: Functions,
}

export type Types = {
  [typeName: string]: Type
}

export interface Type {
  base: "string" | "number" | "boolean" | "date"
}

export type Fields = {
  [typeName: string]: Field
}

export type Collections = {
  [typeName: string]: Collection
}

export interface Collection {
  fields: Fields
  indexes: Indexes
}

export interface Field {
  type: string
}

export type Indexes = {
  [typeName: string]: Index
}

export interface Index {
  type: string
}

export type Documents = {
  [typeName: string]: Document
}

export interface Document {
  data: Fields
}

export type Processes = {
  [typeName: string]: Process
}

export interface Process {
  start: string
  tasks: Tasks
  variables: Fields
  rules: string[]
  volatile: boolean
}

export type Tasks = {
  [typeName: string]: Task
}

export type Task = UITask | SystemTask
export type NextTask = string | {
  task: string
  condition: string
}

export interface BaseTask {
  rules: string[]
  next: NextTask | NextTask[]
}

export interface UITask extends BaseTask {
  useView: string
}

export interface SystemTask extends BaseTask {
  useFunction: UseFunction
}

export type Views = {
  [typeName: string]: View
}

export interface View {
  content: Widget[]
  primaryAction?: ViewAction
  secondaryAction?: ViewAction
  othersActions?: ViewAction[]
}

export interface ViewAction {
  caption: I18N
  useFunction: "next" | "back" | UseFunction
}

export type Widget = WidgetEntry | WidgetShow

export interface WidgetEntry {
  kind: "entry",
  var: string
}

export interface WidgetShow {
  kind: "show",
  var: string
}

export type Functions = {
  [typeName: string]: Function
}

export interface Function {
  level: "cpu" | "local" | "net"
  input: Fields
  output: Fields
  code: string
}

export interface UseFunction {
  function: string
  input: {
    [param: string]: string
  },
  output: {
    [param: string]: string
  },
}

export interface Workspace {
  rootDir: string
  builders: {
    [name: string]: Builder
  },
  getApp(name: string): Promise<Application>
}

export interface Builder {
  build(ws: Workspace, app: Application, cfg: BuilderConfig): Promise<void>
}

export interface BuilderConfig {
  rootDir: string
}
