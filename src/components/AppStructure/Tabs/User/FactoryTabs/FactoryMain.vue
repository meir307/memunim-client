<template>
    <div class="pa-4">
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
                 
                 <h1 class="me-9 text-truncate d-md-none" style="max-width: 200px;">{{ factory?.name || 'שם המפעל' }}</h1>
                 <h1 class="me-9 d-none d-md-block">{{ factory?.name || 'שם המפעל' }}</h1>
 
                 <p class="text-h6 text-medium-emphasis mb-0 text-truncate d-md-none" style="max-width: 100px;">{{ factory?.memuneHours || '0' }} שעות ממונה חודשיות</p>
                 <p class="text-h6 text-medium-emphasis mb-0 d-none d-md-block">{{ factory?.memuneHours || '0' }} שעות ממונה חודשיות</p>
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
             factory: null,
             showMobileMenu: false,
             navigationItems: [
                 {
                     key: 'employees',
                     title: 'עובדים',
                     icon: 'mdi-account-group',
                     route: 'factory-employees'
                 },
                 {
                     key: 'reports',
                     title: 'דוחות',
                     icon: 'mdi-chart-bar',
                     route: 'factory-reports'
                 },
                 {
                     key: 'settings',
                     title: 'הגדרות',
                     icon: 'mdi-cog',
                     route: 'factory-settings'
                 },
                 {
                     key: 'safety-procedures',
                     title: 'נהלי בטיחות',
                     icon: 'mdi-comment-text-outline',
                     route: 'safety-procedures'
                 },
                 {
                     key: 'safety-committee',
                     title: 'ועדת בטיחות',
                     icon: 'mdi-cog',
                     route: 'safety-committee'
                 }
             ]
         }
     },
    created() {
        // Get factory from router state or store
        const userStore = useUserStore()
        this.factory = userStore.selectedFactory || null

                 // If no factory found, redirect back
         if (!this.factory) {
             this.$router.push('/user')
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
