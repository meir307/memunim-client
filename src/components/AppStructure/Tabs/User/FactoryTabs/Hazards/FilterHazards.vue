<template>
  <v-card>
    <v-card-title class="popup-title d-flex align-center justify-space-between">
      סינון מפגעים
      <v-btn 
        icon="mdi-close" 
        variant="text" 
        @click="$emit('close')"
      ></v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-form>
        <!-- Severity Filter - Checkboxes -->
        <div class="filter-section">
          <h3 class="filter-section-title">רמת חומרה</h3>
          <div class="checkbox-group">
            <div 
              v-for="severity in severityOptions"
              :key="severity.value"
              class="checkbox-wrapper"
            >
              <label class="checkbox-label">{{ severity.title }}</label>
              <v-checkbox
                v-model="selectedSeverities"
                :value="severity.value"
                hide-details
                density="comfortable"
                color="primary"
                class="checkbox-input"
              ></v-checkbox>
            </div>
          </div>
        </div>

        <!-- Area Filter - Multiselect -->
        <div class="filter-section">
          <h3 class="filter-section-title">אזור</h3>
          <v-select
            v-model="selectedAreas"
            :items="areaOptions"
            item-title="title"
            item-value="value"
            label="בחר אזורים"
            multiple
            chips
            closable-chips
            variant="outlined"
            density="comfortable"
            reverse
            no-data-text="לא הוגדרו אזורים"
          ></v-select>
        </div>

        <!-- Status Filter - Checkboxes -->
        <div class="filter-section">
          <h3 class="filter-section-title">סטטוס</h3>
          <div class="checkbox-group">
            <div 
              v-for="status in statusOptions"
              :key="status.value"
              class="checkbox-wrapper"
            >
              <label class="checkbox-label">{{ status.title }}</label>
              <v-checkbox
                v-model="selectedStatuses"
                :value="status.value"
                hide-details
                density="comfortable"
                color="primary"
                class="checkbox-input"
              ></v-checkbox>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="popup-btn-row">
          <v-btn 
            color="primary" 
            @click="applyFilters"
            :disabled="!isFormValid"
          >
            החל סינון
          </v-btn>
          <v-btn 
            variant="outlined" 
            @click="resetFilters"
          >
            איפוס
          </v-btn>
          <v-spacer></v-spacer>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'FilterHazards',
  props: {
    filterObject: {
      type: Object,
      required: true,
      default: () => ({
        severities: [1, 2, 3],
        areas: [],
        statuses: [0] // 0 = open, 1 = closed
      })
    }
  },
  emits: ['close', 'apply-filters'],
  setup(props, { emit }) {
    const userStore = useUserStore()

    // Severity options
    const severityOptions = [
      { title: 'נמוכה', value: 1 },
      { title: 'בינונית', value: 2 },
      { title: 'גבוהה', value: 3 }
    ]

    // Status options
    const statusOptions = [
      { title: 'פתוח', value: 0 }, // 0 = open
      { title: 'סגור', value: 1 }  // 1 = closed
    ]

    // Initialize from filterObject prop
    const selectedSeverities = ref([...props.filterObject.severities])
    const selectedAreas = ref([...props.filterObject.areas])
    const selectedStatuses = ref([...props.filterObject.statuses])

    // Area options from factory
    const areaOptions = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.areas) {
        return []
      }
      
      try {
        const parsed = JSON.parse(factory.areas)
        if (!Array.isArray(parsed)) {
          return []
        }
        return parsed.map(area => ({
          title: area.name || '',
          value: area.id
        }))
      } catch (e) {
        console.error('Error parsing areas:', e)
        return []
      }
    })

    // Watch filterObject prop to update local values when it changes
    watch(() => props.filterObject, (newFilter) => {
      if (newFilter) {
        selectedSeverities.value = [...newFilter.severities]
        selectedAreas.value = [...newFilter.areas]
        selectedStatuses.value = [...newFilter.statuses]
      }
    }, { deep: true, immediate: true })
    
    // Watch areaOptions and update selectedAreas if filterObject has areas
    watch(areaOptions, (newOptions) => {
      if (newOptions.length > 0 && selectedAreas.value.length === 0 && props.filterObject.areas.length === 0) {
        selectedAreas.value = newOptions.map(area => area.value)
      }
    }, { immediate: true })

    function applyFilters() {
      const filters = {
        severities: [...selectedSeverities.value],
        areas: [...selectedAreas.value],
        statuses: [...selectedStatuses.value]
      }
      emit('apply-filters', filters)
    }

    function resetFilters() {
      // Reset to default values
      selectedSeverities.value = [1, 2, 3]
      selectedAreas.value = areaOptions.value.map(area => area.value)
      selectedStatuses.value = [0] // 0 = open
      applyFilters()
    }

    // Check if form is valid (at least one severity and one status must be selected)
    const isFormValid = computed(() => {
      return selectedSeverities.value.length > 0 && selectedStatuses.value.length > 0
    })

    return {
      severityOptions,
      statusOptions,
      selectedSeverities,
      selectedAreas,
      selectedStatuses,
      areaOptions,
      applyFilters,
      resetFilters,
      isFormValid
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


.filter-section {
  margin-bottom: 24px;
}

.filter-section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.checkbox-group {
  display: flex;
  flex-direction: row;
  gap: 16px;
  flex-wrap: nowrap;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  gap: 0;
}

.checkbox-label {
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input :deep(.v-label) {
  display: none !important;
}
</style>

