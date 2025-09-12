<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h1 class="title-text">נהל נהלי בטיחות</h1>
          <v-btn color="primary" @click="openDialog" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף נהל בטיחות
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <div class="table-wrapper">
          <v-simple-table class="modern-table">
            <thead>
              <tr>
                <th class="table-header" style="width: 40%;">שם הנהל</th>
                <th class="table-header" style="width: 10%;">תאריך</th>
                <th class="table-header" style="width: 25%;">הועלה על ידי</th>
                <th class="table-header actions-header" style="width: 15%;">פעולות</th>
                
              </tr>
            </thead>
            <tbody>
              <tr v-for="procedure in procedures" :key="procedure.id" class="table-row">
                <td class="table-cell" >
                  <div class="procedure-info">
                    <a href="#" class="procedure-link" @click.prevent="viewProcedure(procedure)">
                      {{ procedure.name }}
                    </a>
                  </div>
                </td>
                <td class="table-cell" >{{ formatDate(procedure.createdAt) }}</td>
                <td class="table-cell" >{{ procedure.createdBy }}</td>
                <td class="table-cell actions-cell" >
                 
                  <v-btn icon size="small" @click="editProcedure(procedure)" color="primary" class="action-btn">
                      <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" @click="deleteProcedure(procedure)" color="error" class="action-btn">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <input 
                    type="file" 
                    :ref="`fileInput-${procedure.id}`" 
                    style="display: none" 
                    @change="handleFileUpload($event, procedure)"
                    accept=".pdf,.doc,.docx"
                  />
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Add New Procedure Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="popup-title d-flex align-center justify-space-between">
          הוסף נהל בטיחות חדש
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveProcedure">
            <v-text-field 
              v-model="newProcedure.name" 
              label="שם הנהל" 
              required 
              reverse
            ></v-text-field>
            
            <v-file-input
              v-model="newProcedure.file"
              label="קובץ הנהל"
              accept=".pdf,.doc,.docx"
              prepend-icon="mdi-file-document"
              reverse
              show-size
              counter
            ></v-file-input>
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

const safetyProceduresStore = useSafetyProceduresStore()
const userStore = useUserStore()

// Use store state
const procedures = computed(() => safetyProceduresStore.getProcedures)


const dialog = ref(false)
const newProcedure = ref({
  name: '',
  file: null
})

function openDialog() {
  console.log('Opening dialog to add new procedure')
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  newProcedure.value = {
    name: '',
    file: null
  }
}

async function saveProcedure() {
  console.log('Saving new procedure:', newProcedure.value)
  
  if (!newProcedure.value.name.trim()) {
    console.error('Procedure name is required')
    return
  }
  
  if (!newProcedure.value.file) {
    console.error('Procedure file is required')
    return
  }
  
  try {
    const factoryId = userStore.selectedFactory.id
    
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

async function viewProcedure(procedure) {
  console.log('Viewing procedure:', procedure.name)
 
  try {
    // Use the download function from the store
    await safetyProceduresStore.downloadProcedureFile(procedure.fileName, this.selectedFactory.id)
  } catch (error) {
    console.error('Failed to download procedure file:', error)
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

function editProcedure(procedure) {
  console.log('Editing procedure:', procedure.name)
  // TODO: Implement edit functionality
}

async function deleteProcedure(procedure) {
  console.log('Deleting procedure:', procedure.name)
  
  try {
    // Call store method to delete procedure
    await safetyProceduresStore.deleteProcedure(procedure.id)
    console.log('Procedure deleted successfully')
  } catch (error) {
    console.error('Failed to delete procedure:', error)
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('he-IL')
}

onMounted(async () => {
  console.log('SafetyProcedures component mounted')
  try {
    const factoryId = userStore.selectedFactory.id
    // Fetch procedures from store
    await safetyProceduresStore.fetchProcedures(factoryId)
  } catch (error) {
    console.error('Failed to fetch procedures:', error)
  }
})
</script>

<style scoped>
.table-wrapper {
  width: 60%;
  margin-left: auto;
  margin-right: 0;
}

@media (max-width: 768px) {
  .table-wrapper {
    width: 100%;
  }
}
</style>