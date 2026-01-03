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
            maxlength="100"
            counter
            :rules="titleRules"
          ></v-text-field>

          <v-row v-if="!isEditMode">
            <v-col cols="12" md="4">
              <v-text-field
                v-model="formattedDate"
                label="תאריך"
                required
                reverse
                :rules="dateRules"
                @input="handleDateChange"
                placeholder="dd/MM/yyyy"
                prepend-icon="mdi-calendar"
                readonly
                @click:prepend="showDatePicker = true"
                class="date-field"
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
            <v-col cols="12" md="8">
              <div class="severity-container">
                <label class="severity-label">חומרת התאונה</label>
                <AccidentSeverity
                  v-model="editedItem.severity"
                  :disabled="false"
                />
              </div>
            </v-col>
          </v-row>

          <v-row v-if="isEditMode">
            <v-col cols="12">
              <div class="severity-container">
                <label class="severity-label">חומרת התאונה</label>
                <AccidentSeverity
                  v-model="editedItem.severity"
                  :disabled="false"
                />
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                label="תיאור"
                reverse
                rows="3"
                placeholder="הזן תיאור של התאונה..."
                :rules="descriptionRules"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row v-if="!isEditMode">
            <v-col cols="12">
              <v-file-input
                v-model="editedItem.files"
                label="העלאת קבצים"
                prepend-icon="mdi-file-multiple"
                reverse
                show-size
                multiple
                hint="ניתן להעלות מספר קבצים (תמונות, מסמכים, סרטונים וכו')"
                persistent-hint
                :rules="fileRules"
                @update:model-value="handleFilesChange"
              ></v-file-input>
            </v-col>
          </v-row>

          <div v-if="!isEditMode && newImagePreviews.length > 0" class="new-files-section">
            <h4 class="files-title">קבצים חדשים:</h4>
            <div class="files-list">
              <div 
                v-for="(preview, index) in newImagePreviews" 
                :key="index"
                class="file-item"
              >
                <v-icon v-if="preview.isImage" color="primary">mdi-image</v-icon>
                <v-icon v-else color="primary">mdi-file</v-icon>
                <span class="file-name">{{ preview.fileName || preview.file.name }}</span>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="removeNewImage(index)"
                  class="file-action-btn"
                ></v-btn>
              </div>
            </div>
          </div>

          <div v-if="!isEditMode && existingFiles.length > 0" class="existing-files-section">
            <h4 class="files-title">קבצים קיימים:</h4>
            <div class="files-list">
              <div 
                v-for="(file, index) in existingFiles" 
                :key="index"
                class="file-item"
              >
                <v-icon color="primary">mdi-file</v-icon>
                <span class="file-name">{{ getFileName(file) }}</span>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="removeExistingFile(index)"
                  class="file-action-btn"
                ></v-btn>
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
import { useAccidentStore } from '@/stores/AccidentStore'
import { 
  getTodayDDMMYYYY, 
  getDatePickerValue, 
  getDisplayValue,
  isValidDDMMYYYY
} from '@/utils/DateFormater'
import { compressImage } from '@/utils/ImageCompressor'
import AccidentSeverity from './AccidentSeverity.vue'

