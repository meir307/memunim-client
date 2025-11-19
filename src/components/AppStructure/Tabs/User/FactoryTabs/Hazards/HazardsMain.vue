<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">מפגעים</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openDialog" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף מפגע
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <div class="tiles-container">
          <div v-if="hazards.length === 0" class="no-data">
            לא הוזנו מפגעים
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
import { useHazardStore } from '@/stores/HazardStore'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'HazardsMain',
  components: {
    HazardTile,
    UpsertHazard
  },
  setup() {
    const hazardStore = useHazardStore()
    const userStore = useUserStore()

    const showDialog = ref(false)
    const selectedHazard = ref(null)
    const upsertHazardDialog = ref(null)

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
          // await hazardStore.resolveHazard(hazardId)
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
          await hazardStore.fetchHazards(userStore.selectedFactory.id)
        }
      } catch (error) {
        console.error('Failed to refresh hazards:', error)
      }
    }
    
    function handleUpdateHazard() {
      // Refresh hazards to get updated data
      refreshHazards()
    }

    onMounted(async () => {
      try {
        if (userStore.selectedFactory) {
          await hazardStore.fetchHazards(userStore.selectedFactory.id)
        }
      } catch (error) {
        console.error('Failed to fetch hazards:', error)
      }
    })

    return {
      showDialog,
      selectedHazard,
      upsertHazardDialog,
      hazards,
      openDialog,
      closeDialog,
      editHazard,
      deleteHazard,
      resolveHazard,
      refreshHazards,
      handleUpdateHazard
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
