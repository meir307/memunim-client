<template>
    <div>
      <v-card class="modern-card">
        <v-card-title class="modern-title">
          <div class="title-container">
            <h2 class="title-text">בדיקות תקופתיות</h2>
            <v-btn color="primary" @click="openDialog" class="add-btn">
              <v-icon left>mdi-plus</v-icon>
              הוסף סוג בדיקה תקופתית
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pa-0">
          <div class="tiles-container">
            <div v-if="routineCheckTypes.length === 0" class="no-data">
              אין סוגי בדיקות תקופתיות
            </div>
            <RoutineCheckTile
              v-for="checkType in routineCheckTypes"
              :id="checkType.id"
              :key="checkType.id"
              :checkTypeId="checkType.checkTypeId"
              :check-type="checkType"
              :check-date="checkType.checkDate || ''"
              :check-period-in-month="checkType.checkPeriodInMonth"
              :next-check-date="checkType.nextCheck || ''"
              @add-check="addCheck"
              @edit-check="editCheckType"
              @history="showHistory"
              @delete-check="deleteCheckType"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Add Routine Check Type Dialog Component -->
      <AddRoutineCheckTypeDialog 
        ref="routineCheckTypeDialog"
        :show-dialog="showDialog" 
        @close-dialog="closeDialog" 
      />

      <!-- Upsert Check Dialog Component -->
      <UpsertCheckDialog 
        ref="upsertCheckDialog"
        :show-dialog="showCheckDialog" 
        :check-type="selectedCheckType"
        :edit-check="selectedEditCheck"
        @close-dialog="closeCheckDialog" 
      />

      <!-- History Checks Component -->
      <HistoryChecks 
        v-if="showHistoryDialog"
        @close-history="closeHistoryDialog"
      />
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import AddRoutineCheckTypeDialog from './AddRoutineCheckTypeDialog.vue'
  import RoutineCheckTile from './RoutineCheckTile.vue'
  import UpsertCheckDialog from './upsertCheckDialog.vue'
  import HistoryChecks from './HistoryChecks.vue'
  import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
  import { useUserStore } from '@/stores/UserStore'
  
  export default {
    name: 'RoutineChecksMain',
    components: {
      AddRoutineCheckTypeDialog,
      RoutineCheckTile,
      UpsertCheckDialog,
      HistoryChecks
    },
    setup() {
      const routineCheckStore = useRoutineCheckStore()
      const userStore = useUserStore()
      
      const showDialog = ref(false)
      const routineCheckTypeDialog = ref(null)
      
      // Check dialog state
      const showCheckDialog = ref(false)
      const selectedCheckType = ref(null)
      const selectedEditCheck = ref(null)
      const upsertCheckDialog = ref(null)
      
      // History dialog state
      const showHistoryDialog = ref(false)

      // Computed property for routine check types
      const routineCheckTypes = computed(() => routineCheckStore.getRoutineCheckTypes)

      function openDialog() {
        console.log('Opening dialog to add new routine check type')
        showDialog.value = true
      }

      function closeDialog() {
        showDialog.value = false
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

      function showHistory(checkType) {
        console.log('Show history for type:', checkType)
        showHistoryDialog.value = true
      }

      function closeHistoryDialog() {
        showHistoryDialog.value = false
      }

      function deleteCheckType(checkType) {
        console.log('Delete check type:', checkType)
        // TODO: Implement delete functionality
      }

      function closeCheckDialog() {
        showCheckDialog.value = false
        selectedCheckType.value = null
        selectedEditCheck.value = null
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
        showDialog,
        routineCheckTypeDialog,
        routineCheckTypes,
        showCheckDialog,
        selectedCheckType,
        selectedEditCheck,
        upsertCheckDialog,
        showHistoryDialog,
        openDialog,
        closeDialog,
        addCheck,
        editCheckType,
        showHistory,
        closeHistoryDialog,
        deleteCheckType,
        closeCheckDialog
      }
    }
  }
  </script>

  <style scoped>
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .add-btn {
    margin-left: 16px;
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