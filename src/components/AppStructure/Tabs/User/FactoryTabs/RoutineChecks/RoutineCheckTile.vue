<template>
  <div>
    <v-card class="routine-check-tile" :class="tileBackgroundClass" elevation="2" style="width: 100%;">
      <v-card-text>
        <div class="tile-content">
          <div class="title-menu-row">
            <div class="info-column title-column">
              <h2 class="check-type-name">{{ checkType.checkTypeName }}</h2>
            </div>
            <div class="info-column menu-column">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props"
                  class="menu-btn"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item @click="addCheck">
                  <v-list-item-title>
                    הוסף בדיקה חדשה
                    <v-icon left> mdi-plus</v-icon>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="showHistory">
                  <v-list-item-title>
                    הצג הסטוריה
                    <v-icon left>  mdi-history</v-icon>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteCheckType">
                  <v-list-item-title>
                    מחק
                    <v-icon left>mdi-delete</v-icon>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          </div>

          <div class="info-column">
            <v-icon class="info-icon">mdi-calendar</v-icon>
            <span class="info-label">תאריך בדיקה:</span>
            <span class="info-value">{{ formatDate(checkDate) }}</span>
          </div>

          <div class="info-column">
            <v-icon class="info-icon">mdi-calendar-clock</v-icon>
            <span class="info-label">תאריך בדיקה הבאה:</span>
            <span class="info-value">{{ formatDate(nextCheckDate) }}</span>
          </div>

          <div class="info-column">
            <v-icon class="info-icon">mdi-clock-outline</v-icon>
            <span class="info-label">תדירות (חודשים):</span>
            <span class="info-value">{{ checkPeriodInMonth }}</span>
          </div>
        </div>
        
        <div class="remark-section">
          <div class="remark-container">
            <v-btn
              @click="saveRemark"
              color="primary"
              size="small"
              class="save-btn"
            >
              <v-icon left>mdi-check</v-icon>
              שמור
            </v-btn>
            <v-textarea
              v-model="localRemark"
              placeholder="הזן הערה..."
              rows="1"
              variant="outlined"
              density="compact"
              class="remark-input"
            ></v-textarea>
          </div>
          <div class="day-left-container">
            <span class="day-left-text">ימים שנותרו:</span>
            <span v-if="daysRemaining !== null" class="day-left-value" :class="daysRemainingClass">{{ daysRemainingText }}</span>
            <span v-else class="day-left-value">-</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- History Checks Dialog -->
    <HistoryChecks 
      :showDialog="showHistoryDialog"
      :checkTypeId="checkType.checkTypeId"
      :checkTypeName="checkType.checkTypeName"
      :id="checkType.id"
      @close-history="closeHistoryDialog"
      @check-deleted="handleCheckDeleted"
    />
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
import HistoryChecks from './HistoryChecks.vue'

