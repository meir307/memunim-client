<template>

<v-sheet
  color="primary"
  height="50"
  class="d-flex align-center topstrip-fixed"
>
  <v-spacer></v-spacer>
  <v-btn variant="text" @click="showLogin = true">התחברות</v-btn>
  <v-btn variant="text" href="http://">הרשמה</v-btn>

  <v-dialog v-model="showLogin" width="1000">
    <Login />
  </v-dialog>

</v-sheet>

</template>

<script>
import Login from '@/components/Authentication/Login.vue'

export default {
  name: 'TopStrip',
  components: { Login },
  data: () => ({
    showLogin: false
  }),
}
</script>

<style>
.topstrip-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}
</style>