
export interface Type {
  tId: string,
  uri: string,
  base: string,
  validate (val: any): false | string
  format (val: any): string
  parse (txt: string): any
}

export interface Process {
  pId: string,
  uri: string,
  title: I18N,
  caption: I18N,
  icon: string,
  volatile: boolean,
}

export interface DocumentField {
  name: string
  primary: boolean
  type: Type
}
export type DocumentIndexFlag = 'asc' | 'desc' | 'text'
export interface DocumentIndex {
  name: string
  fields: Array<{
    field: DocumentField,
    flag: DocumentIndexFlag,
  }>
}

export interface DocumentState {
  name: string
  icon: string
  description: I18N
}

export interface DocumentAction {
  name: string
  from?: DocumentState[]
  to: DocumentState[]
  icon: string
  description: I18N
  run (data: any): Promise<void>
}

export interface Document {
  dId: string,
  uri: string,
  volatile: boolean,
  fields: DocumentField[],
  identification: DocumentIdentification
  states: DocumentState[]
  actions: DocumentAction[]
}

export interface DocumentIdentification {
  name: 'GUID'
}

export const DocumentIdentificationGUID: DocumentIdentification = {
  name: 'GUID'
}

export type I18N = {
  [lang: string]: (...args: any) => string
}
