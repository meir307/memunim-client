<template>
  <v-dialog :model-value="showDialog" @update:model-value="$emit('close-history')" max-width="1000px" persistent>
    <v-card class="history-card">
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        היסטורית בדיקות - {{ checkTypeName }}
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row class="history-content">

          <v-col cols="6">
            <div class="panel-container">
              <div class="panel-title-with-button">
                <h3 class="panel-title">הסטורית בדיקות</h3>
              </div>
              <div class="panel-content dates-panel">
                <div v-if="checkHistory && checkHistory.length > 0" class="dates-list">
                  <div v-for="(check, index) in checkHistory" :key="index" class="date-item"
                    :class="{ 'selected': selectedCheck && selectedCheck.checkDate === check.checkDate }"
                    @click="selectCheck(check)">
                    <v-icon class="date-icon">mdi-calendar</v-icon>
                    <span class="date-text">{{ formatDate(check.checkDate) }}</span>
                  </div>
                </div>
                <div v-else class="placeholder-text">
                  כאן יוצגו תאריכי הבדיקות
                </div>
              </div>
            </div>
          </v-col>
          <!-- Left Panel - Files -->
          <v-col cols="6">
            <div class="panel-container">
              <div class="panel-title-with-button">
                <h3 class="panel-title">הקבצים שמקושרים לבדיקה</h3>
                <v-btn size="small" color="primary" @click="addFiles" class="add-file-btn">
                  <v-icon left>mdi-plus</v-icon>
                  הוסף קבצים
                </v-btn>
              </div>
              <div class="panel-content files-panel">
                <div v-if="selectedCheck && selectedCheck.fileNames && selectedCheck.fileNames.length > 0"
                  class="files-list">
                  <div 
                    v-for="(fileName, index) in selectedCheck.fileNames" 
                    :key="index" 
                    class="file-item file-item-clickable"
                    @click="openFile(index)"
                  >
                    <v-icon class="file-icon">mdi-file-document</v-icon>
                    <span class="file-name">{{ fileName }}</span>
                    <v-btn icon="mdi-delete"   @click.stop="deleteFile(index)"
                      class="delete-file-btn"></v-btn>
                  </div>
                </div>
                <div v-else class="placeholder-text">
                  כאן יוצגו הקבצים שמקושרים לבדיקה המסומנת
                </div>
              </div>
            </div>
          </v-col>

          <!-- Right Panel - Check Dates -->

        </v-row>

        <!-- Remarks Section -->
        <v-row class="mt-4">
          <v-col cols="12">
            <div class="remarks-section">
              <div class="remarks-container">
                <v-textarea v-model="selectedRemark" label="הערות על הבדיקה המסומנת" rows="1" reverse variant="outlined"
                  class="remarks-field"
                  :placeholder="selectedCheck ? 'הערות עבור ' + formatDate(selectedCheck.checkDate) : 'בחר בדיקה להצגת הערות'"></v-textarea>
                <v-btn color="primary" @click="saveRemarks" :disabled="!selectedCheck">
                  <v-icon left>mdi-content-save</v-icon>
                  שמור
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>


      <div class="popup-btn-row">
        <v-btn @click="closeDialog" class="close-btn">סגור</v-btn>
      </div>

    </v-card>
  </v-dialog>

  <!-- Add Check Files Dialog -->
  <AddCheckFilesDialog :showDialog="showAddFilesDialog" :checkId="selectedCheck?.checkId"
    :checkDate="selectedCheck?.checkDate" @close-dialog="closeAddFilesDialog" @checkFilesChanged="checkFilesChanged" />
</template>

<script>
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore';
import { useUserStore } from '@/stores/UserStore';
import AddCheckFilesDialog from './AddCheckFilesDialog.vue';

