<template>
  <v-app dir="rtl">
    <TopStrip />
    <v-main dir="rtl">
      <router-view/>
      <AppLoader />
    </v-main>
  </v-app>
</template>

<script>
import AppLoader from '@/components/Common/AppLoader.vue'
import TopStrip from '@/components/AppStructure/TopStrip.vue'

export default {
  name: 'App',
  components: { AppLoader, TopStrip }
}
</script>
