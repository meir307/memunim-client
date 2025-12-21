<template>
  <div>
    <v-app-bar
      dir="rtl"
  color="primary"
      prominent
      elevation="2"
      class="topstrip-fixed"
    >
      <!-- Mobile Menu Button - First element (leftmost) -->
      <v-btn
        icon
        variant="text"
        color="white"
        @click="drawer = !drawer"
        class="d-md-none"
        size="medium"
      >
        <v-icon icon="mdi-menu" size="large"></v-icon>
      </v-btn>

      <!-- App Title/Logo -->
      <v-app-bar-title class="d-none d-md-flex align-center">
        <v-icon icon="mdi-shield-check" class="mr-2"></v-icon>
        <span class="font-weight-bold">Memunim</span>
      </v-app-bar-title>

  <v-spacer></v-spacer>

      <!-- Navigation Tabs -->
      <v-tabs
        v-model="activeTab"
        color="white"
        align-tabs="center"
        class="d-none d-md-flex"
      >
        <v-tab
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="navigateToTab(tab.route)"
          class="text-white"
        >
          {{ tab.text }}
        </v-tab>
      </v-tabs>

      <v-spacer></v-spacer>

      <!-- User Section -->
      <div class="d-flex align-center">
        <!-- Guest User -->
        <div v-if="!isAuthenticated" class="d-flex align-center">
          <span class="text-white mr-4">שלום אורח</span>
          <v-btn variant="text" color="white" @click="showLogin = true" class="mr-2">
            כניסה
          </v-btn>
          <v-btn variant="outlined" color="white" @click="showRegister = true">
            הרשמה
          </v-btn>
</div>

        <!-- Authenticated User -->
        <div v-if="isAuthenticated" class="d-flex align-center">
          <v-menu v-model="userMenu" location="bottom end" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-avatar size="32" class="mr-2" v-bind="props" style="cursor: pointer;">
                <v-icon icon="mdi-account"></v-icon>
              </v-avatar>
            </template>
            <v-list>
              <v-list-item @click="updateProfile">
                <v-list-item-title>
                  עדכן פרופיל
                  <v-icon left>mdi-account-edit</v-icon>
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="changePassword">
                <v-list-item-title>
                  שנה סיסמא
                  <v-icon left>mdi-lock-reset</v-icon>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <span class="text-white mr-4">שלום {{ userName }}</span>
          <v-btn variant="text" color="white" @click="logout" class="mr-2">
            התנתק
          </v-btn>
        </div>
</div>

      <!-- Dialogs -->
      <v-dialog v-model="showLogin" max-width="1000" width="90%" persistent>
        <Login @btnClose="showLogin = false" @forgot-password="handleForgotPassword" />
  </v-dialog>

      <v-dialog v-model="showRegister" max-width="1000" width="90%" persistent>
        <Register @btnClose="showRegister = false" />
      </v-dialog>

      <v-dialog v-model="showChangePassword" max-width="1000" width="90%" persistent>
        <ChangePassword @btnClose="showChangePassword = false" />
      </v-dialog>

      <v-dialog v-model="showUpdateProfile" max-width="1000" width="90%" persistent>
        <UpdateProfile @btnClose="showUpdateProfile = false" />
      </v-dialog>

      <v-dialog v-model="showForgotPassword" max-width="1000" width="90%" persistent>
        <ForgotPassword @btnClose="showForgotPassword = false" />
      </v-dialog>
    </v-app-bar>

    <!-- Mobile Navigation Drawer - Outside App Bar -->
    <v-navigation-drawer 
      v-model="drawer" 
      location="right" 
      temporary 
      width="200"
      overlay
      class="mobile-drawer"
    >
      <v-list>
        <v-list-item
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="navigateToTab(tab.route)"
          :active="$route.path === tab.route"
          class="mb-2"
        >
          <v-list-item-title class="text-h6">{{ tab.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import Login from '@/components/Authentication/Login.vue'
import Register from '@/components/Authentication/Register.vue'
import ChangePassword from '@/components/Authentication/ChangePassword.vue'
import UpdateProfile from '@/components/Authentication/UpdateProfile.vue'
import ForgotPassword from '@/components/Authentication/ForgotPassword.vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'TopStrip',
  components: { Login, Register, ChangePassword, UpdateProfile, ForgotPassword },
  data: () => ({
    showLogin: false,
    showRegister: false,
    showChangePassword: false,
    showUpdateProfile: false,
    showForgotPassword: false,
    drawer: false,
    userMenu: false,
    activeTab: 0,
    tabs: [

      { id: 0, text: 'אודותינו', route: '/about', adminType: null },
      { id: 1, text: 'חוקים ותקנות', route: '/regulations', adminType: 3 },
      { id: 2, text: 'חנות ושרותים', route: '/services', adminType: 2 },
      { id: 3, text: 'איזור אישי', route: '/user', adminType: null },
      { id: 4, text: 'ניהול מערכת', route: '/admin/system', adminType:1 },
      { id: 5, text: 'ניהול חנות', route: '/admin/shop', adminType:2 }
    ]
  }),
  computed: {
    userStore() {
      return useUserStore()
    },
    isAuthenticated() {
      return this.userStore.user.isAuthenticated
    },
    userName() {
      return this.userStore.user.fullName
    },
    visibleTabs() {
      let filteredTabs = this.tabs
      
      // Filter by authentication - hide 'איזור אישי' for guests
      if (!this.isAuthenticated) {
        filteredTabs = filteredTabs.filter(tab => tab.id !== 3)
      }
      
      // Filter by AdminType
      const userAdminType = this.userStore.user?.AdminType
      
      filteredTabs = filteredTabs.filter(tab => {
        // If tab has no adminType restriction (null), show it to everyone
        if (tab.adminType === null || tab.adminType === undefined) {
          return true
        }
        
        // If user has no AdminType, hide admin-restricted tabs
        if (!userAdminType) {
          return false
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
        
        // Convert all to numbers for consistent comparison
        const userAdminTypesNum = userAdminTypes.map(type => Number(type)).filter(num => !isNaN(num))
        
        // If tab.adminType is an array, check if any user AdminType is in the array
        if (Array.isArray(tab.adminType)) {
          const tabAdminTypesNum = tab.adminType.map(type => Number(type))
          return userAdminTypesNum.some(userType => tabAdminTypesNum.includes(userType))
        }
        
        // If tab.adminType is a single value, check if any user AdminType matches
        const tabAdminTypeNum = Number(tab.adminType)
        return userAdminTypesNum.some(userType => userType === tabAdminTypeNum)
      })
      
      return filteredTabs
    }
  },
  methods: {
    logout() {
      this.userStore.logout()
      this.$router.push('/about')
    },
    navigateToTab(route) {
      this.$router.push(route)
      this.drawer = false
    },
    syncActiveTab() {
      const tabIndex = this.visibleTabs.findIndex(tab => tab.route === this.$route.path)
      if (tabIndex !== -1) this.activeTab = tabIndex
    },
    updateProfile() {
      this.userMenu = false
      this.showUpdateProfile = true
    },
    changePassword() {
      this.userMenu = false
      this.showChangePassword = true
    },
    handleForgotPassword() {
      this.showLogin = false
      this.showForgotPassword = true
    }
  },
  watch: {
    '$route'() {
      this.syncActiveTab()
    }
  },
  mounted() {
    this.syncActiveTab()
  }
}
</script>

<style scoped>
.topstrip-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

:deep(.v-tab) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.v-tab--selected) {
  color: white !important;
  font-weight: bold;
}

:deep(.v-tab__content) {
  color: inherit;
}

</style>