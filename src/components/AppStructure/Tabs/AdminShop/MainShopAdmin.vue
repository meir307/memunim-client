<template>
  <div class="pa-4">
    <h1>ניהול מערכת</h1>
    <v-card class="mt-4">
      <v-card-text class="text-center py-8">
        <v-icon size="64" color="primary" class="mb-4">mdi-cog-outline</v-icon>
        <h3 class="text-h6 mb-2">דף ניהול לסער גורפיל</h3>
        <p class="text-body-2 text-medium-emphasis">בדף זה ינוהל איזור החנות והשרותים של האתר</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'MainShopAdmin',
  mounted() {
    console.log('MainShopAdmin component mounted')
  }
}
</script>

