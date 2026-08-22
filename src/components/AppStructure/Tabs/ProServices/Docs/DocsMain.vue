<template>
  <div class="docs-main-container">
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">מסמכים</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openAddDialog" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף מסמך
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <div class="filter-docs-container">
          <div class="search-row">
            <v-text-field
              v-model="searchQuery"
              label="חפש מסמך"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              reverse
              hide-details
              class="search-input"
              @click:clear="searchQuery = ''"
              @keyup.enter="handleSearch"
            ></v-text-field>
            <v-btn color="primary" @click="handleSearch" class="search-btn">
              <v-icon left>mdi-magnify</v-icon>
              חפש
            </v-btn>
          </div>
        </div>

        <div class="table-wrapper">
          <v-data-table
            :headers="headers"
            :items="filteredDocs"
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
                  <span v-if="column.key === 'name'">{{ item.name || '-' }}</span>
                  <span v-else-if="column.key === 'description'">{{ item.description || '-' }}</span>
                  <span v-else-if="column.key === 'actions'">
                    <v-btn icon size="small" @click="openEditDialog(item)" color="primary" class="action-btn">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </span>
                  <span v-else>{{ item[column.key] || '-' }}</span>
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>

    <UpsertDoc
      :show-dialog="showUpsertDialog"
      :edit-doc="selectedDoc"
      @close-dialog="closeUpsertDialog"
      @doc-saved="handleDocSaved"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import UpsertDoc from './UpsertDoc.vue'
import { useServicesStore } from '@/stores/ServicesStore'
import '@/assets/DataTable.css'

export default {
  name: 'DocsMain',
  components: {
    UpsertDoc
  },
  setup() {
    const servicesStore = useServicesStore()
    const loading = ref(false)
    const showUpsertDialog = ref(false)
    const selectedDoc = ref(null)
    const searchQuery = ref('')
    const appliedSearch = ref('')

    const headers = [
      { title: 'שם מסמך', key: 'name', sortable: true },
      { title: 'תיאור', key: 'description', sortable: true },
      { title: '', key: 'actions', sortable: false, align: 'center' }
    ]

    const filteredDocs = computed(() => {
      const query = appliedSearch.value.trim().toLowerCase()
      const docs = servicesStore.getDocs
      if (!query) return docs
      return docs.filter(doc =>
        (doc.name || '').toLowerCase().includes(query) ||
        (doc.description || '').toLowerCase().includes(query)
      )
    })

    function handleSearch() {
      appliedSearch.value = searchQuery.value
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

    async function handleDocSaved(payload) {
      if (payload.id) {
        // update not implemented yet
        closeUpsertDialog()
        return
      }

      try {
        await servicesStore.addDoc(payload)
        closeUpsertDialog()
      } catch (error) {
        console.error('Failed to add document:', error)
        alert(servicesStore.getError || 'שגיאה בהוספת מסמך')
      }
    }

    return {
      loading,
      showUpsertDialog,
      selectedDoc,
      searchQuery,
      headers,
      filteredDocs,
      handleSearch,
      openAddDialog,
      openEditDialog,
      closeUpsertDialog,
      handleDocSaved
    }
  }
}
</script>

<style scoped>
.docs-main-container {
  padding: 6px !important;
  margin: 0 !important;
}

:deep(.v-card-title.modern-title),
:deep(.modern-title) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 10px !important;
}

:deep(.v-card-title.modern-title *),
:deep(.modern-title *) {
  color: white !important;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-text {
  flex: 0 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 !important;
  font-size: 1.1rem !important;
  font-weight: 100 !important;
  color: white !important;
}

h2.title-text {
  font-size: 1.1rem !important;
  font-weight: 100 !important;
  line-height: 1.2 !important;
}

.docs-main-container .title-text,
.docs-main-container h2.title-text,
.docs-main-container .title-container,
.docs-main-container .title-container * {
  color: white !important;
}

.add-btn {
  flex-shrink: 0 !important;
  min-width: auto;
}

.filter-docs-container {
  padding: 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  flex: 1;
}

.search-btn {
  flex-shrink: 0;
  min-width: 100px;
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

  .modern-table :deep(thead th:last-child),
  .modern-table :deep(tbody td:last-child) {
    min-width: 50px !important;
    max-width: 60px !important;
    padding: 8px 2px !important;
  }
}
</style>
