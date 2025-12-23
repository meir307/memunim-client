<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        ערוך משתמש
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
         

          <!-- Line 1: fullName, email, phone, createdAt -->
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="userForm.fullName"
                label="שם מלא"
                required
                reverse
                :rules="[v => !!v || 'שם מלא חובה']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="userForm.email"
                label="אימייל"
                type="email"
                required
                reverse
                :rules="[v => !!v || 'אימייל חובה', v => /.+@.+\..+/.test(v) || 'אימייל לא תקין']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="userForm.phone"
                label="טלפון"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="userForm.role"
                :items="roleOptions"
                label="תפקיד"
                required
                reverse
                :rules="[v => v !== null || 'תפקיד חובה']"
              ></v-select>
            </v-col>
            
          </v-row>

        <!-- Line 2: id, isActive, adminType, role -->
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="userForm.id"
                label="מזהה"
                reverse
                readonly
                disabled
                class="readonly-field"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="formattedCreatedAt"
                label="תאריך יצירה"
                reverse
                readonly
                disabled
                class="readonly-field"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-checkbox
                v-model="userForm.isActive"
                label="פעיל"
                reverse
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="userForm.adminType"
                label="סוג מנהל"
                reverse
              ></v-text-field>
            </v-col>
           
            
          </v-row>

          <div class="popup-btn-row">
            <v-btn @click="save" color="primary" :loading="loading">עדכן</v-btn>
            <v-btn @click="displayFactories" color="info" :loading="loadingFactories">הצג מפעלים</v-btn>
            <v-btn @click="loginAsUser" color="success" :loading="loggingInAsUser">התחבר כמשתמש</v-btn>
            <v-btn @click="deleteSession" color="error" :loading="deletingSession">מחק סשן</v-btn>
            <v-btn @click="closeDialog">ביטול</v-btn>
            <v-spacer></v-spacer>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Display Factories Dialog -->
  <v-dialog v-model="showFactoriesDialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        מפעלים של {{ user?.fullName || user?.email }}
        <v-btn icon="mdi-close" variant="text" @click="showFactoriesDialog = false"></v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="loadingFactories" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">טוען מפעלים...</p>
        </div>
        <div v-else-if="userFactories.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-factory</v-icon>
          <h3 class="text-h6 mb-2">אין מפעלים</h3>
          <p class="text-body-2 text-medium-emphasis">למשתמש זה אין מפעלים.</p>
        </div>
        <v-list v-else>
          <v-list-item
            v-for="(factory, index) in userFactories"
            :key="factory.id || factory.hetpei || index"
            :title="factory.name || factory.hetpei || 'מפעל ללא שם'"
            :subtitle="factory.address || ''"
          >
            <template v-slot:prepend>
              <v-icon>mdi-factory</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="showFactoriesDialog = false">סגור</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useAdminSystemStore } from '@/stores/AdminSystemStore'
import { useUserStore } from '@/stores/UserStore'
import { useRouter } from 'vue-router'

