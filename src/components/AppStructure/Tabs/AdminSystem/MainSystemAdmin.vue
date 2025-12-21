<template>
  <div class="admin-wrapper" :style="{ marginTop: '-' + (topStripHeight) + 'px', paddingTop: topStripHeight + 'px' }">
    <div class="admin-system-container" dir="rtl">
    <div class="d-flex">
      <!-- Vertical Navigation Menu -->
      <div class="navigation-menu d-none d-md-block">
        <v-card class="navigation-card" elevation="2" :style="{ top: topStripHeight + 'px', maxHeight: 'calc(100vh - ' + topStripHeight + 'px)' }">
          <v-card-title class="modern-title bg-primary">
            <div class="title-container">
              <h2 class="title-text pr-6">ניהול מערכת</h2>
              <v-spacer></v-spacer>
              <v-icon class="mr-2 title-icon">mdi-account-cog</v-icon>
            </div>
          </v-card-title>
          <v-divider></v-divider>
          <v-list class="pa-2">
            <v-list-item
              v-for="item in menuItems"
              :key="item.key"
              :active="activeMenuItem === item.key"
              @click="selectMenuItem(item.key)"
              :prepend-icon="item.icon"
              :title="item.title"
              class="mb-2 rounded"
              variant="text"
            ></v-list-item>
          </v-list>
        </v-card>
      </div>

      <!-- Content Area -->
      <div class="content-area flex-grow-1">
        
        <!-- Dynamic Component Display -->
        <div class="content-section">
          <component :is="currentComponent" />
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="showMobileMenu"
      location="right"
      temporary
      width="250"
      class="d-md-none"
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.key"
          :active="activeMenuItem === item.key"
          @click="selectMenuItem(item.key)"
          :prepend-icon="item.icon"
          :title="item.title"
          class="mb-2"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    </div>
  </div>
</template>

<script>
import AdminUsers from './Tabs/AdminUsers.vue'
import AdminFactories from './Tabs/AdminFactories.vue'

export default {
  name: 'MainSystemAdmin',
  components: {
    AdminUsers,
    AdminFactories
  },
  data() {
    return {
      activeMenuItem: 'users',
      showMobileMenu: false,
      topStripHeight: 128,
      menuItems: [
        {
          key: 'users',
          title: 'משתמשים',
          icon: 'mdi-account-group',
          component: 'AdminUsers'
        },
        {
          key: 'factories',
          title: 'מפעלים',
          icon: 'mdi-factory',
          component: 'AdminFactories'
        }
      ]
    }
  },
  computed: {
    currentComponent() {
      const selectedItem = this.menuItems.find(item => item.key === this.activeMenuItem)
      return selectedItem ? selectedItem.component : 'AdminUsers'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.calculateTopStripHeight()
    })
    window.addEventListener('resize', this.calculateTopStripHeight)
    console.log('MainSystemAdmin component mounted')
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateTopStripHeight)
  },
  methods: {
    selectMenuItem(key) {
      this.activeMenuItem = key
      this.showMobileMenu = false
    },
    calculateTopStripHeight() {
      this.$nextTick(() => {
        const topStrip = document.querySelector('.topstrip-fixed')
        if (topStrip) {
          this.topStripHeight = topStrip.offsetHeight
          console.log('TopStrip height:', this.topStripHeight)
        }
      })
    }
  }
}
</script>

<style scoped>
.admin-wrapper {
  margin: 0;
  padding: 0;
  position: relative;
}

.admin-system-container {
  padding: 0 !important;
  margin: 0 !important;
  position: relative;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.navigation-menu {
  width: 280px;
  min-width: 280px;
  margin-left: 16px;
  margin-top: 0;
  padding-top: 0;
}

.navigation-card {
  position: sticky;
  overflow-y: auto;
  margin-top: 0;
}

.content-area {
  min-height: 500px;
  padding: 16px;
}

.content-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.v-list-item--active) {
  background-color: rgba(25, 118, 210, 0.1);
  color: rgb(25, 118, 210);
}

:deep(.v-list-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Remove any default padding/margin from parent containers */
:deep(.v-main) {
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.v-main__wrap) {
  padding: 0 !important;
  margin: 0 !important;
}

/* Target router-view if it has padding */
:deep(router-view) {
  padding: 0 !important;
  margin: 0 !important;
}

/* Ensure no spacing from parent */
.admin-system-container {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Title styling matching HazardsMain */
.modern-title {
  color: white !important;
  padding: 16px !important;
  background-image: none !important;
  background: rgb(var(--v-theme-primary)) !important;
}

:deep(.modern-title) {
  background-image: none !important;
  background: rgb(var(--v-theme-primary)) !important;
}

.title-container {
  display: flex !important;
  align-items: center !important;
  width: 100%;
  flex-wrap: nowrap !important;
  flex-direction: row !important;
  gap: 16px;
}

.title-text {
  flex: 0 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 !important;
  font-size: 1.2rem !important;
  color: white !important;
}

.title-icon {
  color: white !important;
}

@media (max-width: 768px) {
  .title-container {
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
  }
  
  .title-text {
    text-align: left !important;
    margin-right: 16px !important;
  }
}
</style>

