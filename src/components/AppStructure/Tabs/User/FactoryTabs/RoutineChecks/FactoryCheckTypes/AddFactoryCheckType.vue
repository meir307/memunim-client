<template>
    <!-- Add Factory Check Type Dialog -->
    <v-dialog :model-value="showDialog" @update:model-value="$emit('close-dialog')" max-width="750px" persistent>
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                הוסף סוג פעילות שוטפת
                <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>
            <v-card-text>
                <FactoryCheckTypeTile
                    ref="tileRef"
                    :key="tileKey"
                    :check-type-name="''"
                    :check-period-in-month="0"
                    :id="0"
                    @save="handleSave"
                />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
import FactoryCheckTypeTile from './FactoryCheckTypeTile.vue'

export default {
    name: 'AddFactoryCheckType',
    components: {
        FactoryCheckTypeTile
    },
    props: {
        showDialog: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close-dialog'],
    setup(props, { emit }) {
        const routineCheckStore = useRoutineCheckStore()
        const tileKey = ref(0)
        const tileRef = ref(null)

        watch(() => props.showDialog, async (newVal) => {
            if (newVal) {
                tileKey.value++
                // Wait for the component to be rendered and then focus
                await nextTick()
                setTimeout(() => {
                    if (tileRef.value && tileRef.value.focusName) {
                        tileRef.value.focusName()
                    }
                }, 100)
            }
        })

        function closeDialog() {
            emit('close-dialog')
        }

        async function handleSave(data) {
            try {
                
                await routineCheckStore.AddNewFactoryCheckType(data)
                closeDialog()
            } catch (error) {
                console.error('Failed to add factory check type:', error)
                // Error message is already shown by the store
            }
        }

        return {
            tileKey,
            tileRef,
            closeDialog,
            handleSave
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
</style>

