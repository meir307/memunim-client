<template>
    <div>
        <v-card-text class="pa-0">
            <div class="table-wrapper">
                <v-data-table
                    :headers="headers"
                    :items="users"
                    :loading="loading"
                    class="modern-table"
                    no-data-text="אין נאמני בטיחות"
                    loading-text="טוען נתונים..."
                    hide-default-footer
                >
                    <template #item="{ item, columns }">
                        <tr>
                            <td v-for="column in columns" :key="column.key">
                                <v-checkbox 
                                    v-if="column.key === 'isCommitteeMember'"
                                    v-model="item.isCommitteeMember" 
                                    readonly="true" 
                                    :true-value="true" 
                                    :false-value="false"
                                    hide-details 
                                    class="committee-checkbox" 
                                    @change="handleCommitteeStatusChange(item, $event)"
                                ></v-checkbox>
                                <div v-else-if="column.key === 'fullName'" class="user-info">
                                    <span class="user-name">{{ item.fullName }}</span>
                                </div>
                                <span v-else-if="column.key === 'actions' && userStore.user.role === 1">
                                    <v-btn icon size="small" @click="editUser(item)" color="primary" class="action-btn">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon size="small" @click="deleteUser(item)" color="error" class="action-btn">
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
    </div>
</template>
  
<script>
import { computed, ref, onMounted } from 'vue'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'
import { useUserStore } from '@/stores/UserStore'

export default {
    name: 'SafetyCommittee',
    props: {
        editUser: {
            type: Function,
            required: true
        },
        deleteUser: {
            type: Function,
            required: true
        }
    },
    setup() {
        const safetyCommitteeStore = useSafetyCommitteeStore()
        const userStore = useUserStore()
        const loading = ref(false)

        // Use store state
        const users = computed(() => {
            const members = safetyCommitteeStore.getMembers
            console.log('🔍 Raw members from store:', members)
            
            // Convert integer values to boolean for display
            return members.map(user => ({
                ...user,
                isCommitteeMember: user.isCommitteeMember === 1 || user.isCommitteeMember === true
            }))
        })

        const headers = computed(() => {
            const baseHeaders = [
                { title: 'חבר ועדה', key: 'isCommitteeMember', sortable: false, align: 'right', width: '50px' },
                { title: 'שם', key: 'fullName', sortable: true, width: '150px' },
                { title: 'אימייל', key: 'email', sortable: false, width: '150px'  },
                { title: 'טלפון', key: 'phone', sortable: false, width: '150px' }
            ]
            
            // Only add actions column if user role is 1
            if (userStore.user.role === 1) {
                baseHeaders.push({ title: '', key: 'actions', sortable: false, align: 'center', width: '420px' })
            }
            
            return baseHeaders
        })

        onMounted(async () => {
            try {
                loading.value = true
                const userStore = useUserStore()
                await safetyCommitteeStore.fetchMembers(userStore.selectedFactory.id)
            } catch (error) {
                console.error('Failed to fetch safety committee members:', error)
            } finally {
                loading.value = false
            }
        })

        // Handle committee status changes
        async function handleCommitteeStatusChange(user, newStatus) {
            console.log('🔄 Committee status change:', user.id, 'from', user.isCommitteeMember, 'to', newStatus)
            return;
        }

        // Return all the reactive data and functions
        return {
            users,
            headers,
            loading,
            userStore,
            handleCommitteeStatusChange
        }
    }
}
</script>

<style scoped>
.v-card-text {
    padding: 0 !important;
    margin: 0 !important;
}

.table-wrapper {
    width: 100%;
    overflow-x: auto;
    margin: 0 !important;
    padding: 0 !important;
}

.modern-table {
    width: 100%;
    max-width: 100%;
}

/* Data table header styling */
.modern-table ::v-deep thead {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.modern-table ::v-deep thead th {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
    color: #2c3e50 !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    padding: 16px 12px !important;
    border: none !important;
}

.modern-table ::v-deep thead th:first-child {
    border-top-right-radius: 0;
}

.modern-table ::v-deep thead th:last-child {
    border-top-left-radius: 0;
}

/* Remove any default spacing from Vuetify components */
::v-deep .v-card {
    margin: 0 !important;
}

::v-deep .v-card-text {
    padding: 0 !important;
    margin: 0 !important;
}

.user-name {
    font-weight: 500;
}

.action-btn {
    margin: 0 2px;
}

/* Make the committee member checkbox column thinner */
.modern-table ::v-deep(thead th:first-child),
.modern-table ::v-deep(tbody td:first-child) {
    width: 40px !important;
    min-width: 40px !important;
    max-width: 40px !important;
    padding: 8px 6px !important;
}

/* Make the actions column thinner */
.modern-table ::v-deep(thead th:last-child),
.modern-table ::v-deep(tbody td:last-child) {
    width: 160px !important;
    min-width: 160px !important;
    max-width: 160px !important;
    padding: 8px 4px !important;
}

@media (max-width: 768px) {
    .table-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .modern-table {
        min-width: 100%;
        width: 100%;
        max-width: 100vw;
    }
    
    /* Hide columns except isCommitteeMember (1st) and name (2nd) */
    .modern-table ::v-deep(thead th:nth-child(3)),
    .modern-table ::v-deep(thead th:nth-child(4)),
    .modern-table ::v-deep(thead th:nth-child(5)) {
        display: none !important;
    }
    
    .modern-table ::v-deep(tbody td:nth-child(3)),
    .modern-table ::v-deep(tbody td:nth-child(4)),
    .modern-table ::v-deep(tbody td:nth-child(5)) {
        display: none !important;
    }
    
    .modern-table ::v-deep(table) {
        width: 100%;
        max-width: 100%;
        table-layout: fixed;
    }
}
</style>