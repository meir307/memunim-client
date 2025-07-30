import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/AppStructure/HelloWorld.vue'),
    redirect: '/regulations'
  },
  {
    path: '/regulations',
    name: 'regulations',
    component: () => import('../components/AppStructure/Tabs/Regulations/MainRegulations.vue')
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('../components/AppStructure/Tabs/ProServices/MainServices.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('../components/AppStructure/Tabs/User/UserMain.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
