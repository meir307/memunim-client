<template>
  <div>
    <v-card-text class="pa-0">
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="guides"
          :loading="loading"
          class="modern-table"
          no-data-text="אין מדריכי בטיחות"
          loading-text="טוען נתונים..."
          hide-default-footer
        >
          <template #item="{ item, columns }">
            <tr>
              <td v-for="column in columns" :key="column.key">
                <div v-if="column.key === 'name'" class="guide-info">
                  <a :href="item.fileName" target="_blank" class="guide-link">
                    {{ item.name }}
                  </a>
                </div>
                
                <span v-else-if="column.key === 'createdAt'">{{ formatDate(item.createdAt) }}</span>
                <span v-else-if="column.key === 'actions' && userStore.user.role === 1">
                  <v-btn icon size="small" @click="editGuide(item)" color="primary" class="action-btn">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" @click="deleteGuide(item)" color="error" class="action-btn">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <input type="file" :ref="`fileInput-${item.id}`" style="display: none"
                    @change="handleFileUpload($event, item)" accept=".pdf,.doc,.docx" />
                </span>
                <span v-else>{{ item[column.key] }}</span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-card-text>

    <!-- Add New Guide Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="popup-title d-flex align-center justify-space-between">
          {{ dialogTitle }}
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveGuide" ref="form">
            <v-text-field 
              v-model="newGuide.name" 
              label="שם המדריך" 
              required 
              reverse
            ></v-text-field>

            <v-file-input 
              v-model="newGuide.file" 
              label="קובץ המדריך" 
              accept=".pdf,.doc,.docx"
              prepend-icon="mdi-file-document" 
              reverse 
              show-size 
              counter
            ></v-file-input>
          </v-form>
          <div class="popup-btn-row">
            <v-btn @click="saveGuide" color="primary">שמור</v-btn>
            <v-btn @click="closeDialog">ביטול</v-btn>
            <v-spacer></v-spacer>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSafetyProceduresStore } from '@/stores/SafetyProceduresStore'
import { useUserStore } from '@/stores/UserStore'
import '@/assets/DataTable.css'

const safetyProceduresStore = useSafetyProceduresStore()
const userStore = useUserStore()

// Use store state
const guides = computed(() => safetyProceduresStore.getGuides)

const dialog = ref(false)
const loading = ref(false)
// Use ref like SafetyProceduresContent - template auto-unwraps refs
const newGuide = ref({
  name: '',
  file: null,
  id: null
})

var dialogMode = ref('add')

const dialogTitle = ref('הוסף מדריך בטיחות חדש')

const headers = computed(() => {
  const baseHeaders = [
    { title: 'שם המדריך', key: 'name', sortable: true },
    { title: 'הועלה על ידי', key: 'createdBy', sortable: false },
    { title: 'תאריך', key: 'createdAt', sortable: true, width: '140px' }
  ]
  
  // Only add actions column if user role is 1
  if (userStore.user.role === 1) {
    baseHeaders.push({ title: '', key: 'actions', sortable: false, align: 'center' })
  }
  
  return baseHeaders
})

function openDialog() {
  console.log('Opening dialog to add new guide')
  dialogTitle.value = 'הוסף מדריך בטיחות חדש'
  dialogMode.value = 'add'
  dialog.value = true
}

// Watch dialog and reset form when it opens in 'add' mode
watch(dialog, (newVal) => {
  if (newVal && dialogMode.value === 'add') {
    // Update properties instead of replacing object to preserve reactivity
    newGuide.value.name = ''
    newGuide.value.file = null
    newGuide.value.id = null
  }
})

function closeDialog() {
  dialog.value = false
  dialogMode.value = 'add'
  dialogTitle.value = 'הוסף מדריך בטיחות חדש'
  newGuide.value = {
    name: '',
    file: null,
    id: null
  }
}

