<template>
    <!-- Add/Edit Routine Check Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                {{ formTitle }}
                <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="save">
                    <v-select 
                        v-model="editedItem.checkType" 
                        :items="checkTypeOptions" 
                        label="סוג הבדיקה" 
                        required 
                        reverse
                        :rules="[v => !!v || 'סוג הבדיקה חובה']"
                    ></v-select>
                    
                    <v-text-field 
                        v-model="editedItem.checkDate" 
                        label="תאריך הבדיקה" 
                        type="date"
                        required 
                        reverse
                        :rules="[v => !!v || 'תאריך הבדיקה חובה']"
                    ></v-text-field>
                    
                    <v-text-field 
                        v-model="editedItem.nextCheckDate" 
                        label="תאריך הבדיקה הבאה" 
                        type="date"
                        required 
                        reverse
                        :rules="[v => !!v || 'תאריך הבדיקה הבאה חובה']"
                    ></v-text-field>
                    
                    <v-file-input
                        v-model="editedItem.file"
                        label="קובץ הבדיקה"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        prepend-icon="mdi-file-document"
                        reverse
                        show-size
                        counter
                        :rules="[v => !isEditMode || v || 'קובץ הבדיקה חובה']"
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
import { useUserStore } from '@/stores/UserStore'
import { useCommonStore } from '@/stores/CommonStore'

export default {
    name: 'UpsertRoutineCheckDialog',
    props: {
        showDialog: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close-dialog'],
    setup(props, { emit }) {
        const userStore = useUserStore()
        const commonStore = useCommonStore()

        const dialog = ref(false)
        const loading = ref(false)
        const editedIndex = ref(-1)
        const editedItem = ref({
            id: null,
            checkType: '',
            checkDate: '',
            nextCheckDate: '',
            file: null,
            currentFileName: null,
            factoryId: null
        })

        const checkTypeOptions = computed(() => {
            const types = commonStore.getRoutineCheckTypes
            return types.map(type => ({
                title: type.name,
                value: type.id,
                period: type.checkPeriodInMonth 
            }))
        })

        const isEditMode = computed(() => editedIndex.value !== -1)

        const formTitle = computed(() => {
            return isEditMode.value ? 'ערוך בדיקה תקופתית' : 'בדיקה תקופתית חדשה'
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

        function editCheck(check) {
            editedIndex.value = 0 // For now, we'll handle this differently
            editedItem.value = {
                id: check.id,
                checkType: check.checkType || '',
                checkDate: check.checkDate || '',
                nextCheckDate: check.nextCheckDate || '',
                file: null,
                currentFileName: check.fileName || null,
                factoryId: check.factoryId || null
            }
            dialog.value = true
        }

        function closeDialog() {
            dialog.value = false
            editedIndex.value = -1
            editedItem.value = {
                id: null,
                checkType: '',
                checkDate: '',
                nextCheckDate: '',
                file: null,
                currentFileName: null,
                factoryId: null
            }
        }

        async function save() {
            loading.value = true
            const factoryId = userStore.selectedFactory.id
            
            try {
                // Validate required fields
                if (!editedItem.value.checkType) {
                    alert('סוג הבדיקה חובה')
                    return
                }
                
                if (!editedItem.value.checkDate) {
                    alert('תאריך הבדיקה חובה')
                    return
                }
                
                if (!editedItem.value.nextCheckDate) {
                    alert('תאריך הבדיקה הבאה חובה')
                    return
                }
                
                if (!isEditMode.value && !editedItem.value.file) {
                    alert('קובץ הבדיקה חובה')
                    return
                }

                // Create FormData for API call
                const formData = new FormData()
                formData.append('checkType', editedItem.value.checkType)
                formData.append('checkDate', editedItem.value.checkDate)
                formData.append('nextCheckDate', editedItem.value.nextCheckDate)
                formData.append('factoryId', factoryId)
                
                if (editedItem.value.file) {
                    formData.append('file', editedItem.value.file)
                }
                
                if (isEditMode.value) {
                    formData.append('id', editedItem.value.id)
                    // TODO: Call update routine check API
                    console.log('Update routine check:', formData)
                } else {
                    // TODO: Call add routine check API
                    console.log('Add routine check:', formData)
                }
                
                closeDialog()
                alert(isEditMode.value ? 'בדיקה עודכנה בהצלחה' : 'בדיקה נוספה בהצלחה')
                
            } catch (error) {
                console.error('Failed to save routine check:', error)
                alert('שגיאה בשמירת הבדיקה: ' + error.message)
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
            checkTypeOptions,
            openDialog,
            editCheck,
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
