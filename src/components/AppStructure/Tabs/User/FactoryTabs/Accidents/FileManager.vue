<template>
  <v-dialog v-model="dialog" max-width="700px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        ניהול קבצים
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      
      <v-card-text>
        <div class="files-header d-flex align-center justify-space-between mb-4">
          <v-btn 
            color="primary" 
            @click="triggerFileInput"
            prepend-icon="mdi-plus"
          >
            הוסף קובץ
          </v-btn>
          <input
            ref="fileInput"
            type="file"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>

        <div v-if="filesList.length === 0" class="no-files">
          <v-icon size="48" color="#ccc">mdi-file-outline</v-icon>
          <p>אין קבצים להצגה</p>
        </div>

        <div v-else class="files-list">
          <div 
            v-for="(file, index) in filesList" 
            :key="index"
            class="file-item"
            :class="{ 'file-item-clickable': canOpenFile(file) }"
            @click="openFile(file)"
          >
            <div class="file-info">
              <v-icon 
                :color="getFileIconColor(file)"
                class="file-icon"
              >
                {{ getFileIcon(file) }}
              </v-icon>
              <div class="file-details">
                <span class="file-name">{{ getFileName(file) }}</span>
                <span v-if="getFileSize(file)" class="file-size">{{ getFileSize(file) }}</span>
              </div>
            </div>
            <v-btn
              icon="mdi-delete"
              variant="text"
              color="error"
              size="small"
              @click.stop="deleteFile(index)"
              class="delete-btn"
            ></v-btn>
          </div>
        </div>
      </v-card-text>

      <div class="popup-btn-row">
        <v-btn @click="closeDialog">
          סגור
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { compressImage } from '@/utils/ImageCompressor'
import { useCommonStore } from '@/stores/CommonStore'
import { useAccidentStore } from '@/stores/AccidentStore'

