<template>
  <div>
    <v-card-text class="pa-0">
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="docActivityTypes"
          :loading="loading"
          :items-per-page="-1"
          class="modern-table"
          no-data-text="אין סוגי תעוד פעילות"
          loading-text="טוען נתונים..."
          hide-default-footer
        >
          <template #item="{ item, columns }">
            <tr>
              <td v-for="column in columns" :key="column.key">
                <span v-if="column.key === 'TypeName'">{{ item.TypeName }}</span>
                <span v-else-if="column.key === 'actions' && userStore.user.role === 1">
                  <v-btn icon size="small" @click="editDocType(item)" color="primary" class="action-btn">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" @click="deleteDocType(item)" color="error" class="action-btn delete-btn">
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

    <UpsertDocType
      :show-dialog="showDialog"
      :edit-doc-type="selectedDocType"
      types-field="docActivityTypes"
      @close-dialog="closeDialog"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useFactoryActivityDocsStore } from '@/stores/FactoryActivityDocsStore'
import UpsertDocType from './UpsertDocType.vue'
import '@/assets/DataTable.css'

export default {
  name: 'ActivityDocTypes',
  components: {
    UpsertDocType
  },
  setup() {
    const userStore = useUserStore()
    const activityDocsStore = useFactoryActivityDocsStore()

    const loading = ref(false)
    const showDialog = ref(false)
    const selectedDocType = ref(null)

    const docActivityTypes = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.docActivityTypes) {
        return []
      }

      try {
        const parsed = typeof factory.docActivityTypes === 'string'
          ? JSON.parse(factory.docActivityTypes)
          : factory.docActivityTypes
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Error parsing docActivityTypes:', e)
        return []
      }
    })

    const headers = computed(() => {
      const baseHeaders = [
        { title: 'שם', key: 'TypeName', sortable: true }
      ]

      if (userStore.user.role === 1) {
        baseHeaders.push({ title: '', key: 'actions', sortable: false, align: 'center' })
      }

      return baseHeaders
    })

    function openDialog() {
      selectedDocType.value = null
      showDialog.value = true
    }

    function closeDialog() {
      showDialog.value = false
      selectedDocType.value = null
    }

    function editDocType(docType) {
      selectedDocType.value = { ...docType }
      showDialog.value = true
    }

    async function deleteDocType(docType) {
      const confirmed = confirm(`האם למחוק את סוג תעוד הפעילות "${docType.TypeName}"?`)
      if (!confirmed) return

      const factory = userStore.selectedFactory
      if (!factory?.id) {
        alert('מפעל לא נבחר')
        return
      }

      try {
        loading.value = true

        await activityDocsStore.fetchDocs(factory.id)
        const linkedCount = (activityDocsStore.getDocs || []).filter(
          d => Number(d.docTypeId) === Number(docType.TypeId)
        ).length

        if (linkedCount > 0) {
          alert(`לא ניתן למחוק את סוג תעוד הפעילות "${docType.TypeName}" מכיוון שיש מסמכים המשויכים אליו.`)
          return
        }

        let typesList = []
        try {
          const raw = factory.docActivityTypes
          typesList = raw
            ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
            : []
        } catch (e) {
          typesList = []
        }

        if (!Array.isArray(typesList)) {
          typesList = []
        }

        typesList = typesList.filter(
          t => Number(t.TypeId) !== Number(docType.TypeId)
        )

        const updatedFactory = {
          ...factory,
          docActivityTypes: JSON.stringify(typesList)
        }

        await userStore.updateFactory(updatedFactory)
        const synced = (userStore.factories || []).find(
          f => Number(f.id) === Number(factory.id)
        )
        userStore.selectedFactory = synced || updatedFactory
      } catch (error) {
        console.error('Failed to delete activity doc type:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      userStore,
      loading,
      showDialog,
      selectedDocType,
      docActivityTypes,
      headers,
      openDialog,
      closeDialog,
      editDocType,
      deleteDocType
    }
  },
  expose: ['openDialog']
}
</script>

<style scoped>
.modern-table :deep(thead th:last-child),
.modern-table :deep(tbody td:last-child) {
  width: 45px !important;
  min-width: 80px !important;
  max-width: 120px !important;
  padding: 8px 4px !important;
  white-space: nowrap !important;
}

@media (max-width: 768px) {
  .delete-btn {
    display: none !important;
  }

  .modern-table :deep(thead th:last-child),
  .modern-table :deep(tbody td:last-child) {
    min-width: 50px !important;
    max-width: 60px !important;
    padding: 8px 2px !important;
  }
}
</style>
