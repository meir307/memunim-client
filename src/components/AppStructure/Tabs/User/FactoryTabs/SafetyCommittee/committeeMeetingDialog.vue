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
                    
                    <v-text-field
                        v-model="formattedMeetingDate"
                        label="תאריך הפגישה"
                        required
                        reverse
                        :rules="[v => !!v || 'תאריך הפגישה חובה', dateFormatRule]"
                        @input="handleMeetingDateChange"
                        placeholder="dd/MM/yyyy"
                        prepend-icon="mdi-calendar"
                        readonly
                        @click:prepend="showDatePicker = true"
                    ></v-text-field>
                    
                    <v-dialog v-model="showDatePicker" max-width="290">
                        <v-date-picker
                            v-model="datePickerValue"
                            @update:model-value="handleDatePickerChange"
                            locale="he"
                            :first-day-of-week="0"
                        ></v-date-picker>
                    </v-dialog>
                    
                    <v-textarea 
                        v-model="editedItem.summary" 
                        label="הערות נוספות" 
                        required 
                        reverse
                        rows="1"
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
                    <!-- <div v-if="isEditMode && editedItem.currentFileName" class="current-file-info">
                        <v-chip color="info" variant="outlined">
                            <v-icon start>mdi-file-document</v-icon>
                            קובץ נוכחי: {{ editedItem.currentFileName }}
                        </v-chip>
                    </div> -->
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
import {
    getDatePickerValue,
    getDisplayValue,
    getTodayDDMMYYYY,
    formatToDDMMYYYY,
    dateFormatRule
} from '@/utils/DateFormater'

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
        const showDatePicker = ref(false)
        const datePickerValue = ref(null)
        const formattedMeetingDate = ref('')
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

        function initializeForm() {
            // Reset form for new meeting only (not in edit mode)
            if (editedIndex.value === -1) {
                const today = getTodayDDMMYYYY()
                editedItem.value.meetingDate = today
                formattedMeetingDate.value = today
                datePickerValue.value = getDatePickerValue(today)
            }
        }

        // Watch for prop changes
        watch(() => props.showDialog, (newVal) => {
            dialog.value = newVal
            // Only initialize form for new meetings, not when editing
            if (newVal && editedIndex.value === -1) {
                initializeForm()
            }
        })

        // Watch for dialog changes and emit to parent
        watch(dialog, (newVal) => {
            if (!newVal) {
                emit('close-dialog')
            } else {
                // Only initialize form for new meetings, not when editing
                if (editedIndex.value === -1) {
                    initializeForm()
                }
            }
        })

        function openDialog() {
            // Initialize date picker for new meeting with today's date
            const today = getTodayDDMMYYYY()
            editedItem.value.meetingDate = today
            formattedMeetingDate.value = today
            datePickerValue.value = getDatePickerValue(today)
            dialog.value = true
        }

        function editMeeting(meeting) {
            editedIndex.value = 0 // Set edit mode
            
            // Extract values from proxy object to ensure we get the actual values
            const meetingId = meeting.id
            const meetingTitle = meeting.title || ''
            const meetingSummary = meeting.summary || ''
            const meetingFileName = meeting.fileName || null
            const meetingDateValue = meeting.meetingDate || meeting.createdAt || null
            const meetingFactoryId = meeting.factoryId || null
            
            editedItem.value = {
                id: meetingId,
                title: meetingTitle,
                summary: meetingSummary,
                file: null,
                currentFileName: meetingFileName,
                meetingDate: meetingDateValue,
                factoryId: meetingFactoryId
            }
            
            // Set formatted date and date picker value
            if (meetingDateValue) {
                // Normalize the date to dd/MM/yyyy format first (handles ISO strings, YYYY-MM-DD, etc.)
                let normalizedDate = formatToDDMMYYYY(meetingDateValue)
                
                // If normalization failed or returned empty, try parsing as Date object
                if (!normalizedDate) {
                    const dateObj = new Date(meetingDateValue)
                    if (!isNaN(dateObj.getTime())) {
                        normalizedDate = formatToDDMMYYYY(dateObj)
                    }
                }
                
                if (normalizedDate) {
                    editedItem.value.meetingDate = normalizedDate
                    formattedMeetingDate.value = normalizedDate
                    const pickerValue = getDatePickerValue(normalizedDate)
                    datePickerValue.value = pickerValue
                    console.log('Edit meeting - Date set:', {
                        original: meetingDateValue,
                        normalized: normalizedDate,
                        pickerValue: pickerValue
                    })
                } else {
                    console.warn('Failed to normalize date:', meetingDateValue)
                    formattedMeetingDate.value = ''
                    datePickerValue.value = null
                }
            } else {
                console.warn('No meeting date found in meeting object:', meeting)
                formattedMeetingDate.value = ''
                datePickerValue.value = null
            }
            dialog.value = true
        }
        
        function handleMeetingDateChange() {
            // Handle manual date input if needed
        }
        
        function handleDatePickerChange(value) {
            if (value) {
                editedItem.value.meetingDate = getDisplayValue(value)
                formattedMeetingDate.value = editedItem.value.meetingDate
                showDatePicker.value = false
            }
        }


        function closeDialog() {
            dialog.value = false
            editedIndex.value = -1
            showDatePicker.value = false
            datePickerValue.value = null
            formattedMeetingDate.value = ''
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
            
                if (!editedItem.value.meetingDate) {
                    alert('תאריך הפגישה חובה')
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
                formData.append('meetingDate', editedItem.value.meetingDate)
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
                //alert(isEditMode.value ? 'פגישה עודכנה בהצלחה' : 'פגישה נוספה בהצלחה')
                
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
            showDatePicker,
            datePickerValue,
            formattedMeetingDate,
            dateFormatRule,
            openDialog,
            editMeeting,
            closeDialog,
            save,
            handleMeetingDateChange,
            handleDatePickerChange
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
