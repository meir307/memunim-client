<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="popup-title d-flex align-center justify-space-between">
            עדכן פרופיל
            <v-btn icon="mdi-close" variant="text" @click="$emit('btnClose')"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-text-field 
              v-model="user.fullName" 
              :rules="validationRules.fullNameRules" 
              label="שם מלא"
              type="text" 
              reverse
              required
              @keyup.enter="focusEmail"
            ></v-text-field>

            <v-text-field 
              ref="emailField"
              v-model="user.email" 
              :rules="validationRules.emailRules" 
              label="אימייל"
              type="email" 
              reverse
              required
              @keyup.enter="focusPhone"
            ></v-text-field>

            <v-text-field 
              ref="phoneField"
              v-model="user.phone" 
              :rules="validationRules.phoneRules" 
              label="טלפון" 
              type="text"
              reverse
              required
              class="phone-input"
              @input="handlePhoneInput"
              @keyup.enter="updateProfile"
            ></v-text-field>

            <div class="popup-btn-row">
              <v-btn @click="updateProfile" color="primary">עדכן</v-btn>
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
import { restrictPhoneToDigits } from '@/utils/PhoneInput'

export default {
  name: 'UpdateProfileComponent',
  data() {
    const userStore = useUserStore()
    return {
      user: {
        fullName: userStore.user.fullName || '',
        email: userStore.user.email || '',
        phone: userStore.user.phone || ''
      },
      validationRules
    }
  },
  methods: {
    handlePhoneInput(value) {
      this.user.phone = restrictPhoneToDigits(value)
    },
    focusEmail() {
      this.$nextTick(() => {
        this.$refs.emailField?.focus()
      })
    },
    focusPhone() {
      this.$nextTick(() => {
        this.$refs.phoneField?.focus()
      })
    },
    async updateProfile() {
      // Validate all fields
      const fullNameValid = this.validationRules.fullNameRules.every(rule => rule(this.user.fullName) === true)
      const emailValid = this.validationRules.emailRules.every(rule => rule(this.user.email) === true)
      const phoneValid = this.validationRules.phoneRules.every(rule => rule(this.user.phone) === true)

      if (!fullNameValid || !emailValid || !phoneValid) {
        alert('אנא מלא את כל השדות בצורה תקינה')
        return
      }

      try {
        const userStore = useUserStore()
        await userStore.updateProfile(this.user)
        alert('הפרופיל עודכן בהצלחה')
        this.$emit('btnClose')
      } catch (error) {
        alert(error.response?.data?.message || 'שגיאה בעדכון הפרופיל')
        console.error('Update profile error:', error)
      }
    }
  }
}
</script>

<style scoped></style>

