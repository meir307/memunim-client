<template>
  <div>
    <v-card class="hazard-tile" :class="tileBackgroundClass" elevation="0">
      <v-card-text>
        <div class="tile-wrapper">
          <!-- Content Side (left in RTL) -->
        <div class="content-side">
          <!-- Top Section -->
          <div class="top-section">
            <div class="top-left">
              <div class="title-box">
                <span class="title-text">{{ hazard.title }}</span>
              </div>
              <span v-if="areaName" class="area-name">  {{ areaName }}</span>
            </div>
            <div class="top-right">
              <div class="severity-radio-group">
                <v-radio-group
                  v-model="localSeverity"
                  @update:model-value="saveSeverity"
                  inline
                  density="compact"
                  hide-details
                  class="severity-radios"
                  :disabled="!canEditHazard"
                >
                  <v-radio
                    :value="1"
                    label="נמוכה"
                    class="severity-radio severity-radio-1"
                  ></v-radio>
                  <v-radio
                    :value="2"
                    label="בינונית"
                    class="severity-radio severity-radio-2"
                  ></v-radio>
                  <v-radio
                    :value="3"
                    label="גבוהה"
                    class="severity-radio severity-radio-3"
                  ></v-radio>
                </v-radio-group>
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
                  :readonly="!canEditHazard"
                ></v-textarea>
              </div>
              <div class="created-info">
                <span>נוצר על ידי {{ createdByName || 'לא ידוע' }} ב-{{ formatDate(hazard.createdAt || hazard.date) }}</span>
              </div>
            </div>
            
            <div class="bottom-right">
              <div class="buttons-container">
                <v-btn
                  @click="saveHazardRemark"
                  color="primary"
                  size="small"
                  class="save-btn"
                  :disabled="!canEditHazard"
                >
                  <v-icon left>mdi-check</v-icon>
                  שמור
                </v-btn>
                <!-- Mobile image icon button -->
                <v-btn
                  v-if="hazardImage"
                  icon="mdi-image"
                  size="small"
                  class="mobile-image-btn"
                  @click="openImage(hazardImage)"
                  color="primary"
                ></v-btn>
                <!-- Resolve button -->
                <v-btn 
                  icon="mdi-check" 
                  class="resolve-btn-icon" 
                  @click="resolveHazard"
                  size="small"
                  :disabled="!canEditHazard"
                ></v-btn>
                <!-- Delete button -->
                <v-btn 
                  icon="mdi-delete" 
                  class="delete-btn-icon" 
                  @click="deleteHazard"
                  size="small"
                  :disabled="!canEditHazard"
                ></v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Side (right in RTL) -->
        <div class="image-side">
          <div v-if="hazardImage" class="image-thumbnail hide-on-mobile">
            <img 
              :src="getImageUrl(hazardImage)"
              alt="תמונה"
              class="thumbnail-image"
              @click="openImage(hazardImage)"
            />
          </div>
          <div v-else class="image-placeholder hide-on-mobile">
            <v-icon size="48" color="#ccc">mdi-image-off</v-icon>
          </div>
        </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useHazardStore } from '@/stores/HazardStore'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'HazardTile',
  props: {
    hazard: {
      type: Object,
      required: true
    }
  },
  emits: ['edit-hazard', 'delete-hazard', 'resolve-hazard'],
  setup(props, { emit }) {
    const hazardStore = useHazardStore()
    const userStore = useUserStore()
    
    // Local reactive state for severity (visual only, no API calls)
    const localSeverity = ref(props.hazard.severity || 2)
    
    // Watch for prop changes to sync local state
    watch(() => props.hazard.severity, (newSeverity) => {
      localSeverity.value = newSeverity || 2
    })
    
    // Local reactive state for description
    const localDescription = ref('')
    
    // Initialize localDescription from prop
    function getDescriptionText(description) {
      if (!description) return ''
      if (typeof description === 'string') {
        try {
          const parsed = JSON.parse(description)
          if (Array.isArray(parsed)) {
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
      return String(description)
    }
    
    // Initialize localDescription
    localDescription.value = getDescriptionText(props.hazard.description)
    
    // Watch for prop changes to sync local description
    watch(() => props.hazard.description, (newDescription) => {
      localDescription.value = getDescriptionText(newDescription)
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

    const descriptionText = computed(() => {
      if (!props.hazard.description) return ''
      if (typeof props.hazard.description === 'string') {
        try {
          const parsed = JSON.parse(props.hazard.description)
          if (Array.isArray(parsed)) {
            return parsed.map(item => typeof item === 'string' ? item : (item.text || '')).join('\n')
          }
          return props.hazard.description
        } catch {
          return props.hazard.description
        }
      }
      if (Array.isArray(props.hazard.description)) {
        return props.hazard.description.map(item => typeof item === 'string' ? item : (item.text || '')).join('\n')
      }
      return String(props.hazard.description)
    })

    const severityText = computed(() => {
      const severity = props.hazard.severity
      if (severity === 1) return 'נמוכה'
      if (severity === 2) return 'בינונית'
      if (severity === 3) return 'גבוהה'
      return 'לא הוגדר'
    })

    const severityClass = computed(() => {
      const severity = props.hazard.severity
      if (severity === 1) return 'severity-low'
      if (severity === 2) return 'severity-medium'
      if (severity === 3) return 'severity-high'
      return ''
    })
    
    const severityColor = computed(() => {
      const severity = props.hazard.severity || 2
      if (severity === 1) return '#2e7d32'
      if (severity === 2) return '#f57c00'
      if (severity === 3) return '#c62828'
      return '#f57c00'
    })
    
    const tileBackgroundClass = computed(() => {
      const severity = localSeverity.value || 2
      if (severity === 3) return 'tile-bg-red'    // High severity = red
      if (severity === 2) return 'tile-bg-yellow' // Medium severity = yellow
      if (severity === 1) return 'tile-bg-green'  // Low severity = green
      return ''
    })

    const createdByName = computed(() => {
      return props.hazard.createdBy || props.hazard.createdByName || 'לא ידוע'
    })

    // Get area name from factory areas based on hazard's areaId
    const areaName = computed(() => {
      if (!props.hazard.areaId) {
        return null
      }
      
      const factory = userStore.selectedFactory
      if (!factory || !factory.areas) {
        return null
      }
      
      try {
        const parsed = JSON.parse(factory.areas)
        if (!Array.isArray(parsed)) {
          return null
        }
        const area = parsed.find(a => a.id === props.hazard.areaId)
        return area ? area.name : null
      } catch (e) {
        console.error('Error parsing areas:', e)
        return null
      }
    })

    // Check if user can edit/delete: admin (role == 1) or creator
    const canEditHazard = computed(() => {
      const userRole = userStore.user.role
      const currentUserId = userStore.user.id 
      const hazardCreatorId = props.hazard.createdById 
      
      console.log(userRole, currentUserId, hazardCreatorId)

      // Admin can always edit
      if (userRole === 1) {
        return true
      }
      
      // Creator can edit their own hazard
      if (hazardCreatorId && currentUserId && hazardCreatorId == currentUserId) {
        return true
      }
      
      return false
    })

    const hazardImage = computed(() => {
      // First check if files array exists
      if (props.hazard.files) {
        return Array.isArray(props.hazard.files) ? props.hazard.files[0] : props.hazard.files
      }
      // If no files but fileName exists, return fileName as string
      if (props.hazard.fileName) {
        return props.hazard.fileName
      }
      return null
    })

    function getImageUrl(file) {
      if (!file) return ''
      
      // If it's a string (URL or fileName), return as is
      if (typeof file === 'string') {
        return file
      }
      
      // If it's an object with url property
      if (file.url) {
        return file.url
      }
      
      // If it's an object with fileName property, use it
      if (file.fileName) {
        return file.fileName
      }
      
      // If it's a File object, create blob URL
      if (file instanceof File || (file.name && file.size)) {
        return URL.createObjectURL(file)
      }
      
      return ''
    }

    function openImage(file) {
      const imageUrl = getImageUrl(file)
      if (imageUrl) {
        window.open(imageUrl, '_blank')
      }
    }

    function resolveHazard() {
      emit('resolve-hazard', props.hazard.id)
    }

    function deleteHazard() {
      const confirmed = confirm(`האם למחוק את המפגע? "${props.hazard.title}"?`)
      if (!confirmed) return
      emit('delete-hazard', props.hazard.id)
    }

    async function saveHazardRemark() {
      try {
        await hazardStore.saveHazardRemark({
          id: props.hazard.id,
          description: localDescription.value || ''
        })
      } catch (error) {
        console.error('Failed to save hazard remark:', error)
      }
    }

    async function saveSeverity(newSeverity) {
      try {
        await hazardStore.saveSeverity({
          id: props.hazard.id,
          severity: newSeverity
        })
      } catch (error) {
        console.error('Failed to save hazard severity:', error)
      }
    }

    return {
      formatDate,
      descriptionText,
      localDescription,
      severityText,
      severityClass,
      severityColor,
      tileBackgroundClass,
      createdByName,
      hazardImage,
      getImageUrl,
      openImage,
      resolveHazard,
      deleteHazard,
      saveHazardRemark,
      saveSeverity,
      localSeverity,
      areaName,
      canEditHazard
    }
  }
}
</script>

<style scoped>
.hazard-tile {
  margin-bottom: 8px;
  border-radius: 4px;
  transition: box-shadow 0.2s ease;
  border: 1px solid #e0e0e0;
  width: 100%;
  min-width: 100%;
  flex: 1;
}

.hazard-tile:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-color: #1976d2;
}

.tile-bg-red {
  border-color: #ff9aa9 !important;
  border-width: 0px;
  background-color: #ff9aa9 !important;
}

.tile-bg-yellow {
  background-color: #fff9e6 !important;
}

.tile-bg-green {
  background-color: #e8f5e9 !important;
}

.tile-wrapper {
  display: flex;
  flex-direction: row-reverse; /* RTL: content first, image second */
  gap: 32px;
  align-items: center;
  justify-content: space-between;
}

/* Content Side (left in RTL) */
.content-side {
  flex: 1;
  min-width: 0;
}

/* Image Side (right in RTL) */
.image-side {
  flex-shrink: 0;
  width: 120px;
}

.image-thumbnail {
  width: 120px;
  height: 120px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.image-thumbnail:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 120px;
  height: 120px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

/* Top Section */
.top-section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex: 1;
  gap: 16px;
  margin-bottom: 12px;
}

.top-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}

.top-center {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.severity-radio-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.severity-radios {
  margin: 0 !important;
  padding: 0 !important;
}

.severity-radio {
  margin-right: 16px;
}

.severity-radio-1 ::v-deep(.v-label) {
  color: #2e7d32 !important;
  font-weight: 600;
}

.severity-radio-1 ::v-deep(.v-selection-control-group__input) {
  color: #2e7d32 !important;
}

.severity-radio-2 ::v-deep(.v-label) {
  color: #f57c00 !important;
  font-weight: 600;
}

.severity-radio-2 ::v-deep(.v-selection-control-group__input) {
  color: #f57c00 !important;
}

.severity-radio-3 ::v-deep(.v-label) {
  color: #c62828 !important;
  font-weight: 600;
}

.severity-radio-3 ::v-deep(.v-selection-control-group__input) {
  color: #c62828 !important;
}

.severity-low {
  color: #4caf50;
}

.severity-medium {
  color: #ff9800;
}

.severity-high {
  color: #f44336;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.title-box {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  max-width: fit-content;
}

.title-text {
  font-size: 1.4rem;
  font-weight: 600;
  color: #06488a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  line-height: 1.4;
  max-height: calc(1.4rem * 1.4 * 2);
}

.area-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #666;
  margin-right: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.created-info {
  font-size: 0.9rem;
  color: #666;
  text-align: right;
  white-space: nowrap;
  margin-top: 8px;
}

/* Bottom Section */
.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-top: 16px;
}

.bottom-left {
  flex: 1;
  min-width: 0;
}

.bottom-right {
  flex-shrink: 0;
}

.buttons-container {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.save-btn {
  flex-shrink: 0;
}

.resolve-btn-icon {
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

.resolve-btn-icon:hover {
  background-color: #45a049 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
  transform: scale(1.1);
}

.resolve-btn-icon ::v-deep(.v-icon) {
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

.description-box {
  display: flex;
  align-items: flex-start;
  min-height: auto;
}

.description-textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.description-textarea ::v-deep(.v-field) {
  padding: 0 !important;
  margin: 0 !important;
  max-width: 100%;
  box-sizing: border-box;
}

.description-textarea ::v-deep(.v-field__input) {
  padding: 8px !important;
  min-height: 80px !important;
  text-align: right;
  font-size: 1rem;
  max-width: 100%;
  box-sizing: border-box;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hazard-tile {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .tile-wrapper {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .image-side {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .image-thumbnail,
  .image-placeholder {
    display: none;
  }

  .mobile-image-btn {
    display: flex !important;
  }

  .top-section {
    flex-direction: column;
    gap: 12px;
  }

  .top-right {
    justify-content: flex-start;
    width: 100%;
  }

  .title-box {
    width: 100%;
    min-width: auto;
  }

  .top-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .area-name {
    margin-right: 0;
    margin-top: 4px;
  }

  .bottom-section {
    flex-direction: column;
  }

  .bottom-left {
    width: 100%;
    justify-content: flex-start;
  }

  .description-box {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .description-textarea {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .description-textarea ::v-deep(.v-field) {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .description-textarea ::v-deep(.v-field__input) {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}

.mobile-image-btn {
  display: none;
}

@media (max-width: 768px) {
}
</style>
