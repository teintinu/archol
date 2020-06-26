import { Package, basicTypes, View, Widget } from '../typesDecl';

export async function genpkg (pkg: Package) {

  let procCount = 0

  const processesNames = Object.keys(pkg.processes)
  const processesDecl = processesNames.map((procname) => {
    return `      ${procname}: I${pkg.name}Process${procname},`
  }).join('\n')

  const functionsNames = Object.keys(pkg.functions)
  const functionsDecl = functionsNames.map((funcname) => {
    return `      ${funcname}: I${pkg.name}OPT${funcname},`
  }).join('\n')

  const viewsnames = Object.keys(pkg.views)
  const useview = viewsnames.map((v) => {
    return '"' + v + '"'
  }).join('|')
  const viewsDecl = viewsnames.map((viewname) => {
    return `      ${viewname}: I${pkg.name}VOPT${viewname},`
  }).join('\n')

  const rolesnames = Object.keys(pkg.roles)
  const rolesDecl = rolesnames.map((r) => {
    return '"' + r + '"'
  }).join('|')

  let lines: string[] = `

  declare function declarePackage (name: '${pkg.name}'): I${pkg.name}Uses
  declare interface I${pkg.name}Uses {
    uses (packages: PackageUrls[]): I${pkg.name}Roles
  }
  
  declare interface I${pkg.name}Roles {
    roles (roles: Roles): I${pkg.name}Processes
  }
  
  declare type I${pkg.name}Role = ${rolesDecl}
  declare type I${pkg.name}UseRoles = I${pkg.name}Role[]

  declare type I${pkg.name}Processes = {
    processes (processes: {
${processesDecl}
    }): I${pkg.name}Functions
  }

  declare type I${pkg.name}UseView = ${useview}

  declare type I${pkg.name}Fields = {
    [fieldName: string]: I${pkg.name}Field
  }
  
  declare interface I${pkg.name}Field {
    type: I${pkg.name}Types
  }
  
  declare type I${pkg.name}Types = 'string'
  
  declare interface I${pkg.name}Functions {
    functions (functions: {
${functionsDecl}
    }): I${pkg.name}Views
  }

  declare interface I${pkg.name}Views {
    views (functions: {
${viewsDecl}      
    }): void
  }
  
`.split('\n')
  for (const procname of processesNames) {
    procCount++
    const proc = pkg.processes[procname]
    const inputNames = Object.keys(proc.vars.input);
    const scopeInput = inputNames
      .map((n) => `      ${n}: ${basetype(proc.vars.input[n].type)}`)
    const outputNames = Object.keys(proc.vars.ouput);
    const scopeOutput = outputNames
      .map((n) => `      ${n}: ${basetype(proc.vars.ouput[n].type)}`)
    const localNames = Object.keys(proc.vars.local);
    const scopeLocal = localNames
      .map((n) => `      ${n}: ${basetype(proc.vars.local[n].type)}`)

    const scopePaths = inputNames.map((i) => '"input.' + i + '"')
      .concat(outputNames.map((o) => '"output.' + o + '"'))
      .concat(localNames.map((l) => '"local.' + l + '"'))
      .join('|')

    const tasksnames = Object.keys(proc.tasks)
    const procTaskNames = tasksnames.map((t) => '"' + t + '"').join('|')

    lines = lines.concat(`
  declare interface I${pkg.name}Process${procname} {
    title: I18N,
    caption: I18N,
    icon: Icon,
    start: I${pkg.name}TaskName${procname},
    volatile: true,
    roles: I${pkg.name}UseRoles[],
    vars: I${pkg.name}Vars${procname}
    tasks: I${pkg.name}Tasks${procname},
  }
    
  declare interface I${pkg.name}Vars${procname} {
    input: I${pkg.name}Fields
    output: I${pkg.name}Fields
    local: I${pkg.name}Fields
  }
  
  declare interface I${pkg.name}Scope${procname} {
    input: {
${scopeInput}
    }
    output: {
${scopeOutput}
    }
    local: {
${scopeLocal}      
    }
  }
  
  declare type I${pkg.name}ScopePath${procname} = ${scopePaths}      
  
  declare type I${pkg.name}TaskName${procname} = ${procTaskNames}
  
  declare type I${pkg.name}Tasks${procname} = {
    [taskName: string]: I${pkg.name}Task${procname}
  }

  declare type I${pkg.name}Task${procname} = {
    useView: I${pkg.name}UseView,
    next: I${pkg.name}NextTask${procname},
    roles: I${pkg.name}UseRoles
  } | {
    useFunction: I${pkg.name}UseFunction${procname},
    next: I${pkg.name}NextTask${procname},
  }
  
  declare type I${pkg.name}NextTask${procname} = I${pkg.name}TaskName${procname} | {
    [task in I${pkg.name}TaskName${procname}]?: (vars: I${pkg.name}Scope${procname}) => boolean
  }

  declare type I${pkg.name}UseFunction${procname} = {

`.split('\n'))

    let firsttask = true
    let flines: string[] = []
    for (const funcname of functionsNames) {
      const func = pkg.functions[funcname]
      const finputname = Object.keys(pkg.functions[funcname].input)
      const finputUse = finputname.map((i) => `      ${i}: I${pkg.name}ScopePath${procname}`).join('\n')
      const fscopeInput = finputname
        .map((n) => `      ${n}: ${basetype(func.input[n].type)}`)
      const foutputname = Object.keys(pkg.functions[funcname].output)
      const foutputUse = foutputname.map((o) => `      ${o}: I${pkg.name}ScopePath${procname}`).join('\n')
      const fscopeOutput = foutputname
        .map((n) => `      ${n}: ${basetype(func.output[n].type)}`)

      if (firsttask) firsttask = false
      else lines.push('  } | {')
      lines = lines.concat(`   
    function: '${funcname}',
    input: {
${finputUse}
    },
    output: {
      ${foutputUse}
    }
    `.split('\n'))
      if (procCount === 1) flines = flines.concat(`
    declare interface I${pkg.name}OPT${funcname} {
      level: FunctionLevel
      input: I${pkg.name}Fields,
      output: I${pkg.name}Fields,
      code (vars: { input: I${pkg.name}INPUT${funcname}, output: I${pkg.name}OUTPUT${funcname} }): void
    }
    
    declare interface I${pkg.name}INPUT${funcname} {
${fscopeInput}
      first: string
      last: string
    }
    
    declare interface I${pkg.name}OUTPUT${funcname} {
${fscopeOutput}
      full: string
    }`.split('\n'))

    }
    lines.push('  }')
    lines = lines.concat(flines)

    if (procCount === 1) {
      for (const viewname of viewsnames) {
        const view = pkg.views[viewname]
        const allWidgets = allwidgets(view)
        const viewfieldsDecl = allWidgets.reduce<string[]>((ret, w) => {
          if (w.field && w.type) ret.push(`        ${w.field}: ${basetype(w.type)}`)
          return ret
        }, []).join('\n')
        lines = lines.concat(`   
  
      declare interface I${pkg.name}VOPT${viewname} {
        content: I${pkg.name}VCONTENT${viewname}
        primaryAction: I${pkg.name}Action<I${pkg.name}VDATA${viewname}>
        secondaryAction?: I${pkg.name}Action<I${pkg.name}VDATA${viewname}>
        otherActions?: Array<I${pkg.name}Action<I${pkg.name}VDATA${viewname}>>
      }
      
      declare interface I${pkg.name}VDATA${viewname} {
${viewfieldsDecl}
      }
      
      declare type I${pkg.name}VCONTENT${viewname} = Array<{
        kind: 'show' | 'entry'
        field: string
        type: I${pkg.name}Types
      }>    
      `.split('\n'))
      }
    }
  }

  return lines
  
  function basetype (typename: string): string {
    const t = pkg.types[typename]
    if (t) return t.base as any
    if ((basicTypes as any)[typename]) return typename
    throw new Error('invalid type: ' + typename)
  }

  function allwidgets (view: View): Widget[] {
    const used: { [n: string]: string } = {}
    const ret: Widget[] = []
    rec(view.content)
    return ret
    function rec (l: Widget[]) {
      l.forEach((w) => {
        const fieldname = w.field
        const fieldtype = w.type
        if (fieldname) {
          if (!fieldtype) throw new Error('widget ' + fieldname + ' usado sem tipo')
          if (used[fieldname]) {
            if (used[fieldname] !== fieldtype)
              throw new Error('widget ' + fieldname + ' usado com tipos incompatíveis')
          } else {
            used[fieldname] = fieldtype
            ret.push(w)
          }
        }
        if (w.children) rec(w.children)
      })
    }
  }
}
