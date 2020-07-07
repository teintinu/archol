import { Package, basicTypes, View, Widget } from '../typesDecl';

export async function genpkg (pkg: Package) {

  let procCount = 0

  const processesNames = Object.keys(pkg.processes||{})
  const processesDecl = processesNames.map((procname) => {
    return `      ${procname}: I${pkg.name}Process${procname},`
  }).join('\n')

  const functionsNames = Object.keys(pkg.functions||{})
  const functionsDecl = functionsNames.map((funcname) => {
    return `      ${funcname}: I${pkg.name}OPT${funcname},`
  }).join('\n')

  const viewsnames = Object.keys(pkg.views||{})
  const pkgviewnames = viewsnames.map((v) => {
    return '"' + v + '"'
  }).join('|')
  const viewsDecl = viewsnames.map((viewname) => {
    return `      ${viewname}: I${pkg.name}VOPT${viewname},`
  }).join('\n')

  const typesnames = Object.keys(pkg.types||{})
  const basictypesnames = Object.keys(basicTypes||{})
  const typesDecl = typesnames.map((typename) => {
    return `      ${typename}: I${pkg.name}TOPT${typename},`
  }).join('\n')
  const pkgtypenames = basictypesnames.concat(typesnames).map((typename) => {
    return `'${typename}'`
  }).join('|')

  const docsnames = Object.keys(pkg.documents||{})
  const docsDecl = docsnames.map((docname) => {
    return `      ${docname}: I${pkg.name}DOPT${docname},`
  }).join('\n')

  const rolesnames = Object.keys(pkg.roles||{})
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

  declare type I${pkg.name}ViewNames = ${pkgviewnames}

  declare type I${pkg.name}Fields = {
    [fieldName: string]: I${pkg.name}Field
  }
  
  declare interface I${pkg.name}Field {
    type: I${pkg.name}TypeName
  }
  
  declare type I${pkg.name}TypeName = ${pkgtypenames}
  
  declare interface I${pkg.name}Functions {
    functions (functions: {
${functionsDecl}
    }): I${pkg.name}Views
  }

  declare interface I${pkg.name}Views {
    views (views: {
${viewsDecl}      
    }): I${pkg.name}Types
  }

  declare interface I${pkg.name}Types {
    types (types: {
${typesDecl}      
    }): I${pkg.name}Docs
  }

  declare interface I${pkg.name}Docs {
    documents (documents: {
${docsDecl}      
    }): void
  }
  
`.split('\n')
  for (const procname of processesNames) {
    procCount++
    const proc = pkg.processes[procname]
    const inputNames = Object.keys(proc.vars?.input||{});
    const scopeInput = inputNames
      .map((n) => `      ${n}: ${basetype(proc.vars.input[n].type)}`)
    const outputNames = Object.keys(proc.vars?.output||{});
    const scopeOutput = outputNames
      .map((n) => `      ${n}: ${basetype(proc.vars.output[n].type)}`)
    const localNames = Object.keys(proc.vars?.local||{});
    const scopeLocal = localNames
      .map((n) => `      ${n}: ${basetype(proc.vars.local[n].type)}`)

    const scopePaths = inputNames.map((i) => '"input.' + i + '"')
      .concat(outputNames.map((o) => '"output.' + o + '"'))
      .concat(localNames.map((l) => '"local.' + l + '"'))
      .join('|')

    const tasksnames = Object.keys(proc.tasks||{})
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
  
  declare type I${pkg.name}NextTask${procname} = I${pkg.name}TaskName${procname} | {
    [task in I${pkg.name}TaskName${procname}]?: (vars: I${pkg.name}Scope${procname}) => boolean
  }

  declare type I${pkg.name}UseFunction${procname} = {

`.split('\n'))

    let firsttask = true
    let flines: string[] = []
    let itasklines: string[] = [`declare type I${pkg.name}Task${procname} =`]
    let itasklinespipe = false
    for (const funcname of functionsNames) {
      const func = pkg.functions[funcname]
      const finputname = Object.keys(pkg.functions[funcname].input||{})
      const finputUse = finputname.map((i) => `      ${i}: I${pkg.name}ScopePath${procname}`).join('\n')
      const fscopeInput = finputname
        .map((n) => `      ${n}: ${basetype(func.input[n].type)}`)
      const foutputname = Object.keys(pkg.functions[funcname].output||{})
      const foutputUse = foutputname.map((o) => `      ${o}: I${pkg.name}ScopePath${procname}`).join('\n')
      const fscopeOutput = foutputname
        .map((n) => `      ${n}: ${basetype(func.output[n].type)}`)

      if (firsttask) firsttask = false
      else lines.push('  } | {')

      itasklines = itasklines.concat(` ${itasklinespipe ? '|' : ''} {
        useFunction: I${pkg.name}UseFunction${procname},
        next: I${pkg.name}NextTask${procname},
      }`.split('\n'))
      itasklinespipe = true

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
    }
    
    declare interface I${pkg.name}OUTPUT${funcname} {
${fscopeOutput}
    }`.split('\n'))

    }
    lines.push('  }')
    lines = lines.concat(flines)

    for (const viewname of viewsnames) {
      const view = pkg.views[viewname]
      itasklines = itasklines.concat(`
        ${itasklinespipe ? '|' : ''} {
          useView: {
            view: '${viewname}'
            bind: I${pkg.name}VBIND${viewname}<I${pkg.name}ScopePath${procname}>
          },
          next: I${pkg.name}NextTask${procname},
          roles: I${pkg.name}UseRoles
        }
      `.split('\n'))
      itasklinespipe = true
      if (procCount === 1) {
        const allWidgets = allwidgets(view)
        const viewfields = allWidgets.reduce<{ decl: string[], bind: string[] }>((ret, w) => {
          if (w.field && w.type) {
            ret.decl.push(`        ${w.field}: ${basetype(w.type)}`)
            ret.bind.push(`        ${w.field}: S`)
          }
          return ret
        }, { decl: [], bind: [] })
        lines = lines.concat(`   
  
      declare interface I${pkg.name}VOPT${viewname} {
        content: I${pkg.name}VCONTENT${viewname}
        primaryAction?: IAction<I${pkg.name}VDATA${viewname}>
        secondaryAction?: IAction<I${pkg.name}VDATA${viewname}>
        otherActions?: Array<IAction<I${pkg.name}VDATA${viewname}>>
      }
      
      declare interface I${pkg.name}VDATA${viewname} {
${viewfields.decl.join('\n')}
      }

      declare type I${pkg.name}VBIND${viewname}<S> ={
        ${viewfields.bind.join('\n')}
      }
        
      declare type I${pkg.name}VCONTENT${viewname} = Array<{
        kind: 'show' | 'entry'
        field: string
        type: I${pkg.name}TypeName
      }>    
      `.split('\n'))
      }
    }

    lines = lines.concat(itasklines)
  }

  for (const typename of typesnames) {
    const tp = pkg.types[typename]
    lines = lines.concat(`
    declare interface I${pkg.name}TOPT${typename} {
      base: BasicTypes
      validate? (val: ${tp.base}): string|false
      format? (val: ${tp.base}): string
      parse? (str: string): ${tp.base}
    }
    `.split('\n'))
  }

  lines = lines.concat(`
  declare type I${pkg.name}ColFields = {
    [fieldName: string]: I${pkg.name}ColField
  }
  
  declare interface I${pkg.name}ColField {
    description: string
    type: I${pkg.name}TypeName
  }`.split('\n'))

  for (const docname of docsnames) {
    const doc = pkg.documents[docname]

    const docstatesnames = Object.keys(doc.states||{})
    const docStateDecl = docstatesnames.map((s) => '        ' + s + ': DocState').join('\n')
    const colfieldsnames = Object.keys(doc.collection||{})
    const docactionsnames = Object.keys(doc.actions||{})

    lines = lines.concat(`
    declare type I${pkg.name}DOCOLNAME${docname} = ${colfieldsnames.map((f) => '"' + f + '"').join('|')}
    declare interface I${pkg.name}DOPT${docname} {
      persistence: DocPersistence
      states: {
${docStateDecl}
      }
      collection: I${pkg.name}ColFields
      indexes: {[name:string]:I${pkg.name}DOCOLNAME${docname}[]}
      actions: I${pkg.name}DOCACTIONS${docname}
    }
    `.split('\n'))
    lines.push(`    declare interface I${pkg.name}DOCACTIONS${docname} {`)
    for (const docactionname of docactionsnames) {
      lines=lines.concat(`
        ${docactionname}: {
          from: 'newDoc'|${docstatesnames.map((s) => '"' + s + '"').join('|')},
          to: ${docstatesnames.map((s) => '"' + s + '"').join('|')},
          icon: Icon,
          description: I18N,
          run (fn: string): Promise<any>
        }
      `.split('\n'))
    }
    lines.push(`}`)
  }
  return lines

  function basetype (typename: string): string {
    if ((basicTypes as any)[typename]) return typename
    const t = pkg.types[typename]
    if (t) return t.base as any
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
