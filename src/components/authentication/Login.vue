<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="popup-title d-flex align-center justify-space-between">
            כניסה
            <v-btn icon="mdi-close" variant="text" @click="$emit('btnClose')"></v-btn>
          </v-card-title>
          <v-card-text>

            <v-text-field ref="emailField" v-model="email" reverse label="אימייל" type="email" required
              @keyup.enter="focusPassword"></v-text-field>
            <v-text-field 
              ref="passwordField" 
              v-model="password" 
              reverse 
              label="סיסמה" 
              :type="showPassword ? 'text' : 'password'" 
              required
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              @keyup.enter="login"
            ></v-text-field>
              
            <div class="text-right mt-2 mb-4">
              <a href="#" @click.prevent="openForgotPassword" class="forgot-password-link">
                שכחתי סיסמה
              </a>
            </div>
              
            <div class="popup-btn-row">

              <v-btn @click="login" color="primary">התחבר</v-btn>
              <v-btn @click="$emit('btnClose')">סגור</v-btn>
              <v-spacer></v-spacer>
            </div>

        

            <!-- <div class="login-btn-row">
                <v-btn color="primary">התחבר</v-btn>
                <v-btn @click="$emit('btnClose')">סגור</v-btn>
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
  emits: ['btnClose', 'forgot-password'],
  data: () => ({
    email: '',
    password: '',
    showPassword: false
  }),
  methods: {
    openForgotPassword() {
      this.$emit('forgot-password')
    },
    focusPassword() {
      this.$nextTick(() => {
        this.$refs.passwordField.focus()
      })
    },

    getClientType() {
      const userAgent = navigator.userAgent.toLowerCase()

      if (/android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)) {
        return 3 //'mobile'
      } else if (/tablet|ipad/.test(userAgent)) {
        return 2 //'tablet'
      } else {
        return 1 //'desktop'
      }
    },

    async login() {
      try {
        const userStore = useUserStore()
        await userStore.login({
          email: this.email,
          password: this.password,
          clientType: this.getClientType()
        })

        
        // Check if login was successful (user object has data)
        if (userStore.user.isAuthenticated) {
          this.$emit('btnClose')
          // Navigate to user route after successful login
          this.$router.push('/user')
        }
      } catch (error) {
        console.error('Login error:', error)
        alert('Login failed: ' + error.message)
      }
    },
  },
}
</script>

<style scoped>
.forgot-password-link {
  color: #1976d2;
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
}

.forgot-password-link:hover {
  text-decoration: underline;
}
</style>