export default {
  name: 'RoutineCheckTile',
  components: {
    HistoryChecks
  },
  props: {
    id: {
      type: String,
      required: true
    },
    checkType: {
      type: Object,
      required: true
    },
    checkDate: {
      type: String,
      required: true
    },
    checkPeriodInMonth: {
      type: Number,
      required: true
    },
    nextCheckDate: {
      type: String,
      required: true
    },
    remark: {
      type: String,
      required: false
    }
  },
  emits: ['add-check', 'delete-check-type', 'refresh-tiles'],
  setup(props, { emit }) {
    const routineCheckStore = useRoutineCheckStore()
    
    // History dialog state
    const showHistoryDialog = ref(false)
    
    // Create a local reactive copy of the remark
    const localRemark = ref(props.checkType.remark || '')
    
    // Watch for changes in the prop and update local copy
    watch(() => props.checkType.remark, (newRemark) => {
      localRemark.value = newRemark || ''
    })
    
    function formatDate(dateString) {
      if (!dateString) return 'לא נקבע'
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    function addCheck() {
      emit('add-check', props)
    }


    function showHistory() {
      showHistoryDialog.value = true
    }

    function closeHistoryDialog() {
      showHistoryDialog.value = false
    }

    function handleCheckDeleted() {
      emit('refresh-tiles')
    }

    function deleteCheckType() {
      // Prevent deletion if check date is not set
      if (props.checkDate !='') {
        alert('לא ניתן למחוק סוג בדיקה שמקושרות לו בדיקות')
        return
      }
      
     emit('delete-check-type', props.id)
     
    }

    function saveRemark() {
      // Handle save logic internally
      routineCheckStore.updateRoutineCheckType(props.id, { remark: localRemark.value })
    }

    // Calculate days remaining until next check
    const daysRemaining = computed(() => {
      if (!props.nextCheckDate || props.nextCheckDate === '' || props.nextCheckDate === 'לא נקבע') {
        return null
      }
      const nextDate = new Date(props.nextCheckDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      nextDate.setHours(0, 0, 0, 0)
      const diffTime = nextDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    })

    const daysRemainingText = computed(() => {
      if (daysRemaining.value === null) return ''
      if (daysRemaining.value === 0) return 'היום'
      if (daysRemaining.value === 1) return 'מחר'
      if (daysRemaining.value === -1) return 'אתמול'
      if (daysRemaining.value > 0) {
        return `${daysRemaining.value} ימים`
      }
      return `${Math.abs(daysRemaining.value)} ימים באיחור`
    })

    const daysRemainingClass = computed(() => {
      if (daysRemaining.value === null) return ''
      if (daysRemaining.value < 0) return 'overdue'
      if (daysRemaining.value <= 7) return 'soon'
      return 'normal'
    })

    const tileBackgroundClass = computed(() => {
      if (daysRemaining.value === null) return ''
      if (daysRemaining.value < 21) return 'tile-bg-red'
      if (daysRemaining.value < 42) return 'tile-bg-yellow'
      return 'tile-bg-green'
    })

    return {
      showHistoryDialog,
      localRemark,
      formatDate,
      addCheck,
      showHistory,
      closeHistoryDialog,
      handleCheckDeleted,
      deleteCheckType,
      saveRemark,
      daysRemaining,
      daysRemainingText,
      daysRemainingClass,
      tileBackgroundClass
    }
  }
}
</script>

<style scoped>
.routine-check-tile {
  margin-bottom: 8px;
  border-radius: 4px;
  transition: box-shadow 0.2s ease;
  border: 1px solid #e0e0e0;
  width: 100%;
  min-width: 100%;
  flex: 1;
}

.routine-check-tile:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-color: #1976d2;
}

.tile-bg-red {
  border-color: #ff9aa9 !important;
  border-width: 0px;
  background-color: #ff9aa9 !important;
}

.tile-bg-yellow {
  background-color: #fff9e6 !important;
}

.tile-bg-green {
  background-color: #e8f5e9 !important;
}

.check-type-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #06488a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-menu-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex: 1;
}

.menu-column {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.title-column {
  flex: 1;
  min-width: 0;
}

.menu-btn {
  color: #666;
  flex-shrink: 0;
  min-width: 40px;
}

.tile-content {
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: center;
  justify-content: space-between;
}

.info-column {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.info-icon {
  color: #666;
  font-size: 16px;
  min-width: 20px;
}

.info-label {
  font-weight: 500;
  color: #333;
  min-width: 100px;
  font-size: 1rem;
}

.info-value {
  color: #666;
  font-weight: 600;
  font-size: 1.1rem;
}

.days-remaining {
  font-weight: 500;
  font-size: 0.85rem;
  display: flex;
  align-items: left;
  padding-right: 8px;
  flex-shrink: 0;
}

.days-remaining.overdue {
  font-weight: 400;
}

.days-remaining.soon {
  font-weight: 400;
}

.days-remaining.normal {
  font-weight: 400;
}

.remark-section {
  width: 100%;
  margin-top: 1px;
  padding-top: 1px;
  border-top: 0px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.remark-container {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.save-btn {
  flex-shrink: 0;
  align-self: center;
  margin-top: 0px;
}

.remark-input {
  width: 400px !important;
  max-width: 400px;
  min-width: 400px;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
  margin-top: 14px;
}

.day-left-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.day-left-text {
  font-size: 1rem;
  color: #666;
}

.day-left-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.day-left-value.overdue {
  font-weight: 400;
}

.day-left-value.soon {
  font-weight: 400;
}

.day-left-value.normal {
  font-weight: 400;
}

/* Responsive design */
@media (max-width: 768px) {
  .tile-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .title-menu-row {
    width: 100%;
    order: -1;
    flex-direction: row;
    justify-content: space-between;
  }

  .info-column {
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .title-column {
    flex: 1;
  }

  .info-label {
    min-width: auto;
  }

  .remark-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .remark-container {
    width: 100%;
  }

  .day-left-container {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
