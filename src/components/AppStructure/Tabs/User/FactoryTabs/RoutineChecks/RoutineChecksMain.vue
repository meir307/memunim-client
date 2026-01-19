<template>
    <div class="routine-checks-wrapper">
      <v-card class="modern-card">
        <v-card-title class="modern-title fixed-title">
          <div class="title-container">
            <h2 class="title-text">פעילות שוטפת</h2>

            <div v-if="userStore.user.role === 1" class="buttons-group">
              <v-btn color="primary" @click="openDialog" class="add-btn ">
                <v-icon>mdi-plus</v-icon>
                הוסף סוג פעילות שוטפת
              </v-btn>

              <v-btn color="primary" @click="openSettingsDialog" class="add-btn hide-on-mobile">
                <v-icon>mdi-cog</v-icon>
                הגדרות פעילות שוטפת
              </v-btn>
            </div>
            
          </div>
          
        </v-card-title>

        <v-card-text class="pa-0 scrollable-content">
          <div class="tiles-container">
            <div v-if="routineCheckTypes.length === 0" class="no-data">
             לא הוגדרה פעילות שוטפת
            </div>
            <RoutineCheckTile
              v-for="checkType in routineCheckTypes"
              :id="String(checkType.id)"
              :key="checkType.id"
              :checkTypeId="checkType.checkTypeId"
              :check-type="checkType"
              :check-date="checkType.checkDate || ''"
              :check-period-in-month="checkType.checkPeriodInMonth"
              :next-check-date="checkType.nextCheck || ''"
              @add-check="addCheck"
              @delete-check-type="deleteCheckType"
              @refresh-tiles="refreshTiles"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Add Factory Check Type Dialog Component -->
      <AddFactoryCheckType 
        :show-dialog="showDialog" 
        @close-dialog="closeDialog"
        @check-type-added="handleCheckTypeAdded"
      />

      <!-- Upsert Check Dialog Component -->
      <UpsertCheckDialog 
        ref="upsertCheckDialog"
        :show-dialog="showCheckDialog" 
        :check-type="selectedCheckType"
        @close-dialog="closeCheckDialog" 
      />

      <!-- Factory Check Types Settings Dialog -->
      <FactoryCheckTypesSettings 
        :show-dialog="showSettingsDialog" 
        @close-dialog="closeSettingsDialog"
        @add-check-type="handleAddFromSettings"
        @refresh-parent="refreshTiles"
      />

    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import AddFactoryCheckType from './FactoryCheckTypes/AddFactoryCheckType.vue'
  import RoutineCheckTile from './RoutineCheckTile.vue'
  import UpsertCheckDialog from './upsertCheckDialog.vue'
  import FactoryCheckTypesSettings from './FactoryCheckTypes/FactoryCheckTypesSettings.vue'
  import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
  import { useUserStore } from '@/stores/UserStore'
  
  export default {
    name: 'RoutineChecksMain',
    components: {
      AddFactoryCheckType,
      RoutineCheckTile,
      UpsertCheckDialog,
      FactoryCheckTypesSettings
    },
    setup() {
      const routineCheckStore = useRoutineCheckStore()
      const userStore = useUserStore()
      
      const showDialog = ref(false)
      
      // Check dialog state
      const showCheckDialog = ref(false)
      const selectedCheckType = ref(null)
      const selectedEditCheck = ref(null)
      const upsertCheckDialog = ref(null)
      
      // Settings dialog state
      const showSettingsDialog = ref(false)

      // Helper function to calculate days remaining
      const getDaysRemaining = (checkType) => {
        if (!checkType.nextCheck || checkType.nextCheck === '' || checkType.nextCheck === 'לא נקבע') {
          return null
        }
        const nextDate = new Date(checkType.nextCheck)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        nextDate.setHours(0, 0, 0, 0)
        const diffTime = nextDate - today
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }

      // Computed property for routine check types - sorted by days remaining
      const routineCheckTypes = computed(() => {
        const types = routineCheckStore.getRoutineCheckTypes
        
        // Create a copy and sort by days remaining
        return [...types].sort((a, b) => {
          const daysA = getDaysRemaining(a)
          const daysB = getDaysRemaining(b)
          
          // Handle null values (no date) - put them at the end
          if (daysA === null && daysB === null) return 0
          if (daysA === null) return 1
          if (daysB === null) return -1
          
          // Sort ascending (most urgent/lowest days first, including overdue)
          return daysA - daysB
        })
      })

      function openDialog() {
        console.log('Opening dialog to add new routine check type')
        showDialog.value = true
      }

      function closeDialog() {
        showDialog.value = false
      }

      function openSettingsDialog() {
        console.log('openSettingsDialog called, setting showSettingsDialog to true')
        showSettingsDialog.value = true
        console.log('showSettingsDialog value:', showSettingsDialog.value)
      }

      function closeSettingsDialog() {
        showSettingsDialog.value = false
      }

      function handleAddFromSettings() {
        // Close settings dialog and open add dialog
        showSettingsDialog.value = false
        openDialog()
      }

      // eslint-disable-next-line no-unused-vars
      async function handleCheckTypeAdded(checkTypeId) {
        // Refresh the tiles after a new check type is added
        await refreshTiles()
      }

      function addCheck(tileProps) {
        console.log('Add check for type:', tileProps)
        // Extract checkType from the tile props
        selectedCheckType.value = tileProps.checkType
        selectedEditCheck.value = null
        showCheckDialog.value = true
      }

      function editCheckType(tileProps) {
        console.log('Edit check type:', tileProps)
        // Convert proxy object to plain JavaScript object
        const plainObject = JSON.parse(JSON.stringify(tileProps))

        // Extract checkType from the tile props
        selectedCheckType.value = plainObject.checkType
        selectedEditCheck.value = null // TODO: Get existing check data
        showCheckDialog.value = true
      }


      async function deleteCheckType(routineCheckTypeId) {
        // Find the routine check type to get its factory check type ID
        const routineCheckType = routineCheckTypes.value.find(type => String(type.id) === String(routineCheckTypeId))
        
        if (!routineCheckType) {
          alert('סוג הפעילות לא נמצא')
          return
        }

        // Get the factory check type ID
        const factoryCheckTypeId = routineCheckType.checkTypeId
        const checkTypeName = routineCheckType.checkTypeName || 'זה'

        // Use the same delete logic as FactoryCheckTypesSettings.handleDelete
        const confirmed = confirm(`האם למחוק את סוג הפעילות "${checkTypeName}"?`)
        if (!confirmed) return

        try {
          // Delete the factory check type (same as FactoryCheckTypesSettings)
          await routineCheckStore.DeleteFactoryCheckType(factoryCheckTypeId)
          
          // Refresh the list
          await routineCheckStore.fetchRoutineChecks(userStore.selectedFactory.id)
        } catch (error) {
          console.error('Failed to delete check type:', error)
          alert('שגיאה במחיקת סוג הפעילות')
        }
      }

      function closeCheckDialog() {
        showCheckDialog.value = false
        selectedCheckType.value = null
        selectedEditCheck.value = null
      }

      async function refreshTiles() {
        try {
          const factoryId = userStore.selectedFactory.id
          await routineCheckStore.fetchRoutineChecks(factoryId)
        } catch (error) {
          console.error('Failed to refresh routine checks:', error)
        }
      }

      onMounted(async () => {
        console.log('RoutineChecksMain component mounted')
        try {
          const factoryId = userStore.selectedFactory.id
          console.log('Fetching routine checks for factory:', factoryId)
          // Fetch routine check types from store
          await routineCheckStore.fetchRoutineChecks(factoryId)
          console.log('Routine check types after fetch:', routineCheckStore.getRoutineCheckTypes)
        } catch (error) {
          console.error('Failed to fetch routine check types:', error)
        }
      })

      return {
        userStore,
        showDialog,
        routineCheckTypes,
        showCheckDialog,
        selectedCheckType,
        selectedEditCheck,
        upsertCheckDialog,
        showSettingsDialog,
        openDialog,
        closeDialog,
        openSettingsDialog,
        closeSettingsDialog,
        handleAddFromSettings,
        handleCheckTypeAdded,
        addCheck,
        editCheckType,
        deleteCheckType,
        closeCheckDialog,
        refreshTiles
      }
    }
  }
  </script>

  <style scoped>
     /* scorling */
  .routine-checks-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .fixed-title {
    position: sticky;
    top: 0;
    z-index: 10;
    flex-shrink: 0;
    margin-bottom: 0;
  }

  .modern-card {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
 /* scorling */
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
   /* scorling */

  .scrollable-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
  }

  .tiles-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    width: 100%;
  }
 /* scorling */
 
  .buttons-group {
    display: flex;
    gap: 4px;
    
  }

  .add-btn {
    margin-left: 10px;
  }

  .add-btn ::v-deep(.v-btn__content) {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .add-btn ::v-deep(.v-icon) {
    margin: 0 !important;
  }

  .tiles-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    width: 100%;
  }

  .no-data {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .tiles-container {
      padding: 8px;
    }
  }
  </style>