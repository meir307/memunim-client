<template>
    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                {{ formTitle }}
                <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="save">
                    <v-text-field v-model="editedItem.fullName" label="שם" required reverse></v-text-field>
                    <v-text-field v-model="editedItem.email" label="אימייל" type="email" required reverse></v-text-field>
                    <v-text-field v-model="editedItem.phone" label="טלפון" reverse class="phone-input" @input="handlePhoneInput"></v-text-field>
                    <v-checkbox v-model="editedItem.isCommitteeMember" label="חבר ועדה" :true-value="true"></v-checkbox>
                </v-form>
                <div class="popup-btn-row">
                    <v-btn @click="save" color="primary">שמור</v-btn>
                    <v-btn @click="closeDialog">ביטול</v-btn>
                    <v-spacer></v-spacer>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDelete" max-width="400px">
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                אישור מחיקה
                <v-btn icon="mdi-close" variant="text" @click="closeDelete"></v-btn>
            </v-card-title>
            <v-card-text>
                <p class="delete-confirmation-text">{{ deleteConfirmationMessage }}</p>
                <div class="popup-btn-row">
                    <v-btn @click="deleteItemConfirm" color="error">מחק</v-btn>
                    <v-btn @click="closeDelete">ביטול</v-btn>
                    <v-spacer></v-spacer>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'
import { useUserStore } from '@/stores/UserStore'
import { restrictPhoneToDigits } from '@/utils/PhoneInput'

export default {
    name: 'SafetyTrusteesDialog',
    props: {
        showDialog: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close-dialog'],
    setup(props, { emit }) {
        const safetyCommitteeStore = useSafetyCommitteeStore()
        const userStore = useUserStore()

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

        // Watch for prop changes
        watch(() => props.showDialog, (newVal) => {
            dialog.value = newVal
        })

        // Watch for dialog changes and emit to parent
        watch(dialog, (newVal) => {
            if (!newVal) {
                emit('close-dialog')
            }
        })

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'משתמש חדש' : 'ערוך משתמש'
})

const deleteConfirmationMessage = computed(() => {
    const contact = editedIndex.value >= 0 && users.value[editedIndex.value] ? users.value[editedIndex.value] : null
    const contactName = contact ? (contact.fullName || contact.name) : 'משתמש זה'
    return `האם למחוק את נאמן הבטיחות - ${contactName}?\nבמידה ו ${contactName} הזין מפגעים, מפגעים אלה ישוייכו אליך.`
})

// Get users from store
const users = computed(() => {
    const members = safetyCommitteeStore.getMembers
    return members.map(user => ({
        ...user,
        isCommitteeMember: user.isCommitteeMember === 1 || user.isCommitteeMember === true
    }))
})

function editUser(item) {
    console.log('🔍 editUser called with item:', item)
    console.log('🔍 users array:', users.value)
    
    // Use findIndex by ID instead of indexOf by object reference
    const userIndex = users.value.findIndex(user => user.id === item.id)
    console.log('🔍 Found user index by ID:', userIndex)
    
    editedIndex.value = userIndex
    editedItem.value = { 
        id: item.id,
        fullName: item.fullName || item.name || '',
        email: item.email || '',
        isCommitteeMember: item.isCommitteeMember === 1 || item.isCommitteeMember === true,
        phone: item.phone || '',
        factoryId: item.factoryId || 0,
        role: item.role || 2,
        password: item.password || ''
    }
    dialog.value = true
}

function handlePhoneInput(value) {
    editedItem.value.phone = restrictPhoneToDigits(value)
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

function deleteUser(item) {
    // Use findIndex by ID instead of indexOf by object reference
    const userIndex = users.value.findIndex(user => user.id === item.id)
    editedIndex.value = userIndex
    dialogDelete.value = true
}

function closeDelete() {
    dialogDelete.value = false
    editedIndex.value = -1
}

async function addUserToFactoryContacts(userData) {
    const factory = userStore.selectedFactory
    if (!factory) {
        return
    }

    // Get current contacts or initialize as empty array
    let contacts = []
    try {
        contacts = factory.contacts ? JSON.parse(factory.contacts) : []
    } catch (e) {
        contacts = []
    }

    if (!Array.isArray(contacts)) {
        contacts = []
    }

    // Check if contact already exists (by email)
    const existingContactIndex = contacts.findIndex(
        c => c.email && c.email.toLowerCase() === userData.email.toLowerCase()
    )

    if (existingContactIndex === -1) {
        // Add new contact
        const newContact = {
            id: Date.now(), // Simple ID generation
            name: userData.fullName || '',
            jobDescription: 'נאמן בטיחות',
            email: userData.email || '',
            phone: userData.phone || ''
        }
        contacts.push(newContact)

        // Update factory with new contacts JSON
        const updatedFactory = {
            ...factory,
            contacts: JSON.stringify(contacts)
        }

        await userStore.updateFactory(updatedFactory)
        
        // Update selectedFactory in store
        userStore.selectedFactory = updatedFactory
    }
}

async function save() {
    const factoryId = userStore.selectedFactory.id
    const factoryName = userStore.selectedFactory.name
       
    // Convert boolean to integer for API
    const dataToSend = {
        ...editedItem.value,
        isCommitteeMember: editedItem.value.isCommitteeMember ? 1 : 0,
        factoryName: factoryName
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
            await safetyCommitteeStore.addMember(dataToSend)

            // Add this user to factory contacts
            await addUserToFactoryContacts(editedItem.value)
        }
        closeDialog()
    } catch (error) {
        alert(error)
    }
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

        // Return all the reactive data and functions
        return {
            dialog,
            dialogDelete,
            editedIndex,
            editedItem,
            formTitle,
            deleteConfirmationMessage,
            users,
            editUser,
            deleteUser,
            closeDialog,
            closeDelete,
            save,
            deleteItemConfirm,
            handlePhoneInput
        }
    }
}
</script>

<style scoped>
.popup-title {
    padding: 0;
    margin: 0;
    padding-right: 12px;
    margin-bottom: 20px;
    background-color: rgb(138, 200, 224);
    text-align: right;
    border-color: black;
    border-width: 2px;
}

.popup-btn-row {
    direction: ltr;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 16px;
    margin-top: 24px;
    margin-bottom: 8px;
}

.delete-confirmation-text {
    white-space: pre-line;
}
</style>
