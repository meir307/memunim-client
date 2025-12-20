<template>
  <div class="pa-4">
    <h1>ניהול מערכת - סוג 1</h1>
    <v-card class="mt-4">
      <v-card-text class="text-center py-8">
        <v-icon size="64" color="primary" class="mb-4">mdi-account-cog</v-icon>
        <h3 class="text-h6 mb-2">דף ניהול למנהלי סוג 1</h3>
        <p class="text-body-2 text-medium-emphasis">דף זה זמין רק למשתמשים עם AdminType = 1</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'MainSystemAdmin',
  mounted() {
    console.log('MainSystemAdmin component mounted')
  }
}
</script>

