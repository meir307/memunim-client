<template>
  <div class="activate-page">
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
        <v-col :cols="success ? 12 : 12" :sm="success ? 12 : 8" :md="success ? 12 : 6" :lg="success ? 10 : 4">
          <v-card>
          <v-card-title class="popup-title d-flex align-center justify-center">
            הפעלת חשבון
          </v-card-title>
          <v-card-text class="text-center pa-8">
            <div v-if="loading" class="mb-4">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="mt-4">מפעיל את החשבון...</p>
            </div>
            
            <div v-else-if="success">
              <div class="text-center mb-6">
                <v-icon color="success" size="64">mdi-check-circle</v-icon>
                <h2 class="mt-4 mb-2 text-success">החשבון הופעל בהצלחה!</h2>
                <p class="mb-4">ניתן להתחבר עכשיו למערכת</p>
              </div>
              <div class="login-wrapper">
                <Login @btnClose="handleLoginClose" @forgot-password="handleForgotPassword" />
              </div>
              
              <!-- Forgot Password Dialog -->
              <v-dialog v-model="showForgotPassword" max-width="1000" width="90%" persistent>
                <ForgotPassword @btnClose="showForgotPassword = false" />
              </v-dialog>
            </div>
            
            <div v-else-if="error" class="mb-4">
              <v-icon color="error" size="64">mdi-alert-circle</v-icon>
              <h2 class="mt-4 mb-2 text-error">שגיאה בהפעלת החשבון</h2>
              <p class="mb-4">{{ errorMessage }}</p>
              <v-btn color="primary" @click="goToHome">חזור לדף הבית</v-btn>
            </div>
          </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCommonStore } from '@/stores/CommonStore'
import { useLoaderStore } from '@/stores/LoaderStore'
import Login from './Login.vue'
import ForgotPassword from './ForgotPassword.vue'

export default {
  name: 'ActivateAccount',
  components: {
    Login,
    ForgotPassword
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const commonStore = useCommonStore()
    const loaderStore = useLoaderStore()
    
    const loading = ref(true)
    const success = ref(false)
    const error = ref(false)
    const errorMessage = ref('')
    const showForgotPassword = ref(false)

    async function activateAccount() {
      const activationCode = route.query.code
      
      if (!activationCode) {
        error.value = true
        errorMessage.value = 'קוד הפעלה לא נמצא'
        loading.value = false
        return
      }

       try {
         loaderStore.show()
         const response = await axios.post(commonStore.apiUrl + 'user/activate', {
           code: activationCode
         })
        
         if (response.data.success) {
           success.value = true
           error.value = false
         } else {
           error.value = true
           success.value = false
           errorMessage.value = response.data.message || 'שגיאה בהפעלת החשבון'
         }
       } catch (err) {
         error.value = true
         errorMessage.value = err.response?.data?.message || 'שגיאה בהפעלת החשבון. נסה שוב מאוחר יותר.'
         console.error('Activation error:', err)
       } finally {
         loading.value = false
         loaderStore.hide()
       }
    }

    function handleLoginClose() {
      // After login, redirect to about page
      router.push('/about')
    }

    function handleForgotPassword() {
      showForgotPassword.value = true
    }

    function goToHome() {
      router.push('/about')
    }

    onMounted(() => {
      activateAccount()
    })

    return {
      loading,
      success,
      error,
      errorMessage,
      showForgotPassword,
      handleLoginClose,
      handleForgotPassword,
      goToHome
    }
  }
}
</script>

<style scoped>
.activate-page {
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

