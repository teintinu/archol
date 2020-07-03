
export interface Application {
  name: string
  description: I18N,
  icon: Icon,
  uses: string[]
  langs: Lang[]
  builders: {
    [builderName: string]: BuilderConfig
  }
}

export type Icon = string

export type I18N = string | {
  [lang in Lang]?: string
}

export type Lang = 'pt' | 'en'

export interface Package {
  name: string
  redefines?: string
  uses: string[]
  types: Types,
  collections: Collections,
  documents: Documents,
  processes: Processes,
  roles: Roles
  views: Views,
  functions: Functions,
}

export type Roles = {
  [typeName: string]: Role
}

export interface Role {
  description: I18N,
  icon: Icon
}

export type Types = {
  [typeName: string]: Type
}

export const basicTypes = {
  string: true,
  number: true,
  boolean: true,
  date: true
}

export interface Type {
  base: keyof typeof basicTypes
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
  icon: string
  title: I18N
  caption: I18N
  tasks: Tasks
  vars: {
    input: Fields,
    output: Fields,
    local: Fields,
  }
  roles: string[]
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
  pool?: string,
  lane?: string,
  roles: string[]
  next: NextTask | NextTask[]
}

export interface UITask extends BaseTask {
  useView: UseView
}

export interface BindFields {
  [field: string]: string
}

export interface UseView {
  view: string
  bind: BindFields,
}

export interface SystemTask extends BaseTask {
  useFunction: UseFunction
}

export interface UseFunction {
  function: string
  input: BindFields,
  output: BindFields,
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
  run: "next" | "back" | UseFunction
}

export interface Widget {
  kind: "entry" | "show",
  children?: Widget[]
  field?: string,
  type?: string
}

export type Functions = {
  [typeName: string]: Function
}

export type FunctionLevel = "cpu" | "io" | "net"

export interface Function {
  level: FunctionLevel
  input: Fields
  output: Fields
  code: string
}

export interface BuilderConfig {
  rootDir: string
}
