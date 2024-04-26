import * as VueRouter from 'vue-router'

import Home from '../components/Home.vue'
import BlblVidExtr from '../components/BlblVidExtr.vue'
import FolderRemarks from '../components/folder_remarks/FolderRemarks.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      name: 'home',
      path: '/',
      component: Home
    },
    {
      name: 'fn-1',
      path: '/fn-1',
      component: BlblVidExtr
    },
    {
      name: 'folder-remarks',
      path: '/folder-remarks',
      component: FolderRemarks
    }
  ]
})

export default router
