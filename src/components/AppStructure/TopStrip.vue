<template>

<v-sheet
  color="primary"
  height="50"
  class="d-flex align-center topstrip-fixed"
>
  <v-spacer></v-spacer>


<div v-if="!isAuthenticated"  class="d-flex align-center">
  <p class="ma-0 ml-6">שלום אורח</p>
  <v-btn variant="text" @click="showLogin = true">כניסה</v-btn>
  <v-btn variant="text" @click="showRegister = true" >הרשמה</v-btn>
</div>

<div v-if="isAuthenticated" class="d-flex align-center" style="font-weight: 200;">
  <p class="ma-0 mr-2">שלום {{ userName }} </p>
  <v-btn variant="text" @click="logout = true" class="ma-0 mr-4">התנתק</v-btn>
</div>

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
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'TopStrip',
  components: { Login, Register},
  data: () => ({
    showLogin: false,
    showRegister:false
  }),
  computed: {
    isAuthenticated() {
      const userStore = useUserStore()
      return userStore.isAuthenticated
    },
    userName(){

      console.log('userName')

      const userStore = useUserStore()
      console.log(userStore.user)
      return userStore.user.fullName
    }
  }
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