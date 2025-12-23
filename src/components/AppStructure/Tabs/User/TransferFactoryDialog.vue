<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between pr-3">
        העברת מפעל
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDialog"
        ></v-btn>
      </v-card-title>
      <v-card-text>
        <!-- Step 1: Email Input -->
        <div v-if="step === 'email'">
          <p class="mb-4">הזן את כתובת האימייל של המשתמש שאליו תרצה להעביר את המפעל:</p>
          <v-form @submit.prevent="handleEmailSubmit" ref="emailForm">
            <v-text-field
              v-model="email"
              label="אימייל"
              type="email"
              required
              reverse
              :rules="emailRules"
              :loading="loadingUser"
              :disabled="loadingUser"
            ></v-text-field>
          </v-form>
          <div class="popup-btn-row">
            <v-btn
              @click="handleEmailSubmit"
              color="primary"
              :loading="loadingUser"
              :disabled="!email || loadingUser"
            >
              המשך
            </v-btn>
            <v-btn @click="closeDialog">ביטול</v-btn>
            <v-spacer></v-spacer>
          </div>
        </div>

        <!-- Step 2: Confirmation -->
        <div v-if="step === 'confirmation'">
          <p class="mb-4">האם אתה בטוח שברצונך להעביר את המפעל <strong>{{ factoryName }}</strong> למשתמש:</p>
          <v-card class="mb-4" variant="outlined">
            <v-card-text>
              <p class="mb-2"><strong>שם מלא:</strong> {{ targetUser.fullName || '-' }}</p>
              <p class="mb-2"><strong>אימייל:</strong> {{ targetUser.email || '-' }}</p>
            </v-card-text>
          </v-card>
          <div class="popup-btn-row">
            <v-btn
              @click="handleConfirmTransfer"
              color="primary"
              :loading="transferring"
              :disabled="transferring"
            >
              אישור והעברה
            </v-btn>
            <v-btn
              @click="step = 'email'"
              :disabled="transferring"
            >
              חזרה
            </v-btn>
            <v-btn
              @click="closeDialog"
              :disabled="transferring"
            >
              ביטול
            </v-btn>
            <v-spacer></v-spacer>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'TransferFactoryDialog',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    factory: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog', 'transfer-completed'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    
    const dialog = ref(false)
    const step = ref('email')
    const email = ref('')
    const targetUser = ref(null)
    const loadingUser = ref(false)
    const transferring = ref(false)
    const emailForm = ref(null)

    const emailRules = [
      v => !!v || 'אימייל חובה',
      v => /.+@.+\..+/.test(v) || 'אימייל לא תקין'
    ]

    const factoryName = computed(() => {
      return props.factory?.name || 'המפעל'
    })

    // Watch for prop changes
    watch(() => props.showDialog, (newVal) => {
      dialog.value = newVal
      if (newVal) {
        resetDialog()
      }
    })

    // Watch for dialog changes and emit to parent
    watch(dialog, (newVal) => {
      if (!newVal) {
        emit('close-dialog')
      }
    })

    function resetDialog() {
      step.value = 'email'
      email.value = ''
      targetUser.value = null
      loadingUser.value = false
      transferring.value = false
      if (emailForm.value) {
        emailForm.value.resetValidation()
      }
    }

    async function handleEmailSubmit() {
      if (!emailForm.value) return
      
      const { valid } = await emailForm.value.validate()
      if (!valid) return

      loadingUser.value = true
      try {
        const user = await userStore.getUserByEmail(email.value)
        targetUser.value = user
        step.value = 'confirmation'
      } catch (error) {
        console.error('Failed to get user by email:', error)
        // Error is already handled in the store with alert
      } finally {
        loadingUser.value = false
      }
    }

    async function handleConfirmTransfer() {
      if (!props.factory || !props.factory.id) {
        alert('שגיאה: מפעל לא זוהה')
        return
      }

      transferring.value = true
      try {
        await userStore.transferFactory(props.factory.id, email.value)
        emit('transfer-completed')
        closeDialog()
      } catch (error) {
        console.error('Failed to transfer factory:', error)
        // Error is already handled in the store with alert
      } finally {
        transferring.value = false
      }
    }

    function closeDialog() {
      dialog.value = false
      resetDialog()
    }

    return {
      dialog,
      step,
      email,
      targetUser,
      loadingUser,
      transferring,
      emailForm,
      emailRules,
      factoryName,
      handleEmailSubmit,
      handleConfirmTransfer,
      closeDialog
    }
  }
}
</script>

<style scoped>
.popup-title {
  padding: 0;
  margin: 0;
}

.popup-btn-row {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>

