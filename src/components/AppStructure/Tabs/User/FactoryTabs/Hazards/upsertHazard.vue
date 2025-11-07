<template>
  <v-dialog v-model="dialog" max-width="700px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        {{ dialogTitle }}
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
          <v-text-field
            v-model="editedItem.title"
            label="כותרת"
            required
            reverse
            :rules="[v => !!v || 'כותרת חובה']"
          ></v-text-field>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formattedDate"
                label="תאריך"
                required
                reverse
                :rules="[v => !!v || 'תאריך חובה', dateFormatRule]"
                @input="handleDateChange"
                placeholder="dd/MM/yyyy"
                prepend-icon="mdi-calendar"
                readonly
                @click:prepend="showDatePicker = true"
              ></v-text-field>
              
              <v-dialog v-model="showDatePicker" max-width="290">
                <v-date-picker
                  v-model="datePickerValue"
                  @update:model-value="handleDatePickerChange"
                  locale="he"
                  :first-day-of-week="0"
                ></v-date-picker>
              </v-dialog>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="editedItem.severity"
                :items="severityOptions"
                label="רמת חומרה"
                required
                reverse
                :rules="[v => !!v || 'רמת חומרה חובה']"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                label="תיאור"
                reverse
                rows="4"
                placeholder="הזן תיאור של המפגע..."
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input
                v-model="editedItem.files"
                label="העלאת תמונה"
                accept="image/*"
                prepend-icon="mdi-image"
                reverse
                show-size
                hint="ניתן להעלות תמונה אחת"
                persistent-hint
                @update:model-value="handleFilesChange"
              ></v-file-input>
            </v-col>
          </v-row>

          <div v-if="newImagePreview" class="new-images-section">
            <h4 class="images-title">תמונה חדשה:</h4>
            <div class="images-grid">
              <div class="image-item">
                <img :src="newImagePreview.url" alt="תמונה" class="preview-image" />
                <div class="image-overlay">
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click="removeNewImage"
                    class="image-action-btn"
                  ></v-btn>
                </div>
              </div>
            </div>
          </div>

          <div v-if="existingFile" class="existing-images-section">
            <h4 class="images-title">תמונה קיימת:</h4>
            <div class="images-grid">
              <div class="image-item">
                <img :src="getExistingImageUrl(existingFile)" alt="תמונה" class="preview-image" />
                <div class="image-overlay">
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click="removeExistingFile"
                    class="image-action-btn"
                  ></v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <div class="popup-btn-row">
        <v-btn @click="save" color="primary" :loading="loading">
          {{ isEditMode ? 'עדכן' : 'שמור' }}
        </v-btn>
        <v-btn @click="closeDialog">
          ביטול
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useHazardStore } from '@/stores/HazardStore'
import { 
  getTodayDDMMYYYY, 
  getDatePickerValue, 
  getDisplayValue,
  isValidDDMMYYYY
} from '@/utils/DateFormater'

