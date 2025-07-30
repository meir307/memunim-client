<template>
  <div>
    <v-app-bar
      dir="rtl"
      color="primary"
      prominent
      elevation="2"
      class="topstrip-fixed"
    >
      <!-- App Title/Logo -->
      <v-app-bar-title class="d-flex align-center">
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
          <v-avatar size="32" class="mr-2">
            <v-icon icon="mdi-account"></v-icon>
          </v-avatar>
          <span class="text-white mr-4">שלום {{ userName }}</span>
          <v-btn variant="text" color="white" @click="logout" class="mr-2">
            התנתק
          </v-btn>
        </div>

        <!-- Mobile Menu Button -->
        <v-btn
          icon
          variant="text"
          color="white"
          @click="drawer = !drawer"
          class="d-md-none ml-2"
          size="large"
        >
          <v-icon icon="mdi-menu" size="large"></v-icon>
        </v-btn>
      </div>

      <!-- Dialogs -->
      <v-dialog v-model="showLogin" max-width="1000" width="90%" persistent>
        <Login @btnClose="showLogin = false" />
      </v-dialog>

      <v-dialog v-model="showRegister" max-width="1000" width="90%" persistent>
        <Register @btnClose="showRegister = false" />
      </v-dialog>
    </v-app-bar>

    <!-- Mobile Navigation Drawer - Outside App Bar -->
    <v-navigation-drawer 
      v-model="drawer" 
      location="right" 
      temporary 
      width="200"
      overlay
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
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'TopStrip',
  components: { Login, Register },
  data: () => ({
    showLogin: false,
    showRegister: false,
    drawer: false,
    activeTab: 0,
    tabs: [
      { id: 0, text: 'חוקים ותקנות', route: '/regulations' },
      { id: 1, text: 'נותני שרות', route: '/services' },
      { id: 2, text: 'איזור אישי', route: '/user' }
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
      return this.isAuthenticated ? this.tabs : this.tabs.slice(0, -1)
    }
  },
  methods: {
    logout() {
      this.userStore.logout()
    },
    navigateToTab(route) {
      this.$router.push(route)
      this.drawer = false
    },
    syncActiveTab() {
      const tabIndex = this.visibleTabs.findIndex(tab => tab.route === this.$route.path)
      if (tabIndex !== -1) this.activeTab = tabIndex
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