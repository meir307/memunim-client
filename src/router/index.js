import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/about'
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../components/AppStructure/Tabs/About/AboutView.vue')
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
        path: 'accidents',
        name: 'factory-accidents',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/Accidents/AccidentsMain.vue')
      },
      {
        path: 'hazards',
        name: 'factory-hazards',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/Hazards/HazardsMain.vue')
      },
      {
        path: 'routine-checks',
        name: 'routine-checks',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/RoutineChecks/RoutineChecksMain.vue')
      },
      {
        path: 'safety-committee',
        name: 'safety-committee',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/SafetyCommittee/SafetyCommitteeMain.vue')
      },
      {
        path: 'safety-procedures',
        name: 'safety-procedures',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/SafetyProcedures/SafetyProceduresMain.vue')
      },
      {
        path: 'factory-details',
        name: 'factory-details',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/FactoryDetails/FactoryDetailsMain.vue')
      },
      {
        path: 'factory-tasks',
        name: 'factory-tasks',
        component: () => import('../components/AppStructure/Tabs/User/FactoryTabs/FactoryTasks/FactoryTasksMain.vue')
      }
          ]
  },

  {
    path: '/activate',
    name: 'activate',
    component: () => import('../components/Authentication/Activate.vue')
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../components/Authentication/ResetPassword.vue')
  },
  {
    path: '/resetPassword',
    name: 'resetPassword',
    component: () => import('../components/Authentication/ResetPassword.vue')
  },
  {
    path: '/activate-trustee',
    name: 'activate-trustee',
    component: () => import('../components/Authentication/ActivateTrustee.vue')
  },
  {
    path: '/activateTrustee',
    name: 'activateTrustee',
    component: () => import('../components/Authentication/ActivateTrustee.vue')
  },
  {
    path: '/admin/system',
    name: 'admin-system',
    component: () => import('../components/AppStructure/Tabs/AdminSystem/MainSystemAdmin.vue'),
    meta: { requiresAuth: true, requiresAdminType: 1 }
  },
  {
    path: '/admin/shop',
    name: 'admin-shop',
    component: () => import('../components/AppStructure/Tabs/AdminShop/MainShopAdmin.vue'),
    meta: { requiresAuth: true, requiresAdminType: 2 }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard to check authentication and admin permissions
router.beforeEach((to, from, next) => {
  // Get user from localStorage (store might not be initialized in router context)
  const userStr = localStorage.getItem('user')
  let user = null
  
  if (userStr && userStr !== 'undefined') {
    try {
      user = JSON.parse(userStr)
    } catch (e) {
      console.error('Error parsing user from localStorage:', e)
    }
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    const isAuthenticated = user?.isAuthenticated || user !== null
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      next('/about') // Redirect to home page
      return
    }
  }
  
  // Check if route requires specific AdminType
  if (to.meta.requiresAdminType !== undefined) {
    const userAdminType = user?.AdminType
    
    if (!userAdminType) {
      next('/about')
      return
    }
    
    // Parse AdminType if it's a string (e.g., "[1,2]")
    let userAdminTypes = userAdminType
    if (typeof userAdminType === 'string') {
      try {
        userAdminTypes = JSON.parse(userAdminType)
      } catch (e) {
        // If parsing fails, treat as single value
        userAdminTypes = [userAdminType]
      }
    }
    
    // Normalize to array
    if (!Array.isArray(userAdminTypes)) {
      userAdminTypes = [userAdminTypes]
    }
    
    const requiredAdminTypeNum = Number(to.meta.requiresAdminType)
    
    // Check if any of the user's AdminTypes match the required type
    const hasMatchingType = userAdminTypes.some(userType => {
      const userTypeNum = Number(userType)
      return !isNaN(userTypeNum) && userTypeNum === requiredAdminTypeNum
    })
    
    if (!hasMatchingType) {
      next('/about')
      return
    }
  }
  
  next() // Allow navigation
})

export default router
