<template>
    <!-- Factory Check Types Settings Dialog -->
    <v-dialog 
        :model-value="isDialogOpen" 
        @update:model-value="$emit('close-dialog')" 
        max-width="800px" 
        persistent 
        content-class="factory-check-types-dialog-content"
    >
        <v-card class="factory-check-types-card">
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                 הגדרות פעילות שוטפת יחודית עבור {{ userStore.selectedFactory.name }}
                <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>
            <v-card-text style="flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; padding: 0;">
                <div class="settings-content">
                    <div v-if="factoryCheckTypes.length === 0" class="no-data">
                        אין סוגי פעילות שוטפת יחודיים עבור {{ userStore.selectedFactory.name }}
                    </div>
                    <div v-else class="table-wrapper">
                        <v-data-table
                            :headers="headers"
                            :items="factoryCheckTypes"
                            :items-per-page="-1"
                            class="modern-table"
                            no-data-text="אין סוגי פעילות שוטפת יחודיים"
                            loading-text="טוען נתונים..."
                            hide-default-footer
                        >
                            <template #item="{ item, columns }">
                                <tr>
                                    <td v-for="column in columns" :key="column.key">
                                        <span v-if="column.key === 'mame'">{{ item.mame || item.name }}</span>
                                        <span v-else-if="column.key === 'checkPeriodInMonth'">{{ item.checkPeriodInMonth }}</span>
                                        <span v-else-if="column.key === 'actions'">
                                            <v-btn icon size="small" @click="editCheckType(item)" color="primary" class="action-btn">
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn icon size="small" @click="handleDelete({ id: item.id })" color="error" class="action-btn">
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </span>
                                        <span v-else>{{ item[column.key] }}</span>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
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

    <!-- Edit Factory Check Type Dialog -->
    <v-dialog v-model="showEditDialog" max-width="750px" persistent>
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                ערוך סוג פעילות שוטפת
                <v-btn icon="mdi-close" variant="text" @click="closeEditDialog"></v-btn>
            </v-card-title>
            <v-card-text>
                <FactoryCheckTypeTile
                    v-if="editingItem"
                    :key="editingItem.id"
                    :check-type-name="editingItem.mame || editingItem.name"
                    :check-period-in-month="editingItem.checkPeriodInMonth"
                    :id="editingItem.id"
                    @save="(data) => { handleSave(data); closeEditDialog(); }"
                />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { watch, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
import { useUserStore } from '@/stores/UserStore'
import FactoryCheckTypeTile from './FactoryCheckTypeTile.vue'
import AddFactoryCheckType from './AddFactoryCheckType.vue'
import '@/assets/DataTable.css'

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
        const showEditDialog = ref(false)
        const editingItem = ref(null)

        const headers = [
            { title: 'שם', key: 'mame', sortable: true, width: '250px' },
            { title: 'תדירות (חודשים)', key: 'checkPeriodInMonth', sortable: true, width: '150px' },
            { title: '', key: 'actions', sortable: false, align: 'center', width: '120px' }
        ]

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

        async function handleSave(data) {
            if (data.id === 0) {
                // This is for new items, handled by AddFactoryCheckType
                return
            }
            
            try {
                await routineCheckStore.updateFactoryCheckType({
                    id: data.id,
                    checkTypeName: data.checkTypeName,
                    checkPeriodInMonth: data.checkPeriodInMonth
                })
                // Refresh the list after save
                if (userStore.selectedFactory) {
                    await routineCheckStore.getFactoryCheckTypes(userStore.selectedFactory.id)
                }
            } catch (error) {
                console.error('Failed to update factory check type:', error)
            }
        }

        function editCheckType(item) {
            editingItem.value = item
            showEditDialog.value = true
        }

        function closeEditDialog() {
            showEditDialog.value = false
            editingItem.value = null
            onCreate() // Refresh list after edit
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
            showEditDialog,
            editingItem,
            headers,
            userStore,
            closeDialog,
            closeAddDialog,
            onCreate,
            factoryCheckTypes,
            handleSave,
            handleDelete,
            handleAdd,
            editCheckType,
            closeEditDialog
        }
    }
}
</script>

<style scoped>
/* Global styles for dialog - not scoped */
.popup-title {
    padding: 0;
    margin: 0;
    padding-right: 12px;
    margin-bottom: 0;
    background-color: rgb(138, 200, 224);
    text-align: right;
    border-color: black;
    border-width: 2px;
}

.settings-content {
    padding: 0;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.table-wrapper {
    width: 100%;
    min-height: 0;
    display: block;
}

.table-wrapper :deep(.v-data-table) {
    width: 100%;
    display: block;
    padding: 5px !important;
}

.table-wrapper :deep(.v-data-table__wrapper) {
    overflow: visible !important;
    padding: 0 !important;
}

:deep(.v-card-text) {
    padding: 0 !important;
}

.table-wrapper :deep(.v-data-table__wrapper table) {
    padding: 0 !important;
}

.table-wrapper :deep(.v-data-table__wrapper table thead) {
    padding: 0 !important;
}

.table-wrapper :deep(.v-data-table__wrapper table tbody) {
    padding: 0 !important;
}

.table-wrapper :deep(.v-data-table__wrapper table th) {
    padding: 8px 12px !important;
}

.table-wrapper :deep(.v-data-table__wrapper table td) {
    padding: 8px 12px !important;
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
    flex-shrink: 0;
}

.factory-check-types-card {
    height: 800px !important;
    max-height: 800px !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
}
</style>

<style>
/* Global styles for dialog content - must not be scoped */
.factory-check-types-dialog-content {
    max-height: 600px !important;
    height: 600px !important;
}

.factory-check-types-dialog-content .v-card {
    height: 800px !important;
    max-height: 800px !important;
}
</style>

