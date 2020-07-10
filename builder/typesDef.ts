import * as decl from './typesDecl'
import { FunctionDeclaration, MethodDeclaration } from 'ts-morph'
import '@hoda5/extensions'
import { defaultTypes } from './defaults'

export interface Application {
  name: string
  description: I18N,
  icon: Icon,
  uses: PackageUses,
  packageList: Package[],
  packages: {
    [uri in PackageURI]: Package
  },
  lang: Lang
  roles: Role[]
  langs: Lang[]
  builders: BuilderInfo[]
  mappings: AppMappings
}

export interface AppMappings {
  [uri: string]: string
}

export type Icon = string

export type I18N = {
  [lang in Lang]?: I18NP
}

export interface I18NP {
  params: Field[],
  msg: string
}

export type Lang = 'pt' | 'en'

export type PackageURI = '$PackageURI'

export interface PackageUses {
  [alias: string]: Package
}

export interface Package {
  uri: {
    alias?: string
    full: PackageURI
    ns: string
    path: string
    mappables: string[]
  },
  redefines?: Package
  uses: PackageUses,
  types: Type[],
  documents: Document[],
  processes: Process[],
  roles: Role[]
  views: View[],
  functions: Function[],
}

export type Roles = {
  [typeName: string]: Role
}

export interface Role {
  name: string
  description: I18N,
  icon: Icon
}

export interface Mappable {
  uri: string
  getId (app: Application): string
}

export interface Type extends Mappable {
  name: string
  base: "string" | "number" | "boolean" | "date"
  validate: Ast | false
  format: Ast | false
  parse: Ast | false
}

export interface Field {
  name: string
  type: Type
}

export interface DocField extends Field {
  primary: boolean
}

export interface DocumentState {
  name: string
  icon: Icon
  description: I18N
}

export interface DocumentAction {
  name: string
  from: undefined | DocumentState[]
  to: undefined | DocumentState[]
  icon: Icon
  description: I18N
  run: Ast | false
}

export interface Document extends Mappable {
  name: string
  identification: 'GUID'
  fields: DocField[]
  indexes: DocIndex[]
  persistence: 'session' | 'persistent'
  states: DocumentState[]
  actions: DocumentAction[]
}

export type DocIndexFlag = 'asc' | 'desc' | 'text'
export interface DocIndexField {
  field: Field
  flag: DocIndexFlag
}

export interface DocIndex {
  name?: string
  fields: DocIndexField[]
}

export interface Process extends Mappable {
  name: string
  start: UseTask
  icon: string
  title: I18N
  caption: I18N
  tasks: Task[]
  vars: ProcessVars,
  roles: string[]
  volatile: boolean
}

interface ProcessVars {
  input: Field[]
  output: Field[]
  local: Field[]
}

export type NextTask = {
  task: UseTask
  condition?: Ast
}

export interface Task {
  name: string,
  pool?: string,
  lane?: string,
  roles: string[]
  next: NextTask[]
  useView?: UseView
  useFunction?: "next" | "back" | UseFunction
}

export interface UseTask {
  ref: Task
}

export interface View {
  name: string
  fields: Field[]
  content: Widget[]
  primaryAction?: ViewAction | undefined
  secondaryAction?: ViewAction | undefined
  othersActions?: ViewAction[] | undefined
}

export interface UseView {
  ref: View
  bind: BindField[]
}

export interface ViewAction {
  caption: I18N
  useFunction: "next" | "back" | UseFunction
}

export interface Widget {
  kind: "entry" | "show",
  children?: Widget[]
  field?: string,
  type?: Type
}

export type FunctionLevel = "cpu" | "io" | "net"

export interface Function {
  name: string
  level: FunctionLevel
  input: Field[]
  output: Field[]
  code: Ast
}

export type UseFunction = {
  function: Function
  input: BindField[],
  output: BindField[],
}

export interface BindField {
  field: Field,
  bind: Field
}

export interface Ast {
  func: MethodDeclaration
}

