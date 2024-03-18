import * as VueRouter from 'vue-router'

import Home from '../components/Home.vue'
import Fn_1 from '../components/Fn_1.vue'
import Fn_2 from '../components/Fn_2.vue'

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
      component: Fn_1
    },
    {
      name: 'fn-2',
      path: '/fn-2',
      component: Fn_2
    }
  ]
})

export default router
