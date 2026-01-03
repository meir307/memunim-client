<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">תאונות וארועי בטיחות</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openDialog" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף תאונה
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <div class="tiles-container">
          <div v-if="accidents.length === 0" class="no-data">
           אין תאונות להצגה
          </div>
          <AccidentTile
            v-for="accident in accidents"
            :key="accident.id"
            :accident="accident"
            @edit-accident="editAccident"
            @delete-accident="deleteAccident"
            @update-accident="handleUpdateAccident"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Upsert Accident Dialog Component -->
    <UpsertAccident 
      ref="upsertAccidentDialog"
      :show-dialog="showDialog" 
      :edit-accident="selectedAccident"
      @close-dialog="closeDialog" 
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import AccidentTile from './AccidentTile.vue'
import UpsertAccident from './UpsertAccident.vue'
import { useAccidentStore } from '@/stores/AccidentStore'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'AccidentsMain',
  components: {
    AccidentTile,
    UpsertAccident
  },
  setup() {
    const accidentStore = useAccidentStore()
    const userStore = useUserStore()

    const showDialog = ref(false)
    const selectedAccident = ref(null)
    const upsertAccidentDialog = ref(null)

    const accidents = computed(() => accidentStore.getAccidents)

    function openDialog() {
      selectedAccident.value = null
      showDialog.value = true
    }

    function closeDialog() {
      showDialog.value = false
      selectedAccident.value = null
      refreshAccidents()
    }

    function editAccident(accident) {
      selectedAccident.value = accident
      showDialog.value = true
    }

    async function deleteAccident(accidentId) {
      try {
        await accidentStore.deleteAccident(accidentId)
        refreshAccidents()
      } catch (error) {
        console.error('Failed to delete accident:', error)
      }
    }

    async function refreshAccidents() {
      try {
        if (userStore.selectedFactory) {
          await accidentStore.fetchAccidents(userStore.selectedFactory.id)
        }
      } catch (error) {
        console.error('Failed to refresh accidents:', error)
      }
    }
    
    async function handleUpdateAccident(updatedAccident) {
      try {
        // Extract description from details
        let description = ''
        if (updatedAccident.details) {
          if (typeof updatedAccident.details === 'string') {
            try {
              const parsed = JSON.parse(updatedAccident.details)
              description = parsed?.description || ''
            } catch {
              description = updatedAccident.details
            }
          } else if (typeof updatedAccident.details === 'object') {
            description = updatedAccident.details.description || ''
          }
        }
        
        // Extract severity
        let severity = updatedAccident.severity || 1
        if (!severity && updatedAccident.details) {
          if (typeof updatedAccident.details === 'string') {
            try {
              const parsed = JSON.parse(updatedAccident.details)
              severity = parsed?.severity || 1
            } catch {
              // Keep default
            }
          } else if (typeof updatedAccident.details === 'object') {
            severity = updatedAccident.details.severity || 1
          }
        }
        
        // Update accident with new files
        await accidentStore.updateAccident({
          id: updatedAccident.id,
          title: updatedAccident.title,
          date: updatedAccident.date,
          description: description,
          severity: severity,
          files: updatedAccident.files || []
        })
        // Refresh accidents to get updated data
        refreshAccidents()
      } catch (error) {
        console.error('Failed to update accident files:', error)
        alert('שגיאה בעדכון קבצים')
      }
    }

    onMounted(async () => {
      try {
        if (userStore.selectedFactory) {
          await accidentStore.fetchAccidents(userStore.selectedFactory.id)
        }
      } catch (error) {
        console.error('Failed to fetch accidents:', error)
      }
    })

    return {
      showDialog,
      selectedAccident,
      upsertAccidentDialog,
      accidents,
      openDialog,
      closeDialog,
      editAccident,
      deleteAccident,
      refreshAccidents,
      handleUpdateAccident
    }
  }
}
</script>

<style scoped>
.title-container {
  display: flex !important;
  align-items: center !important;
  width: 100%;
  flex-wrap: nowrap !important;
  flex-direction: row !important;
  gap: 16px;
}

.title-text {
  flex: 0 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 !important;
  font-size: 1.2rem !important;
}

.add-btn {
  flex-shrink: 0 !important;
  min-width: auto;
}

@media (max-width: 768px) {
  .title-container {
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
  }
  
  .title-text {
    text-align: left !important;
    margin-right: 16px !important;
  }
  
  .add-btn {
    flex-shrink: 0 !important;
  }
}

.tiles-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-data {
  padding: 48px;
  text-align: center;
  color: #999;
  font-size: 1.1rem;
}
</style>
