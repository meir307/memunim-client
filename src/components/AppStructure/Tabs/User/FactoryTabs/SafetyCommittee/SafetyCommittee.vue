<template>
    <div>
        <v-card class="modern-card">
            <v-card-title class="modern-title">
                <div class="title-container">
                    <h1 class="title-text">הגדר מי הם נאמני הבטיחות במפעל והאם הם חברי ועדת הבטיחות</h1>
                    <v-btn color="primary" @click="openDialog" class="add-btn">
                        <v-icon left>mdi-plus</v-icon>
                        הוסף נאמן בטיחות
                    </v-btn>
                </div>
            </v-card-title>

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
                                        <!-- <div class="user-avatar">{{ user.name.charAt(0) }}</div> -->
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
        </v-card>

        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title class="popup-title d-flex align-center justify-space-between">
                    {{ formTitle }}
                    <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="save">
                        <v-text-field v-model="editedItem.fullName" label="שם" required reverse></v-text-field>
                        <v-text-field v-model="editedItem.email" label="אימייל" type="email" required
                            reverse></v-text-field>

                        <v-text-field v-model="editedItem.phone" label="טלפון" reverse></v-text-field>
                        <v-checkbox v-model="editedItem.isCommitteeMember" label="חבר ועדה"
                            :true-value="true"></v-checkbox>
                    </v-form>
                    <div class="popup-btn-row">
                        <v-btn @click="save" color="primary">שמור</v-btn>
                        <v-btn @click="closeDialog">ביטול</v-btn>
                        <v-spacer></v-spacer>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDelete" max-width="400px">
            <v-card>
                <v-card-title class="popup-title d-flex align-center justify-space-between">
                    אישור מחיקה
                    <v-btn icon="mdi-close" variant="text" @click="closeDelete"></v-btn>
                </v-card-title>
                <v-card-text>
                    <p>האם אתה בטוח שברצונך למחוק משתמש זה?</p>
                    <div class="popup-btn-row">
                        <v-btn @click="deleteItemConfirm" color="error">מחק</v-btn>
                        <v-btn @click="closeDelete">ביטול</v-btn>
                        <v-spacer></v-spacer>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'
import { useUserStore } from '@/stores/UserStore'

const safetyCommitteeStore = useSafetyCommitteeStore()

const dialog = ref(false)
const dialogDelete = ref(false)
const editedIndex = ref(-1)
const editedItem = ref({
    fullName: '',
    email: '',
    isCommitteeMember: false,
    phone: '',
    factoryId: 0,
    role: 2,
    password: ''
})



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

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'משתמש חדש' : 'ערוך משתמש'
})

onMounted(async () => {
    try {   

        const userStore = useUserStore()
        await safetyCommitteeStore.fetchMembers(userStore.selectedFactory.id)
    } catch (error) {
        console.error('Failed to fetch safety committee members:', error)
    }
})

// // Watch for errors and show them
// watch(error, (newError) => {
//     if (newError) {
//         alert(newError)
//         safetyCommitteeStore.clearError()
//     }
// })

async function editUser(item) {
 
    
    editedIndex.value = users.value.indexOf(item)
    editedItem.value = { 
        id: item.id,
        fullName: item.fullName || item.name || '',
        email: item.email || '',
        isCommitteeMember: item.isCommitteeMember === 1 || item.isCommitteeMember === true, // Convert int to boolean
        phone: item.phone || '',
        factoryId: item.factoryId || 0,
        role: item.role || 2,
        password: item.password || ''
    }
    
    console.log('🔍 Edited item after mapping:', editedItem.value)
    console.log('🔍 isCommitteeMember after mapping:', editedItem.value.isCommitteeMember)
    
    dialog.value = true
}

async function deleteUser(item) {
    editedIndex.value = users.value.indexOf(item)
    dialogDelete.value = true
}

async function deleteItemConfirm() {
    try {
        const itemToDelete = users.value[editedIndex.value]
        await safetyCommitteeStore.deleteMember(itemToDelete.id)
        closeDelete()
    } catch (error) {
        console.error('Failed to delete member:', error)
    }
}

function closeDialog() {
    dialog.value = false
    editedIndex.value = -1
    editedItem.value = { 
        fullName: '', 
        email: '', 
        isCommitteeMember: false, 
        phone: '', 
        factoryId: 0, 
        role: 2,
        password: ''
    }
}

function closeDelete() {
    dialogDelete.value = false
    editedIndex.value = -1
}

async function save() {
   
    const userStore = useUserStore()
    const factoryId = userStore.selectedFactory.id
       
    // Convert boolean to integer for API
    const dataToSend = {
        ...editedItem.value,
        isCommitteeMember: editedItem.value.isCommitteeMember ? 1 : 0
    }
    
    try {
        if (editedIndex.value > -1) {
            // Update existing member
            const itemToUpdate = users.value[editedIndex.value]
            await safetyCommitteeStore.updateMember(itemToUpdate.id, dataToSend)
        } else {
            // Add new member
            dataToSend.password = editedItem.value.phone
            dataToSend.factoryId = factoryId
            const newMember = await safetyCommitteeStore.addMember(dataToSend)
            console.log('🔍 New member added:', newMember)
            closeDialog()
        }
        closeDialog()
    } catch (error) {
        alert(error)
    }
}

function openDialog() {
    dialog.value = true
}

// Handle committee status changes
async function handleCommitteeStatusChange(user, newStatus) {   //xxxxx
    console.log('🔄 Committee status change:', user.id, 'from', user.isCommitteeMember, 'to', newStatus)
    return;
   
    

    // const itemToUpdate = users.value[editedIndex.value]
    // await safetyCommitteeStore.updateMember(itemToUpdate.id, dataToSend)



    // try {
    //     // Convert boolean to integer for API
    //     const statusValue = newStatus ? 1 : 0
    //     await safetyCommitteeStore.updateCommitteeStatus(user.id, statusValue)
        
    //     // Update the user object in the store to reflect the change
    //     const members = safetyCommitteeStore.getMembers
    //     const userIndex = members.findIndex(m => m.id === user.id)
    //     if (userIndex !== -1) {
    //         members[userIndex].isCommitteeMember = statusValue
    //     }
    // } catch (error) {
    //     console.error('Failed to update committee status:', error)
    //     // Revert the checkbox state on error
    //     user.isCommitteeMember = !newStatus
    // }
}
</script>

<style scoped>

</style>