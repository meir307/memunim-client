<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="popup-title d-flex align-center justify-space-between">
            שנה סיסמא
            <v-btn icon="mdi-close" variant="text" @click="$emit('btnClose')"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-text-field 
              v-model="currentPassword" 
              :rules="validationRules.passwordRules" 
              label="סיסמה נוכחית"
              :type="showCurrentPassword ? 'text' : 'password'"
              reverse
              required
              :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
              @keyup.enter="focusNewPassword"
            ></v-text-field>

            <v-text-field 
              ref="newPasswordField"
              v-model="newPassword" 
              :rules="validationRules.passwordRules" 
              label="סיסמה חדשה"
              :type="showNewPassword ? 'text' : 'password'"
              reverse
              required
              :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showNewPassword = !showNewPassword"
              @keyup.enter="focusConfirmPassword"
            ></v-text-field>

            <v-text-field 
              ref="confirmPasswordField"
              v-model="confirmPassword" 
              :rules="passwordConfirmRules" 
              label="אימות סיסמה חדשה"
              :type="showConfirmPassword ? 'text' : 'password'"
              reverse
              required
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              @keyup.enter="changePassword"
            ></v-text-field>

            <div class="popup-btn-row">
              <v-btn @click="changePassword" color="primary">שנה סיסמא</v-btn>
              <v-btn @click="$emit('btnClose')">סגור</v-btn>
              <v-spacer></v-spacer>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as validationRules from '@/utils/ValidationRules'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'ChangePasswordComponent',
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      validationRules,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false
    }
  },
  computed: {
    passwordConfirmRules() {
      return [
        this.validationRules.required,
        (v) => v === this.newPassword || 'הסיסמאות אינן תואמות'
      ]
    }
  },
  methods: {
    focusNewPassword() {
      this.$nextTick(() => {
        this.$refs.newPasswordField?.focus()
      })
    },
    focusConfirmPassword() {
      this.$nextTick(() => {
        this.$refs.confirmPasswordField?.focus()
      })
    },
    async changePassword() {
      // Validate all fields
      const currentPasswordValid = this.validationRules.passwordRules.every(rule => rule(this.currentPassword) === true)
      const newPasswordValid = this.validationRules.passwordRules.every(rule => rule(this.newPassword) === true)
      const confirmPasswordValid = this.passwordConfirmRules.every(rule => rule(this.confirmPassword) === true)

      if (!currentPasswordValid || !newPasswordValid || !confirmPasswordValid) {
        alert('אנא מלא את כל השדות בצורה תקינה')
        return
      }

      // Check if new password is different from current
      if (this.currentPassword === this.newPassword) {
        alert('הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית')
        return
      }


      try {
        const userStore = useUserStore()
        
        userStore.changePassword(this.currentPassword, this.newPassword)
        
        this.$emit('btnClose')
        // Clear form
        this.currentPassword = ''
        this.newPassword = ''
        this.confirmPassword = ''
      } catch (error) {
        alert(error.response?.data?.message || 'שגיאה בשינוי הסיסמה')
        console.error('Change password error:', error)
      } 
    }
  }
}
</script>

<style scoped></style>

