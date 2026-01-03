<template>
  <div>
    <v-card class="accident-tile" elevation="0">
      <v-card-text>
        <div class="tile-wrapper">
          <!-- Content Side (left in RTL) -->
          <div class="content-side">
            <!-- Top Section -->
            <div class="top-section">
              <div class="top-left">
                <div class="title-box">
                  <span class="title-text">{{ accident.title }}</span>
                </div>
                <span class="date-info">תאריך - {{ formatDate(accident.date) }}</span>
              </div>
              <div class="top-right">
                <div class="buttons-container">
                  <v-chip
                    :color="severityColor"
                    class="severity-chip"
                  >
                    {{ severityText }}
                  </v-chip>
                  <v-btn
                    icon="mdi-file-multiple"
                    @click="openFileManager"
                    color="primary"
                    size="small"
                    class="file-btn"
                    :disabled="!canEditAccident"
                  ></v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    @click="editAccident"
                    color="primary"
                    size="small"
                    class="save-btn"
                    :disabled="!canEditAccident"
                  ></v-btn>
                  <!-- Delete button -->
                  <v-btn 
                    icon="mdi-delete" 
                    class="delete-btn-icon" 
                    @click="deleteAccident"
                    size="small"
                    :disabled="!canEditAccident"
                  ></v-btn>
                </div>
              </div>
            </div>

            <!-- Bottom Section -->
            <div class="bottom-section">
              <div class="bottom-left">
                <div class="description-box">
                  <v-textarea
                    v-model="localDescription"
                    density="compact"
                    variant="outlined"
                    hide-details
                    rows="2"
                    class="description-textarea"
                    placeholder="אין תיאור"
                    :readonly="true"
                  ></v-textarea>
                </div>
                <div class="created-info">
                  <span>נוצר על ידי {{ createdByName || 'לא ידוע' }} ב-{{ formatDate(accident.createdAt || accident.date) }}</span>
                </div>
              </div>
              
              <div class="bottom-right">
                <div v-if="accidentFiles.length > 0" class="files-info">
                  <v-icon size="20" color="#666">mdi-file-multiple</v-icon>
                  <span class="files-count">{{ accidentFiles.length }} קבצים</span>
                </div>
                <div v-else class="no-files">
                  <v-icon size="20" color="#ccc">mdi-file-outline</v-icon>
                  <span>אין קבצים</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- File Manager Dialog -->
    <FileManager
      :show-dialog="showFileManager"
      :files="accidentFiles"
      :accident-id="accident.id"
      @close-dialog="showFileManager = false"
    />
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import FileManager from './FileManager.vue'

export default {
  name: 'AccidentTile',
  components: {
    FileManager
  },
  props: {
    accident: {
      type: Object,
      required: true
    }
  },
  emits: ['edit-accident', 'delete-accident', 'update-accident'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    
    // File manager dialog state
    const showFileManager = ref(false)
    
    // Local reactive state for description
    const localDescription = ref('')
    
    // Initialize localDescription from prop
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
      return String(details)
    }
    
    // Initialize localDescription
    localDescription.value = getDescriptionText(props.accident.details)
    
    // Watch for prop changes to sync local description
    watch(() => props.accident.details, (newDetails) => {
      localDescription.value = getDescriptionText(newDetails)
    })

    function formatDate(dateString) {
      if (!dateString) return 'לא נקבע'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) {
          // Try parsing as DD/MM/YYYY format
          const parts = dateString.split('/')
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10)
            const month = parseInt(parts[1], 10) - 1
            const year = parseInt(parts[2], 10)
            const parsedDate = new Date(year, month, day)
            if (!isNaN(parsedDate.getTime())) {
              const formattedDay = parsedDate.getDate().toString().padStart(2, '0')
              const formattedMonth = (parsedDate.getMonth() + 1).toString().padStart(2, '0')
              const formattedYear = parsedDate.getFullYear()
              return `${formattedDay}/${formattedMonth}/${formattedYear}`
            }
          }
          return dateString
        }
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      } catch (error) {
        return dateString
      }
    }

    const createdByName = computed(() => {
      return props.accident.createdBy || props.accident.createdByName || 'לא ידוע'
    })

    // Get severity from accident or from details JSON
    const accidentSeverity = computed(() => {
      let severity = props.accident.severity || 1
      if (!severity && props.accident.details) {
        try {
          const parsed = typeof props.accident.details === 'string' 
            ? JSON.parse(props.accident.details)
            : props.accident.details
          if (parsed && parsed.severity) {
            severity = parsed.severity
          }
        } catch {
          // Keep default
        }
      }
      return severity
    })

    const severityText = computed(() => {
      const severity = accidentSeverity.value
      if (severity === 1) return 'תאונה חמורה'
      if (severity === 2) return 'תאונה קלה'
      if (severity === 3) return 'כמעט תאונה'
      return 'לא הוגדר'
    })

    const severityColor = computed(() => {
      const severity = accidentSeverity.value
      if (severity === 1) return 'error' // Red for major
      if (severity === 2) return 'warning' // Orange for minor
      if (severity === 3) return 'success' // Green for almost accident
      return 'grey'
    })

    // Check if user can edit/delete: admin (role == 1) or creator
    const canEditAccident = computed(() => {
      const userRole = userStore.user.role
      const currentUserId = userStore.user.id 
      const accidentCreatorId = props.accident.createdById 
      
      // Admin can always edit
      if (userRole === 1) {
        return true
      }
      
      // Creator can edit their own accident
      if (accidentCreatorId && currentUserId && accidentCreatorId == currentUserId) {
        return true
      }
      
      return false
    })

    const accidentFiles = computed(() => {
      // Check if files array exists
      if (props.accident.files) {
        return Array.isArray(props.accident.files) ? props.accident.files : [props.accident.files]
      }
      // If no files but fileName exists, return as array
      if (props.accident.fileName) {
        return [props.accident.fileName]
      }
      return []
    })

    function deleteAccident() {
      // Check if accident has files attached
      if (accidentFiles.value.length > 0) {
        alert('לא ניתן למחוק תאונה שיש לה קבצים מקושרים')
        return
      }
      
      const confirmed = confirm(`האם למחוק את התאונה? "${props.accident.title}"?`)
      if (!confirmed) return
      emit('delete-accident', props.accident.id)
    }

    function editAccident() {
      emit('edit-accident', props.accident)
    }

    function openFileManager() {
      showFileManager.value = true
    }

    return {
      formatDate,
      localDescription,
      createdByName,
      accidentFiles,
      deleteAccident,
      editAccident,
      canEditAccident,
      showFileManager,
      openFileManager,
      severityText,
      severityColor
    }
  }
}
</script>

