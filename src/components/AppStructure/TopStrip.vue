<template>

<v-sheet
  color="primary"
  height="50"
  class="d-flex align-center topstrip-fixed"
>
  <v-spacer></v-spacer>
  <v-btn variant="text" @click="showLogin = true">כניסה</v-btn>
  <v-btn variant="text" @click="showRegister = true" >הרשמה</v-btn>

  <v-dialog v-model="showLogin" width="1000">
    <Login v-on:btnCancel="showLogin= false"/>
  </v-dialog>

  <v-dialog v-model="showRegister" width="1000">
    <Register v-on:btnCancel="showRegister= false"/>
  </v-dialog>

</v-sheet>

</template>

<script>
import Login from '@/components/Authentication/Login.vue'
import Register from '@/components/Authentication/Register.vue'

export default {
  name: 'TopStrip',
  components: { Login, Register},
  data: () => ({
    showLogin: false,
    showRegister:false
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