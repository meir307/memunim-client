<template>
    <div class="pa-2">
                 <!-- Sticky Header -->
         <div class="sticky-header d-flex align-center mb-4">
             <div class="d-flex align-center flex-grow-1">
                 <!-- Mobile hamburger menu -->
                 <v-btn
                     icon="mdi-menu"
                     variant="text"
                     @click="showMobileMenu = !showMobileMenu"
                     class="d-md-none me-1"
                 ></v-btn>
                 
                <h2 class="me-9 text-truncate d-md-none" style="max-width: 150px; padding-right: 16px;">{{ selectedFactory?.name || 'שם המפעל' }}</h2>
                <h2 class="me-9 d-none d-md-block" style="padding-right: 45px;">{{ selectedFactory?.name || 'שם המפעל' }}</h2>
 
                <p class="text-h6 text-medium-emphasis mb-0 d-none d-md-block me-6">{{ selectedFactory?.memuneHours || '0' }} שעות ממונה חודשיות</p>
                
                <p class="text-h6 text-medium-emphasis mb-0 d-none d-md-block"> {{ selectedFactory?.employees || '0' }} עובדים</p>
             </div>
  
              <div class="back-button-container">
                  <v-btn 
                      color="green-lighten-1"
                      prepend-icon="mdi-arrow-left"
                      @click="goBack" 
                      class="me-3">
                      חזור
                  </v-btn>
              </div>
         </div>

                 <!-- Mobile navigation drawer -->
         <v-navigation-drawer
             v-model="showMobileMenu"
             location="right"
             temporary
             class="d-md-none"
             width="280"
             style="top: 138px; height: calc(100vh - 64px);"
         >
             <v-list>
                 <v-list-item
                     v-for="item in navigationItems"
                     :key="item.key"
                     :active="isActiveRoute(item.route)"
                     @click="selectTab(item.route)"
                     :prepend-icon="item.icon"
                     :title="item.title"
                     class="mb-2"
                 ></v-list-item>
             </v-list>
         </v-navigation-drawer>
         
         <!-- Factory content area -->
         <div class="content-wrapper">
             <!-- Left side - Navigation menu -->
             <div class="navigation-menu d-none d-md-block">
                 <v-card class="pa-3 navigation-card">
                     <v-list>
                         <v-list-item
                             v-for="item in navigationItems"
                             :key="item.key"
                             :active="isActiveRoute(item.route)"
                             @click="navigateToTab(item.route)"
                             :prepend-icon="item.icon"
                             :title="item.title"
                             class="mb-2"
                         ></v-list-item>
                     </v-list>
                 </v-card>
             </div>
             
             <!-- Right side - Content area -->
             <div class="content-area">
                 <router-view />
             </div>
         </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/UserStore'

export default {
    name: 'FactoryMain',
         data() {
         return {
             showMobileMenu: false,
             allNavigationItems: [
                {
                     key: 'routine-checks',
                     title: 'פעילות שוטפת',
                     icon: 'mdi-alarm',
                     route: 'routine-checks'
                 },
                 {
                     key: 'hazards',
                     title: 'מפגעים',
                     icon: 'mdi-biohazard',
                     route: 'factory-hazards'
                 },
                 {
                     key: 'safety-committee',
                     title: 'ועדת בטיחות',
                     icon: 'mdi-account-group',
                     route: 'safety-committee'
                 },
                 {
                     key: 'safety-procedures',
                     title: 'נהלים והדרכות',
                     icon: 'mdi-comment-text-outline',
                     route: 'safety-procedures'
                 },
                 {
                     key: 'accidents',
                     title: 'תאונות וארועי בטיחות',
                     icon: 'mdi-flash',
                     route: 'factory-accidents'
                 },
                 {
                    key: 'factory-details',
                    title: 'הגדרות המפעל',
                    icon: 'mdi-factory',
                    route: 'factory-details'
                },
                {
                     key: 'factory-tasks',
                     title: 'משימות',
                     icon: 'mdi-check-circle',
                     route: 'factory-tasks',
                     requiresRole: 1
                }
             ]
         }
     },
    computed: {
        userStore() {
            return useUserStore()
        },
        selectedFactory() {
            return this.userStore.selectedFactory
        },
        navigationItems() {
            // Filter navigation items based on user role
            return this.allNavigationItems.filter(item => {
                // If item requires a specific role, check if user has that role
                if (item.requiresRole !== undefined) {
                    return this.userStore.user.role === item.requiresRole
                }
                // Otherwise, show the item to all users
                return true
            })
        }
    },
    created() {
        // Get factory from router state or store
        const userStore = useUserStore()

        // If no factory found, redirect back
        if (!userStore.selectedFactory) {
            this.$router.push('/user')
        } else {
            // If we're on the factory route without a specific tab, redirect to routine-checks
            if (this.$route.name === 'FactoryMain' || this.$route.path === '/factory') {
                this.$router.push({ name: 'routine-checks' })
            }
        }
    },
     methods: {
         navigateToTab(routeName) {
             this.$router.push({ name: routeName })
         },
         
         selectTab(routeName) {
             this.navigateToTab(routeName)
             this.showMobileMenu = false // Close mobile menu after selection
         },
         
         isActiveRoute(routeName) {
             return this.$route.name === routeName
         },
         
         goBack() {
             // Navigate back to user page
             this.$router.push('/user')
         }
     }
}
</script>

<style scoped>
.sticky-header {
  margin-bottom: calc(1rem - 8px);
  padding: 7px;
  line-height: 1.2;
  overflow: hidden;
  min-width: 0;
}

.sticky-header > div:first-child {
  min-width: 0;
  flex-shrink: 1;
}

.back-button-container {
  flex: 0 0 auto;
  flex-shrink: 0;
  margin-right: 0;
  margin-left: auto;
  min-width: fit-content;
}

.content-wrapper {
  display: flex;
  position: relative;
  width: 100%;
  min-width: 0;
}

.navigation-menu {
  position: sticky;
  top: 0;
  align-self: flex-start;
  flex: 0 0 auto;
  flex-shrink: 0;
  width: 250px;
  margin-left: 16px;
  z-index: 10;
}

.navigation-card {
  width: 100%;
}

.content-area {
  flex: 1;
  min-width: 0;
  width: 100%;
  overflow-x: hidden;
}

@media (max-width: 960px) {
  .navigation-menu {
    margin-left: 0;
  }
}
</style>