<template>
    <div class="factory-check-type-tile">
        <div class="tile-content">
            <span class="label">שם</span>
            <v-text-field
                ref="nameInputRef"
                v-model="localCheckTypeName"
                density="compact"
                variant="outlined"
                required
                :rules="[v => !!v || 'שם חובה']"
                hide-details="auto"
                class="name-input"
            ></v-text-field>
            
            <span class="label">תדירות (חודשים)</span>
            <v-text-field
                v-model.number="localCheckPeriodInMonth"
                type="number"
                min="0"
                max="36"
                density="compact"
                variant="outlined"
                hide-details
                class="period-input"
            ></v-text-field>
            
            <v-btn color="primary" size="small" @click="handleSave">שמור</v-btn>
            <v-btn v-if="showDeleteButton" icon="mdi-delete" size="small" variant="text" color="error" @click="handleDelete"></v-btn>
        </div>
    </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'

export default {
    name: 'FactoryCheckTypeTile',
    props: {
        checkTypeName: {
            type: String,
            required: true
        },
        checkPeriodInMonth: {
            type: Number,
            required: true
        },
        id: {
            type: Number,
            required: true
        }
    },
    emits: ['save', 'delete'],
    setup(props, { emit }) {
        const routineCheckStore = useRoutineCheckStore()
        const localCheckTypeName = ref(props.checkTypeName)
        const localCheckPeriodInMonth = ref(props.checkPeriodInMonth || 12)
        const showDeleteButton = computed(() => props.id !== 0)
        const nameInputRef = ref(null)
        // Update local values when props change
        watch(() => props.checkTypeName, (newVal) => {
            localCheckTypeName.value = newVal
        })

        watch(() => props.checkPeriodInMonth, (newVal) => {
            localCheckPeriodInMonth.value = newVal || 12
        })

        // Prevent negative values and set default to 12
        watch(localCheckPeriodInMonth, (newVal) => {
            if (newVal < 0 || newVal === 0 || !newVal) {
                localCheckPeriodInMonth.value = 12
            }
        })

        async function handleSave() {
            if (!localCheckTypeName.value || localCheckTypeName.value.trim() === '') {
                alert('שם הפעילות הוא שדה חובה.')
                return
            }

            // If id is 0, emit save event for parent to handle (for adding new)
            if (props.id === 0) {
                emit('save', {
                    id: props.id,
                    checkTypeName: localCheckTypeName.value,
                    checkPeriodInMonth: localCheckPeriodInMonth.value
                })
                return
            }

            // Otherwise, update existing
            try {
                await routineCheckStore.updateFactoryCheckType({
                    id: props.id,
                    checkTypeName: localCheckTypeName.value,
                    checkPeriodInMonth: localCheckPeriodInMonth.value
                })
                // List will be refreshed automatically by the store method
            } catch (error) {
                console.error('Failed to update factory check type:', error)
                // Error message is already shown by the store
            }
        }

        function handleDelete() {
            emit('delete', {
                id: props.id
            })
        }

        function focusName() {
            if (nameInputRef.value && nameInputRef.value.$el) {
                const input = nameInputRef.value.$el.querySelector('input')
                if (input) {
                    input.focus()
                }
            }
        }

        return {
            localCheckTypeName,
            localCheckPeriodInMonth,
            showDeleteButton,
            nameInputRef,
            handleSave,
            handleDelete,
            focusName
        }
    }
}
</script>

<style scoped>
.factory-check-type-tile {
    padding: 12px;
    margin-bottom: 0;
    background-color: #fff;
}

.tile-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
}

.label {
    font-weight: 500;
    white-space: nowrap;
    min-width: fit-content;
}

.name-input {
    flex: 1;
    min-width: 250px;
}

.period-input {
    width: 100px;
    max-width: 70px;
}


@media (max-width: 768px) {
    .tile-content {
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .name-input {
        min-width: 100%;
    }
}
</style>

