<template>
    <div class="pa-2">
                 <!-- Sticky Header -->
         <div class="sticky-header d-flex align-center justify-space-between mb-4">
             <div class="d-flex align-center">
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
 
             <div class="d-flex align-center">
                 <v-btn 
                     color="green-lighten-1"
                     
                      prepend-icon="mdi-arrow-left"
                     @click=" this.$router.push('/user')" 
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
         <div class="d-flex">
             <!-- Left side - Navigation menu -->
             <div class="d-none d-md-block me-4">
                 <v-card class="pa-3" style="width: 250px;">
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
             <div class="flex-grow-1">
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
                     key: 'accidents',
                     title: 'תאונות',
                     icon: 'mdi-flash',
                     route: 'factory-accidents'
                 },
                
                 {
                     key: 'hazards',
                     title: 'מפגעים',
                     icon: 'mdi-biohazard',
                     route: 'factory-hazards'
                 },
                 {
                     key: 'routine-checks',
                     title: 'פעילות שוטפת',
                     icon: 'mdi-alarm',
                     route: 'routine-checks'
                 },
                 {
                     key: 'safety-procedures',
                     title: 'נהלים והדרכות',
                     icon: 'mdi-comment-text-outline',
                     route: 'safety-procedures'
                 },
                 {
                     key: 'safety-committee',
                     title: 'ועדת בטיחות',
                     icon: 'mdi-account-group',
                     route: 'safety-committee'
                 },
                {
                    key: 'factory-details',
                    title: 'פרטי המפעל',
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
         }
     }
}
</script>

<style scoped>
.sticky-header {
  margin-bottom: calc(1rem - 8px);
  padding: 7px;
  line-height: 1.2;
}
</style>