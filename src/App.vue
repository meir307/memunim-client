<template>
  <v-app  dir="rtl">
    
    <v-main  dir="rtl">
      <router-view/>
      <AppLoader />
    </v-main>
    
  </v-app>
</template>

<script>
import AppLoader from '@/components/Common/AppLoader.vue'

export default {
  name: 'App',
  components: { AppLoader },
  data: () => ({
    //
  }),
}
</script>
