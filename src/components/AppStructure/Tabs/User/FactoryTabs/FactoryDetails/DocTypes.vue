<template>
  <div>
    <v-card-text class="pa-0">
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="docTypes"
          :loading="loading"
          :items-per-page="-1"
          class="modern-table"
          no-data-text="אין סוגי מסמכים"
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
      @close-dialog="closeDialog"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useFactoryDocsStore } from '@/stores/FactoryDocsStore'
import UpsertDocType from './UpsertDocType.vue'
import '@/assets/DataTable.css'

export default {
  name: 'FactoryDocTypes',
  components: {
    UpsertDocType
  },
  setup() {
    const userStore = useUserStore()
    const factoryDocsStore = useFactoryDocsStore()

    const loading = ref(false)
    const showDialog = ref(false)
    const selectedDocType = ref(null)

    const docTypes = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.docTypes) {
        return []
      }

      try {
        const parsed = typeof factory.docTypes === 'string'
          ? JSON.parse(factory.docTypes)
          : factory.docTypes
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Error parsing docTypes:', e)
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
      const confirmed = confirm(`האם למחוק את סוג המסמך "${docType.TypeName}"?`)
      if (!confirmed) return

      const factory = userStore.selectedFactory

      try {
        loading.value = true

        // Block delete if docs are linked to this type
        await factoryDocsStore.fetchDocs(factory.id)
        const linkedCount = (factoryDocsStore.getDocs || []).filter(
          d => Number(d.docTypeId) === Number(docType.TypeId)
        ).length

        if (linkedCount > 0) {
          alert(`לא ניתן למחוק את סוג המסמך "${docType.TypeName}" מכיוון שיש מסמכים המשויכים אליו.`)
          return
        }

        let docTypesList = []
        try {
          const raw = factory.docTypes
          docTypesList = raw
            ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
            : []
        } catch (e) {
          docTypesList = []
        }

        if (!Array.isArray(docTypesList)) {
          docTypesList = []
        }

        docTypesList = docTypesList.filter(
          t => Number(t.TypeId) !== Number(docType.TypeId)
        )

        const updatedFactory = {
          ...factory,
          docTypes: JSON.stringify(docTypesList)
        }

        await userStore.updateFactory(updatedFactory)
        userStore.selectedFactory = updatedFactory
      } catch (error) {
        console.error('Failed to delete doc type:', error)
        alert('שגיאה במחיקת סוג מסמך')
      } finally {
        loading.value = false
      }
    }

    return {
      userStore,
      loading,
      showDialog,
      selectedDocType,
      docTypes,
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
