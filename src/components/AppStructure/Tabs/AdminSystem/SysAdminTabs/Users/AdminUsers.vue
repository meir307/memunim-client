<template>
  <div class="admin-users-container">
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">ניהול משתמשים</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showAddUserDialog = true" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף משתמש
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <FilterUsers @search="handleSearch" />
        <div class="table-wrapper">
          <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :loading="loading"
            :items-per-page="-1"
            class="modern-table"
            no-data-text="אין משתמשים"
            loading-text="טוען נתונים..."
            hide-default-footer
          >
            <template #item="{ item, columns }">
              <tr>
                <td v-for="column in columns" :key="column.key">
                  <span v-if="column.key === 'fullName'">{{ item.fullName || '-' }}</span>
                  <span v-else-if="column.key === 'email'">{{ item.email || '-' }}</span>
                  <span v-else-if="column.key === 'phone'">{{ item.phone || '-' }}</span>
                  <span v-else-if="column.key === 'role'">{{ getRoleName(item.role) }}</span>
                  <span v-else-if="column.key === 'isActive'">
                    <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
                      {{ item.isActive ? 'פעיל' : 'לא פעיל' }}
                    </v-chip>
                  </span>
                  <span v-else-if="column.key === 'actions'">
                    <v-btn icon size="small" @click="editUser(item)" color="primary" class="action-btn">
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

    <!-- Add User Dialog -->
    <AddUser 
      :show-dialog="showAddUserDialog"
      @close-dialog="showAddUserDialog = false"
      @user-saved="handleUserSaved"
    />

    <!-- Edit User Dialog -->
    <UserCard 
      :show-dialog="showEditUserDialog"
      :user="selectedUser"
      @close-dialog="closeEditDialog"
      @user-updated="handleUserUpdated"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAdminSystemStore } from '@/stores/AdminSystemStore'
import FilterUsers from './FilterUsers.vue'
import AddUser from './AddUser.vue'
import UserCard from './UserCard.vue'
import '@/assets/DataTable.css'

export default {
  name: 'AdminUsers',
  components: {
    FilterUsers,
    AddUser,
    UserCard
  },
  setup() {
    const adminSystemStore = useAdminSystemStore()
    
    const loading = ref(false)
    const showAddUserDialog = ref(false)
    const showEditUserDialog = ref(false)
    const selectedUser = ref(null)
    const lastSearchQuery = ref('')

    const headers = computed(() => [
      { title: 'שם מלא', key: 'fullName', sortable: true },
      { title: 'אימייל', key: 'email', sortable: true },
      { title: 'טלפון', key: 'phone', sortable: false },
      { title: 'תפקיד', key: 'role', sortable: true },
      { title: 'סטטוס', key: 'isActive', sortable: true },
      { title: '', key: 'actions', sortable: false, align: 'center' }
    ])

    // Get users from store
    const filteredUsers = computed(() => adminSystemStore.getUsers)

    async function handleSearch(query) {
      loading.value = true
      lastSearchQuery.value = query
      try {
        await adminSystemStore.searchUsers(query)
      } catch (error) {
        console.error('Failed to search users:', error)
        alert( 'שגיאה בחיפוש משתמשים')
      } finally {
        loading.value = false
      }
    }

    function getRoleName(role) {
      const roleMap = {
        0: 'משתמש רגיל',
        1: 'מנהל מפעל',
        2: 'מנהל מערכת'
      }
      return roleMap[role] || 'לא מוגדר'
    }


    function editUser(user) {
      selectedUser.value = user
      showEditUserDialog.value = true
    }

    function closeEditDialog() {
      showEditUserDialog.value = false
      selectedUser.value = null
    }

    async function handleUserSaved() {
      showAddUserDialog.value = false
      // Refresh the current search results
      if (lastSearchQuery.value) {
        await handleSearch(lastSearchQuery.value)
      }
    }

    async function handleUserUpdated() {
      closeEditDialog()
      // Refresh the current search results
      if (lastSearchQuery.value) {
        await handleSearch(lastSearchQuery.value)
      }
    }

    return {
      loading,
      showAddUserDialog,
      showEditUserDialog,
      selectedUser,
      filteredUsers,
      headers,
      getRoleName,
      editUser,
      closeEditDialog,
      handleSearch,
      handleUserSaved,
      handleUserUpdated
    }
  }
}
</script>

<style scoped>
.admin-users-container {
  padding: 6px !important;
  margin: 0 !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Use same style as FactoryTabs - ensure gradient applies */
:deep(.v-card-title.modern-title) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 10px !important;
}

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

/* Ensure h2 doesn't make it bigger - match FactoryTabs exactly */
h2.title-text {
  font-size: 1.1rem !important;
  font-weight: 100 !important;
  line-height: 1.2 !important;
}

.title-text,
.title-text *,
h2.title-text {
  color: white !important;
}

/* Override AdminTabs.css black text color - must be more specific */
.admin-users-container .title-text,
.admin-wrapper .admin-users-container .title-text,
.admin-container .admin-users-container .title-text,
.admin-wrapper .admin-users-container h2.title-text,
.admin-container .admin-users-container h2.title-text,
.admin-users-container h2.title-text {
  color: white !important;
}

/* Also override for all elements inside title-container */
.admin-users-container .title-container,
.admin-users-container .title-container *,
.admin-wrapper .admin-users-container .title-container,
.admin-wrapper .admin-users-container .title-container *,
.admin-container .admin-users-container .title-container,
.admin-container .admin-users-container .title-container * {
  color: white !important;
}

.add-btn,
.menu-btn {
  flex-shrink: 0 !important;
  min-width: auto;
}

/* Set actions column to minimum width */
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

  /* Hide some columns on mobile */
  .modern-table :deep(thead th:nth-child(3)),
  .modern-table :deep(tbody td:nth-child(3)) {
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

