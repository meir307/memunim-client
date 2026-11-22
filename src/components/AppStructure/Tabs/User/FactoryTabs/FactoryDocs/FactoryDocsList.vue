<template>
  <div>
    <div class="table-wrapper">
      <v-data-table
        :headers="headers"
        :items="tableItems"
        :loading="loading"
        :items-per-page="-1"
        class="modern-table"
        no-data-text="אין מסמכים"
        loading-text="טוען נתונים..."
        hide-default-footer
      >
        <template #item="{ item, columns }">
          <tr>
            <td v-for="column in columns" :key="column.key">
              <span v-if="column.key === 'docTypeName'">{{ item.docTypeName || '-' }}</span>
              <div v-else-if="column.key === 'docName'" class="doc-info">
                <a
                  v-if="item.fileName"
                  :href="item.fileName"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="doc-link"
                >{{ item.docName || '-' }}</a>
                <span v-else>{{ item.docName || '-' }}</span>
              </div>
              <span v-else-if="column.key === 'description'">{{ item.description || '-' }}</span>
              <span v-else-if="column.key === 'actions' && userStore.user.role === 1">
                <v-btn icon size="small" @click="openEditDialog(item)" color="primary" class="action-btn">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" @click="deleteDoc(item)" color="error" class="action-btn">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </span>
              <span v-else>{{ item[column.key] || '-' }}</span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>

    <UpsertFactoryDoc
      :show-dialog="showUpsertDialog"
      :edit-doc="selectedDoc"
      @close-dialog="closeUpsertDialog"
      @doc-saved="handleDocSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useFactoryDocsStore } from '@/stores/FactoryDocsStore'
import UpsertFactoryDoc from './UpsertFactoryDoc.vue'
import '@/assets/DataTable.css'

export default {
  name: 'FactoryDocsList',
  components: {
    UpsertFactoryDoc
  },
  setup() {
    const userStore = useUserStore()
    const factoryDocsStore = useFactoryDocsStore()

    const loading = ref(false)
    const showUpsertDialog = ref(false)
    const selectedDoc = ref(null)

    const headers = computed(() => {
      const cols = [
        { title: 'סוג מסמך', key: 'docTypeName', sortable: true },
        { title: 'שם מסמך', key: 'docName', sortable: true },
        { title: 'תיאור', key: 'description', sortable: false }
      ]
      if (userStore.user.role === 1) {
        cols.push({ title: '', key: 'actions', sortable: false, align: 'center' })
      }
      return cols
    })

    const docTypeMap = computed(() => {
      const factory = userStore.selectedFactory
      const map = {}
      if (!factory?.docTypes) return map
      try {
        const parsed = typeof factory.docTypes === 'string'
          ? JSON.parse(factory.docTypes)
          : factory.docTypes
        if (Array.isArray(parsed)) {
          parsed.forEach(type => {
            map[Number(type.TypeId)] = type.TypeName
          })
        }
      } catch (e) {
        console.error('Error parsing docTypes:', e)
      }
      return map
    })

    const tableItems = computed(() =>
      (factoryDocsStore.getDocs || []).map(doc => ({
        ...doc,
        docTypeName: docTypeMap.value[Number(doc.docTypeId)] || '-'
      }))
    )

    async function loadDocs() {
      if (!userStore.selectedFactory?.id) return
      loading.value = true
      try {
        await factoryDocsStore.fetchDocs(userStore.selectedFactory.id)
      } catch (error) {
        console.error('Failed to load factory docs:', error)
        alert(factoryDocsStore.getError || 'שגיאה בטעינת מסמכים')
      } finally {
        loading.value = false
      }
    }

    function openAddDialog() {
      selectedDoc.value = null
      showUpsertDialog.value = true
    }

    function openEditDialog(doc) {
      selectedDoc.value = { ...doc }
      showUpsertDialog.value = true
    }

    function closeUpsertDialog() {
      showUpsertDialog.value = false
      selectedDoc.value = null
    }

    async function handleDocSaved() {
      await loadDocs()
    }

    async function deleteDoc(doc) {
      const confirmed = confirm(`האם למחוק את המסמך "${doc.docName}"?`)
      if (!confirmed) return
      try {
        await factoryDocsStore.deleteDoc(doc.id)
      } catch (error) {
        console.error('Failed to delete factory doc:', error)
      }
    }

    onMounted(() => {
      loadDocs()
    })

    return {
      userStore,
      loading,
      headers,
      tableItems,
      showUpsertDialog,
      selectedDoc,
      openAddDialog,
      openEditDialog,
      closeUpsertDialog,
      handleDocSaved,
      deleteDoc
    }
  },
  expose: ['openAddDialog']
}
</script>

<style scoped>
.doc-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.doc-link:hover {
  text-decoration: underline;
}

.modern-table :deep(thead th:last-child),
.modern-table :deep(tbody td:last-child) {
  width: 45px !important;
  min-width: 80px !important;
  max-width: 120px !important;
  padding: 8px 4px !important;
  white-space: nowrap !important;
}

@media (max-width: 768px) {
  .modern-table :deep(thead th:last-child),
  .modern-table :deep(tbody td:last-child) {
    min-width: 50px !important;
    max-width: 60px !important;
    padding: 8px 2px !important;
  }
}
</style>
