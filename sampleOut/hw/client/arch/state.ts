import * as React from 'react';
import '@hoda5/extensions'
import {
  AppDecl,
  AuthProviders,
  Size, WindowReference
} from './decl'
import { createPublication, LOADING, NOTFOUND, Publication } from '@hoda5/h5doc'

export function startApp<AUTH extends AuthProviders, EXT extends object> (
  decl: AppDecl<AUTH, EXT>): AppDef<AUTH, EXT> {

  const {
    welcome, noauth, noroute,
    getMenu, loading,
    windowReference
  } = decl

  const routes = decl.routes.map(routerg)
  const docCache: { [url: string]: AppDocWithDraft } = {}

  const pageletDefs: { [name in keyof P]: {
    align: PageletAlign,
    update: PageletUpdater
  } } = {} as any
  const pagelets: {
    [name in keyof P]: PageletDefType<P[name]>
  } = {} as any
  const contentSize: Size = {} as any
  const windowSize = windowReference.size
  const shutdown = init()
  const badges: Array<() => AppBagde> = []
  const auth = buildAuth()
  const updateState = updateStateInit()

  const _appstatePub = createPublication<ReadOnlyObject<AppState<P, AUTH, EXT>>>({
    ...decl.extensions,
    title: decl.title,
    url: '',
    pagelets: pagelets as any,
    busy: [],
    auth: LOADING,
    badges,
    menu: [],
    windowSize
  } as any)
  const self: AppDef<P, AUTH, EXT> = {
    pagelets,
    run,
    can,
    loading,
    getAppState: updateState.getAppState,
    subscribeAppState (fn: (newState: ReadOnlyObject<AppState<P, AUTH, EXT>>) => void, dispatchDelayed?: boolean | 'once') {
      return _appstatePub.subscribe(fn, dispatchDelayed)
    },
    setAppTitle (title: string) {
      if (title !== updateState.getAppState().title) updateState((c) => c.title = title)
    },
    registerBadge,
    location: {
      get url () {
        return updateState.getAppState().url
      },
      goHistory: windowReference.goHistory,
      go: windowReference.goUrl
    },
    auth,
    shutdown () {
      shutdown.forEach((fn) => fn())
    }
  }

  updateState(updateAuthDeps, updateSize)
  return self

  function init () {
    if (!windowReference) throw new Error('need to createWindowReference')
    if (welcome.getRoles() !== 'public') throw new Error('welcome need to be public')
    let hasContent = false
    Object.keys(decl.pagelets).forEach((n: keyof typeof decl.pagelets) => {
      const c = decl.pagelets[n]
      if (c.align === 'content') {
        if (hasContent) throw new Error('content must be last pagelet')
        hasContent = true
      }
      pagelets[n] = {
        ...c.initialState(windowSize), align: c.align,
        left: undefined, top: undefined, size: undefined, view: undefined
      }
      const cn = c.create(
        () => pagelets[n],
        (s: any) => {
          Object.keys(s).forEach((sn) => pagelets[n][sn] = s[sn])
          updateState((c) => c.pagelets = pagelets as any, updateSize)
        })
      const pk = Object.keys(pagelets[n])
      const ms = cn.methods
      Object.keys(ms).forEach((mn) => {
        const m = ms[mn].bind(ms)
        if (pk.indexOf(mn) !== -1) throw new Error('duplication ' + mn)
        pagelets[n][mn] = m
      })
      pageletDefs[n] = {
        align: c.align,
        update: cn.update
      }
    })
    return [
      windowReference.subscribe.url(() => updateState(updateUrl)),
      windowReference.subscribe.size(() => updateState(updateSize))
    ]
  }

  function can (roles: Roles): boolean {
    const app = updateState.getAppState()
    const auth = app.auth
    if (!auth) return false
    if (auth === LOADING) return roles === 'public'
    if (auth === NOTFOUND) return roles === 'public' || roles === 'anonymous'
    if (roles === 'public') return true
    if (roles === 'anonymous') return false
    if (roles === 'auth') return true
    return auth.roles.some((r) => roles.indexOf(r) >= 0)
  }

  function buildAuth (): AuthProvidersDef<AUTH> {
    const auths = decl.auth
    const r: AUTH & { logout (): Promise<void> } = {
      ...auths,
      async logout () {
        updateState((changes) => changes.auth = NOTFOUND)
        await Promise.all(Object.keys(auths).map((a) => auths[a].signOut()))
        updateState(updateAuthDeps)
      }
    }
    Object.keys(auths).forEach((n) => {
      const auth = auths[n]
      shutdown.push(auth.auth.subscribe((authInfo) => {
        let g: any = updateState.getChanges().auth
        if (authInfo === LOADING) {
          if (g === LOADING) return
          else if (g === NOTFOUND) updateState((changes) => changes.auth = LOADING)
          // tslint:disable-next-line: brace-style
          else {
            g = { ...g }
            delete g.providers[n]
            if (!Object.keys(g.providers).length) g = LOADING
            updateState((changes) => changes.auth = g)
          }
        } else if (authInfo === NOTFOUND) {
          if (g === NOTFOUND) return
          else if (g === LOADING) updateState((changes) => changes.auth = NOTFOUND)
          // tslint:disable-next-line: brace-style
          else {
            g = { ...g }
            delete g.providers[n]
            if (!Object.keys(g.providers).length) g = NOTFOUND
            updateState((changes) => changes.auth = g)
          }
        } else {
          if (g === NOTFOUND || g === LOADING) {
            g = {
              uid: authInfo.uid,
              name: authInfo.name,
              roles: authInfo.roles,
              providers: {}
            }
          } else {
            g = { ...g }
          }
          g.providers[n] = authInfo
          updateState((changes) => changes.auth = g)
        }
        updateState(updateAuthDeps)
      }))
    })
    return r
  }

  async function run (a: ActionLetArgs): Promise<void> {
    updateState((changes) => changes.busy = [...updateState.getAppState().busy, a] as any)
    try {
      return await a.act.run(a)
    } finally {
      const busy = updateState.getAppState().busy.filter((b) => b !== a)
      updateState((changes) => changes.busy = busy as any)
    }
  }

  function registerBadge (pub: Publication<AppBagde>): AppBagdeDef {
    const def: AppBagdeDef = {
      pub,
      click () {
        if (pub.last.onClick) pub.last.onClick()
      }
    }
    badges.push(() => pub.last)
    updateState((c) => c.badges = badges)
    return def
  }

  function updateAuthDeps (changes) {
    updateUrl(changes)
    changes.menu = getMenu().reduce(menuItem, [])

    function menuItem (r: AppMenuItem[], m: AppMenuItem) {
      if (m === '-') {
        if (r[r.length - 1] !== '-') r.push(m)
      } else if (menuHasSubMenu(m)) {
        if (can(m.roles)) {
          const m2 = {
            ...m,
            submenu: m.submenu.reduce(menuItem, [])
          }
          if (m2.submenu.length) r.push(m2)
        }
      } else if (can(m.roles)) r.push(m)
      return r
    }
  }

  function updateUrl (partial: AppState<P, AUTH, EXT>) {
    const url = partial.url = windowReference.url
    let proc: Process
    let params: any = {}
    for (let i = 0; (!proc) && i < routes.length; i++) {
      const r = routes[i]
      const rg = new RegExp(r.$url, 'g')
      const m = rg.exec(url)
      if (m) {
        proc = r.proc
        params = r.params as any || {}
        r.$params.forEach((pn, idx) => {
          params[pn] = m[idx]
        })
      }
    }
    if (!proc) proc = noroute(windowReference.url)
    const needRoles: Roles = proc.getRoles()
    if (!can(needRoles)) {
      proc = noauth(needRoles)
      params = {}
    }
    const prj = proc.open(params)
    const view = prj.getView(partial)
    const dd = needDoc(proc, params, view.docRef)
    partial.ctx = { proc, prj, dd, view, params }
  }

  function routerg (r: AppRoute<any>): AppRoute<any> & { $url: string, $params: string[] } {
    let $url = '^\/'
    const $params: string[] = []
    for (let i = 0; i < r.path.length; i++) {
      const p = r.path[i]
      if (i > 0) $url = $url + '\/'
      if (typeof p === 'string') {
        if (/\\W/g.test(p)) throw new Error(p + ' nome parametro invalido: ' + JSON.stringify(r))
        $url = $url + p
      } else {
        $url = $url + '([^/]*)'
        const pn = p.param as string
        if (/\\W/g.test(pn)) throw new Error(pn + ' nome parametro invalido: ' + JSON.stringify(r))
        $params.push(pn)
      }
    }
    $url = $url + '$'
    return { ...r, $url, $params }
  }

  function updateSize (partial: AppState<P, AUTH, EXT>) {
    const ws = windowReference.size
    let left = 0
    let right = ws.width - 1
    let top = 0
    let bottom = ws.height - 1
    contentSize.width = ws.width
    contentSize.height = ws.height
    Object.keys(pageletDefs).forEach((n) => {
      const pageletstate = pagelets[n]
      const pd = pageletDefs[n]
      const ps = pd.update(partial.ctx, ws)
      Object.keys(ps).forEach((sn) => pageletstate[sn] = ps[sn])
      if (pd.align === 'top') {
        pageletstate.left = left
        pageletstate.top = top
        pageletstate.width = contentSize.width
        pageletstate.height = ps.size
        top += ps.size
        contentSize.height -= ps.size
      } else if (pd.align === 'left') {
        pageletstate.left = left
        pageletstate.top = top
        pageletstate.width = ps.size
        pageletstate.height = contentSize.height
        left += ps.size
        contentSize.width -= ps.size
      } else if (pd.align === 'bottom') {
        pageletstate.left = left
        pageletstate.top = bottom - ps.size
        pageletstate.width = contentSize.width
        pageletstate.height = ps.size
        bottom -= ps.size
        contentSize.height -= ps.size
      } else if (pd.align === 'right') {
        pageletstate.left = right - ps.size
        pageletstate.top = top
        pageletstate.width = ps.size
        pageletstate.height = contentSize.height
        right -= ps.size
        contentSize.width -= ps.size
      } else {
        pageletstate.left = left
        pageletstate.top = top
        pageletstate.width = contentSize.width
        pageletstate.height = contentSize.height
      }
    })
    partial.pagelets = pagelets as any
  }

  function updateStateInit () {
    let currentChanges: undefined | AppState<P, AUTH, EXT>
    const applyDebouced = h5lib.debounce(applyChanges, 5)

    return h5lib.mergeObjWith(add,{ getAppState, getChanges, applyChanges })

    function add (...fn: Array<(changes: AppState<P, AUTH, EXT>) => void>) {
      const changes = getChanges()
      for (const f of fn) f(changes)
      applyDebouced()
    }
    function getAppState (): ReadOnlyObject<AppState<P, AUTH, EXT>> {
      if (currentChanges) return currentChanges as any
      return _appstatePub.last
    }
    function getChanges ()  {
      if (!currentChanges) currentChanges = { ..._appstatePub.last as any }
      return currentChanges
    }
    function applyChanges () {
      if (currentChanges) {
        const changes = currentChanges
        currentChanges = undefined
        _appstatePub.dispatch(changes as any)
      }
    }
  }

  function needDoc<TYPE extends object, PARAMS extends object> (
    proc: Process,
    params: PARAMS,
    docRef: false | AppDocRef
  ): AppDocWithDraft {
    const { url, getDoc } = docRef || proc.getDocRef(params)
    let d = docCache[url]
    if (!d) {
      const doc = getDoc()
      const draftUrl = 'app:draft:' + url
      d = docCache[url] = {
        doc,
        saveDraft () {
          localStorage.setItem(draftUrl, JSON.stringify(doc.actual.last))
        },
        discardDraft () {
          localStorage.removeItem(draftUrl)
        }
      }
      const draft = localStorage.getItem(draftUrl)
      if (draft) try {
        doc.actual.dispatch(JSON.parse(draft))
      } catch (e) { }
    }
    return d
  }
}

