<template>
  <div>
    <v-card-text class="pa-0">
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="contacts"
          :loading="loading"
          :items-per-page="-1"
          class="modern-table"
          no-data-text="אין אנשי קשר"
          loading-text="טוען נתונים..."
          hide-default-footer
        >
          <template #item="{ item, columns }">
            <tr>
              <td v-for="column in columns" :key="column.key">
                <span v-if="column.key === 'name'">{{ item.name }}</span>
                <span v-else-if="column.key === 'jobDescription'">{{ item.jobDescription }}</span>
                <span v-else-if="column.key === 'email'">{{ item.email || '-' }}</span>
                <span v-else-if="column.key === 'phone'">{{ item.phone || '-' }}</span>
                <span v-else-if="column.key === 'actions' && userStore.user.role === 1">
                  <v-btn icon size="small" @click="editContact(item)" color="primary" class="action-btn">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" @click="deleteContact(item)" color="error" class="action-btn">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </span>
                <span v-else>{{ item[column.key] }}</span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-card-text>

    <!-- Add/Edit Contact Dialog -->
    <UpsertContact 
      :show-dialog="showDialog" 
      :edit-contact="selectedContact"
      @close-dialog="closeDialog" 
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import UpsertContact from './UpsertContact.vue'
import '@/assets/DataTable.css'

export default {
  name: 'FactoryContacts',
  components: {
    UpsertContact
  },
  setup() {
    const userStore = useUserStore()

    const loading = ref(false)
    const showDialog = ref(false)
    const selectedContact = ref(null)

    // Parse contacts from factory
    const contacts = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.contacts) {
        return []
      }
      
      try {
        const parsed = JSON.parse(factory.contacts)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Error parsing contacts:', e)
        return []
      }
    })

    const headers = computed(() => {
      const baseHeaders = [
        { title: 'שם', key: 'name', sortable: true },
        { title: 'תיאור תפקיד', key: 'jobDescription', sortable: true },
        { title: 'אימייל', key: 'email', sortable: false },
        { title: 'טלפון', key: 'phone', sortable: false }
      ]
      
      // Only add actions column if user role is 1
      if (userStore.user.role === 1) {
        baseHeaders.push({ title: '', key: 'actions', sortable: false, align: 'center' })
      }
      
      return baseHeaders
    })

    function openDialog() {
      selectedContact.value = null
      showDialog.value = true
    }

    function closeDialog() {
      showDialog.value = false
      selectedContact.value = null
    }

    function editContact(contact) {
      selectedContact.value = contact
      showDialog.value = true
    }

    async function deleteContact(contact) {
      const confirmed = confirm(`האם למחוק את איש הקשר "${contact.name}"?`)
      if (!confirmed) return

      try {
        loading.value = true
        const factory = userStore.selectedFactory
        if (!factory) {
          alert('מפעל לא נבחר')
          return
        }

        // Get current contacts
        let contactsList = []
        try {
          contactsList = factory.contacts ? JSON.parse(factory.contacts) : []
        } catch (e) {
          contactsList = []
        }

        if (!Array.isArray(contactsList)) {
          contactsList = []
        }

        // Remove contact
        contactsList = contactsList.filter(c => c.id !== contact.id)

        // Update factory
        const updatedFactory = {
          ...factory,
          contacts: JSON.stringify(contactsList)
        }

        await userStore.updateFactory(updatedFactory)
        
        // Update selectedFactory in store
        userStore.selectedFactory = updatedFactory
      } catch (error) {
        console.error('Failed to delete contact:', error)
        alert('שגיאה במחיקת איש קשר')
      } finally {
        loading.value = false
      }
    }

    return {
      userStore,
      loading,
      showDialog,
      selectedContact,
      contacts,
      headers,
      openDialog,
      closeDialog,
      editContact,
      deleteContact
    }
  },
  // Expose methods for parent component
  expose: ['openDialog']
}
</script>

<style scoped>
</style>

