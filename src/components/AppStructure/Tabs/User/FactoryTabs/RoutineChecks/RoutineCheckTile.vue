<template>
  <div>
    <v-card class="routine-check-tile" elevation="2" style="width: 100%;">
      <v-card-text>
        <div class="tile-content">
          <div class="info-column">
            <h3 class="check-type-name">{{ checkType.checkTypeName }}</h3>
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
                <v-list-item @click="editCheck">
                  <v-list-item-title>
                    עדכן בדיקה
                    <v-icon left> mdi-pencil</v-icon>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="showHistory">
                  <v-list-item-title>
                    הצג הסטוריה
                    <v-icon left>  mdi-history</v-icon>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteCheck">
                  <v-list-item-title>
                    מחק
                    <v-icon left>mdi-delete</v-icon>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
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
    />
  </div>
</template>

<script>
import { ref, watch } from 'vue'
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
  emits: ['add-check', 'edit-check', 'delete-check'],
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
      return date.toLocaleDateString('he-IL')
    }

    function addCheck() {
      emit('add-check', props)
    }

    function editCheck() {
      emit('edit-check', props)
    }

    function showHistory() {
      showHistoryDialog.value = true
    }

    function closeHistoryDialog() {
      showHistoryDialog.value = false
    }

    function deleteCheck() {
      emit('delete-check', props)
    }

    function saveRemark() {
      // Handle save logic internally
      routineCheckStore.updateRoutineCheckType(props.id, { remark: localRemark.value })
    }

    return {
      showHistoryDialog,
      localRemark,
      formatDate,
      addCheck,
      editCheck,
      showHistory,
      closeHistoryDialog,
      deleteCheck,
      saveRemark
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

.check-type-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-column {
  display: flex;
  justify-content: center;
  align-items: center;
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
  font-size: 0.9rem;
}

.info-value {
  color: #666;
  font-weight: 400;
  font-size: 0.9rem;
}

.remark-section {
  width: 100%;
  margin-top: 1px;
  padding-top: 1px;
  border-top: 0px solid #e0e0e0;
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

/* Responsive design */
@media (max-width: 768px) {
  .tile-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .info-column {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .menu-column {
    align-self: flex-end;
  }

  .info-label {
    min-width: auto;
  }
}
</style>
