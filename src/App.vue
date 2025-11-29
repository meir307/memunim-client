<template>
  <v-app dir="rtl">
    <TopStrip v-if="!isActivatePage" />
    <v-main>
      <router-view/>
      <AppLoader />
    </v-main>
  </v-app>
</template>

<script>
import AppLoader from '@/components/Common/AppLoader.vue'
import TopStrip from '@/components/AppStructure/TopStrip.vue'
import { useCommonStore } from '@/stores/CommonStore'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  components: { AppLoader, TopStrip },
  setup() {
    const route = useRoute()
    const isActivatePage = computed(() => 
      route.path === '/activate' || 
      route.path === '/reset-password' || 
      route.path === '/resetPassword' ||
      route.path === '/activate-trustee' ||
      route.path === '/activateTrustee'
    )
    
    return {
      isActivatePage
    }
  },
  async created() {
    const commonStore = useCommonStore()
    await commonStore.fetchInitData()
  }
}
</script>
