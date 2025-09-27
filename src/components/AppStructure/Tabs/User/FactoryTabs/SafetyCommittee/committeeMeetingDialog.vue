<template>
    <!-- Add/Edit Committee Meeting Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                {{ formTitle }}
                <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="save">
                    <v-text-field 
                        v-model="editedItem.title" 
                        label="כותרת הפגישה" 
                        required 
                        reverse
                        :rules="[v => !!v || 'כותרת הפגישה חובה']"
                    ></v-text-field>
                    
                    <v-textarea 
                        v-model="editedItem.summary" 
                        label="סיכום הפגישה" 
                        required 
                        reverse
                        rows="4"
                        :rules="[v => !!v || 'סיכום הפגישה חובה']"
                    ></v-textarea>
                    
                    <v-file-input
                        v-model="editedItem.file"
                        label="קובץ הפגישה"
                        accept=".pdf,.doc,.docx"
                        prepend-icon="mdi-file-document"
                        reverse
                        show-size
                        counter
                        :rules="[v => !isEditMode || v || 'קובץ הפגישה חובה']"
                    ></v-file-input>
                    
                    <!-- Show current file if editing -->
                    <div v-if="isEditMode && editedItem.currentFileName" class="current-file-info">
                        <v-chip color="info" variant="outlined">
                            <v-icon start>mdi-file-document</v-icon>
                            קובץ נוכחי: {{ editedItem.currentFileName }}
                        </v-chip>
                    </div>
                </v-form>
                <div class="popup-btn-row">
                    <v-btn @click="save" color="primary" :loading="loading">שמור</v-btn>
                    <v-btn @click="closeDialog">ביטול</v-btn>
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

export default {
    name: 'CommitteeMeetingDialog',
    props: {
        showDialog: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close-dialog'],
    setup(props, { emit }) {
        const userStore = useUserStore()
        const safetyCommitteeStore = useSafetyCommitteeStore()
        const dialog = ref(false)
        const loading = ref(false)
        const editedIndex = ref(-1)
        const editedItem = ref({
            id: null,
            title: '',
            summary: '',
            file: null,
            currentFileName: null,
            meetingDate: null,
            factoryId: null
        })

        const isEditMode = computed(() => editedIndex.value !== -1)

        const formTitle = computed(() => {
            return isEditMode.value ? 'ערוך פגישת ועדה' : 'פגישת ועדה חדשה'
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

        function openDialog() {
            dialog.value = true
        }

        function editMeeting(meeting) {
            editedIndex.value = 0 // For now, we'll handle this differently
            editedItem.value = {
                id: meeting.id,
                title: meeting.title || '',
                summary: meeting.summary || '',
                file: null,
                currentFileName: meeting.fileName || null,
                meetingDate: meeting.meetingDate || null,
                factoryId: meeting.factoryId || null
            }
            dialog.value = true
        }


        function closeDialog() {
            dialog.value = false
            editedIndex.value = -1
            editedItem.value = {
                id: null,
                title: '',
                summary: '',
                file: null,
                currentFileName: null,
                meetingDate: null,
                factoryId: null
            }
        }


        async function save() {
            loading.value = true
            const factoryId = userStore.selectedFactory.id
            try {
                // Validate required fields
                if (!editedItem.value.title.trim()) {
                    alert('כותרת הפגישה חובה')
                    return
                }
                
                if (!editedItem.value.summary.trim()) {
                    alert('סיכום הפגישה חובה')
                    return
                }
                
                if (!isEditMode.value && !editedItem.value.file) {
                    alert('קובץ הפגישה חובה')
                    return
                }

                // Create FormData for API call
                const formData = new FormData()
                formData.append('title', editedItem.value.title)
                formData.append('summary', editedItem.value.summary)
                formData.append('factoryId', factoryId)
                
                if (editedItem.value.file) {
                    formData.append('file', editedItem.value.file)
                }
                
                if (isEditMode.value) {
                    formData.append('id', editedItem.value.id)
                    await safetyCommitteeStore.updateMeeting(formData)
                } else {
                    await safetyCommitteeStore.addMeeting(formData)
                }
                
                closeDialog()
                alert(isEditMode.value ? 'פגישה עודכנה בהצלחה' : 'פגישה נוספה בהצלחה')
                
            } catch (error) {
                console.error('Failed to save meeting:', error)
                alert('שגיאה בשמירת הפגישה: ' + error)
            } finally {
                loading.value = false
            }
        }


        // Return all the reactive data and functions
        return {
            dialog,
            loading,
            editedIndex,
            editedItem,
            isEditMode,
            formTitle,
            openDialog,
            editMeeting,
            closeDialog,
            save
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

.current-file-info {
    margin-top: 8px;
    margin-bottom: 16px;
}
</style>
