<template>
  <div class="admin-users-container">
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">ניהול משתמשים</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openDialog" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף משתמש
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <div class="table-wrapper">
          <v-data-table
            :headers="headers"
            :items="users"
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
                    <v-btn icon size="small" @click="deleteUser(item)" color="error" class="action-btn delete-btn">
                      <v-icon>mdi-delete</v-icon>
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

    <!-- Add/Edit User Dialog -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ selectedUser ? 'ערוך משתמש' : 'הוסף משתמש' }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="userForm.fullName"
                  label="שם מלא"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="userForm.email"
                  label="אימייל"
                  type="email"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="userForm.phone"
                  label="טלפון"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="userForm.role"
                  :items="roleOptions"
                  label="תפקיד"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="userForm.isActive"
                  label="פעיל"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
            ביטול
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveUser">
            שמור
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/UserStore'
import { useCommonStore } from '@/stores/CommonStore'
import '@/assets/DataTable.css'

export default {
  name: 'AdminUsers',
  setup() {
    const userStore = useUserStore()
    const commonStore = useCommonStore()
    
    const loading = ref(false)
    const showDialog = ref(false)
    const selectedUser = ref(null)
    const users = ref([])
    
    const userForm = ref({
      fullName: '',
      email: '',
      phone: '',
      role: null,
      isActive: true
    })

    const roleOptions = [
      { title: 'משתמש רגיל', value: 0 },
      { title: 'מנהל מפעל', value: 1 },
      { title: 'מנהל מערכת', value: 2 }
    ]

    const headers = computed(() => [
      { title: 'שם מלא', key: 'fullName', sortable: true },
      { title: 'אימייל', key: 'email', sortable: true },
      { title: 'טלפון', key: 'phone', sortable: false },
      { title: 'תפקיד', key: 'role', sortable: true },
      { title: 'סטטוס', key: 'isActive', sortable: true },
      { title: '', key: 'actions', sortable: false, align: 'center' }
    ])

    function getRoleName(role) {
      const roleMap = {
        0: 'משתמש רגיל',
        1: 'מנהל מפעל',
        2: 'מנהל מערכת'
      }
      return roleMap[role] || 'לא מוגדר'
    }

    async function fetchUsers() {
      loading.value = true
      try {
        // TODO: Replace with actual API endpoint
        const response = await axios.post(commonStore.apiUrl + 'admin/getUsers', {}, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        users.value = response.data.users || []
      } catch (error) {
        console.error('Failed to fetch users:', error)
        // For now, use mock data if API fails
        users.value = []
      } finally {
        loading.value = false
      }
    }

    function openDialog() {
      selectedUser.value = null
      userForm.value = {
        fullName: '',
        email: '',
        phone: '',
        role: null,
        isActive: true
      }
      showDialog.value = true
    }

    function closeDialog() {
      showDialog.value = false
      selectedUser.value = null
      userForm.value = {
        fullName: '',
        email: '',
        phone: '',
        role: null,
        isActive: true
      }
    }

    function editUser(user) {
      selectedUser.value = user
      userForm.value = {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || null,
        isActive: user.isActive !== undefined ? user.isActive : true
      }
      showDialog.value = true
    }

    async function saveUser() {
      try {
        loading.value = true
        // TODO: Replace with actual API endpoint
        const endpoint = selectedUser.value 
          ? 'admin/updateUser' 
          : 'admin/createUser'
        
        const payload = {
          ...userForm.value,
          id: selectedUser.value?.id
        }

        await axios.post(commonStore.apiUrl + endpoint, payload, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        await fetchUsers()
        closeDialog()
      } catch (error) {
        console.error('Failed to save user:', error)
        alert('שגיאה בשמירת משתמש')
      } finally {
        loading.value = false
      }
    }

    async function deleteUser(user) {
      const confirmed = confirm(`האם למחוק את המשתמש "${user.fullName}"?`)
      if (!confirmed) return

      try {
        loading.value = true
        // TODO: Replace with actual API endpoint
        await axios.post(commonStore.apiUrl + 'admin/deleteUser', { id: user.id }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        await fetchUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('שגיאה במחיקת משתמש')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      loading,
      showDialog,
      selectedUser,
      users,
      userForm,
      roleOptions,
      headers,
      getRoleName,
      openDialog,
      closeDialog,
      editUser,
      saveUser,
      deleteUser
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

