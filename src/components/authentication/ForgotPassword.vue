<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="popup-title d-flex align-center justify-space-between">
            שכחתי סיסמה
            <v-btn icon="mdi-close" variant="text" @click="$emit('btnClose')"></v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="!emailSent">
              <p class="mb-4">אנא הזן את כתובת האימייל שלך. נשלח אליך קישור לאיפוס הסיסמה.</p>
              
              <v-text-field 
                ref="emailField"
                v-model="email" 
                :rules="validationRules.emailRules" 
                label="אימייל"
                type="email" 
                reverse
                required
                @keyup.enter="sendResetLink"
              ></v-text-field>

              <div class="popup-btn-row">
                <v-btn @click="sendResetLink" color="primary">שלח קישור לאיפוס</v-btn>
                <v-btn @click="$emit('btnClose')">סגור</v-btn>
                <v-spacer></v-spacer>
              </div>
            </div>

            <div v-else class="text-center">
              <v-icon color="success" size="64">mdi-check-circle</v-icon>
              <h3 class="mt-4 mb-2 text-success">המייל נשלח בהצלחה!</h3>
              <p class="mb-4">נשלח אליך מייל עם קישור לאיפוס הסיסמה. אנא בדוק את תיבת הדואר הנכנס.</p>
              <v-btn @click="$emit('btnClose')" color="primary">סגור</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useUserStore } from '@/stores/UserStore'
import * as validationRules from '@/utils/ValidationRules'

export default {
  name: 'ForgotPasswordComponent',
  emits: ['btnClose'],
  data() {
    return {
      email: '',
      emailSent: false,
      validationRules
    }
  },
  methods: {
    async sendResetLink() {
      // Validate email
      const emailValid = this.validationRules.emailRules.every(rule => rule(this.email) === true)

      if (!emailValid) {
        alert('אנא הזן כתובת אימייל תקינה')
        return
      }

      try {
        const userStore = useUserStore()
        await userStore.forgotPassword(this.email)
        this.emailSent = true
      } catch (error) {
        console.error('Forgot password error:', error)
        // Error message is already shown by the store
      }
    }
  }
}
</script>

<style scoped></style>