async function saveGuide() {
  console.log('Saving new guide - Full object:', newGuide.value)
  console.log('Guide name:', newGuide.value.name)
  console.log('Guide file:', newGuide.value.file)
  const factoryId = userStore.selectedFactory.id

  if (dialogMode.value === 'add') {
    // Use .value to access ref content
    if (!newGuide.value.name || !newGuide.value.name.trim()) {
      console.error('Guide name is required')
      alert('נא להזין שם למדריך')
      return
    }

    if (!newGuide.value.file) {
      console.error('Guide file is required')
      alert('נא לבחור קובץ')
      return
    }

    try {
      // Create FormData for file upload - use .value to access ref
      const formData = new FormData()
      formData.append('name', newGuide.value.name)
      formData.append('file', newGuide.value.file)
      formData.append('factoryId', factoryId)
      
      console.log('FormData name:', formData.get('name'))
      console.log('FormData file:', formData.get('file'))
     
      await safetyProceduresStore.addGuide(formData)
      

      console.log('Guide added successfully')
      closeDialog()
    } catch (error) {
      console.error('Failed to add guide:', error)
      // You can show an error message to the user here
    }

  }
  else {
    try {
      // Use .value to access ref content
      const formData = new FormData()
      formData.append('name', newGuide.value.name)
      if (newGuide.value.file) {
        formData.append('file', newGuide.value.file)
      }
      formData.append('factoryId', factoryId)
      formData.append('id', newGuide.value.id)

      await safetyProceduresStore.updateGuide(formData)
      
      // Refresh guides list after updating
      await safetyProceduresStore.fetchGuides(factoryId)
      closeDialog()
    } catch (error) {
      console.error('Failed to update guide:', error)
    }
    
  }
}


async function handleFileUpload(event, guide) {
  const file = event.target.files[0]
  if (file) {
    console.log('File selected for guide:', guide.name, 'File:', file.name)

    try {
      // TODO: Implement guide file upload in store
      // await safetyProceduresStore.uploadGuideFile(guide.id, file)
      console.log('File uploaded successfully')
    } catch (error) {
      console.error('Failed to upload file:', error)
    }
  }
  // Reset the input
  event.target.value = ''
}

async function editGuide(guide) {
  console.log('Editing guide:', guide.name)
  dialogTitle.value = 'ערוך מדריך בטיחות'
  dialogMode.value = 'edit'
  // Set the form data for editing - use .value to access ref
  newGuide.value = {
    name: guide.name,
    id: guide.id,
    file: null
  }
  dialog.value = true
}

async function deleteGuide(guide) {
  // Show confirmation dialog
  // Extract guide name from proxy object
  const guideName = String(guide.name || '')
  if (confirm(`האם אתה בטוח שברצונך למחוק את המדריך "${guideName}"?`)) {
    try {
      await safetyProceduresStore.deleteGuide(guide)
      // Refresh guides list after deletion
      const factoryId = userStore.selectedFactory.id
      await safetyProceduresStore.fetchGuides(factoryId)
    } catch (error) {
      alert(error.response?.data?.message || error)
    }
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

onMounted(async () => {
  console.log('SafetyGuides component mounted')
  loading.value = true
  try {
    const factoryId = userStore.selectedFactory.id
    // TODO: Fetch guides from store when implemented
    await safetyProceduresStore.fetchGuides(factoryId)
  } catch (error) {
    console.error('Failed to fetch guides:', error)
  } finally {
    loading.value = false
  }
})

// Expose methods for parent component
// eslint-disable-next-line no-undef
defineExpose({
  openDialog,
  editGuide,
  deleteGuide
})
</script>

<style scoped>
/* Component-specific mobile column hiding */
@media (max-width: 768px) {
  .modern-table ::v-deep(thead th:nth-child(2)),
  .modern-table ::v-deep(thead th:nth-child(3)),
  .modern-table ::v-deep(thead th:nth-child(4)) {
    display: none !important;
  }
  
  .modern-table ::v-deep(tbody td:nth-child(2)),
  .modern-table ::v-deep(tbody td:nth-child(3)),
  .modern-table ::v-deep(tbody td:nth-child(4)) {
    display: none !important;
  }
}
</style>

