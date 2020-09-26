import * as decl from '../typesDecl';
import * as def from '../typesDef';
import { join } from 'path';
import {
  Project, ExpressionStatement, CallExpression, Identifier, Node, ts,
  NumericLiteral, StringLiteral, BooleanLiteral,
  ObjectLiteralExpression, ArrayLiteralExpression,
  PropertyAssignment,
  PropertyAccessExpression,
  MethodDeclaration, NoSubstitutionTemplateLiteral
} from 'ts-morph';

export function loadWorkspace (ws: def.Workspace) {

  const apps: { [appName: string]: decl.Application } = {}
  const pkgs: { [pkgUri in decl.PackageURI]: decl.Package } = {} as any
  const ret: def.DefWorkspace = { ...ws, decl: { apps, pkgs }, def: { apps: {} } }

  const decl = new Project({
    tsConfigFilePath: ws.rootDir + '/tsconfig.json'
  })

  parseSources()

  return ret

  function parseSources () {
    decl.getSourceFiles().forEach((src) => {
      if (src.getBaseName() !== 'decl.d.ts') {
        const stmts = src.getStatements();
        if (stmts.length != 1) fail(src.getFilePath() + ' só deveria ter uma declaração')
        const stmt = stmts[0]
        if (stmt instanceof ExpressionStatement) {
          const expr1 = stmt.getExpression()
          if (expr1 instanceof CallExpression) {
            tsCallExpr(expr1)
          }
          else fail(src.getFilePath() + ' comando deveria ser uma chamada a declareApplication ou declarePackage')
        } else fail(src.getFilePath() + ' comando deveria ser declareApplication ou declarePackage')
      }
    })
  }

  function tsCallExpr (expr1: CallExpression): any {
    const fnexpr = expr1.getExpression()
    if (fnexpr instanceof Identifier) {
      return runFunc(fnexpr.getText(), expr1)
    }
    else if (fnexpr instanceof PropertyAccessExpression) {
      const objExpr = fnexpr.getExpression()
      if (objExpr instanceof CallExpression) {
        const obj = tsCallExpr(objExpr)
        const n = fnexpr.getName()
        return obj[n](expr1)
      }
      else fail('tsCallExpr err2')
    } else fail('tsCallExpr err1')
  }

  function runFunc (fn: string, expr1: CallExpression) {
    const args = expr1.getArguments()
    if (fn === 'declareApplication') {
      if (args.length !== 2) fail(expr1.getSourceFile().getFilePath() + ' declareApplication precisa de dois parametros')
      const appname = parseStrArg(args[0])
      const appopts = parseObjArg(args[1])
      return declareApplication(appname, appopts)
    } else if (fn === 'declarePackage') {
      if (args.length !== 2) fail(expr1.getSourceFile().getFilePath() + ' declarePackage precisa de dois parametros')
      const pkgns = parseStrArg(args[0])
      const pkgpath = parseStrArg(args[1])
      return declarePackage(pkgns, pkgpath)
    }
    else fail(expr1.getSourceFile().getFilePath() + ' declareApplication ou declarePackage era esperado')
  }

  function parseAnyArg (propValue: any): any {
    let ret: any = undefined
    if (propValue instanceof ObjectLiteralExpression) ret = parseObjArg(propValue)
    else if (propValue instanceof ArrayLiteralExpression) ret = parseArrArg(propValue)
    else if (propValue instanceof StringLiteral) ret = parseStrArg(propValue)
    else if (propValue instanceof NoSubstitutionTemplateLiteral) ret = parseStr2Arg(propValue)
    //else if (propValue instanceof TaggedTemplateExpression) ret = parseStrArg(propValue)
    else if (propValue instanceof NumericLiteral) ret = parseNumArg(propValue)
    else if (propValue instanceof BooleanLiteral) ret = parseBolArg(propValue)
    else fail(propValue.getText() + ': tipo de dado não tratado')
    return ret
  }

  function parseStrArg (arg: Node): string {
    let ret: string = undefined as any
    if (arg instanceof StringLiteral) ret = arg.getLiteralValue()
    else fail(arg.getSourceFile().getFilePath() + ' ' + arg.getText() + ' string é esperada')
    return ret
  }

  function parseStr2Arg (arg: Node): string {
    let ret: string = undefined as any
    if (arg instanceof NoSubstitutionTemplateLiteral) ret = arg.getLiteralValue()
    else fail(arg.getSourceFile().getFilePath() + ' ' + arg.getText() + ' string é esperada')
    return ret
  }

  function parseNumArg (arg: Node): number {
    let ret: number = undefined as any
    if (arg instanceof NumericLiteral) ret = arg.getLiteralValue()
    else fail(arg.getSourceFile().getFilePath() + ' ' + arg.getText() + ' number é esperada')
    return ret
  }

  function parseBolArg (arg: Node): boolean {
    let ret: boolean = undefined as any
    if (arg instanceof BooleanLiteral) ret = arg.getLiteralValue()
    else fail(arg.getSourceFile().getFilePath() + ' ' + arg.getText() + ' boolean é esperada')
    return ret
  }

  function parseObjArg (arg: Node): any {
    let ret: any = undefined as any
    if (arg instanceof ObjectLiteralExpression) {
      ret = {}
      for (const p of arg.getProperties()) {
        if (p instanceof PropertyAssignment) {
          const propName = parsePropertyName(p.getNameNode())
          const propValue = p.getInitializer()
          ret[propName] = parseAnyArg(propValue)
        }
        else if (p instanceof MethodDeclaration) {
          const propName = parsePropertyName(p.getNameNode())
          ret[propName] = { func: p }
        } else fail(p.getText() + ': tipo de propriedade não tratado')
        // PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;

        //NoSubstitutionTemplateLiteral | TemplateExpression | BooleanLiteral |  StringLiteral | NumericLiteral | ObjectLiteralElementLike
        //arg.getLiteralValue()
      }
    } else fail(arg.getSourceFile().getFilePath() + ' ' + arg.getText() + ' string é esperada')
    return ret
  }

  function parsePropertyName (nameNode: any) {
    let ret: string = undefined as any
    if (nameNode instanceof StringLiteral) ret = nameNode.getLiteralValue()
    else if (nameNode instanceof Identifier) ret = nameNode.getText()
    else fail(nameNode.getText() + ': nome de propriedade não tratado')
    return ret
  }

  function parseArrArg (arg: Node): any {
    let ret: any = undefined as any
    if (arg instanceof ArrayLiteralExpression) {
      ret = arg.getElements().map(parseAnyArg)
    } else fail(arg.getSourceFile().getFilePath() + ' ' + arg.getText() + ' string é esperada')
    return ret
  }

  function declareApplication (name: string, opts: Exclude<decl.Application, 'name'>) {
    if (apps[name]) throw new Error('Duplicated application name: ' + name)
    apps[name] = { ...opts, name }
    return apps[name]
  }

  function declarePackage (ns: string, path: string) {
    const full: decl.PackageURI = join(ns, path) as any
    const id = full.replace(/[\/\.]/g, '_').replace(/[^\w.]/g, '')
    const uri = {
      id,
      full,
      ns,
      path
    }
    if (pkgs[full]) throw new Error('Duplicated package uri: ' + full)
    const pkg: decl.Package = pkgs[full] = { uri } as any
    return { uses }
    function uses (expr1: CallExpression) {
      const args = expr1.getArguments()
      if (args.length !== 1) fail(expr1.getSourceFile().getFilePath() + ' uses precisa de um parametro')
      pkg.uses = parseObjArg(args[0])
      return { roles }
    }
    function roles (expr1: CallExpression) {
      const args = expr1.getArguments()
      if (args.length !== 1) fail(expr1.getSourceFile().getFilePath() + ' roles precisa de um parametro')
      pkg.roles = parseObjArg(args[0])
      return { processes }
    }
    function processes (expr1: CallExpression) {
      const args = expr1.getArguments()
      if (args.length !== 1) fail(expr1.getSourceFile().getFilePath() + ' processes precisa de um parametro')
      pkg.processes = parseObjArg(args[0])
      return { functions }
    }
    function functions (expr1: CallExpression) {
      const args = expr1.getArguments()
      if (args.length !== 1) fail(expr1.getSourceFile().getFilePath() + ' functions precisa de um parametro')
      pkg.functions = parseObjArg(args[0])
      return { views }
    }
    function views (expr1: CallExpression) {
      const args = expr1.getArguments()
      if (args.length !== 1) fail(expr1.getSourceFile().getFilePath() + ' views precisa de um parametro')
      pkg.views = parseObjArg(args[0])
      return { types }
    }
    function types (expr1: CallExpression) {
      const args = expr1.getArguments()
      if (args.length !== 1) fail(expr1.getSourceFile().getFilePath() + ' types precisa de um parametro')
      pkg.types = parseObjArg(args[0])
      return { documents }
    }
    function documents (expr1: CallExpression) {
      const args = expr1.getArguments()
      if (args.length !== 1) fail(expr1.getSourceFile().getFilePath() + ' documents precisa de um parametro')
      pkg.documents = parseObjArg(args[0])
      return {}
    }
  }
}

function fail (...args: any[]): any {
  debugger
  console.log(args)
  throw new Error(args.map((a) => a.toString()).join(' '))
}