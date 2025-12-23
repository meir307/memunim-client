<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        הוסף משתמש
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
          <v-text-field
            v-model="userForm.fullName"
            label="שם מלא"
            required
            reverse
            :rules="[v => !!v || 'שם מלא חובה']"
          ></v-text-field>
          
          <v-text-field
            v-model="userForm.email"
            label="אימייל"
            type="email"
            required
            reverse
            :rules="[v => !!v || 'אימייל חובה', v => /.+@.+\..+/.test(v) || 'אימייל לא תקין']"
          ></v-text-field>
          
          <v-text-field
            v-model="userForm.phone"
            label="טלפון"
            reverse
          ></v-text-field>
          
          <v-select
            v-model="userForm.role"
            :items="roleOptions"
            label="תפקיד"
            required
            reverse
            :rules="[v => v !== null || 'תפקיד חובה']"
          ></v-select>
          
          <v-checkbox
            v-model="userForm.isActive"
            label="פעיל"
            reverse
          ></v-checkbox>

          <div class="popup-btn-row">
            <v-btn @click="save" color="primary" :loading="loading">שמור</v-btn>
            <v-btn @click="closeDialog">ביטול</v-btn>
            <v-spacer></v-spacer>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useAdminSystemStore } from '@/stores/AdminSystemStore'

export default {
  name: 'AddUser',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close-dialog', 'user-saved'],
  setup(props, { emit }) {
    const adminSystemStore = useAdminSystemStore()
    const form = ref(null)
    const loading = ref(false)
    
    const userForm = ref({
      fullName: '',
      email: '',
      phone: '',
      role: null,
      isActive: true
    })

    const roleOptions = [
      { title: 'משתמש רגיל', value: 0 },
      { title: 'מנהל מפעל', value: 1 },
      { title: 'מנהל מערכת', value: 2 }
    ]

    const dialog = computed({
      get: () => props.showDialog,
      set: (value) => {
        if (!value) {
          emit('close-dialog')
        }
      }
    })

    watch(() => props.showDialog, (newVal) => {
      if (newVal) {
        // Reset form when dialog opens
        userForm.value = {
          fullName: '',
          email: '',
          phone: '',
          role: null,
          isActive: true
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
        await adminSystemStore.createUser(userForm.value)
        emit('user-saved')
      } catch (error) {
        console.error('Failed to create user:', error)
        alert(adminSystemStore.getError || 'שגיאה ביצירת משתמש')
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      form,
      loading,
      userForm,
      roleOptions,
      closeDialog,
      save
    }
  }
}
</script>

<style scoped>
</style>

