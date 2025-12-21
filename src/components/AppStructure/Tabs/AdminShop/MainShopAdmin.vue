<template>
  <div class="admin-wrapper" :style="{ marginTop: '-' + (topStripHeight) + 'px', paddingTop: topStripHeight + 'px' }">
    <div class="admin-container" dir="rtl">
      <!-- Title Row - Full Width -->
      <v-card-title class="modern-title title-row">
        <div class="title-container">
          <v-btn
            icon
            variant="text"
            class="d-md-none mr-2"
            @click="showMobileMenu = true"
          >
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <h2 class="title-text pr-6">ניהול חנות</h2>
          <v-spacer></v-spacer>
          <v-icon class="mr-2 title-icon">mdi-store</v-icon>
        </div>
      </v-card-title>
      
      <!-- Content Row -->
      <div class="d-flex" style="gap: 0;">
        <!-- Vertical Navigation Menu -->
        <div class="navigation-menu d-none d-md-block pt-4">
        <v-card class="navigation-card" elevation="2" :style="{ top: topStripHeight + 'px', maxHeight: 'calc(100vh - ' + topStripHeight + 'px)' }">
         
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
import AdminProducts from './ShopAdminTabs/Products/AdminProducts.vue'
import AdminOrders from './ShopAdminTabs/Orders/AdminOrders.vue'
import AdminServices from './ShopAdminTabs/Services/AdminServices.vue'

export default {
  name: 'MainShopAdmin',
  components: {
    AdminProducts,
    AdminOrders,
    AdminServices
  },
  data() {
    return {
      activeMenuItem: 'products',
      showMobileMenu: false,
      topStripHeight: 128,
      menuItems: [
        {
          key: 'products',
          title: 'מוצרים',
          icon: 'mdi-package-variant',
          component: 'AdminProducts'
        },
        {
          key: 'orders',
          title: 'הזמנות',
          icon: 'mdi-cart',
          component: 'AdminOrders'
        },
        {
          key: 'services',
          title: 'שירותים',
          icon: 'mdi-tools',
          component: 'AdminServices'
        }
      ]
    }
  },
  computed: {
    currentComponent() {
      const selectedItem = this.menuItems.find(item => item.key === this.activeMenuItem)
      return selectedItem ? selectedItem.component : 'AdminProducts'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.calculateTopStripHeight()
    })
    window.addEventListener('resize', this.calculateTopStripHeight)
    console.log('MainShopAdmin component mounted')
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

<style>
@import '@/assets/AdminTabs.css';
</style>
