import * as decl from './typesDecl'

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
  type: string
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
  vars: ProcessVar[],
  roles: string[]
  volatile: boolean
}

interface ProcessVar extends Field {
  scope: 'input' | 'output' | 'local'
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
  content: Widget[]
  primaryAction?: ViewAction
  secondaryAction?: ViewAction
  othersActions?: ViewAction[]
}

export interface UseView {
  ref: View
  vars: ProcessVar[]
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

export interface Function {
  name: string
  level: "cpu" | "local" | "net"
  input: Field[]
  output: Field[]
  code: Ast
}

export type Ast = any

export interface FunctionField {
  local: Field,
  bind: ProcessVar
}

export interface UseFunction {
  function: string
  input: FunctionField[],
  output: FunctionField[],
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
      ret[l] = {
        msg: msgs[l],
        params: []
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

    const pkgViews = await vviews(declPkg.views)
    const pkgFunctions = await vfunctions(declPkg.functions)
    const pkgProcesses = await vprocesses(declPkg.processes)

    const pkg: Package = {
      name: videntifier(declPkg, 'name'),
      redefines: await vpackageOpt(declPkg.redefines),
      uses: await vpackages(declPkg.uses),
      types: await vtypes(declPkg.types),
      collections: await vcollections(declPkg.collections),
      documents: await vdocuments(declPkg.documents),
      processes: pkgProcesses,
      roles: pkgRoles,
      views: pkgViews,
      functions: pkgFunctions,
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
      return null as any as Type[]
    }

    async function vcollections (collections: decl.Collections) {
      return null as any as Collection[]
    }

    async function vdocuments (documents: decl.Documents) {
      return null as any as Document[]
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
      const procVars = await vvars()
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
        const useView: string = (declTask as any).useView
        const useFunction: decl.UseFunction = (declTask as any).useFunction
        const ret: Task = {
          name: tastName,
          pool: declTask.pool,
          lane: declTask.lane,
          roles: vrolesuse(declTask, 'roles'),
          next: vnexttasks(),
          useFunction: useFunction ? await vuseFunction(useFunction) : undefined,
          useView: useView ? await vuseView(useView) : undefined,
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
      async function vvars () {
        const pvars = declProc.vars
        const ret: ProcessVar[] = []
        return ret
        // {
        //   input: Field[],
        //   output: Field[],
        //   local: Field[],
        // }
      }
    }

  }

  async function vviews (views: decl.Views) {
    return null as any as View[]
  }

  async function vuseView (view: string) {
    return null as any as UseView
  }

  async function vfunctions (functions: decl.Functions) {
    return null as any as Function[]
  }

  async function vuseFunction (useFunction: decl.UseFunction) {
    return null as any as UseFunction
  }
}