<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="popup-title">
            <h3>כניסה</h3>
          </v-card-title>
          <v-card-text>

            <v-text-field v-model="email" reverse label="אימייל" type="email" required></v-text-field>
            <v-text-field v-model="password" reverse label="סיסמה" type="password" required></v-text-field>
            <div class="popup-btn-row">

              <v-btn @click="login" color="primary">התחבר</v-btn>
              <v-btn @click="$emit('btnCancel')">סגור</v-btn>
              <v-spacer></v-spacer>
            </div>


            <!-- <div class="login-btn-row">
                <v-btn color="primary">התחבר</v-btn>
                <v-btn @click="$emit('btnCancel')">סגור</v-btn>
              </div>
             -->


          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'LoginComponent',
  data: () => ({
    email: '',
    password: ''
  }),
  methods: {
    getClientType() {
      const userAgent = navigator.userAgent.toLowerCase()
      
      if (/android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)) {
        return 'mobile'
      } else if (/tablet|ipad/.test(userAgent)) {
        return 'tablet'
      } else {
        return 'desktop'
      }
    },
    
    async login() {
      const userStore = useUserStore()
      await userStore.login({
        email: this.email,
        password: this.password,
        clientType: this.getClientType()
      })

      if ( userStore.isAuthenticated ) {
        this.$emit('btnCancel')
      }
    },
  },
}
</script>

<style scoped></style>