import { route } from 'quasar/wrappers'
import VueRouter from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

let router: VueRouter

export default route(function ({ Vue }) {
  Vue.use(VueRouter)

  router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  })

  return router
})

export function navigate (url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    router.push(url, resolve, reject)
  })
}
