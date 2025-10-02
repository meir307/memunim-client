<template>
    <!-- Add Routine Check Type Dialog -->
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
                    
                    <v-textarea 
                        v-model="editedItem.remark" 
                        label="הערות" 
                        reverse
                        rows="4"
                        placeholder="הוסף הערות לגבי הבדיקה..."
                    ></v-textarea>
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
import { ref, computed, watch, toRaw } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useCommonStore } from '@/stores/CommonStore'
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'

export default {
    name: 'AddRoutineCheckTypeDialog',
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
        const routineCheckStore = useRoutineCheckStore()

        const dialog = ref(false)
        const loading = ref(false)
        const editedItem = ref({
            checkType: '',
            remark: ''
        })

        const checkTypeOptions = computed(() => {
            const types = commonStore.getRoutineCheckTypes
            return types.map(type => ({
                title: type.name,
                value: type.id,
                period: type.checkPeriodInMonth 
            }))
        })

        const formTitle = computed(() => {
            return 'הוסף סוג בדיקה תקופתית'
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

        function closeDialog() {
            dialog.value = false
            editedItem.value = {
                checkType: '',
                remark: ''
            }
        }

        async function save() {
            loading.value = true
            const factoryId = userStore.selectedFactory.id
            
            try {
                // Get raw data to avoid proxy issues
                const rawData = toRaw(editedItem.value)
                
                // Validate required fields
                if (!rawData.checkType) {
                    alert('סוג הבדיקה חובה')
                    return
                }

                // Create FormData for API call
                const formData = new FormData()
                formData.append('checkType', rawData.checkType)
                formData.append('remark', rawData.remark || '')
                formData.append('factoryId', factoryId)
                
                // Call add routine check type API
                await routineCheckStore.addRoutineCheckType(formData)
                
                closeDialog()
                alert('סוג בדיקה נוסף בהצלחה')
                
            } catch (error) {
                console.error('Failed to save routine check type:', error)
                alert('שגיאה בשמירת סוג הבדיקה: ' + error.message)
            } finally {
                loading.value = false
            }
        }

        // Return all the reactive data and functions
        return {
            dialog,
            loading,
            editedItem,
            formTitle,
            checkTypeOptions,
            openDialog,
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
</style>
