import * as decl from './typesDecl'
import '@hoda5/extensions'

export interface Application {
  name: string
  description: I18N,
  icon: Icon,
  uses: Package[]
  lang: Lang
  roles: Role[]
  langs: Lang[]
  builders: BuilderInfo[]
}

export type Icon = string

export type I18N = {
  [lang in Lang]?: {
    params: Field[],
    msg: string
  }
}

export type Lang = 'pt' | 'en'

export interface Package {
  name: string
  redefines?: Package
  uses: Package[]
  types: Type[],
  collections: Collection[],
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

export interface Type {
  name: string
  base: "string" | "number" | "boolean" | "date"
}

export interface Collection {
  name: string
  fields: Field[]
  indexes: Index[]
}

export interface Field {
  name: string
  type: Type
}

export interface Index {
  name: string
  fields: {
    field: string,
    flag?: 'desc' | 'text'
  }[]
}

export interface Document {
  name: string
  data: Field[]
}

export interface Process {
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
  condition: Ast
}

export interface Task {
  name: string,
  pool?: string,
  lane?: string,
  roles: string[]
  next: NextTask[]
  useView?: UseView
  useFunction?: UseFunction
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

export interface Function {
  name: string
  level: "cpu" | "local" | "net"
  input: Field[]
  output: Field[]
  code: Ast
}

export type Ast = any

export interface BindField {
  field: Field,
  bind: string
}

export type UseFunction = {
  function: Function
  input: BindField[],
  output: BindField[],
}

export interface DefWorkspace extends Workspace {
  apps: { [appName: string]: decl.Application },
  pkgs: { [pkgName: string]: decl.Package },
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

export async function defApp (ws: DefWorkspace, appname: string, onlyLang?: Lang) {

  const declApp: decl.Application = await ws.apps[appname]
  if (!declApp) throw new Error('invalid app name ' + appname)

  const defLang = declApp.langs[0]
  const appLangs = declApp.langs
  const appPackages = await vpackages(declApp.uses);
  const def: Application = {
    name: videntifier(declApp, 'name'),
    description: vi18n(declApp, 'description'),
    icon: vicon(declApp, 'icon'),
    uses: appPackages,
    roles: allroles(),
    lang: defLang,
    langs: appLangs,
    builders: vbuilders()
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
    throw new Error(msg)
  }

  function vbuilders () {
    const ret: BuilderInfo[] = []
    const buildernames = Object.keys(declApp.builders)
    const all = buildernames.map(async (builderName) => {
      const b: BuilderInfo = {
        builderName,
        ws,
        onlyLang,
        config: declApp.builders[builderName],
      }
      ret.push(b)
    })
    return ret
  }

  function allroles () {
    return appPackages
      .map((p) => p.roles)
      .reduce((r, c) => r.concat(c), [])
      .filter((r, i, a) => a.some((r2, i2) => i === i2 && r.name === r2.name))
  }

  async function vpackages (uses: string[]): Promise<Package[]> {
    const ret: Package[] = []
    for (const pkgname of declApp.uses) {
      const pkg = await vpackage(pkgname)
      ret.push(pkg)
    }
    return ret
  }

  async function vpackageOpt (pkgname?: string): Promise<Package | undefined> {
    if (pkgname) return vpackage(pkgname)
  }

  async function vpackage (pkgname: string): Promise<Package> {
    const declPkg: decl.Package = await ws.pkgs[pkgname]
    if (!declPkg) throw new Error('invalid package ' + pkgname)
    const pkgRoles = vpkgroles()

    const redefines = vpackageOpt(declPkg.redefines)
    const pkgUses = vpackages(declPkg.uses)
    const pkgtypes = vtypes(declPkg.types)
    const pkgFunctions = vfunctions(declPkg.functions)
    const pkgViews = vviews(declPkg.views)
    const pkgCollections = vcollections(declPkg.collections)
    const pkgDocuments = vdocuments(declPkg.documents)
    const pkgProcesses = vprocesses(declPkg.processes)

    const pkg: Package = {
      name: videntifier(declPkg, 'name'),
      redefines: await redefines,
      uses: await pkgUses,
      types: await pkgtypes,
      collections: await pkgCollections,
      documents: await pkgDocuments,
      processes: await pkgProcesses,
      roles: pkgRoles,
      views: await pkgViews,
      functions: await pkgFunctions,
    }

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
      const roles: string[] = obj[prop] as any
      return roles.map((r) => {
        if (!pkgRoles.some((pr) => pr.name === r))
          fail(obj, 'invalid role: ' + r)
        return r
      })
    }

    async function vtypes (types: decl.Types) {
      const ret: Type[] = []
      Object.keys(types).forEach((n) => {
        const d = types[n]
        const t: Type = {
          name: n,
          base: d.base
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
      const procVars = await vprocVars()
      const procTasks = await vtasks()
      const ret: Process = {
        name: procName,
        start: vtaskuse(declProc, declProc.start),
        icon: vicon(declProc, 'icon'),
        title: vi18n(declProc, 'title'),
        caption: vi18n(declProc, 'caption'),
        tasks: procTasks,
        vars: procVars,
        roles: vrolesuse(declProc, 'roles'),
        volatile: declProc.volatile
      }
      return ret

      async function vtasks () {
        const ret: Task[] = []
        const taskNames = Object.keys(declProc.tasks)
        for (const taskName of taskNames) {
          const t = await vtask(taskName, declProc.tasks[taskName])
          ret.push(t)
        }
        return ret
      }

      async function vtask (tastName: string, declTask: decl.Task) {
        const useView: decl.UseView = (declTask as any).useView
        const useFunction: decl.UseFunction = (declTask as any).useFunction
        const ret: Task = {
          name: tastName,
          pool: declTask.pool,
          lane: declTask.lane,
          roles: vrolesuse(declTask, 'roles'),
          next: vnexttasks(),
          useFunction: useFunction ? await vuseFunctionOnTask(procVars, useFunction) : undefined,
          useView: useView ? await vuseView(procVars, useView) : undefined,
        }
        return ret
        function vnexttasks () {
          const ret: NextTask[] = []
          const n = declTask.next
          if (typeof n === 'string') ret.push({
            task: vtaskuse(declTask, n), condition: ''
          })
          return ret
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
        if (!ret) fail(obj, 'invalid taskname: ' + taskname)
        return ret
      }

      async function vprocVars () {
        const pvars = declProc.vars
        const input = vprocVar(pvars.input)
        const output = vprocVar(pvars.output)
        const local = vprocVar(pvars.local)
        const ret: ProcessVars = {
          input: await input,
          output: await output,
          local: await local
        }
        return ret
      }
      async function vprocVar (vars: decl.ProcessVars) {
        const names = Object.keys(vars)
        return Promise.all(names.map(async (n) => {
          const field = await vfield(n, vars[n])
          return field
        }))
      }
    }

    async function vfield (fieldname: string, field: decl.Field) {
      const ret: Field = {
        name: fieldname,
        type: await findtype(field.type)
      }
      return ret
    }

    async function findtype (type: string): Promise<Type> {
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
          primaryAction: await primaryAction,
          secondaryAction: await secondaryAction,
          othersActions: await othersActions
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
      await Promise.all(from.fields.map((f) => {
        const bindto = useView[f.name]
        if (!bindto) fail(from, 'falta bind para ' + f.name)
        const bind = h5lib.getPropByPath(vars, bindto)
        if (!bind) fail(from, 'erro no bind de ' + f.name + ' para ' + bindto)
        ret.push({
          field: f,
          bind
        })
      }))
      return ret
    }

    async function vfunctionbindfields (from: Function, bindfields: Field[], useFunction: decl.BindFields): Promise<{
      input: BindField[]
      output: BindField[]
    }> {
      const ret: BindField[] = []
      await Promise.all(fields.map((f) => {
        const bindto = useFunction[f.name]
        if (!bindto) fail(from, 'falta bind para ' + f.name)
        const bind = h5lib.getPropByPath(vars, bindto)
        if (!bind) fail(from, 'erro no bind de ' + f.name + ' para ' + bindto)
        ret.push({
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
        useFunction: await vuseFunctionOnView(fields, action.useFunction)
      }
      return ret
    }

    async function vfindfunction (funcname: string): Promise<Function> {
      const funcs = await pkgFunctions
      const ret = funcs.filter((f) => f.name === funcname)[0]
      if (!ret) fail(declPkg, 'invalid function: ' + funcname)
      return ret
    }
    async function vuseFunctionOnView (fields: Field[], useFunction: "next" | "back" | decl.UseFunction): Promise<"next" | "back" | UseFunction> {
      if (typeof useFunction === 'string') return useFunction;
      const ref = await vfindfunction(useFunction.function)
      const input = await vfunctionbindfields(ref, fields, useFunction.input)
      const output = await vfunctionbindfields(ref, fields, useFunction.output)
      const ret: UseFunction = { function: ref, input, output }
      return ret
    }

    async function vfunctions (functions: decl.Functions) {
      return xnull as any as Function[]
    }

    async function vuseFunctionOnTask (procVars: ProcessVars, useFunction: "next" | "back" | decl.UseFunction): Promise<UseFunction> {
      const ref = await vfindview(useView.view)
      const bind = await vviewindfields(ref, procVars, useView.bind)
      const ret: UseView = { ref, bind }
      return ret
    }

    async function vcollections (collections: decl.Collections) {
      return null as any as Collection[]
    }

    async function vdocuments (documents: decl.Documents) {
      return null as any as Document[]
    }
  }
}