export default {
  name: 'UserCard',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog', 'user-updated'],
  setup(props, { emit }) {
    const adminSystemStore = useAdminSystemStore()
    const userStore = useUserStore()
    const router = useRouter()
    const form = ref(null)
    const loading = ref(false)
    const deletingSession = ref(false)
    const loggingInAsUser = ref(false)
    const loadingFactories = ref(false)
    const showFactoriesDialog = ref(false)
    const userFactories = ref([])
    
    const userForm = ref({
      id: null,
      fullName: '',
      email: '',
      phone: '',
      role: null,
      adminType: '',
      createdAt: null,
      isActive: true
    })

    const roleOptions = [
      { title: 'ממונה בטיחות', value: 1 },
      { title: 'נאמן בטיחות', value: 2 }
    ]

    const formattedCreatedAt = computed(() => {
      if (!userForm.value.createdAt) return ''
      try {
        const date = new Date(userForm.value.createdAt)
        if (isNaN(date.getTime())) return userForm.value.createdAt
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes} ${day}/${month}/${year}`
      } catch (error) {
        return userForm.value.createdAt
      }
    })

    const dialog = computed({
      get: () => props.showDialog,
      set: (value) => {
        if (!value) {
          emit('close-dialog')
        }
      }
    })

    watch(() => [props.showDialog, props.user], ([showDialog, user]) => {
      if (showDialog && user) {
        userForm.value = {
          id: user.id || null,
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role !== undefined ? user.role : null,
          adminType: user.adminType !== undefined ? user.adminType : null,
          createdAt: user.createdAt || null,
          isActive: user.isActive !== undefined ? (user.isActive === 1 || user.isActive === true) : true
        }
        if (form.value) {
          form.value.resetValidation()
        }
      }
    })

    function closeDialog() {
      emit('close-dialog')
    }

    async function save() {
      const { valid } = await form.value.validate()
      if (!valid) return

      loading.value = true
      try {
        const payload = {
          ...userForm.value,
          id: props.user?.id,
          // Convert boolean back to number (1/0) for the API
          isActive: userForm.value.isActive ? 1 : 0
        }
        await adminSystemStore.updateUser(payload)
        emit('user-updated')
      } catch (error) {
        console.error('Failed to update user:', error)
        alert(adminSystemStore.getError || 'שגיאה בעדכון משתמש')
      } finally {
        loading.value = false
      }
    }

    async function deleteSession() {
      const confirmed = confirm(`האם למחוק את הסשן של המשתמש "${props.user?.fullName || props.user?.email}"?`)
      if (!confirmed) return

      deletingSession.value = true
      try {
        await adminSystemStore.deleteUserSession(props.user?.id)
        alert('הסשן נמחק בהצלחה')
      } catch (error) {
        console.error('Failed to delete session:', error)
        alert(adminSystemStore.getError || 'שגיאה במחיקת סשן')
      } finally {
        deletingSession.value = false
      }
    }

    async function loginAsUser() {
      const confirmed = confirm(`האם להתחבר כמשתמש "${props.user?.fullName || props.user?.email}"?`)
      if (!confirmed) return

      loggingInAsUser.value = true
      try {
        const response = await adminSystemStore.loginAsUser(props.user?.id)
        
        // Update user store with the new user data
        if (response.user) {
          userStore.user = response.user
          localStorage.setItem('user', JSON.stringify(response.user))
          
          // Close dialog and navigate to user route
          emit('close-dialog')
          router.push('/user')
        }
      } catch (error) {
        console.error('Failed to login as user:', error)
        alert(adminSystemStore.getError || 'שגיאה בהתחברות כמשתמש')
      } finally {
        loggingInAsUser.value = false
      }
    }

    async function displayFactories() {
      showFactoriesDialog.value = true
      loadingFactories.value = true
      userFactories.value = []
      
      try {
        const factories = await adminSystemStore.getUserFactories(props.user?.id)
        userFactories.value = factories || []
      } catch (error) {
        console.error('Failed to get factories:', error)
        alert(adminSystemStore.getError || 'שגיאה בטעינת מפעלים')
      } finally {
        loadingFactories.value = false
      }
    }

    return {
      dialog,
      form,
      loading,
      deletingSession,
      loggingInAsUser,
      loadingFactories,
      showFactoriesDialog,
      userFactories,
      userForm,
      roleOptions,
      formattedCreatedAt,
      closeDialog,
      save,
      deleteSession,
      loginAsUser,
      displayFactories
    }
  }
}
</script>

<style scoped>
.readonly-field :deep(.v-field__input),
.readonly-field :deep(input) {
  font-weight: bold !important;
}

.popup-btn-row {
  flex-wrap: wrap;
}

.popup-btn-row :deep(.v-btn) {
  flex: 1 1 auto;
  min-width: 120px;
  margin: 4px;
}

@media (max-width: 768px) {
  .popup-btn-row {
    flex-direction: column;
  }
  
  .popup-btn-row :deep(.v-btn) {
    width: 100%;
    margin: 4px 0;
  }
}
</style>

