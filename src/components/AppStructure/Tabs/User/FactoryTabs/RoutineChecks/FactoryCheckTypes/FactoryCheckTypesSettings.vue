<template>
    <!-- Factory Check Types Settings Dialog -->
    <v-dialog :model-value="isDialogOpen" @update:model-value="$emit('close-dialog')" max-width="800px" persistent>
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                 הגדרות פעילות שוטפת יחודית עבור {{ userStore.selectedFactory.name }}
                <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>
            <v-card-text>
                <div class="settings-content">
                    <div v-if="factoryCheckTypes.length === 0" class="no-data">
                        אין סוגי פעילות שוטפת יחודיים עבור {{ userStore.selectedFactory.name }}
                    </div>
                    <div v-else>
                        <FactoryCheckTypeTile
                            v-for="checkType in factoryCheckTypes"
                            :key="checkType.id"
                            :check-type-name="checkType.mame"
                            :check-period-in-month="checkType.checkPeriodInMonth"
                            :id="checkType.id"
                            @save="handleSave"
                            @delete="handleDelete"
                        />
                    </div>
                </div>
                <div class="popup-btn-row">
                    <v-btn @click="handleAdd" color="primary">הוסף</v-btn>
                    <v-btn @click="closeDialog">סגור</v-btn>
                    <v-spacer></v-spacer>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Add Factory Check Type Dialog -->
    <AddFactoryCheckType
        :show-dialog="showAddDialog"
        @close-dialog="closeAddDialog"
    />
</template>

<script>
import { watch, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
import { useUserStore } from '@/stores/UserStore'
import FactoryCheckTypeTile from './FactoryCheckTypeTile.vue'
import AddFactoryCheckType from './AddFactoryCheckType.vue'

export default {
    name: 'FactoryCheckTypesSettings',
    components: {
        FactoryCheckTypeTile,
        AddFactoryCheckType
    },
    props: {
        showDialog: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close-dialog', 'refresh-parent'],
    setup(props, { emit }) {
        const routineCheckStore = useRoutineCheckStore()
        const userStore = useUserStore()
        const { factoryCheckTypes: storeFactoryCheckTypes } = storeToRefs(routineCheckStore)
        const showAddDialog = ref(false)

        const factoryCheckTypes = computed(() => {
            const types = storeFactoryCheckTypes.value || []
            if (!Array.isArray(types)) return []
            return types
                .filter(type => type && type.id != null && type.id !== undefined && type.factoryId != null)
                .map(type => ({
                    ...type,
                    id: Number(type.id),
                    checkPeriodInMonth: Number(type.checkPeriodInMonth) || 0,
                    mame: type.mame || type.name || ''
                }))
        })

        const isDialogOpen = computed(() => props.showDialog)

        // Watch for prop changes to trigger onCreate when dialog opens
        watch(() => props.showDialog, (newVal) => {
            console.log('showDialog prop changed:', newVal)
            if (newVal) {
                onCreate()
            }
        })

        function closeDialog() {
            emit('close-dialog')
            // Emit event to notify parent to refresh
            emit('refresh-parent')
        }

        async function onCreate() {
            if (!userStore.selectedFactory) {
                console.error('No factory selected')
                return
            }
            const factoryId = userStore.selectedFactory.id
            // Fetch routine check types from store
            await routineCheckStore.getFactoryCheckTypes(factoryId)
        }

        async function handleSave() {
            alert(5)
            // Refresh the list after save
            if (userStore.selectedFactory) {
                await routineCheckStore.getFactoryCheckTypes(userStore.selectedFactory.id)
            }
        }

        async function handleDelete(data) {
            const checkType = factoryCheckTypes.value.find(type => type.id === data.id)
            const checkTypeName = checkType?.mame || 'זה'
            const confirmed = confirm(`האם למחוק את סוג הפעילות "${checkTypeName}"?`)
            if (!confirmed) return

            try {
                await routineCheckStore.DeleteFactoryCheckType(data.id)
                // List will be refreshed automatically by the store method
            } catch (error) {
                console.error('Failed to delete factory check type:', error)
                // Error message is already shown by the store
            }
        }

        function handleAdd() {
            showAddDialog.value = true
        }

        function closeAddDialog() {
            showAddDialog.value = false
            // Refresh the list when dialog closes (in case a new item was added)
            onCreate()
        }

        return {
            isDialogOpen,
            showAddDialog,
            userStore,
            closeDialog,
            closeAddDialog,
            onCreate,
            factoryCheckTypes,
            handleSave,
            handleDelete,
            handleAdd
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

.settings-content {
    padding: 16px 0;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
}

.settings-content > * {
    margin-bottom: 0;
}

.no-data {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
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

