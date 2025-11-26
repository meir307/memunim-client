<template>
  <div class="reset-password-page">
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
        <v-col :cols="success ? 12 : 12" :sm="success ? 12 : 8" :md="success ? 12 : 6" :lg="success ? 10 : 4">
          <v-card>
          <v-card-title class="popup-title d-flex align-center justify-center">
            איפוס סיסמה
          </v-card-title>
          <v-card-text class="text-center pa-8">
            <div v-if="loading" class="mb-4">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="mt-4">מאפס את הסיסמה...</p>
            </div>
            
            <div v-else-if="!resetCode" class="mb-4">
              <v-icon color="error" size="64">mdi-alert-circle</v-icon>
              <h2 class="mt-4 mb-2 text-error">קוד איפוס לא נמצא</h2>
              <p class="mb-4">קישור האיפוס לא תקין או שפג תוקפו</p>
              <v-btn color="primary" @click="goToHome">חזור לדף הבית</v-btn>
            </div>
            
            <div v-else-if="success">
              <div class="text-center mb-6">
                <v-icon color="success" size="64">mdi-check-circle</v-icon>
                <h2 class="mt-4 mb-2 text-success">הסיסמה אופסה בהצלחה!</h2>
                <p class="mb-4">ניתן להתחבר עכשיו עם הסיסמה החדשה</p>
              </div>
              <div class="login-wrapper">
                <Login @btnClose="handleLoginClose" />
              </div>
            </div>
            
            <div v-else-if="error" class="mb-4">
              <v-icon color="error" size="64">mdi-alert-circle</v-icon>
              <h2 class="mt-4 mb-2 text-error">שגיאה באיפוס הסיסמה</h2>
              <p class="mb-4">{{ errorMessage }}</p>
              <v-btn color="primary" @click="goToHome">חזור לדף הבית</v-btn>
            </div>
            
            <div v-else>
              <p class="mb-4">אנא הזן סיסמה חדשה</p>
              
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
                @keyup.enter="resetPassword"
              ></v-text-field>

              <div class="popup-btn-row">
                <v-btn @click="resetPassword" color="primary">אפס סיסמה</v-btn>
                <v-btn @click="goToHome">ביטול</v-btn>
                <v-spacer></v-spacer>
              </div>
            </div>
          </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useLoaderStore } from '@/stores/LoaderStore'
import * as validationRules from '@/utils/ValidationRules'
import Login from './Login.vue'

export default {
  name: 'ResetPasswordComponent',
  components: {
    Login
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const loaderStore = useLoaderStore()
    
    const loading = ref(false)
    const success = ref(false)
    const error = ref(false)
    const errorMessage = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)
    const newPasswordField = ref(null)
    const confirmPasswordField = ref(null)
    
    const resetCode = ref(route.query.code || null)

    const passwordConfirmRules = computed(() => {
      return [
        validationRules.required,
        (v) => v === newPassword.value || 'הסיסמאות אינן תואמות'
      ]
    })

    async function resetPassword() {
      // Validate all fields
      const newPasswordValid = validationRules.passwordRules.every(rule => rule(newPassword.value) === true)
      const confirmPasswordValid = passwordConfirmRules.value.every(rule => rule(confirmPassword.value) === true)

      if (!newPasswordValid || !confirmPasswordValid) {
        alert('אנא מלא את כל השדות בצורה תקינה')
        return
      }

      try {
        loading.value = true
        loaderStore.show()
        await userStore.resetPassword(resetCode.value, newPassword.value)
        success.value = true
        error.value = false
      } catch (err) {
        error.value = true
        success.value = false
        errorMessage.value = err.response?.data?.message || 'שגיאה באיפוס הסיסמה. נסה שוב מאוחר יותר.'
        console.error('Reset password error:', err)
      } finally {
        loading.value = false
        loaderStore.hide()
      }
    }

    function handleLoginClose() {
      // After login, redirect to regulations page
      router.push('/regulations')
    }

    function goToHome() {
      router.push('/regulations')
    }

    async function focusConfirmPassword() {
      await nextTick()
      if (confirmPasswordField.value && confirmPasswordField.value.$el) {
        const input = confirmPasswordField.value.$el.querySelector('input')
        if (input) {
          input.focus()
        }
      }
    }

    return {
      loading,
      success,
      error,
      errorMessage,
      resetCode,
      newPassword,
      confirmPassword,
      showNewPassword,
      showConfirmPassword,
      validationRules,
      passwordConfirmRules,
      resetPassword,
      handleLoginClose,
      goToHome,
      focusConfirmPassword,
      newPasswordField,
      confirmPasswordField
    }
  }
}
</script>

<style scoped>
.reset-password-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.fill-height {
  height: 100%;
}

.popup-title {
  padding: 0;
  margin: 0;
  padding-right: 12px;
  margin-bottom: 20px;
  background-color: rgb(138, 200, 224);
  text-align: center;
  border-color: black;
  border-width: 2px;
}

.login-wrapper :deep(.v-container) {
  max-width: 100% !important;
  padding: 0 !important;
}

.login-wrapper :deep(.v-row) {
  margin: 0 !important;
}

.login-wrapper :deep(.v-col) {
  padding: 0 !important;
  max-width: 100% !important;
  flex: 0 0 100% !important;
  width: 100% !important;
}

.login-wrapper :deep(.v-col[class*="sm-8"]) {
  flex: 0 0 100% !important;
  max-width: 100% !important;
  width: 100% !important;
}

.login-wrapper :deep(.v-col[class*="md-4"]) {
  flex: 0 0 100% !important;
  max-width: 100% !important;
  width: 100% !important;
}

.login-wrapper :deep(.v-card) {
  width: 100% !important;
}
</style>