export default {
  name: 'FileManager',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    files: {
      type: Array,
      default: () => []
    },
    accidentId: {
      type: Number,
      default: null
    }
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const dialog = ref(false)
    const loading = ref(false)
    const fileInput = ref(null)
    const filesList = ref([])

    // Watch for prop changes
    watch(() => props.showDialog, (newVal) => {
      dialog.value = newVal
      if (newVal) {
        initializeFiles()
      }
    })

    // Watch for dialog changes and emit to parent
    watch(dialog, (newVal) => {
      if (!newVal) {
        emit('close-dialog')
      }
    })

    function initializeFiles() {
      // Initialize files list from props
      filesList.value = props.files ? [...props.files] : []
    }

    function triggerFileInput() {
      fileInput.value?.click()
    }

    async function handleFileSelect(event) {
      const selectedFile = event.target.files?.[0]
      if (!selectedFile) return

      // Check if file already exists in the list
      const fileName = selectedFile.name
      const fileExists = filesList.value.some(fileItem => {
        const existingFileName = getFileName(fileItem)
        return existingFileName === fileName
      })

      if (fileExists) {
        alert('הקובץ כבר קיים ברשימה')
        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        return
      }

      loading.value = true

      try {
        // Process file (compress if image)
        let fileToUpload = selectedFile
        if (selectedFile.type && selectedFile.type.startsWith('image/')) {
          try {
            fileToUpload = await compressImage(selectedFile, 100)
          } catch (error) {
            console.error('Error compressing image:', error)
            // Use original file if compression fails
          }
        }

        // Upload file using store method
        const accidentStore = useAccidentStore()
        const response = await accidentStore.uploadAccidentFile(props.accidentId, fileToUpload)

        // Update files list with server response
        if (response && response.files) {
          filesList.value = response.files.map(file => {
            if (typeof file === 'string') {
              return file
            }
            return {
              fileName: file.fileName || file.name || file.url || file,
              fileSize: file.fileSize || file.size,
              fileType: file.fileType || file.type,
              isImage: file.isImage || (file.fileType && file.fileType.startsWith('image/'))
            }
          })
        }

        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      } catch (error) {
        console.error('Failed to upload file:', error)
        // Error is already handled in the store
      } finally {
        loading.value = false
      }
    }

    async function deleteFile(index) {
      const fileItem = filesList.value[index]
      const fileName = getFileName(fileItem)
      const confirmed = confirm(`האם למחוק את הקובץ "${fileName}"?`)
      if (!confirmed) return

      loading.value = true

      try {
        // Check if this is an existing file (from server) or a new file (not yet uploaded)
        const isExistingFile = !fileItem.file || (typeof fileItem === 'string')
        
        if (isExistingFile && props.accidentId) {
          // Get the actual file name with timestamp for deletion
          let actualFileName = ''
          if (typeof fileItem === 'string') {
            actualFileName = fileItem
          } else if (fileItem.fileName) {
            actualFileName = fileItem.fileName
          } else if (fileItem.name) {
            actualFileName = fileItem.name
          } else if (fileItem.url) {
            actualFileName = fileItem.url
          }

          // Call store method to delete from server
          const accidentStore = useAccidentStore()
          const response = await accidentStore.deleteAccidentFile(props.accidentId, actualFileName)
          
          // Update files list with server response
          if (response && response.files) {
            filesList.value = response.files.map(file => {
              if (typeof file === 'string') {
                return file
              }
              return {
                fileName: file.fileName || file.name || file.url || file,
                fileSize: file.fileSize || file.size,
                fileType: file.fileType || file.type,
                isImage: file.isImage || (file.fileType && file.fileType.startsWith('image/'))
              }
            })
          }
        } else {
          // For new files (not yet uploaded), just remove from local list
          filesList.value.splice(index, 1)
        }
      } catch (error) {
        console.error('Failed to delete file:', error)
        // Error is already handled in the store
      } finally {
        loading.value = false
      }
    }

    function getFileName(fileItem) {
      let fileName = ''
      
      if (typeof fileItem === 'string') {
        // Decode URL-encoded strings
        try {
          fileName = decodeURIComponent(fileItem)
        } catch {
          fileName = fileItem
        }
        // Extract filename from path/URL
        const parts = fileName.split('/')
        fileName = parts[parts.length - 1] || fileName
      } else if (fileItem.fileName) {
        fileName = fileItem.fileName
      } else if (fileItem.name) {
        fileName = fileItem.name
      } else if (fileItem.file && fileItem.file.name) {
        fileName = fileItem.file.name
      } else if (fileItem.url) {
        try {
          fileName = decodeURIComponent(fileItem.url)
        } catch {
          fileName = fileItem.url
        }
        const parts = fileName.split('/')
        fileName = parts[parts.length - 1] || fileName
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

    function getFileSize(fileItem) {
      let size = null
      if (fileItem.fileSize) {
        size = fileItem.fileSize
      } else if (fileItem.file && fileItem.file.size) {
        size = fileItem.file.size
      } else if (fileItem.size) {
        size = fileItem.size
      }

      if (size) {
        if (size < 1024) {
          return `${size} B`
        } else if (size < 1024 * 1024) {
          return `${(size / 1024).toFixed(2)} KB`
        } else {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`
        }
      }
      return null
    }

    function getFileIcon(fileItem) {
      if (typeof fileItem === 'object') {
        if (fileItem.isImage) {
          return 'mdi-image'
        }
        if (fileItem.fileType) {
          if (fileItem.fileType.includes('pdf')) {
            return 'mdi-file-pdf-box'
          }
          if (fileItem.fileType.includes('word') || fileItem.fileType.includes('document')) {
            return 'mdi-file-word-box'
          }
          if (fileItem.fileType.includes('excel') || fileItem.fileType.includes('spreadsheet')) {
            return 'mdi-file-excel-box'
          }
          if (fileItem.fileType.includes('video')) {
            return 'mdi-file-video'
          }
        }
      }
      return 'mdi-file'
    }

    function getFileIconColor(fileItem) {
      if (typeof fileItem === 'object' && fileItem.isImage) {
        return 'primary'
      }
      return 'grey-darken-1'
    }

    function canOpenFile(fileItem) {
      // Can open if it's a URL string or has a file object
      if (typeof fileItem === 'string') {
        return true
      }
      if (fileItem.url || fileItem.file || fileItem.fileName) {
        return true
      }
      return false
    }

    function openFile(fileItem) {
      if (!canOpenFile(fileItem)) {
        return
      }

      let fileUrl = ''

      // If it's a string (URL or file path)
      if (typeof fileItem === 'string') {
        fileUrl = fileItem
      }
      // If it's a File object (newly uploaded)
      else if (fileItem.file && fileItem.file instanceof File) {
        fileUrl = URL.createObjectURL(fileItem.file)
      }
      // If it has a URL property
      else if (fileItem.url) {
        fileUrl = fileItem.url
      }
      // If it has a fileName (existing file from server)
      else if (fileItem.fileName) {
        // Construct URL from fileName (assuming it's a server path)
        const commonStore = useCommonStore()
        fileUrl = commonStore.apiUrl + 'files/' + encodeURIComponent(fileItem.fileName)
      }

      if (fileUrl) {
        // Open in new tab
        window.open(fileUrl, '_blank')
      }
    }

    function closeDialog() {
      dialog.value = false
      // Files are already updated in the store via upload/delete methods
      // No need to emit files-updated since changes are already saved
      filesList.value = []
    }

    return {
      dialog,
      loading,
      fileInput,
      filesList,
      triggerFileInput,
      handleFileSelect,
      deleteFile,
      getFileName,
      getFileSize,
      getFileIcon,
      getFileIconColor,
      canOpenFile,
      openFile,
      closeDialog
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
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding: 0 16px 16px;
}

.files-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.no-files {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #999;
}

.no-files p {
  margin-top: 16px;
  font-size: 1rem;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.file-item-clickable {
  cursor: pointer;
}

.file-item-clickable:hover {
  background-color: #e3f2fd;
  border-color: #1976d2;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.file-name {
  font-size: 0.95rem;
  color: #333;
  word-break: break-word;
  font-weight: 500;
}

.file-size {
  font-size: 0.8rem;
  color: #666;
}

.delete-btn {
  flex-shrink: 0;
  margin-right: 8px;
}
</style>