<style scoped>
.accident-tile {
  margin-bottom: 8px;
  border-radius: 4px;
  transition: box-shadow 0.2s ease;
  border: 1px solid #e0e0e0;
  background-color: #e3f2fd !important;
  width: 100%;
  min-width: 100%;
  flex: 1;
}

.accident-tile:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-color: #1976d2;
}

.tile-wrapper {
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
}

.content-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.top-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.severity-chip {
  flex-shrink: 0;
  font-weight: 600;
  font-size: 0.9rem !important;
  height: 32px !important;
  padding: 0 12px !important;
}

.title-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #06488a;
  margin: 0;
  word-break: break-word;
}

.date-info {
  font-size: 0.9rem;
  color: #666;
}

.top-right {
  flex-shrink: 0;
}

.buttons-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.save-btn {
  flex-shrink: 0;
}

.file-btn {
  background-color: #4caf50 !important;
  color: white !important;
  border-radius: 50% !important;
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s ease !important;
}

.file-btn:hover {
  background-color: #45a049 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
  transform: scale(1.1);
}

.file-btn ::v-deep(.v-icon) {
  color: white !important;
  font-size: 20px !important;
}

.delete-btn-icon {
  background-color: #f44336 !important;
  color: white !important;
  border-radius: 50% !important;
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s ease !important;
}

.delete-btn-icon:hover {
  background-color: #d32f2f !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
  transform: scale(1.1);
}

.delete-btn-icon ::v-deep(.v-icon) {
  color: white !important;
  font-size: 20px !important;
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.bottom-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.description-box {
  width: 100%;
}

.description-textarea {
  width: 100%;
}

.description-textarea :deep(.v-field) {
  background-color: #e3f2fd;
}

.created-info {
  font-size: 0.85rem;
  color: #999;
}

.bottom-right {
  flex-shrink: 0;
  min-width: 120px;
}

.files-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.files-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.file-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-thumbnail:hover {
  opacity: 0.8;
}

.no-files {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #ccc;
  font-size: 0.85rem;
  padding: 16px;
}

@media (max-width: 768px) {
  .tile-wrapper {
    flex-direction: column;
  }

  .top-section,
  .bottom-section {
    flex-direction: column;
  }

  .top-right,
  .bottom-right {
    width: 100%;
  }

  .bottom-right {
    display: none !important;
  }

  .bottom-left {
    width: 100% !important;
  }

  .description-box {
    width: 100% !important;
    max-width: 100% !important;
  }

  .description-textarea {
    width: 100% !important;
    max-width: 100% !important;
  }

  .description-textarea :deep(.v-field) {
    width: 100% !important;
    max-width: 100% !important;
  }

  .description-textarea :deep(.v-field__input) {
    width: 100% !important;
    max-width: 100% !important;
  }

  .files-grid {
    justify-content: flex-start;
  }
}
</style>

