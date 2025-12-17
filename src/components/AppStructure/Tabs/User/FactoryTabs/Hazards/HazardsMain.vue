<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">מפגעים</h2>
          <v-spacer></v-spacer>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="props"
                class="menu-btn"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item @click="openFilterDialog">
                <template v-slot:prepend>
                  <v-icon>mdi-filter</v-icon>
                </template>
                <v-list-item-title>סינון</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sendReport">
                <template v-slot:prepend>
                  <v-icon>mdi-file-send</v-icon>
                </template>
                <v-list-item-title>שלח דוח</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn color="primary" @click="openDialog" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף מפגע
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <div class="tiles-container">
          <div v-if="hazards.length === 0" class="no-data">
           אין מפגעים להצגה
          </div>
          <HazardTile
            v-for="hazard in hazards"
            :key="hazard.id"
            :hazard="hazard"
            @edit-hazard="editHazard"
            @delete-hazard="deleteHazard"
            @resolve-hazard="resolveHazard"
            @update-hazard="handleUpdateHazard"
          />
        </div>
      </v-card-text>

    <!-- Filter Dialog -->
    <v-dialog v-model="showFilterDialog" max-width="600px" persistent>
      <FilterHazards 
        :filter-object="filterObject"
        @close="showFilterDialog = false"
        @apply-filters="handleApplyFilters"
      />
    </v-dialog>
    </v-card>

    <!-- Upsert Hazard Dialog Component -->
    <UpsertHazard 
      ref="upsertHazardDialog"
      :show-dialog="showDialog" 
      :edit-hazard="selectedHazard"
      @close-dialog="closeDialog" 
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import HazardTile from './HazardTile.vue'
import UpsertHazard from './upsertHazard.vue'
import FilterHazards from './FilterHazards.vue'
import { useHazardStore } from '@/stores/HazardStore'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'HazardsMain',
  components: {
    HazardTile,
    UpsertHazard,
    FilterHazards
  },
  setup() {
    const hazardStore = useHazardStore()
    const userStore = useUserStore()

    const showDialog = ref(false)
    const selectedHazard = ref(null)
    const upsertHazardDialog = ref(null)
    const showFilterDialog = ref(false)
    
    // Filter object with default values
    const createDefaultFilter = () => {
      const factory = userStore.selectedFactory
      let defaultAreas = []
      
      // Get all area IDs from factory
      if (factory && factory.areas) {
        try {
          const parsed = JSON.parse(factory.areas)
          if (Array.isArray(parsed)) {
            defaultAreas = parsed.map(area => area.id)
          }
        } catch (e) {
          console.error('Error parsing areas:', e)
        }
      }
      
      return {
        severities: [1, 2, 3], // All severities by default
        areas: defaultAreas, // All areas by default
        statuses: [0] // Only open status by default (0 = open, 1 = closed)
      }
    }
    
    const filterObject = ref(createDefaultFilter())

    const hazards = computed(() => hazardStore.getHazards)

    function openDialog() {
      selectedHazard.value = null
      showDialog.value = true
    }

    function closeDialog() {
      showDialog.value = false
      selectedHazard.value = null
      refreshHazards()
    }

    function editHazard(hazard) {
      selectedHazard.value = hazard
      showDialog.value = true
    }

    async function deleteHazard(hazardId) {
      try {
        await hazardStore.deleteHazard(hazardId)
        refreshHazards()
      } catch (error) {
        console.error('Failed to delete hazard:', error)
      }
    }

    async function resolveHazard(hazardId) {
      if (confirm('האם אתה בטוח שברצונך לסמן את המפגע כפתור?')) {
        try {
          // TODO: Implement resolve hazard API call
          await hazardStore.resolveHazard(hazardId)
          console.log('Resolving hazard:', hazardId)
          alert('המפגע סומן כפתור בהצלחה')
          refreshHazards()
        } catch (error) {
          console.error('Failed to resolve hazard:', error)
        }
      }
    }

    async function refreshHazards() {
      try {
        if (userStore.selectedFactory) {
          await hazardStore.fetchHazards(userStore.selectedFactory.id, filterObject.value)
        }
      } catch (error) {
        console.error('Failed to refresh hazards:', error)
      }
    }
    
    function handleUpdateHazard() {
      // Refresh hazards to get updated data
      refreshHazards()
    }

    function openFilterDialog() {
      showFilterDialog.value = true
    }

    function handleApplyFilters(filters) {
      filterObject.value = filters
      showFilterDialog.value = false
      // Refresh hazards with new filter
      refreshHazards()
    }

    function sendReport() {
      // TODO: Implement send report functionality
      alert('שליחת דוח - פונקציונליות זו תיושם בקרוב')
    }

    onMounted(async () => {
      try {
        // Initialize filter object with default values
        filterObject.value = createDefaultFilter()
        
        if (userStore.selectedFactory) {
          await hazardStore.fetchHazards(userStore.selectedFactory.id, filterObject.value)
        }
      } catch (error) {
        console.error('Failed to fetch hazards:', error)
      }
    })

    return {
      showDialog,
      selectedHazard,
      upsertHazardDialog,
      showFilterDialog,
      filterObject,
      hazards,
      openDialog,
      closeDialog,
      editHazard,
      deleteHazard,
      resolveHazard,
      refreshHazards,
      handleUpdateHazard,
      openFilterDialog,
      handleApplyFilters,
      sendReport
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

.add-btn,
.menu-btn {
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