export function createWindowReference () {
  const pubUrl = createPublication<string>(window.location.pathname)
  const pubSize = createPublication<Size>({
    width: window.innerWidth,
    height: window.innerHeight
  })
  window.onpopstate = notifyUrl
  window.onresize = notifySize
  window.onload = notifyAll
  return {
    get url () {
      return pubUrl.last
    },
    get size () {
      return {
        width: pubSize.last.width,
        height: pubSize.last.height
      }
    },
    goUrl (url: string, replace: boolean): void {
      console.log('goUrl', url, replace)
      if (replace) window.history.replaceState(undefined, null, url)
      else window.history.pushState(undefined, null, url)
      setTimeout(notifyUrl, 1)
    },
    goHistory (n: number): void {
      console.log('goHistory', n)
      window.history.go(n)
    },
    subscribe: {
      url: pubUrl.subscribe,
      size: pubSize.subscribe
    }
  }
  function notifyAll () {
    notifyUrl()
    notifySize()
  }
  function notifyUrl () {
    console.log('notifyUrl', pubUrl.last, window.location.pathname)
    if (pubUrl.last !== window.location.pathname) {
      pubUrl.dispatch(window.location.pathname)
    }
  }
  function notifySize () {
    console.log('notifySize', pubSize.last, window.innerWidth, window.innerHeight)
    const l = pubSize.last
    const n = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    if (l.width !== n.width || l.height !== n.height) pubSize.dispatch(n)
  }
}

export function fakeWindowReference (realWindowReference: WindowReference, width: number, height: number):
  WindowReference & { setSize (size: Size): void, dispose (): void } {
  const pubSize = createPublication<Size>({
    width,
    height
  })

  return {
    get url () {
      return realWindowReference.url
    },
    get size () {
      return {
        width: pubSize.last.width,
        height: pubSize.last.height
      }
    },
    goUrl: realWindowReference.goUrl,
    goHistory: realWindowReference.goHistory,
    subscribe: {
      url: realWindowReference.subscribe.url,
      size: pubSize.subscribe
    },
    setSize (size) {
      pubSize.dispatch(size)
    },
    dispose () {
      pubSize.destroy()
    }
  }
}

export function menuHasSubMenu (m: AppMenuItem): m is AppMenuItemWithSubmenu {
  return (m as any).submenu
}