export default {
  name: 'UpsertAccident',
  components: {
    AccidentSeverity
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    editAccident: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const accidentStore = useAccidentStore()
    
    const dialog = ref(false)
    const loading = ref(false)
    const form = ref(null)
    const showDatePicker = ref(false)
    const datePickerValue = ref('')
    const existingFiles = ref([])
    const newImagePreviews = ref([])
    
    const editedItem = ref({
      title: '',
      date: '',
      description: '',
      severity: 1,
      files: null
    })

    const isEditMode = computed(() => !!props.editAccident)
    
    const dialogTitle = computed(() => {
      if (isEditMode.value) {
        return 'עדכון תאונה'
      }
      return 'הוסף תאונה חדשה'
    })

    const formattedDate = computed({
      get() {
        return editedItem.value.date
      },
      set(value) {
        editedItem.value.date = value
      }
    })

    // Validation rules
    const titleRules = computed(() => [
      v => !!v || 'כותרת חובה',
      v => !v || v.length <= 100 || 'כותרת לא יכולה לעלות על 100 תווים'
    ])

    const dateRules = computed(() => [
      v => !!v || 'תאריך חובה',
      v => !v || isValidDDMMYYYY(v) || 'פורמט תאריך לא תקין. השתמש בפורמט dd/MM/yyyy'
    ])

    const descriptionRules = computed(() => [
      // Description is optional, no validation required
    ])

    const fileRules = computed(() => {
      // Files are optional
      return []
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
      // Reset validation state
      if (form.value) {
        form.value.resetValidation()
      }
      
      if (isEditMode.value && props.editAccident) {
        // Edit mode - populate with existing data
        const details = getDescriptionText(props.editAccident.details)
        // Get severity from accident or from details JSON
        let severity = props.editAccident.severity || 1
        if (!severity && props.editAccident.details) {
          try {
            const parsed = typeof props.editAccident.details === 'string' 
              ? JSON.parse(props.editAccident.details)
              : props.editAccident.details
            if (parsed && parsed.severity) {
              severity = parsed.severity
            }
          } catch {
            // Keep default
          }
        }
        editedItem.value = {
          title: props.editAccident.title || '',
          date: props.editAccident.date || getTodayDDMMYYYY(),
          description: details,
          severity: severity,
          files: null
        }
        // Get files array
        if (props.editAccident.files) {
          existingFiles.value = Array.isArray(props.editAccident.files) 
            ? props.editAccident.files 
            : [props.editAccident.files]
        } else if (props.editAccident.fileName) {
          existingFiles.value = [props.editAccident.fileName]
        } else {
          existingFiles.value = []
        }
      } else {
        // Add mode - set defaults
        editedItem.value = {
          title: '',
          date: getTodayDDMMYYYY(),
          description: '',
          severity: 1,
          files: null
        }
        existingFiles.value = []
      }
      
      newImagePreviews.value = []
      
      // Set date picker value using utility
      datePickerValue.value = getDatePickerValue(editedItem.value.date)
    }

    function getDescriptionText(details) {
      if (!details) return ''
      if (typeof details === 'string') {
        try {
          const parsed = JSON.parse(details)
          if (parsed && parsed.description) {
            return parsed.description
          }
          return details
        } catch {
          return details
        }
      }
      if (typeof details === 'object' && details.description) {
        return details.description
      }
      return ''
    }

    async function handleFilesChange(files) {
      // Clear previous previews
      newImagePreviews.value.forEach(preview => {
        if (preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url)
        }
      })
      newImagePreviews.value = []

      // Handle multiple files (compress only images)
      if (files && files.length > 0) {
        const fileArray = Array.isArray(files) ? files : [files]
        const previewPromises = fileArray.map(async (file) => {
          // Only compress if it's an image
          if (file.type && file.type.startsWith('image/')) {
            try {
              // Compress the image to max 100KB
              const compressedFile = await compressImage(file, 100)
              return {
                file: compressedFile,
                url: URL.createObjectURL(compressedFile),
                isImage: true,
                fileName: compressedFile.name
              }
            } catch (error) {
              console.error('Error compressing image:', error)
              // Fallback to original file if compression fails
              return {
                file: file,
                url: URL.createObjectURL(file),
                isImage: true,
                fileName: file.name
              }
            }
          } else {
            // For non-image files, just store the file
            return {
              file: file,
              url: null,
              isImage: false,
              fileName: file.name
            }
          }
        })
        
        newImagePreviews.value = await Promise.all(previewPromises)
        editedItem.value.files = newImagePreviews.value.map(p => p.file)
      }
    }

    function removeNewImage(index) {
      // Revoke object URL to free memory
      if (newImagePreviews.value[index] && newImagePreviews.value[index].url && newImagePreviews.value[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(newImagePreviews.value[index].url)
      }
      
      // Remove from previews and files
      newImagePreviews.value.splice(index, 1)
      if (editedItem.value.files) {
        const fileArray = Array.isArray(editedItem.value.files) ? editedItem.value.files : [editedItem.value.files]
        fileArray.splice(index, 1)
        editedItem.value.files = fileArray.length > 0 ? fileArray : null
      }
    }

    function getFileName(file) {
      let fileName = ''
      
      if (typeof file === 'string') {
        // Decode URL-encoded strings
        try {
          fileName = decodeURIComponent(file)
        } catch {
          fileName = file
        }
        // Extract filename from path/URL
        const parts = fileName.split('/')
        fileName = parts[parts.length - 1] || fileName
      } else if (file.fileName) {
        fileName = file.fileName
      } else if (file.name) {
        fileName = file.name
      } else if (file.url) {
        try {
          fileName = decodeURIComponent(file.url)
        const parts = fileName.split('/')
          fileName = parts[parts.length - 1] || fileName
        } catch {
          const parts = file.url.split('/')
          fileName = parts[parts.length - 1] || file.url
        }
      } else {
        return 'קובץ'
      }
      
      // Decode URL encoding in the final filename
      try {
        fileName = decodeURIComponent(fileName)
      } catch {
        // Keep original if decode fails
      }
      
      // Remove timestamp prefix for display (format: YYYYMMDDHHMM - originalname)
      // Pattern: digits followed by space or %20, then dash, then space or %20, then the actual filename
      const timestampPattern = /^\d{12,14}[\s%20]*-[\s%20]*/
      const displayName = fileName.replace(timestampPattern, '')
      
      // If pattern didn't match or resulted in empty string, return original
      return displayName || fileName
    }

    function removeExistingFile(index) {
      existingFiles.value.splice(index, 1)
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
      // Reset validation state
      if (form.value) {
        form.value.resetValidation()
      }
      
      // Clean up object URLs
      newImagePreviews.value.forEach(preview => {
        if (preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url)
        }
      })

      editedItem.value = {
        title: '',
        date: '',
        description: '',
        severity: 1,
        files: null
      }
      existingFiles.value = []
      newImagePreviews.value = []
    }

    function getOldFileNames() {
      if (!isEditMode.value || !props.editAccident) {
        return []
      }
      
      // Return array of file names to delete
      const filesToDelete = []
      const originalFiles = props.editAccident.files 
        ? (Array.isArray(props.editAccident.files) ? props.editAccident.files : [props.editAccident.files])
        : (props.editAccident.fileName ? [props.editAccident.fileName] : [])
      
      // Find files that were removed
      originalFiles.forEach(originalFile => {
        const fileName = typeof originalFile === 'string' 
          ? originalFile 
          : (originalFile.fileName || originalFile.name || originalFile.url)
        
        // Check if this file still exists in existingFiles
        const stillExists = existingFiles.value.some(existingFile => {
          const existingFileName = typeof existingFile === 'string'
            ? existingFile
            : (existingFile.fileName || existingFile.name || existingFile.url)
          return existingFileName === fileName
        })
        
        if (!stillExists) {
          filesToDelete.push(fileName)
        }
      })
      
      return filesToDelete
    }

    async function save() {
      // Validate form before saving
      const { valid } = await form.value.validate()
      if (!valid) {
        return
      }

      loading.value = true

      try {
        const accidentData = {
          title: editedItem.value.title,
          date: editedItem.value.date,
          description: editedItem.value.description || '',
          severity: editedItem.value.severity || 1,
          files: editedItem.value.files ? (Array.isArray(editedItem.value.files) ? editedItem.value.files : [editedItem.value.files]) : []
        }

        if (isEditMode.value) {
          accidentData.id = props.editAccident.id
          accidentData.oldFileNames = getOldFileNames()
          await accidentStore.updateAccident(accidentData)
        } else {
          await accidentStore.addAccident(accidentData)
        }

        closeDialog()
      } catch (error) {
        console.error('Failed to save accident:', error)
        // Error is already handled in the store
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
      existingFiles,
      newImagePreviews,
      editedItem,
      isEditMode,
      dialogTitle,
      formattedDate,
      titleRules,
      dateRules,
      descriptionRules,
      fileRules,
      handleFilesChange,
      removeNewImage,
      getFileName,
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
.popup-title {
  padding: 0;
  margin: 0;
}

.popup-btn-row {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding: 0 16px 16px;
}

.new-files-section,
.existing-files-section {
  margin-top: 16px;
}

.files-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  word-break: break-word;
}

.file-action-btn {
  flex-shrink: 0;
}

.severity-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.severity-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.date-field {
  max-width: 90% !important;
}

@media (max-width: 960px) {
  .date-field {
    max-width: 100% !important;
  }
}
</style>

