<template>
    <div>
        <!-- Remove the v-card wrapper since we're already inside a card -->
        <v-card-text class="pa-0">
            <div class="table-wrapper">
                <v-simple-table class="modern-table">
                    <thead>
                        <tr>
                            <th class="table-header">חבר ועדה</th>
                            <th class="table-header">שם</th>
                            <th class="table-header">אימייל</th>
                            <th class="table-header">טלפון</th>
                            <th class="table-header actions-header">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id" class="table-row">
                            <td class="table-cell">
                                <v-checkbox v-model="user.isCommitteeMember" readonly="true" :true-value="true" :false-value="false"
                                    hide-details class="committee-checkbox" @change="handleCommitteeStatusChange(user, $event)"></v-checkbox>
                            </td>
                            <td class="table-cell">
                                <div class="user-info">
                                    <span class="user-name">{{ user.fullName }}</span>
                                </div>
                            </td>
                            <td class="table-cell">{{ user.email }}</td>
                            <td class="table-cell">{{ user.phone }}</td>
                            <td class="table-cell actions-cell">
                                <v-btn icon size="small" @click="editUser(user)" color="primary" class="action-btn">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn icon size="small" @click="deleteUser(user)" color="error" class="action-btn">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </v-simple-table>
            </div>
        </v-card-text>
          </div>
        </template>
  
<script>
import { computed, onMounted } from 'vue'
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

onMounted(async () => {
    try {   
        const userStore = useUserStore()
        await safetyCommitteeStore.fetchMembers(userStore.selectedFactory.id)
    } catch (error) {
        console.error('Failed to fetch safety committee members:', error)
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
    margin: 0 !important;
    padding: 0 !important;
}

.modern-card {
    margin: 0 !important;
    padding: 0 !important;
}

/* Remove any default spacing from Vuetify components */
::v-deep .v-card {
    margin: 0 !important;
}

::v-deep .v-card-text {
    padding: 0 !important;
    margin: 0 !important;
}
</style>