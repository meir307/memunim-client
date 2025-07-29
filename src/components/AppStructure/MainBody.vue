<template>
  <div class="d-flex main-content">
    <v-tabs v-model="activeTab" align-tabs="center" color="deep-purple-accent-1" selected-class="my-selected-tab">
      <v-tab v-for="tabItem in tabs" :key="tabItem.id" @click="navigateToTab(tabItem.route)">
        {{ tabItem.text }}
      </v-tab>
    </v-tabs>
  </div>

  <v-window v-model="activeTab">
    <v-window-item v-for="tabItem in tabs" :key="tabItem.id" :value="tabItem.id">
      <component :is="tabItem.component" />
    </v-window-item>
  </v-window>
</template>

<script>
import MainRegulations from './Tabs/Regulations/MainRegulations.vue'
import MainServices from './Tabs/ProServices/MainServices.vue'
import UserMain from './Tabs/User/UserMain.vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'MainBody',
  components: { MainRegulations, MainServices, UserMain },
  data: () => ({
    userStore: useUserStore(),
    activeTab: 0,
    links: [
      {
        id: 0,
        text: 'חוקים ותקנות',
        component: 'MainRegulations',
        route: '/regulations'
      },
      {
        id: 1,
        text: 'נותני שרות',
        component: 'MainServices',
        route: '/services'
      },
      {
        id: 2,
        text: 'איזור אישי',
        component: 'UserMain',
        route: '/user'
      }
    ]
  }),

  computed: {
    tabs() {
      if (this.userStore.user.isAuthenticated) {
        return this.links
      }
      else {
        return this.links.slice(0, -1)
      }
    }
  },
  
  methods: {
    navigateToTab(route) {
      this.$router.push(route)
    }
  },
  
  watch: {
    'userStore.user.isAuthenticated': {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.activeTab = 2
          this.$router.push('/user')
        }
      }
    }
  }
}
</script>

<style>
.main-content {
  margin-top: 50px;
}

.my-selected-tab {
  font-weight: bold;
  color: #ff9800 !important;
  /* Example: orange */
  background-color: #e7edff !important;
  /* Example: light background */
  border-bottom: 5px solid #367dbe !important;
  /* Example: underline */
  /* Add any other styles you want */
}
</style>