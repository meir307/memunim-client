<template>
  <div>
    <v-card-text class="pa-0">
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="procedures"
          :loading="loading"
          class="modern-table"
          no-data-text="אין נהלי בטיחות"
          loading-text="טוען נתונים..."
          hide-default-footer
        >
          <template #item="{ item, columns }">
            <tr>
              <td v-for="column in columns" :key="column.key">
                <div v-if="column.key === 'name'" class="procedure-info">
                  <a :href="item.fileName" target="_blank" class="procedure-link">
                    {{ item.name }}
                  </a>
                </div>
                <span v-else-if="column.key === 'createdAt'">{{ formatDate(item.createdAt) }}</span>
                <span v-else-if="column.key === 'actions'">
                  <v-btn icon size="small" @click="editProcedure(item)" color="primary" class="action-btn">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" @click="deleteProcedure(item)" color="error" class="action-btn">
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

    <!-- Add New Procedure Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="popup-title d-flex align-center justify-space-between">
          {{ dialogTitle }}
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveProcedure">
            <v-text-field v-model="newProcedure.name" label="שם הנהל" required reverse></v-text-field>

            <v-file-input v-model="newProcedure.file" label="קובץ הנהל" accept=".pdf,.doc,.docx"
              prepend-icon="mdi-file-document" reverse show-size counter></v-file-input>
          </v-form>
          <div class="popup-btn-row">
            <v-btn @click="saveProcedure" color="primary">שמור</v-btn>
            <v-btn @click="closeDialog">ביטול</v-btn>
            <v-spacer></v-spacer>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSafetyProceduresStore } from '@/stores/SafetyProceduresStore'
import { useUserStore } from '@/stores/UserStore'
import '@/assets/DataTable.css'

const safetyProceduresStore = useSafetyProceduresStore()
const userStore = useUserStore()

// Use store state
const procedures = computed(() => safetyProceduresStore.getProcedures)

const dialog = ref(false)
const loading = ref(false)
const newProcedure = ref({
  name: '',
  file: null
})

var dialogMode = ref('add')

const dialogTitle = ref('הוסף נהל בטיחות חדש')

const headers = [
  { title: 'שם הנהל', key: 'name', sortable: true },
 
  { title: 'הועלה על ידי', key: 'createdBy', sortable: false },
  { title: 'תאריך', key: 'createdAt', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'center' }
]

function openDialog() {
  console.log('Opening dialog to add new procedure')
  dialogTitle.value = 'הוסף נהל בטיחות חדש'
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  dialogMode.value = 'add'
  dialogTitle.value = 'הוסף נהל בטיחות חדש'
  newProcedure.value = {
    name: '',
    file: null
  }
}

async function saveProcedure() {
  console.log('Saving new procedure:', newProcedure.value)
  const factoryId = userStore.selectedFactory.id

  if (dialogMode.value === 'add') {

    if (!newProcedure.value.name.trim()) {
      console.error('Procedure name is required')
      return
    }

    if (!newProcedure.value.file) {
      console.error('Procedure file is required')
      return
    }

    try {
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', newProcedure.value.name)
      formData.append('file', newProcedure.value.file)
      formData.append('factoryId', factoryId)
     
      // Call store method to add procedure
      await safetyProceduresStore.addProcedure(formData)

      console.log('Procedure added successfully')
      closeDialog()
    } catch (error) {
      console.error('Failed to add procedure:', error)
      // You can show an error message to the user here
    }

  }
  else {
    try {
      // Create a plain object to avoid proxy issues
      const formData = new FormData()
      formData.append('name', newProcedure.value.name)
      formData.append('file', newProcedure.value.file)
      formData.append('factoryId', factoryId)
      formData.append('id', newProcedure.value.id)

      await safetyProceduresStore.updateProcedure(formData)
      closeDialog()
    } catch (error) {
      console.error('Failed to update procedure:', error)
    }
    
  }
}


async function handleFileUpload(event, procedure) {
  const file = event.target.files[0]
  if (file) {
    console.log('File selected for procedure:', procedure.name, 'File:', file.name)

    try {
      // Call store method to upload file
      await safetyProceduresStore.uploadProcedureFile(procedure.id, file)
      console.log('File uploaded successfully')
    } catch (error) {
      console.error('Failed to upload file:', error)
    }
  }
  // Reset the input
  event.target.value = ''
}

async function editProcedure(procedure) {
  console.log('Editing procedure:', procedure.name)
  dialogTitle.value = 'ערוך נהל בטיחות'
  dialogMode.value = 'edit'
  // Set the form data for editing
  newProcedure.value = {
    name: procedure.name,
    id: procedure.id,
    file: null
  }
  dialog.value = true
  // TODO: Implement the actual update logic
}

async function deleteProcedure(procedure) {
  // Show confirmation dialog
  if (confirm(`האם אתה בטוח שברצונך למחוק את הנהל "${procedure.name}"?`)) {
    try {
      // Call store method to delete procedure  
      await safetyProceduresStore.deleteProcedure(procedure)
     
    } catch (error) {
      alert(error)
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
  console.log('SafetyProceduresContent component mounted')
  loading.value = true
  try {
    const factoryId = userStore.selectedFactory.id
    // Fetch procedures from store
    await safetyProceduresStore.fetchProcedures(factoryId)
  } catch (error) {
    console.error('Failed to fetch procedures:', error)
  } finally {
    loading.value = false
  }
})

// Expose methods for parent component
// eslint-disable-next-line no-undef
defineExpose({
  openDialog,
  editProcedure,
  deleteProcedure
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

