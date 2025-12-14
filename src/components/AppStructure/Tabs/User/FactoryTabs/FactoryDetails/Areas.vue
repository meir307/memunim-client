<template>
  <div>
    <v-card-text class="pa-0">
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="areas"
          :loading="loading"
          :items-per-page="-1"
          class="modern-table"
          no-data-text="אין אזורים"
          loading-text="טוען נתונים..."
          hide-default-footer
        >
          <template #item="{ item, columns }">
            <tr>
              <td v-for="column in columns" :key="column.key">
                <span v-if="column.key === 'name'">{{ item.name }}</span>
                <span v-else-if="column.key === 'description'">{{ item.description || '-' }}</span>
                <span v-else-if="column.key === 'actions' && userStore.user.role === 1">
                  <v-btn icon size="small" @click="editArea(item)" color="primary" class="action-btn">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" @click="deleteArea(item)" color="error" class="action-btn delete-btn">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </span>
                <span v-else>{{ item[column.key] }}</span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-card-text>

    <!-- Add/Edit Area Dialog -->
    <UpsertArea 
      :show-dialog="showDialog" 
      :edit-area="selectedArea"
      @close-dialog="closeDialog" 
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/UserStore'
import { useCommonStore } from '@/stores/CommonStore'
import UpsertArea from './UpsertArea.vue'
import '@/assets/DataTable.css'

export default {
  name: 'FactoryAreas',
  components: {
    UpsertArea
  },
  setup() {
    const userStore = useUserStore()
    const commonStore = useCommonStore()

    const loading = ref(false)
    const showDialog = ref(false)
    const selectedArea = ref(null)

    // Parse areas from factory
    const areas = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.areas) {
        return []
      }
      
      try {
        const parsed = JSON.parse(factory.areas)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Error parsing areas:', e)
        return []
      }
    })

    const headers = computed(() => {
      const baseHeaders = [
        { title: 'שם', key: 'name', sortable: true },
        { title: 'תיאור', key: 'description', sortable: true }
      ]
      
      // Only add actions column if user role is 1
      if (userStore.user.role === 1) {
        baseHeaders.push({ title: '', key: 'actions', sortable: false, align: 'center' })
      }
      
      return baseHeaders
    })

    function openDialog() {
      selectedArea.value = null
      showDialog.value = true
    }

    function closeDialog() {
      showDialog.value = false
      selectedArea.value = null
    }

    function editArea(area) {
      selectedArea.value = area
      showDialog.value = true
    }

    async function checkHazardsByArea(areaId, factoryId) {
      try {
        const response = await axios.post(commonStore.apiUrl + 'hazards/checkHazardsByArea', {
          areaId,
          factoryId
        }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        return response.data.hazardsCount || 0
      } catch (error) {
        console.error('Failed to check hazards by area:', error)
        throw error
      }
    }

    async function deleteArea(area) {
      const confirmed = confirm(`האם למחוק את האזור "${area.name}"?`)
      if (!confirmed) return

      const factory = userStore.selectedFactory

      // Check if there are any hazards associated with this area
      try {
        const associatedHazardsCount = await checkHazardsByArea(area.id, factory.id)
        
        if (associatedHazardsCount > 0) {
          alert(`לא ניתן למחוק את האזור "${area.name}" מכיוון שיש מפגעים המשויכים אליו.`)
          return
        }
      } catch (error) {
        console.error('Failed to check hazards:', error)
        // Continue with deletion if check fails (user can still proceed)
      }
    

      try {
        loading.value = true

        // Get current areas
        let areasList = []
        try {
          areasList = factory.areas ? JSON.parse(factory.areas) : []
        } catch (e) {
          areasList = []
        }

        if (!Array.isArray(areasList)) {
          areasList = []
        }

        // Remove area
        areasList = areasList.filter(a => a.id !== area.id)

        // Update factory
        const updatedFactory = {
          ...factory,
          areas: JSON.stringify(areasList)
        }

        await userStore.updateFactory(updatedFactory)
        
        // Update selectedFactory in store
        userStore.selectedFactory = updatedFactory
      } catch (error) {
        console.error('Failed to delete area:', error)
        alert('שגיאה במחיקת אזור')
      } finally {
        loading.value = false
      }
    }

    return {
      userStore,
      loading,
      showDialog,
      selectedArea,
      areas,
      headers,
      openDialog,
      closeDialog,
      editArea,
      deleteArea
    }
  },
  // Expose methods for parent component
  expose: ['openDialog']
}
</script>

<style scoped>
/* Set actions column to minimum width */
.modern-table :deep(thead th:last-child),
.modern-table :deep(tbody td:last-child) {
  width: 45px !important;
  min-width: 80px !important;
  max-width: 120px !important;
  padding: 8px 4px !important;
  white-space: nowrap !important;
}

/* Component-specific mobile column hiding */
@media (max-width: 768px) {
  .modern-table :deep(thead th:nth-child(2)),
  .modern-table :deep(thead th:nth-child(2)) {
    display: none !important;
  }
  
  .modern-table :deep(tbody td:nth-child(2)),
  .modern-table :deep(tbody td:nth-child(2)) {
    display: none !important;
  }
  
  /* Hide delete button on mobile */
  .delete-btn {
    display: none !important;
  }
  
  /* Set actions column to minimum width on mobile */
  .modern-table :deep(thead th:last-child),
  .modern-table :deep(tbody td:last-child) {
    min-width: 50px !important;
    max-width: 60px !important;
    padding: 8px 2px !important;
  }
}
</style>

