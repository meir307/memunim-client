<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        שליחת מפגע באימייל
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      <v-card-text>
        <div class="select-with-button">
          <v-select
            v-model="selectedContacts"
            :items="contactOptions"
            item-title="name"
            item-value="value"
            label="בחר אנשי קשר"
            multiple
            chips
            closable-chips
            variant="outlined"
            density="comfortable"
            reverse
            no-data-text="לא הוגדרו אנשי קשר"
            :loading="loading"
            class="select-field"
          >
          <template v-slot:item="{ props, item }">
            <v-list-item 
              :value="props.value"
              :disabled="props.disabled"
              @click="props.onClick"
            >
              <template v-slot:prepend>
                <v-icon>mdi-email</v-icon>
              </template>
              <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              <v-list-item-subtitle v-if="item.raw.jobDescription">{{ item.raw.jobDescription }}</v-list-item-subtitle>
              <v-list-item-subtitle v-if="item.raw.email" class="text-caption">{{ item.raw.email }}</v-list-item-subtitle>
            </v-list-item>
          </template>
          <template v-slot:selection>
            <v-chip
              v-for="(email, index) in selectedContacts"
              :key="index"
              closable
              @click:close="selectedContacts = selectedContacts.filter(e => e !== email)"
            >
              {{ contactOptions.find(c => c.value === email)?.name || email }}
            </v-chip>
          </template>
          </v-select>
          <v-btn
            icon="mdi-plus-circle-outline"
            variant="flat"
            size="small"
            class="select-button"
            color="success"
            @click="openContactDialog"
          ></v-btn>
        </div>
        
        <div class="popup-btn-row">
          <v-btn @click="sendEmail" color="primary" :disabled="selectedContacts.length === 0">
            <v-icon left>mdi-send</v-icon>
            שלח
          </v-btn>
          <v-btn @click="closeDialog">ביטול</v-btn>
          <v-spacer></v-spacer>
        </div>
      </v-card-text>
      </v-card>
    </v-dialog>

  <!-- UpsertContact Dialog -->
  <UpsertContact 
    :show-dialog="showContactDialog" 
    :edit-contact="null"
    @close-dialog="closeContactDialog" 
  />
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import UpsertContact from '../FactoryDetails/UpsertContact.vue'

export default {
  name: 'MailHazard',
  components: {
    UpsertContact
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    hazard: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog', 'send-email'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    const dialog = ref(false)
    const loading = ref(false)
    const selectedContacts = ref([])
    const showContactDialog = ref(false)
    const previousContactCount = ref(0)

    // Watch for prop changes
    watch(() => props.showDialog, (newVal) => {
      dialog.value = newVal
      if (!newVal) {
        selectedContacts.value = []
      }
    })

    // Watch for dialog changes and emit to parent
    watch(dialog, (newVal) => {
      if (!newVal) {
        emit('close-dialog')
        selectedContacts.value = []
      }
    })

    // Parse contacts from factory and create options for multiselect
    const contactOptions = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.contacts) {
        return []
      }
      
      try {
        const parsed = JSON.parse(factory.contacts)
        if (!Array.isArray(parsed)) {
          return []
        }
        // Filter contacts that have email addresses
        return parsed
          .filter(contact => contact.email && contact.email.trim() !== '')
          .map(contact => ({
            name: contact.name || 'ללא שם',
            jobDescription: contact.jobDescription || '',
            value: contact.email,
            contactId: contact.id,
            email: contact.email
          }))
      } catch (e) {
        console.error('Error parsing contacts:', e)
        return []
      }
    })

    function openContactDialog() {
      // Store the current contact count before opening the dialog
      previousContactCount.value = contactOptions.value.length
      showContactDialog.value = true
    }

    function closeContactDialog() {
      showContactDialog.value = false
      
      // Check if a new contact was added (contact count increased)
      if (contactOptions.value.length > previousContactCount.value) {
        const factory = userStore.selectedFactory
        if (factory && factory.contacts) {
          try {
            const parsed = JSON.parse(factory.contacts)
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Find the contact with the highest ID (the newly added one)
              const newContact = parsed.reduce((max, contact) => {
                const maxId = max.id || 0
                const contactId = contact.id || 0
                return contactId > maxId ? contact : max
              }, parsed[0])
              
              // Add the newly added contact's email to selectedContacts if it's not already selected
              if (newContact && newContact.email && !selectedContacts.value.includes(newContact.email)) {
                selectedContacts.value.push(newContact.email)
              }
            }
          } catch (e) {
            console.error('Error parsing contacts:', e)
          }
        }
      }
      
      // Reset the previous count
      previousContactCount.value = contactOptions.value.length
    }

    function closeDialog() {
      dialog.value = false
      selectedContacts.value = []
    }

    function sendEmail() {
      if (selectedContacts.value.length === 0 || !props.hazard) {
        return
      }

      // Emit selected emails with hazard id
      emit('send-email', {
        hazardId: props.hazard.id,
        emails: selectedContacts.value
      })
      
      closeDialog()
    }

    return {
      dialog,
      loading,
      selectedContacts,
      showContactDialog,
      contactOptions,
      openContactDialog,
      closeContactDialog,
      closeDialog,
      sendEmail
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

