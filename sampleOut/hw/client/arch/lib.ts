import * as React from 'react';
import { NOTFOUND, LOADING, createPublication, createCachedPublication, Publication, DocInstance } from '@hoda5/h5doc';
import { Process } from './decl'
import { Role } from './def'

export interface Size {
  width: number,
  height: number
}

export interface WindowReference {
  readonly url: Publication<string>
  readonly size: Publication<Size>
  goUrl (url: string, replace: boolean): void
  goHistory (n: number): void
}

export interface Pagelet<S extends
  {
    size: number
    align: 'left' | 'top' | 'right' | 'bottom' | 'content'
  }> {
  state: Publication<S>
}

export interface Pagelets {
  [name: string]: Pagelet<any>
}

export interface Project {
  readonly process: Process
  readonly instanceId: GUID
  readonly draft: Publication<any>
  readonly saved: Publication<any>
  readonly conflict: Publication<any>
}

export interface AuthProviders {
  [name: string]: AuthProvider<any, any>
}

export type AuthProvidersDef<P extends AuthProviders> = {
  [name in keyof P]: Omit<P[name], 'auth'>
} & {
  logout (): Promise<void>
}

export interface User {
  uid: GUID,
  name: string,
  emails: string[],
  permissoes: string[],
  photo?: string,
}

export interface Organization {
  oid: GUID,
  name: string,
  photo?: string,
}

export interface AuthProvider<AUTH extends Auth, ARGS extends object> {
  auth: Publication<LOADING | NOTFOUND | AUTH>
  signIn (args: ARGS): Promise<void>
  signOut (): Promise<void>
}

export type AuthProviderInfo<T> = T extends AuthProvider<infer I, any> ? I : never

export interface Auth {
  uid: GUID,
  name: string,
  roles: string[],
}

export interface AppDecl<P extends Pagelets, AUTH extends AuthProviders, EXT extends object> {
  title: string,
  welcome: Project,
  noauth: (roles: Role[]) => Process,
  noroute: (url: string) => Process,
  pagelets: P,
  windowReference: WindowReference,
  auth: AUTH,
  extensions: EXT,
  routes: Array<AppRoute<any>>,
  getMenu (): AppMenuItem[],
  loading (): React.ReactElement,
}

export interface AppDef<P extends Pagelets, AUTH extends AuthProviders, EXT extends object> {
  location: {
    readonly url: string,
    goHistory (n: number): void
    go (url: string, replace: boolean): void
  }
  pagelets: P,
  auth: AuthProvidersDef<AUTH>,
  getAppState (): ReadOnlyObject<AppState<P, AUTH, EXT>>
  subscribeAppState (fn: (newState: ReadOnlyObject<AppState<P, AUTH, EXT>>) => void, subscribeAppState?: boolean | 'once'): () => void
  setAppTitle (title: string): void
  can (roles: Role[]): boolean,
  run (a: RunContext): Promise<void>,
  loading (): React.ReactElement
  shutdown (): void
}

export type AppState<P extends Pagelets, AUTH extends AuthProviders, EXT extends object> = {
  title: string,
  url: string,
  ctx: AppContext,
  pagelets: P,
  menu: AppMenuItem[],
  //badges: Array<() => AppBagde>,
  auth: LOADING | NOTFOUND | (Auth & { providers: { [name in keyof AUTH]: AuthProviderInfo<AUTH[name]> } }),
  windowSize: Size,
  focus?: InputLet,
  busy: Array<RunContext>
} & EXT

export interface InputLet {
  label: string,
  getter?(): string,
  setter?(nome: string): void,
}

export interface AppContext {
  proc: Process,
  prj: Project,
  // TODO
  // view: Viewlet,
  // dd: AppDocWithDraft<any, any>,
  params: { [name: string]: string },
}
export interface AppRoute<T extends { [name: string]: string }> {
  path: Array<string | { param: keyof T }>,
  proc: Process,
  params?: Partial<T>
}

export interface RunContext {

}

export type Icon = React.Component<{}>

export interface AppBagde {
  visible: boolean,
  title: string,
  icon: Icon,
  count?: number,
  onClick (): void,
}

export type AppMenuItem = AppMenuItemSimple | AppMenuItemWithSubmenu | '-'

export interface AppMenuItemSimple {
  title: string,
  icon: Icon,
  url: string,
  roles: Role[]
}

export interface AppMenuItemWithSubmenu {
  title: string,
  icon: Icon,
  submenu: AppMenuItem[],
  roles: Role[]
}

export function usePub<T> (pub: Publication<T>): T {
  const [r, setR] = React.useState<T>(pub.last);

  React.useEffect(() => {
    return pub.subscribe(setR)
  }, [false]);

  return r;
}