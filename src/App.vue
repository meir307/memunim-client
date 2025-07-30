<template>
  <v-app dir="rtl">
    <TopStrip />
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

export default {
  name: 'App',
  components: { AppLoader, TopStrip },
  async created() {
    const commonStore = useCommonStore()
    await commonStore.fetchInitData()
  }
}
</script>
