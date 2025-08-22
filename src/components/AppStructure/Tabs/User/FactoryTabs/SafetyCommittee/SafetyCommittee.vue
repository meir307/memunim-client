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
                                    <v-checkbox v-model="user.isCommitteeMember" :true-value="true" :false-value="false"
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
const users = computed(() => safetyCommitteeStore.getMembers)

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'משתמש חדש' : 'ערוך משתמש'
})

onMounted(async () => {
    try {
        // Fetch members from API - you'll need to pass the actual factoryId
        await safetyCommitteeStore.fetchMembers(1) // Replace with actual factoryId
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
    editedItem.value = { ...item }
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
    editedItem.value = { fullName: '', email: '', isCommitteeMember: false, phone: '', factoryId: 0, role: 2 }
}

function closeDelete() {
    dialogDelete.value = false
    editedIndex.value = -1
}

async function save() {
    const userStore = useUserStore()
    const factoryId = userStore.selectedFactory.id
    editedItem.value.password =  editedItem.value.phone
    try {
        if (editedIndex.value > -1) {
            // Update existing member
            const itemToUpdate = users.value[editedIndex.value]
            await safetyCommitteeStore.updateMember(itemToUpdate.id, editedItem.value)
        } else {
            // Add new member
            editedItem.value.factoryId = factoryId
            await safetyCommitteeStore.addMember(editedItem.value)
        }
        closeDialog()
    } catch (error) {
        console.error('Failed to save member:', error)
    }
}

function openDialog() {
    dialog.value = true
}

// Handle committee status changes
async function handleCommitteeStatusChange(user, newStatus) {
    try {
        await safetyCommitteeStore.updateCommitteeStatus(user.id, newStatus)
    } catch (error) {
        console.error('Failed to update committee status:', error)
        // Revert the checkbox state on error
        user.isCommitteeMember = !newStatus
    }
}
</script>

<style scoped>
.modern-card {
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.modern-title {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px;
}

.title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.title-text {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 100;
    color: white;
}

.add-btn {
    border-radius: 12px;
    text-transform: none;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.table-wrapper {
    padding: 0;
    background: #fafafa;
}

.modern-table {
    background: transparent;
}

.modern-table ::v-deep .v-data-table__wrapper {
    border-radius: 0;
}

 .table-header {
     background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
     color: #2c3e50;
     font-weight: 600;
     font-size: 0.9rem;
     text-transform: uppercase;
     letter-spacing: 0.5px;
     padding: 16px 12px;
     border: none;
     width: 120px;
 }
 
 .table-header:first-child {
     width: 100px;
 }
 
 .table-header:nth-child(2) {
     width: 200px;
 }
 
 .table-header:nth-child(3) {
     width: 250px;
 }
 
 .table-header:nth-child(4) {
     width: 150px;
 }
 
 .table-header:last-child {
     width: 120px;
 }

.actions-header {
    text-align: center;
}

.table-row {
    transition: all 0.3s ease;
    border-bottom: 1px solid #e8eaf6;
}

.table-row:hover {
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

 .table-cell {
     padding: 16px 12px;
     vertical-align: middle;
     border: none;
     width: 120px;
 }
 
 .table-cell:first-child {
     width: 100px;
 }
 
 .table-cell:nth-child(2) {
     width: 200px;
 }
 
 .table-cell:nth-child(3) {
     width: 250px;
 }
 
 .table-cell:nth-child(4) {
     width: 150px;
 }
 
 .table-cell:last-child {
     width: 120px;
 }

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.user-name {
    font-weight: 500;
    color: #2c3e50;
}

.committee-checkbox {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: flex-end;
}

.committee-checkbox ::v-deep .v-selection-control {
    min-height: auto;
}

.committee-checkbox ::v-deep .v-selection-control__wrapper {
    margin: 0;
}

.actions-cell {
    text-align: center;
}

.action-btn {
    margin: 0 4px;
    transition: all 0.3s ease;
    border-radius: 8px;
}

.action-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Dialog checkbox styling */
.v-dialog .v-checkbox {
    display: flex;
    justify-content: flex-end;
}

.v-dialog .v-checkbox ::v-deep .v-selection-control {
    flex-direction: row-reverse;
}

.v-dialog .v-checkbox ::v-deep .v-label {
    margin-right: 8px;
    margin-left: 0;
}

/* Responsive design */
@media (max-width: 768px) {
    .modern-title {
        padding: 16px;
        font-size: 1.2rem;
    }

    .title-container {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .title-text {
        font-size: 1rem;
        text-align: center;
    }

    .add-btn {
        align-self: center;
        width: fit-content;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    .modern-table {
        min-width: 600px;
    }

    .table-header {
        padding: 12px 8px;
        font-size: 0.8rem;
        width: 80px;
    }

    .table-header:first-child {
        width: 80px;
    }

    .table-header:nth-child(2) {
        width: 150px;
    }

    .table-header:nth-child(3) {
        width: 180px;
    }

    .table-header:nth-child(4) {
        width: 120px;
    }

    .table-header:last-child {
        width: 80px;
    }

    .table-cell {
        padding: 12px 8px;
        width: 80px;
        font-size: 0.85rem;
    }

    .table-cell:first-child {
        width: 80px;
    }

    .table-cell:nth-child(2) {
        width: 150px;
    }

    .table-cell:nth-child(3) {
        width: 180px;
    }

    .table-cell:nth-child(4) {
        width: 120px;
    }

    .table-cell:last-child {
        width: 80px;
    }

    .user-info {
        gap: 8px;
    }

    .user-avatar {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
    }

    .user-name {
        font-size: 0.85rem;
    }

    .action-btn {
        margin: 0 2px;
        padding: 4px;
    }

    .action-btn ::v-deep .v-icon {
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    .modern-title {
        padding: 12px;
    }

    .title-text {
        font-size: 0.9rem;
    }

    .table-header {
        padding: 8px 4px;
        font-size: 0.75rem;
        width: 60px;
    }

    .table-header:first-child {
        width: 60px;
    }

    .table-header:nth-child(2) {
        width: 120px;
    }

    .table-header:nth-child(3) {
        width: 140px;
    }

    .table-header:nth-child(4) {
        width: 100px;
    }

    .table-header:last-child {
        width: 60px;
    }

    .table-cell {
        padding: 8px 4px;
        width: 60px;
        font-size: 0.8rem;
    }

    .table-cell:first-child {
        width: 60px;
    }

    .table-cell:nth-child(2) {
        width: 120px;
    }

    .table-cell:nth-child(3) {
        width: 140px;
    }

    .table-cell:nth-child(4) {
        width: 100px;
    }

    .table-cell:last-child {
        width: 60px;
    }

    .user-avatar {
        width: 24px;
        height: 24px;
        font-size: 0.7rem;
    }

    .user-name {
        font-size: 0.8rem;
    }

    .action-btn {
        margin: 0 1px;
        padding: 2px;
    }

    .action-btn ::v-deep .v-icon {
        font-size: 14px;
    }
}
</style>