export default {
  name: 'HistoryChecks',
  components: {
    AddCheckFilesDialog
  },
  props: {
    checkTypeId: {
      type: [String, Number],
      required: true
    },
    checkTypeName: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    },
    showDialog: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close-history'],
  data() {
    return {
      checkHistory: [],
      selectedCheck: null,
      selectedRemark: '',
      showAddFilesDialog: false
    }
  },
  mounted() {
    console.log('Props:', this.$props)
    console.log('CheckTypeId:', this.checkTypeId)
    console.log('CheckTypeName:', this.checkTypeName)
    console.log('Id:', this.id)
    // Defer loading history until dialog opens
    if (this.showDialog) {
      this.loadCheckHistory()
    }
  },
  watch: {
    showDialog(newVal) {
      if (newVal) {
        this.loadCheckHistory()
      }
    }
  },
  methods: {
    // Function to load check history from store
    async loadCheckHistory() {
      try {
        const userStore = useUserStore()
        const routineCheckStore = useRoutineCheckStore()

        this.checkHistory = await routineCheckStore.getCheckHistory(this.id, this.checkTypeId, userStore.selectedFactory.id)
        console.log('Loading check history for checkTypeId:', this.checkTypeId)
        console.log('Check type name:', this.checkTypeName)
        console.log('Factory id:', userStore.selectedFactory.id)
      } catch (error) {
        console.error('Error loading check history:', error)
        this.checkHistory = []
      }


      // checkDate: '2024-01-01',
      // remark: 'נמצאו ליקויים קלים במערכת הבטיחות',
      // fileNames: ['דוח_בדיקה_01012024.pdf', 'תיקון_ליקויים.docx']


      // Auto-select the first check if available
      if (this.checkHistory.length > 0) {
        this.selectCheck(this.checkHistory[0])
      }
    },

    // Function to select a check and display its details
    selectCheck(check) {
      this.selectedCheck = check
      this.selectedRemark = check.remark || ''
    },

    // Function to format date for display
    formatDate(dateString) {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    },

    // Function to save remarks only
    saveRemarks() {
      if (this.selectedCheck) {
        // TODO: Replace with actual store method call
        // Example: await store.updateCheckRemark(this.selectedCheck.checkDate, this.selectedRemark)

        // Update only the remark in local data
        this.selectedCheck.remark = this.selectedRemark

        // Show success message or handle response
        console.log('Remarks saved for check:', this.selectedCheck.checkDate, 'New remark:', this.selectedRemark)

        // Optional: Show success notification
        // You can add a toast notification here if you have one
      }
    },

    addFiles() {
      if (!this.selectedCheck) {
        alert('אנא בחר בדיקה קודם')
        return
      }
      this.showAddFilesDialog = true
    },

    closeAddFilesDialog() {
      this.showAddFilesDialog = false
    },

    checkFilesChanged(checkFiles) {
      if (this.selectedCheck && checkFiles) {
        const checkIndex = this.checkHistory.findIndex(
          check => check.checkId === this.selectedCheck.checkId
        );
        if (checkIndex !== -1) {
          const updated = {
            ...this.checkHistory[checkIndex],
            fileNames: checkFiles.fileNames || [],
            fileLinks: checkFiles.fileLinks || []
          };
          this.checkHistory.splice(checkIndex, 1, updated);
        }

        this.selectedCheck = {
          ...this.selectedCheck,
          fileNames: checkFiles.fileNames || [],
          fileLinks: checkFiles.fileLinks || []
        };


      }
    },

    async deleteFile(fileIndex) {
      if (this.selectedCheck && this.selectedCheck.fileNames) {
        const fileName = this.selectedCheck.fileNames[fileIndex]
        const confirmed = confirm(`האם למחוק את הקובץ "${fileName}"?`)
        if (!confirmed) return

        const routineCheckStore = useRoutineCheckStore()
        const success = await routineCheckStore.deleteCheckFile(this.selectedCheck.checkId, fileName)
        if (!success) {
          alert('שגיאה במחיקת הקובץ')
          return
        }

        // Remove from selectedCheck (names and links if present)
        this.selectedCheck.fileNames.splice(fileIndex, 1)
        if (Array.isArray(this.selectedCheck.fileLinks)) {
          this.selectedCheck.fileLinks.splice(fileIndex, 1)
        }

        // Also update the corresponding entry in checkHistory reactively
        const checkIndex = this.checkHistory.findIndex(check => check.checkId === this.selectedCheck.checkId)
        if (checkIndex !== -1) {
          const updated = {
            ...this.checkHistory[checkIndex],
            fileNames: [...this.selectedCheck.fileNames],
            fileLinks: Array.isArray(this.selectedCheck.fileLinks) ? [...this.selectedCheck.fileLinks] : this.checkHistory[checkIndex].fileLinks
          }
          this.checkHistory.splice(checkIndex, 1, updated)
        }
      }
    },

    openFile(index) {
      if (!this.selectedCheck) return
      const links = this.selectedCheck.fileLinks
      const names = this.selectedCheck.fileNames
      const url = Array.isArray(links) && links[index] ? links[index] : null
      if (url) {
        window.open(url, '_blank')
      } else if (names && names[index]) {
        // If only file name exists, try opening by name (backend/static path may handle it)
        window.open(names[index], '_blank')
      } else {
        alert('לא נמצא קישור לקובץ')
      }
    },

    closeDialog() {
      this.$emit('close-history')
    }
  }
}
</script>

<style scoped>
.history-content {
  min-height: 400px;
}

.panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-title-with-button {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #2c3e50;
  border: 2px solid #333;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
}

.panel-title {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  text-align: center;
  flex: 1;
}

.add-file-btn {
  font-size: 0.8rem;
  padding: 4px 8px;
  min-width: auto;
}

.panel-content {
  border: 2px solid #333;
  border-top: none;
  height: 350px;
  overflow-y: auto;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 16px;
}

.placeholder-text {
  color: #666;
  font-style: italic;
  text-align: center;
  font-size: 1.1rem;
}

.dates-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-item {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e8eaf6;
}

.date-item:hover {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.date-item.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.date-icon {
  margin-left: 8px;
  font-size: 1.2rem;
}

.date-text {
  font-weight: 500;
  font-size: 1rem;
}

.files-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-bottom: 1px solid #e8eaf6;
  gap: 8px;
  justify-content: space-between;
}

.file-item-clickable {
  cursor: pointer;
}

.file-item:hover {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.file-icon {
  margin-left: 8px;
  color: #667eea;
  font-size: 1.2rem;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
  flex: 1;
  margin-right: 8px;
}

.delete-file-btn {
  min-width: 32px !important;
  height: 32px !important;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.delete-file-btn:hover {
  opacity: 1;
  background-color: rgba(244, 67, 54, 0.1) !important;
}

.remarks-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.remarks-field {
  direction: rtl;
  flex: 1;
}

.remarks-field ::v-deep .v-field__input {
  text-align: right;
}

.remarks-field ::v-deep .v-label {
  text-align: right;
}

.close-btn {
  padding: 12px 24px !important;
  min-width: 80px;
  height: 40px;
}

/* Responsive design */
@media (max-width: 768px) {
  .history-content {
    flex-direction: column;
  }

  .panel-content {
    height: 250px;
  }

  .panel-title {
    font-size: 0.9rem;
    padding: 10px 12px;
  }

  .date-item,
  .file-item {
    padding: 10px 12px;
  }

  .date-text,
  .file-name {
    font-size: 0.9rem;
  }
}
</style>