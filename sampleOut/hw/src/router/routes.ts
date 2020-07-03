import { RouteConfig } from 'vue-router'
import { setCurrentProcess, ProcInfo } from '../components/archollib'
import { allProcesses } from '../components/archol/index'
import IndexPage from 'pages/Index.vue'
import ProcessPage from 'pages/process/Process.vue'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: IndexPage } as RouteConfig,
    ].concat(allProcesses.map((p) => {
      const pid = p.pid
      const r: RouteConfig = {
        path: '/p/' + pid + '/:id',
        component: ProcessPage,
        props (route) {
          const currentProc: ProcInfo = {
            defId: pid,
            instId: route.params.id,
          }
          setCurrentProcess('content', currentProc)
          return currentProc
        },
      }
      return r
    })),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
]

export default routes