export interface DefWorkspace extends Workspace {
  decl: {
    apps: { [appName: string]: decl.Application },
    pkgs: { [pkgUri in decl.PackageURI]: decl.Package },
  },
  def: {
    apps: { [appName: string]: Promise<Application> },
  }
}

export interface Workspace {
  rootDir: string
  tempDir: string
  builders: {
    [name: string]: BuilderImpl
  }
}

export interface BuilderInfo {
  ws: Workspace,
  config: BuilderConfig
  onlyLang?: Lang
  builderName: string,
}

export interface BuilderImpl {
  buildApp (ws: DefWorkspace, app: Application, info: BuilderInfo): Promise<void>
}

export interface BuilderConfig {
  rootDir: string
}

export async function getAppDef (ws: DefWorkspace, appname: string, onlyLang?: Lang) {
  return ws.def.apps[appname] || (ws.def.apps[appname] = defApp(ws, appname, onlyLang))
}

async function defApp (ws: DefWorkspace, appname: string, onlyLang?: Lang) {

  const pPackages: { [uri in decl.PackageURI]: () => Promise<Package> } = {} as any

  const declApp: decl.Application = ws.decl.apps[appname]
  if (!declApp) throw new Error('invalid app name ' + appname)

  const defLang = declApp.langs[0]
  const appLangs = declApp.langs
  const appPackageList: Package[] = []
  const appMappings: AppMappings = {}
  const appUses = await vusePackages(declApp.uses);
  const appPackages: { [uri in PackageURI]: Package } = {} as any
  await Promise.all(Object.keys(pPackages).map(async (pkguri) => {
    const pkg = await pPackages[(pkguri as decl.PackageURI)]()
    appPackages[(pkguri as PackageURI)] = pkg
  }))
  const def: Application = {
    name: videntifier(declApp, 'name'),
    description: vi18n(declApp, 'description'),
    icon: vicon(declApp, 'icon'),
    uses: appUses,
    packageList: appPackageList,
    packages: appPackages,
    roles: allroles(),
    lang: defLang,
    langs: appLangs,
    builders: await vbuilders(),
    mappings: appMappings
  }
  return def

  function videntifier<T extends object> (obj: T, prop: keyof T): string {
    const r: string = obj[prop] as any
    if (!/[A-Z,a-z][A-Z,a-z]*/g.test(r))
      fail(obj, 'invalid identifier on ' + prop + ' ' + r)
    return r
  }

  function vicon<T extends object> (obj: T, prop: keyof T): string {
    const r: string = obj[prop] as any
    return r
  }

  function vi18n<T extends object> (obj: T, prop: keyof T): I18N {
    const msgs: {
      [lang in Lang]: string
    } = (typeof obj[prop] == 'string' ? { [defLang]: obj[prop] } : obj[prop]) as any
    const ret: I18N = {}
    appLangs.forEach((l) => {
      if (onlyLang && onlyLang !== l) return
      const msg = msgs[l]
      if (!msg) throw fail(obj, 'no translation for ' + prop + '.' + l)
      const params: Field[] = []
      ret[l] = {
        msg,
        params
      }
    })
    return ret
  }

  function fail (obj: any, msg: string) {
    throw new Error(msg + JSON.stringify(obj))
  }

  async function vbuilders () {
    const ret: BuilderInfo[] = []
    const buildernames = Object.keys(declApp.builders)
    await Promise.all(buildernames.map(async (builderName) => {
      const b: BuilderInfo = {
        builderName,
        ws,
        onlyLang,
        config: declApp.builders[builderName],
      }
      ret.push(b)
    }))
    return ret
  }

  function allroles () {
    return Object.keys(appPackages)
      .map((pkguri) => appPackages[(pkguri as PackageURI)].roles)
      .reduce((r, c) => r.concat(c), [])
      .filter((r, i, a) => a.some((r2, i2) => i === i2 && r.name === r2.name))
  }

  async function vusePackages (uses: decl.PackageUses): Promise<PackageUses> {
    const ret: PackageUses = {}
    const aliases: PackageURI[] = Object.keys(uses) as any
    await Promise.all(aliases.map(async (alias) => {
      const uri = uses[alias]
      const pkg = await vusePackage(uri)
      ret[alias] = pkg
    }))
    return ret
  }

  async function vpackageOpt (pkguri?: decl.PackageURI): Promise<Package | undefined> {
    if (pkguri) return vusePackage(pkguri)
  }

  async function vusePackage (pkguri: decl.PackageURI): Promise<Package> {
    const declPkg = ws.decl.pkgs[pkguri]
    if (!declPkg) throw new Error('invalid package ' + pkguri)

    const ppkg = pPackages[pkguri]
    if (ppkg) return ppkg()

    const uri = { ...declPkg.uri, mappables: [] }

    const pkg: Package = { uri } as any
    pPackages[pkguri] = async () => pkg

    const pkgRoles = vpkgroles()
    pkg.roles = pkgRoles

    const redefines = vpackageOpt(declPkg.redefines)
    pkg.redefines = await redefines

    const pkgUses = vusePackages(declPkg.uses)
    pkg.uses = await pkgUses

    const pkgtypes = vtypes(declPkg.types)
    pkg.types = await pkgtypes

    const pkgFunctions = vfunctions(declPkg.functions)
    pkg.functions = await pkgFunctions

    const pkgViews = vviews(declPkg.views)
    pkg.views = await pkgViews

    const pkgDocuments = vdocuments(declPkg.documents)
    pkg.documents = await pkgDocuments

    const pkgProcesses = vprocesses(declPkg.processes)
    pkg.processes = await pkgProcesses

    appPackageList.push(pkg)
    return pkg

    function vpkgroles<T extends object> () {
      const ret: Role[] = []
      const roles = Object.keys(declPkg.roles)
      roles.forEach((rolename) => {
        const role = declPkg.roles[rolename]
        if (!/[A-Z,a-z][A-Z,a-z]*/g.test(rolename))
          fail(declPkg, 'invalid role on ' + rolename)
        const r: Role = {
          name: rolename,
          description: vi18n(role, 'description'),
          icon: role.icon
        }
        ret.push(r)
      })
      return ret
    }

    function vrolesuse<T extends object> (obj: T, prop: keyof T): string[] {
      let roles: string | string[] = obj[prop] as any
      if (!roles) fail(obj, 'roles não foi definido')
      if (typeof roles === 'string') roles = [roles]
      return roles.map((r) => {
        if (!pkgRoles.some((pr) => pr.name === r))
          fail(obj, 'invalid role: ' + r)
        return r
      })
    }

    function vmappable (n: string): Mappable {
      const uri = pkg.uri.full + '#' + n
      if (pkg.uri.mappables.indexOf(uri) >= 0) fail(pkg, 'duplicate ' + n)
      pkg.uri.mappables.push(uri)
      const m = declApp.mappings[uri]
      if (m) appMappings[uri] = m
      return {
        uri,
        getId: getMappedId
      }
    }

    function getMappedId (this: Mappable, app: Application): string {
      const id = appMappings[this.uri]
      return id || 'UNMAPPED_ID(\'' + this.uri + '\')'
    }

    async function vtypes (types: decl.Types) {
      let ret: Type[] = []
      if (types) ret = Object.keys(types).map((n) => {
        const d = types[n]
        const t: Type = {
          name: n,
          base: d.base,
          validate: d.validate,
          parse: d.parse,
          format: d.format,
          ...vmappable(n + '.type')
        }
        return t
      })
      return ret
    }

    async function vprocesses (processes: decl.Processes) {
      const ret: Process[] = []
      const procNames = Object.keys(processes)
      for (const procName of procNames) {
        const p = await vprocess(procName, processes[procName])
        ret.push(p)
      }
      return ret
    }

    async function vprocess (procName: string, declProc: decl.Process) {
      const procTasks: Task[] = []
      const procVars = await vprocVars()
      await vtasks()
      const ret: Process = {
        name: procName,
        start: vtaskuse(declProc, declProc.start),
        icon: vicon(declProc, 'icon'),
        title: vi18n(declProc, 'title'),
        caption: vi18n(declProc, 'caption'),
        tasks: procTasks,
        vars: procVars,
        roles: vrolesuse(declProc, 'roles'),
        volatile: declProc.volatile,
        ...vmappable(procName + '.proc')
      }
      return ret

      async function vtasks () {
        const taskNames = Object.keys(declProc.tasks)
        for (const taskName of taskNames) {
          const t: Task = {
            name: taskName
          } as any
          procTasks.push(t)
        }
        await Promise.all(procTasks.map((t) => vtask(t, declProc.tasks[t.name])))
      }

      async function vtask (task: Task, declTask: decl.Task) {
        const uf: decl.UseFunction = (declTask as any).useFunction
        const uv: decl.UseView = (declTask as any).useView
        task.pool = declTask.pool
        task.lane = declTask.lane
        if (uv) task.roles = vrolesuse(declTask, 'roles')
        task.next = vnexttasks()
        task.useView = uv ? await vuseView(procVars, uv) : undefined
        task.useFunction = uf ? await vuseFunctionOnTask(procVars, uf) : undefined
        function vnexttasks () {
          const ret: NextTask[] = []
          vnexttask(declTask.next)
          return ret
          function vnexttask (n: decl.NextTask | decl.NextTask[]) {
            if (typeof n === 'string') {
              ret.push({
                task: vtaskuse(declTask, n)
              })
            } else if (Array.isArray(n)) {
              n.forEach(vnexttask)
            } else {
              for (const forkname of Object.keys(n)) {
                const cond = n[forkname]
                ret.push({
                  task: vtaskuse(n, forkname),
                  condition: vast(n, cond)
                })
              }
            }
          }
        }
      }

      function vtaskuse (obj: any, taskname: string) {
        let ret: UseTask = undefined as any
        procTasks.some((t) => {
          if (t.name === taskname) {
            ret = { ref: t }
            return true
          }
        })
        if (!ret) {
          fail(obj, 'invalid taskname: ' + taskname)
        }
        return ret
      }

      async function vprocVars () {
        const pvars = declProc.vars
        const input = vfields(pvars.input)
        const output = vfields(pvars.output)
        const local = vfields(pvars.local)
        const ret: ProcessVars = {
          input: await input,
          output: await output,
          local: await local
        }
        return ret
      }

    }

    async function vfields (vars: decl.Fields) {
      const names = Object.keys(vars || [])
      return Promise.all(names.map(async (n) => {
        const field = await vfield(n, vars[n])
        return field
      }))
    }

    async function vfield (fieldname: string, field: decl.Field) {
      const ret: Field = {
        name: fieldname,
        type: await findtype(field.type)
      }
      return ret
    }

    async function vfindfield (scope: Field[], fieldname: string): Promise<Field> {
      const ret = scope.filter((f) => f.name === fieldname)[0]
      if (!ret) fail(scope, fieldname + ' não encontado')
      return ret
    }

    async function findtype (type: string): Promise<Type> {
      if (defaultTypes[type]) return defaultTypes[type]
      const types = await pkgtypes
      const ret = types.filter((t) => t.name === type)[0]
      if (!ret) fail(declPkg, 'invalid type: ' + type)
      return ret
    }

    async function vfindview (view: string): Promise<View> {
      const views = await pkgViews
      const ret = views.filter((t) => t.name === view)[0]
      if (!ret) fail(declPkg, 'invalid views: ' + views)
      return ret
    }

    async function vviews (views: decl.Views): Promise<View[]> {
      const viewsnames = Object.keys(views)
      return Promise.all(viewsnames.map(async (n) => {
        const decl = views[n]
        const { content, fields } = await vwidgets(decl.content)
        const primaryAction = decl.primaryAction && vaction(fields, decl.primaryAction)
        const secondaryAction = decl.secondaryAction && vaction(fields, decl.secondaryAction)
        const othersActions = decl.othersActions && Promise.all(decl.othersActions.map((a) => vaction(fields, a)))

        const view: View = {
          name: n,
          fields: fields,
          content: content,
          primaryAction: primaryAction && await primaryAction,
          secondaryAction: secondaryAction && await secondaryAction,
          othersActions: othersActions && await othersActions
        }
        return view
      }))
    }

    async function vwidgets (widgets: decl.Widget[]): Promise<{ fields: Field[], content: Widget[] }> {
      const fields: Field[] = []
      const content: Widget[] = []
      await Promise.all(widgets.map(async (d) => {
        const children = d.children && await vwidgets(d.children)
        const type = d && d.type ? await findtype(d.type) : undefined
        const w: Widget = {
          kind: d.kind,
          children: children?.content,
          field: d && d.field,
          type: await type
        }
        content.push(w)
        const fs: Field[] = children ? children.fields : []
        if (d && d.field) fs.push({ name: d.field as any, type: type as any })
        fs.forEach((f) => {
          if (!fields.some((f2) => f2.name === f.name))
            fields.push(f)
        })
      }))
      return { fields, content }
    }

    async function vviewindfields (from: View, vars: ProcessVars, useView: decl.BindFields): Promise<BindField[]> {
      const ret: BindField[] = []
      await Promise.all(from.fields.map(async (f) => {
        const bindto = useView[f.name]
        if (!bindto) fail(from, 'falta bind para ' + f.name)
        const m = /^(\w*)\.(.*)$/g.exec(bindto)
        const scope: Field[] = m && m[1] && h5lib.getPropByPath(vars, m[1])
        const bind = scope && m && m[2] && await vfindfield(scope, m[2])
        if (!bind) fail(from, 'erro no bind de ' + f.name + ' para ' + bindto)
        else ret.push({
          field: f,
          bind
        })
      }))
      return ret
    }

    async function vuseView (procVars: ProcessVars, useView: decl.UseView): Promise<UseView> {
      const ref = await vfindview(useView.view)
      const bind = await vviewindfields(ref, procVars, useView.bind)
      const ret: UseView = { ref, bind }
      return ret
    }

    async function vaction (fields: Field[], action: decl.ViewAction): Promise<ViewAction> {
      const ret: ViewAction = {
        caption: vi18n(action, 'caption'),
        useFunction: await vuseFunctionOnView(fields, action.run)
      }
      return ret
    }

    async function vfindfunction (funcname: string): Promise<Function> {
      const funcs = await pkgFunctions
      const ret = funcs.filter((f) => f.name === funcname)[0]
      if (!ret) fail(declPkg, 'invalid function: ' + funcname)
      return ret
    }

    async function vuseFunctionOnView (viewfields: Field[], useFunction: "next" | "back" | decl.UseFunction): Promise<"next" | "back" | UseFunction> {
      if (typeof useFunction === 'string') return useFunction;
      const ref = await vfindfunction(useFunction.function)
      const input = vfunctionbindfields(ref, viewfields, useFunction.input, 'input')
      const output = vfunctionbindfields(ref, viewfields, useFunction.output, 'output')
      return { function: ref, input: await input, output: await output }
    }

    async function vfunctionbindfields (from: Function, viewfields: Field[], partfields: decl.BindFields, scope: 'input' | 'output'): Promise<BindField[]> {
      const ret: BindField[] = []
      await Promise.all(viewfields.map((vf) => {
        const bindto = partfields[vf.name]
        if (!bindto) fail(from, 'falta bind para ' + from.name + ' ' + scope + '.' + vf.name)
        const bind = from[scope].filter((ff) => ff.name === bindto)[0]
        if (!bind) fail(from, 'erro no bind de ' + from.name + ' ' + scope + '.' + bindto)
        ret.push({
          field: vf,
          bind
        })
      }))
      return ret
    }

    async function vuseFunctionOnTask (procVars: ProcessVars, useFunction: "next" | "back" | decl.UseFunction): Promise<"next" | "back" | UseFunction> {
      if (typeof useFunction === 'string') return useFunction
      const ref = await vfindfunction(useFunction.function)
      const input = vfunctionbindfields(ref, procVars.input, useFunction.input, 'input')
      const output = vfunctionbindfields(ref, procVars.output, useFunction.output, 'output')
      return { function: ref, input: await input, output: await output }
    }

    async function vfunctions (functions: decl.Functions): Promise<Function[]> {
      const funcnames = Object.keys(functions)
      return await Promise.all(funcnames.map(async (fn) => {
        const d = functions[fn]
        const input = vfields(d.input)
        const output = vfields(d.output)
        const f: Function = {
          name: fn,
          level: d.level,
          input: await input,
          output: await output,
          code: d.code as any as Ast
        }
        return f
      }))
    }

    async function vdocuments (documents: decl.Documents) {
      const docnames = Object.keys(documents)
      return await Promise.all(docnames.map((dn) => vdocument(dn, documents[dn])))
    }

    async function vdocument (dn: string, d: decl.Document) {
      const primaryFields = await vfields(d.primaryFields)
      const secondaryFields = await vfields(d.secondaryFields)
      const docStates = vdocstates(d.states)
      const ret: Document = {
        name: dn,
        identification: d.identification,
        fields: primaryFields.map((f) => ({ ...f, primary: true }))
          .concat(secondaryFields.map((f) => ({ ...f, primary: false }))),
        persistence: d.persistence,
        states: await docStates,
        actions: await vdocactions(d.actions),
        indexes: await vdocindexes(d.indexes, primaryFields, secondaryFields),
        ...vmappable(dn + '.doc')
      }
      return ret

      async function vdocstates (documentStates: decl.DocumentStates) {
        const statenames = Object.keys(documentStates)
        return await Promise.all(statenames.map(async (sn) => {
          const s = documentStates[sn]
          const ret: DocumentState = {
            name: sn,
            icon: vicon(s, 'icon'),
            description: vi18n(s, "description")
          }
          return ret
        }))
      }

      async function vusedocstates (obj: any, statenames: string | string[]) {
        if (statenames) {
          const d = await docStates
          return (typeof statenames == 'string' ? [statenames] : statenames).map((sn) => {
            const s = d.filter((si) => si.name === sn)[0]
            if (!s) fail(obj, 'invalid state: ' + s)
            return s
          })
        }
        return undefined
      }

      async function vdocactions (documentActions: decl.DocActions) {
        const actionnames = Object.keys(documentActions)
        return await Promise.all(actionnames.map(async (an) => {
          const a = documentActions[an]
          const ret: DocumentAction = {
            name: an,
            from: await vusedocstates(a, a.from),
            to: await vusedocstates(a, a.to),
            icon: vicon(a, 'icon'),
            description: vi18n(a, "description"),
            run: vast(a, a.run)
          }
          return ret
        }))
      }

      async function vdocindexes (documentIndexes: decl.DocIndexes, primaryFields: Field[], secondaryFields: Field[]) {
        const indexnames = Object.keys(documentIndexes)
        return await Promise.all(indexnames.map(async (idxn) => {
          const i = documentIndexes[idxn]
          const fields = await Promise.all(i.map(async (idxf) => {
            const flag: DocIndexFlag = idxn === 'text' ? 'text' : 'asc'
            let field = await vfindfield(primaryFields, idxf)
            if (!field) field = await vfindfield(secondaryFields, idxf)
            const fret: DocIndexField = {
              field,
              flag
            }
            return fret
          }))
          const iret: DocIndex = {
            fields
          }
          if (idxn !== 'text') iret.name = idxn
          return iret
        }))
      }
    }

    function vast (obj: any, source: false | decl.Ast): Ast {
      return source as any
    }
  }
}
