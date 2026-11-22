<template>
  <div>
    <div class="table-wrapper">
      <v-data-table
        :headers="headers"
        :items="tableItems"
        :loading="loading"
        :items-per-page="-1"
        class="modern-table"
        no-data-text="אין מסמכי פעילות"
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
              <span v-else-if="column.key === 'activityAt'">{{ formatDate(item.activityAt) }}</span>
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

    <UpsertActivityDoc
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
import { useFactoryActivityDocsStore } from '@/stores/FactoryActivityDocsStore'
import UpsertActivityDoc from './UpsertActivityDoc.vue'
import '@/assets/DataTable.css'

export default {
  name: 'ActivityDocsMain',
  components: {
    UpsertActivityDoc
  },
  setup() {
    const userStore = useUserStore()
    const activityDocsStore = useFactoryActivityDocsStore()

    const loading = ref(false)
    const showUpsertDialog = ref(false)
    const selectedDoc = ref(null)

    const headers = computed(() => {
      const cols = [
        { title: 'סוג מסמך', key: 'docTypeName', sortable: true },
        { title: 'שם מסמך', key: 'docName', sortable: true },
        { title: 'תיאור', key: 'description', sortable: false },
        { title: 'תאריך פעילות', key: 'activityAt', sortable: true }
      ]
      if (userStore.user.role === 1) {
        cols.push({ title: '', key: 'actions', sortable: false, align: 'center' })
      }
      return cols
    })

    const docTypeMap = computed(() => {
      const factory = userStore.selectedFactory
      const map = {}
      if (!factory?.docActivityTypes) return map
      try {
        const parsed = typeof factory.docActivityTypes === 'string'
          ? JSON.parse(factory.docActivityTypes)
          : factory.docActivityTypes
        if (Array.isArray(parsed)) {
          parsed.forEach(type => {
            map[Number(type.TypeId)] = type.TypeName
          })
        }
      } catch (e) {
        console.error('Error parsing docActivityTypes:', e)
      }
      return map
    })

    const tableItems = computed(() =>
      (activityDocsStore.getDocs || []).map(doc => ({
        ...doc,
        docTypeName: docTypeMap.value[Number(doc.docTypeId)] || '-'
      }))
    )

    function formatDate(dateString) {
      if (!dateString) return '-'
      if (typeof dateString === 'string') {
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (match) {
          return `${match[3]}/${match[2]}/${match[1]}`
        }
      }
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    async function loadDocs() {
      if (!userStore.selectedFactory?.id) return
      loading.value = true
      try {
        await activityDocsStore.fetchDocs(userStore.selectedFactory.id)
      } catch (error) {
        console.error('Failed to load activity docs:', error)
        alert(activityDocsStore.getError || 'שגיאה בטעינת מסמכי פעילות')
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

    function handleDocSaved() {
      // Store already updates local docs on add/update
    }

    async function deleteDoc(doc) {
      const confirmed = confirm(`האם למחוק את המסמך "${doc.docName}"?`)
      if (!confirmed) return
      try {
        await activityDocsStore.deleteDoc(doc.id)
      } catch (error) {
        console.error('Failed to delete activity doc:', error)
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
      formatDate,
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
