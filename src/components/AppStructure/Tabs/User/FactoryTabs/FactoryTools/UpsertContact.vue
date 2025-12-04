<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        {{ dialogTitle }}
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
          <v-text-field 
            v-model="editedItem.name" 
            label="שם" 
            required 
            reverse
            :rules="[v => !!v || 'שם חובה']"
          ></v-text-field>
          <v-text-field 
            v-model="editedItem.jobDescription" 
            label="תיאור תפקיד" 
            required 
            reverse
            :rules="[v => !!v || 'תיאור תפקיד חובה']"
          ></v-text-field>
          <v-text-field 
            v-model="editedItem.email" 
            label="אימייל" 
            type="email" 
            reverse
          ></v-text-field>
          <v-text-field 
            v-model="editedItem.phone" 
            label="טלפון" 
            reverse
          ></v-text-field>
        </v-form>
        <div class="popup-btn-row">
          <v-btn @click="save" color="primary" :loading="loading">שמור</v-btn>
          <v-btn @click="closeDialog">ביטול</v-btn>
          <v-spacer></v-spacer>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'UpsertContact',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    editContact: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    
    const dialog = ref(false)
    const loading = ref(false)
    const form = ref(null)
    
    const editedItem = ref({
      name: '',
      jobDescription: '',
      email: '',
      phone: ''
    })

    const isEditMode = computed(() => !!props.editContact)
    
    const dialogTitle = computed(() => {
      if (isEditMode.value) {
        return 'ערוך איש קשר'
      }
      return 'הוסף איש קשר חדש'
    })

    // Watch for prop changes
    watch(() => props.showDialog, (newVal) => {
      dialog.value = newVal
      if (newVal) {
        initializeForm()
      }
    })

    // Watch for dialog changes and emit to parent
    watch(dialog, (newVal) => {
      if (!newVal) {
        emit('close-dialog')
      }
    })

    function initializeForm() {
      if (isEditMode.value && props.editContact) {
        editedItem.value = {
          name: props.editContact.name || '',
          jobDescription: props.editContact.jobDescription || '',
          email: props.editContact.email || '',
          phone: props.editContact.phone || ''
        }
      } else {
        resetForm()
      }
    }

    function resetForm() {
      editedItem.value = {
        name: '',
        jobDescription: '',
        email: '',
        phone: ''
      }
    }

    function closeDialog() {
      dialog.value = false
      resetForm()
    }

    async function save() {
      if (!form.value.validate()) {
        return
      }

      loading.value = true

      try {
        const factory = userStore.selectedFactory
        if (!factory) {
          alert('מפעל לא נבחר')
          return
        }

        // Get current contacts or initialize as empty array
        let contacts = []
        try {
          contacts = factory.contacts ? JSON.parse(factory.contacts) : []
        } catch (e) {
          contacts = []
        }

        if (!Array.isArray(contacts)) {
          contacts = []
        }

        if (isEditMode.value && props.editContact) {
          // Update existing contact
          const index = contacts.findIndex(c => c.id === props.editContact.id)
          if (index !== -1) {
            contacts[index] = {
              ...contacts[index],
              name: editedItem.value.name,
              jobDescription: editedItem.value.jobDescription,
              email: editedItem.value.email,
              phone: editedItem.value.phone
            }
          }
        } else {
          // Add new contact
          const newContact = {
            id: Date.now(), // Simple ID generation
            name: editedItem.value.name,
            jobDescription: editedItem.value.jobDescription,
            email: editedItem.value.email,
            phone: editedItem.value.phone
          }
          contacts.push(newContact)
        }

        // Update factory with new contacts JSON
        const updatedFactory = {
          ...factory,
          contacts: JSON.stringify(contacts)
        }

        await userStore.updateFactory(updatedFactory)
        
        // Update selectedFactory in store
        userStore.selectedFactory = updatedFactory

        closeDialog()
      } catch (error) {
        console.error('Failed to save contact:', error)
        alert('שגיאה בשמירת איש קשר')
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      loading,
      form,
      editedItem,
      dialogTitle,
      closeDialog,
      save
    }
  }
}
</script>

<style scoped>
.popup-title {
  padding: 0;
  margin: 0;
  padding-right: 12px;
  margin-bottom: 20px;
  background-color: rgb(138, 200, 224);
  text-align: right;
  border-color: black;
  border-width: 2px;
}

.popup-btn-row {
  direction: ltr;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 8px;
}
</style>

