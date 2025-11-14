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
                        item-title="title"
                        item-value="value"
                        label="סוג פעילות" 
                        required 
                        reverse
                        :rules="[v => !!v || 'סוג פעילות חובה']"
                    ></v-select>
                    
                    <v-textarea 
                        v-model="editedItem.remark" 
                        label="הערות" 
                        reverse
                        rows="4"
                        placeholder="הוסף הערות לגבי הפעילות..."
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
import { ref, computed, watch, toRaw, onMounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'
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
        const routineCheckStore = useRoutineCheckStore()

        const dialog = ref(false)
        const loading = ref(false)
        const editedItem = ref({
            checkType: '',
            remark: ''
        })

        const checkTypeOptions = ref([])

        async function loadCheckTypes() {
            try {
                const types = await routineCheckStore.getFactoryCheckTypes(userStore.selectedFactory.id)
                checkTypeOptions.value = types.map(type => ({
                    title: type.mame || type.name || '',
                    value: type.id,
                    period: type.checkPeriodInMonth 
                }))
            } catch (error) {
                console.error('Failed to load check types:', error)
                checkTypeOptions.value = []
            }
        }

        const formTitle = computed(() => {
            return 'הוסף סוג פעילות שוטפת'
        })

        // Watch for prop changes
        watch(() => props.showDialog, (newVal) => {
            dialog.value = newVal
            if (newVal) {
                loadCheckTypes()
            }
        })

        // Watch for dialog changes and emit to parent
        watch(dialog, (newVal) => {
            if (!newVal) {
                emit('close-dialog')
            }
        })

        function openDialog() {
            dialog.value = true
            loadCheckTypes()
        }

        onMounted(() => {
            loadCheckTypes()
        })

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
                    alert('סוג הפעילות חובה')
                    return
                }

                // Find the selected check type to get its name and period
                const selectedCheckType = checkTypeOptions.value.find(type => type.value === rawData.checkType)
                
                if (!selectedCheckType) {
                    alert('סוג הפעילות שנבחר לא נמצא')
                    return
                }

                // Create data object for API call
                const routineCheckTypeData = {
                    checkTypeId: rawData.checkType,
                    checkTypeName: selectedCheckType.title,        // ✅ Added from dropdown
                    checkPeriodInMonth: selectedCheckType.period,  // ✅ Added from dropdown
                    remark: rawData.remark || '',
                    factoryId: factoryId
                }
                
                // Call add routine check type API
                await routineCheckStore.addRoutineCheckType(routineCheckTypeData)
                
                closeDialog()
                
            } catch (error) {
                console.error('Failed to save routine check type:', error)
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

