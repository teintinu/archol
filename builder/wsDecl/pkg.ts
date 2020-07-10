import { Package, basicTypes, View, Widget } from '../typesDecl';
import { SourcePartWriter } from '../sys';

export async function genpkg (w: SourcePartWriter, pkg: Package) {

  let procCount = 0

  const processesNames = Object.keys(pkg.processes || {})
  const processesDecl = processesNames.map((procname) => {
    return `      ${procname}: I${pkg.uri.id}Process${procname},`
  }).join('\n')

  const functionsNames = Object.keys(pkg.functions || {})
  const functionsDecl = functionsNames.map((funcname) => {
    return `      ${funcname}: I${pkg.uri.id}OPT${funcname},`
  }).join('\n')

  const viewsnames = Object.keys(pkg.views || {})
  const pkgviewnames = viewsnames.map((v) => {
    return '"' + v + '"'
  }).join('|')
  const viewsDecl = viewsnames.map((viewname) => {
    return `      ${viewname}: I${pkg.uri.id}VOPT${viewname},`
  }).join('\n')

  const typesnames = Object.keys(pkg.types || {})
  const basictypesnames = Object.keys(basicTypes || {})
  const typesDecl = typesnames.map((typename) => {
    return `      ${typename}: I${pkg.uri.id}TOPT${typename},`
  }).join('\n')
  const pkgtypenames = basictypesnames.concat(typesnames).map((typename) => {
    return `'${typename}'`
  }).join('|')

  const docsnames = Object.keys(pkg.documents || {})
  const docsDecl = docsnames.map((docname) => {
    return `      ${docname}: I${pkg.uri.id}DOPT${docname},`
  }).join('\n')

  const rolesnames = Object.keys(pkg.roles || {})
  const rolesDecl = rolesnames.map((r) => {
    return '"' + r + '"'
  }).join('|')

  let lines: string[] = `

  declare function declarePackage (ns: '${pkg.uri.ns}', path: '${pkg.uri.path}'): I${pkg.uri.id}Uses
  declare interface I${pkg.uri.id}Uses {
    uses (packages: PackageUses): I${pkg.uri.id}Roles
  }
  
  declare interface I${pkg.uri.id}Roles {
    roles (roles: Roles): I${pkg.uri.id}Processes
  }
  
  declare type I${pkg.uri.id}Role = ${rolesDecl}
  declare type I${pkg.uri.id}UseRoles = I${pkg.uri.id}Role[]

  declare type I${pkg.uri.id}Processes = {
    processes (processes: {
${processesDecl}
    }): I${pkg.uri.id}Functions
  }

  declare type I${pkg.uri.id}ViewNames = ${pkgviewnames}

  declare type I${pkg.uri.id}Fields = {
    [fieldName: string]: I${pkg.uri.id}Field
  }
  
  declare interface I${pkg.uri.id}Field {
    type: I${pkg.uri.id}TypeName
  }
  
  declare type I${pkg.uri.id}TypeName = ${pkgtypenames}
  
  declare interface I${pkg.uri.id}Functions {
    functions (functions: {
${functionsDecl}
    }): I${pkg.uri.id}Views
  }

  declare interface I${pkg.uri.id}Views {
    views (views: {
${viewsDecl}      
    }): I${pkg.uri.id}Types
  }

  declare interface I${pkg.uri.id}Types {
    types (types: {
${typesDecl}      
    }): I${pkg.uri.id}Docs
  }

  declare interface I${pkg.uri.id}Docs {
    documents (documents: {
${docsDecl}      
    }): void
  }
  
`.split('\n')
  for (const procname of processesNames) {
    procCount++
    const proc = pkg.processes[procname]
    const inputNames = Object.keys(proc.vars?.input || {});
    const scopeInput = inputNames
      .map((n) => `      ${n}: ${basetype(proc.vars.input[n].type)}`)
    const outputNames = Object.keys(proc.vars?.output || {});
    const scopeOutput = outputNames
      .map((n) => `      ${n}: ${basetype(proc.vars.output[n].type)}`)
    const localNames = Object.keys(proc.vars?.local || {});
    const scopeLocal = localNames
      .map((n) => `      ${n}: ${basetype(proc.vars.local[n].type)}`)

    const scopePaths = inputNames.map((i) => '"input.' + i + '"')
      .concat(outputNames.map((o) => '"output.' + o + '"'))
      .concat(localNames.map((l) => '"local.' + l + '"'))
      .join('|')

    const tasksnames = Object.keys(proc.tasks || {})
    const procTaskNames = tasksnames.map((t) => '"' + t + '"').join('|')

    lines = lines.concat(`
  declare interface I${pkg.uri.id}Process${procname} {
    title: I18N,
    caption: I18N,
    icon: Icon,
    start: I${pkg.uri.id}TaskName${procname},
    volatile: true,
    roles: I${pkg.uri.id}UseRoles[],
    vars: I${pkg.uri.id}Vars${procname}
    tasks: I${pkg.uri.id}Tasks${procname},
  }
    
  declare interface I${pkg.uri.id}Vars${procname} {
    input: I${pkg.uri.id}Fields
    output: I${pkg.uri.id}Fields
    local: I${pkg.uri.id}Fields
  }
  
  declare interface I${pkg.uri.id}Scope${procname} {
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
  
  declare type I${pkg.uri.id}ScopePath${procname} = ${scopePaths}      
  
  declare type I${pkg.uri.id}TaskName${procname} = ${procTaskNames}
  
  declare type I${pkg.uri.id}Tasks${procname} = {
    [taskName: string]: I${pkg.uri.id}Task${procname}
  }
  
  declare type I${pkg.uri.id}NextTask${procname} = I${pkg.uri.id}TaskName${procname} | {
    [task in I${pkg.uri.id}TaskName${procname}]?: (vars: I${pkg.uri.id}Scope${procname}) => boolean
  }

  declare type I${pkg.uri.id}UseFunction${procname} = {

`.split('\n'))

    let firsttask = true
    let flines: string[] = []
    let itasklines: string[] = [`declare type I${pkg.uri.id}Task${procname} =`]
    let itasklinespipe = false
    for (const funcname of functionsNames) {
      const func = pkg.functions[funcname]
      const finputname = Object.keys(pkg.functions[funcname].input || {})
      const finputUse = finputname.map((i) => `      ${i}: I${pkg.uri.id}ScopePath${procname}`).join('\n')
      const fscopeInput = finputname
        .map((n) => `      ${n}: ${basetype(func.input[n].type)}`)
      const foutputname = Object.keys(pkg.functions[funcname].output || {})
      const foutputUse = foutputname.map((o) => `      ${o}: I${pkg.uri.id}ScopePath${procname}`).join('\n')
      const fscopeOutput = foutputname
        .map((n) => `      ${n}: ${basetype(func.output[n].type)}`)

      if (firsttask) firsttask = false
      else lines.push('  } | {')

      itasklines = itasklines.concat(` ${itasklinespipe ? '|' : ''} {
        useFunction: I${pkg.uri.id}UseFunction${procname},
        next: I${pkg.uri.id}NextTask${procname},
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
    declare interface I${pkg.uri.id}OPT${funcname} {
      level: FunctionLevel
      input: I${pkg.uri.id}Fields,
      output: I${pkg.uri.id}Fields,
      code (vars: { input: I${pkg.uri.id}INPUT${funcname}, output: I${pkg.uri.id}OUTPUT${funcname} }): void
    }
    
    declare interface I${pkg.uri.id}INPUT${funcname} {
${fscopeInput}
    }
    
    declare interface I${pkg.uri.id}OUTPUT${funcname} {
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
            bind: I${pkg.uri.id}VBIND${viewname}<I${pkg.uri.id}ScopePath${procname}>
          },
          next: I${pkg.uri.id}NextTask${procname},
          roles: I${pkg.uri.id}UseRoles
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
  
      declare interface I${pkg.uri.id}VOPT${viewname} {
        content: I${pkg.uri.id}VCONTENT${viewname}
        primaryAction?: IAction<I${pkg.uri.id}VDATA${viewname}>
        secondaryAction?: IAction<I${pkg.uri.id}VDATA${viewname}>
        otherActions?: Array<IAction<I${pkg.uri.id}VDATA${viewname}>>
      }
      
      declare interface I${pkg.uri.id}VDATA${viewname} {
${viewfields.decl.join('\n')}
      }

      declare type I${pkg.uri.id}VBIND${viewname}<S> ={
        ${viewfields.bind.join('\n')}
      }
        
      declare type I${pkg.uri.id}VCONTENT${viewname} = Array<{
        kind: 'show' | 'entry'
        field: string
        type: I${pkg.uri.id}TypeName
      }>    
      `.split('\n'))
      }
    }

    lines = lines.concat(itasklines)
  }

  for (const typename of typesnames) {
    const tp = pkg.types[typename]
    lines = lines.concat(`
    declare interface I${pkg.uri.id}TOPT${typename} {
      base: BasicTypes
      validate? (this: void, val: ${tp.base}): string|false
      format? (this: void, val: ${tp.base}): string
      parse? (this: void, str: string): ${tp.base}
    }
    `.split('\n'))
  }

  lines = lines.concat(`
  declare type I${pkg.uri.id}SomeFields = {
    [fieldName: string]: I${pkg.uri.id}SomeField
  }
  
  declare interface I${pkg.uri.id}SomeField {
    description: string
    type: I${pkg.uri.id}TypeName
  }`.split('\n'))

  for (const docname of docsnames) {
    const doc = pkg.documents[docname]

    const docstatesnames = Object.keys(doc.states || {})
    const docStateDecl = docstatesnames.map((s) => '        ' + s + ': DocState').join('\n')
    const pfieldsnames = Object.keys(doc.primaryFields || {})
    const sfieldsnames = Object.keys(doc.secondaryFields || {})
    const docactionsnames = Object.keys(doc.actions || {})

    lines = lines.concat(`
    declare type I${pkg.uri.id}DOCOLNAME${docname} = ${pfieldsnames.concat(sfieldsnames).map((f) => '"' + f + '"').join('|')}
    declare interface I${pkg.uri.id}DOPT${docname} {
      persistence: DocPersistence
      identification: 'GUID'
      states: {
${docStateDecl}
      }
      primaryFields: I${pkg.uri.id}SomeFields
      secondaryFields: I${pkg.uri.id}SomeFields
      indexes: {[name:string]:I${pkg.uri.id}DOCOLNAME${docname}[]}
      actions: I${pkg.uri.id}DOCACTIONS${docname}
    }
    `.split('\n'))
    lines.push(`    declare type I${pkg.uri.id}STATENAMES${docname} = ${docstatesnames.map((s) => '"' + s + '"').join('|')}`)

    lines.push(`    declare interface I${pkg.uri.id}DOCDATA${docname} {`)
    pfieldsnames.map((fn) =>{
      const f=doc.primaryFields[fn]
      lines.push(`      `+fn+': '+basetype(f.type))
    })
    sfieldsnames.map((fn) =>{
      const f=doc.secondaryFields[fn]
      lines.push(`      `+fn+': '+basetype(f.type))
    })
    lines.push(`    }`)

    lines.push(`    declare interface I${pkg.uri.id}DOCACTIONS${docname} {`)
    for (const docactionname of docactionsnames) {
      lines = lines.concat(`
        ${docactionname}: {
          from?: I${pkg.uri.id}STATENAMES${docname}|I${pkg.uri.id}STATENAMES${docname}[],
          to: I${pkg.uri.id}STATENAMES${docname}|I${pkg.uri.id}STATENAMES${docname}[],
          icon: Icon,
          description: I18N,
          run (this: I${pkg.uri.id}DOCDATA${docname}, fn: string): Promise<any>
        }
      `.split('\n'))
    }
    lines.push(`}`)
  }
  w.writelines(lines)

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
