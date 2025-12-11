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
            v-model="editedItem.description" 
            label="תיאור" 
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
  name: 'UpsertArea',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    editArea: {
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
      description: ''
    })

    const isEditMode = computed(() => !!props.editArea)
    
    const dialogTitle = computed(() => {
      if (isEditMode.value) {
        return 'ערוך אזור'
      }
      return 'הוסף אזור חדש'
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
      if (isEditMode.value && props.editArea) {
        editedItem.value = {
          name: props.editArea.name || '',
          description: props.editArea.description || ''
        }
      } else {
        resetForm()
      }
    }

    function resetForm() {
      editedItem.value = {
        name: '',
        description: ''
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

        // Get current areas or initialize as empty array
        let areas = []
        try {
          areas = factory.areas ? JSON.parse(factory.areas) : []
        } catch (e) {
          areas = []
        }

        if (!Array.isArray(areas)) {
          areas = []
        }

        if (isEditMode.value && props.editArea) {
          // Update existing area
          const index = areas.findIndex(a => a.id === props.editArea.id)
          if (index !== -1) {
            areas[index] = {
              ...areas[index],
              name: editedItem.value.name,
              description: editedItem.value.description
            }
          }
        } else {
          // Add new area
          // Find the maximum ID and increment by 1
          const maxId = areas.length > 0 
            ? Math.max(...areas.map(a => a.id || 0))
            : 0
          
          const newArea = {
            id: maxId + 1,
            name: editedItem.value.name,
            description: editedItem.value.description
          }
          areas.push(newArea)
        }

        // Update factory with new areas JSON
        const updatedFactory = {
          ...factory,
          areas: JSON.stringify(areas)
        }

        await userStore.updateFactory(updatedFactory)
        
        // Update selectedFactory in store
        userStore.selectedFactory = updatedFactory

        closeDialog()
      } catch (error) {
        console.error('Failed to save area:', error)
        alert('שגיאה בשמירת אזור')
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

