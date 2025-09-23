import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
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
    component: () => import('../components/AppStructure/Tabs/User/UserMain.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/factory',
    name: 'FactoryMain',
    component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/FactoryMain.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'employees'
      },
      {
        path: 'employees',
        name: 'factory-employees',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/EmployeesTab.vue')
      },
      {
        path: 'reports',
        name: 'factory-reports',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/ReportsTab.vue')
      },
      {
        path: 'settings',
        name: 'factory-settings',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/SettingsTab.vue')
      },
      {
        path: 'safety-committee',
        name: 'safety-committee',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/SafetyCommittee/SafetyCommitteeMain.vue')
      },
      {
        path: 'safety-procedures',
        name: 'safety-procedures',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/SafetyProcedures/SafetyProcedures.vue')
      }
          ]
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

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Get user store to check authentication status
    // You'll need to import your user store here
    const isAuthenticated = localStorage.getItem('user') || false // Simple check
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      next('/regulations') // Redirect to home page
      return
    }
  }
  
  next() // Allow navigation
})

export default router
