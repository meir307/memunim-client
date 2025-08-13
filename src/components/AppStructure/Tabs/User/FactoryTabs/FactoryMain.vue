<template>
    <div class="pa-4">
        <!-- Sticky Header -->
        <div class="sticky-header d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center">
                <h1 class="me-9">{{ factory?.name || 'שם המפעל' }}</h1>

                <p class="text-h6 text-medium-emphasis mb-0">{{ factory?.memuneHours || '0' }} שעות ממונה חודשיות</p>
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

        <!-- Factory content will go here -->
        <div>
            <h2>תוכן המפעל</h2>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/UserStore'

export default {
    name: 'FactoryMain',
    data() {
        return {
            factory: null
        }
    },
    created() {
        // Get factory from router state or store
        const userStore = useUserStore()
        this.factory = userStore.selectedFactory || this.$route.state?.factory || null

        // If no factory found, redirect back
        if (!this.factory) {
            this.$router.push('/user')
        }
    }
}
</script>