export default {
  name: 'UpsertHazard',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    editHazard: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const hazardStore = useHazardStore()
    
    const dialog = ref(false)
    const loading = ref(false)
    const form = ref(null)
    const showDatePicker = ref(false)
    const datePickerValue = ref('')
    const existingFile = ref(null)
    const newImagePreview = ref(null)
    
    const editedItem = ref({
      title: '',
      date: '',
      description: '',
      severity: '',
      files: null
    })

    const severityOptions = [
      { title: 'נמוכה', value: 1 },
      { title: 'בינונית', value: 2 },
      { title: 'גבוהה', value: 3 }
    ]

    const isEditMode = computed(() => !!props.editHazard)
    
    const dialogTitle = computed(() => {
      if (isEditMode.value) {
        return 'עדכון מפגע'
      }
      return 'הוסף מפגע חדש'
    })

    const formattedDate = computed({
      get() {
        return editedItem.value.date
      },
      set(value) {
        editedItem.value.date = value
      }
    })

    // Date format validation rule
    const dateFormatRule = (value) => {
      if (!value) return true
      return isValidDDMMYYYY(value) || 'פורמט תאריך לא תקין. השתמש בפורמט dd/MM/yyyy'
    }

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
      if (isEditMode.value && props.editHazard) {
        // Edit mode - populate with existing data
        editedItem.value = {
          title: props.editHazard.title || '',
          date: props.editHazard.date || getTodayDDMMYYYY(),
          description: getDescriptionText(props.editHazard.description),
          severity: props.editHazard.severity || 2,
          files: null
        }
        // Get first file if array, or the file itself
        existingFile.value = props.editHazard.files 
          ? (Array.isArray(props.editHazard.files) ? props.editHazard.files[0] : props.editHazard.files)
          : null
      } else {
        // Add mode - set defaults
        editedItem.value = {
          title: '',
          date: getTodayDDMMYYYY(),
          description: '',
          severity: 2,
          files: null
        }
        existingFile.value = null
      }
      
      // Set date picker value using utility
      datePickerValue.value = getDatePickerValue(editedItem.value.date)
    }

    function getDescriptionText(description) {
      if (!description) return ''
      if (typeof description === 'string') {
        // Try to parse if it's JSON, otherwise return as is
        try {
          const parsed = JSON.parse(description)
          if (Array.isArray(parsed)) {
            // If it's an array, join the text values
            return parsed.map(item => typeof item === 'string' ? item : (item.text || '')).join('\n')
          }
          return description
        } catch {
          return description
        }
      }
      if (Array.isArray(description)) {
        return description.map(item => typeof item === 'string' ? item : (item.text || '')).join('\n')
      }
      return ''
    }

    function handleFilesChange(file) {
      // Clear previous preview
      if (newImagePreview.value && newImagePreview.value.url && newImagePreview.value.url.startsWith('blob:')) {
        URL.revokeObjectURL(newImagePreview.value.url)
      }

      // Create new preview for single file
      if (file) {
        newImagePreview.value = {
          file: file,
          url: URL.createObjectURL(file)
        }
      } else {
        newImagePreview.value = null
      }
    }

    function removeNewImage() {
      // Revoke object URL to free memory
      if (newImagePreview.value && newImagePreview.value.url && newImagePreview.value.url.startsWith('blob:')) {
        URL.revokeObjectURL(newImagePreview.value.url)
      }
      
      // Clear preview and file
      newImagePreview.value = null
      editedItem.value.files = null
    }

    function getExistingImageUrl(file) {
      if (typeof file === 'string') {
        return file
      } else if (file.url) {
        return file.url
      } else if (file.name) {
        // If it's a file path, construct URL (adjust based on your API structure)
        return file.name
      }
      return ''
    }

    function removeExistingFile() {
      existingFile.value = null
    }

    function handleDateChange() {
      // Handle date change if needed
    }

    function handleDatePickerChange(value) {
      if (value) {
        editedItem.value.date = getDisplayValue(value)
        showDatePicker.value = false
      }
    }

    function closeDialog() {
      dialog.value = false
      resetForm()
    }

    function resetForm() {
      // Clean up object URL
      if (newImagePreview.value && newImagePreview.value.url && newImagePreview.value.url.startsWith('blob:')) {
        URL.revokeObjectURL(newImagePreview.value.url)
      }

      editedItem.value = {
        title: '',
        date: '',
        description: '',
        severity: 2,
        files: null
      }
      existingFile.value = null
      newImagePreview.value = null
    }

    async function save() {
      if (!form.value.validate()) {
        return
      }

      loading.value = true

      try {
        const hazardData = {
          title: editedItem.value.title,
          date: editedItem.value.date,
          description: editedItem.value.description || '',
          severity: editedItem.value.severity,
          files: editedItem.value.files ? [editedItem.value.files] : []
        }

        if (isEditMode.value) {
          hazardData.id = props.editHazard.id
          await hazardStore.updateHazard(hazardData)
        } else {
          await hazardStore.addHazard(hazardData)
        }

        closeDialog()
      } catch (error) {
        console.error('Failed to save hazard:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      loading,
      form,
      showDatePicker,
      datePickerValue,
      editedItem,
      existingFile,
      newImagePreview,
      isEditMode,
      dialogTitle,
      formattedDate,
      dateFormatRule,
      severityOptions,
      handleFilesChange,
      removeNewImage,
      getExistingImageUrl,
      removeExistingFile,
      handleDateChange,
      handleDatePickerChange,
      closeDialog,
      save
    }
  }
}
</script>

<style scoped>
.new-images-section,
.existing-images-section {
  margin-top: 16px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.images-title {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Square aspect ratio */
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  transition: border-color 0.2s ease;
}

.image-item:hover {
  border-color: #1976d2;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-action-btn {
  color: white !important;
}
</style>

