<template>
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
              <v-list-item @click="editCheck">
                <v-list-item-title>
                  <v-icon left>mdi-pencil</v-icon>
                  ערוך
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteCheck">
                <v-list-item-title>
                  <v-icon left>mdi-delete</v-icon>
                  מחק
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>


export default {
  name: 'RoutineCheckTile',
  props: {
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
    }
  },
  emits: ['edit-check', 'delete-check'],
  setup(props, { emit }) {
    function formatDate(dateString) {
      if (!dateString) return 'לא נקבע'
      const date = new Date(dateString)
      return date.toLocaleDateString('he-IL')
    }

    function editCheck() {
      emit('edit-check', props)
    }

    function deleteCheck() {
      emit('delete-check', props)
    }

    return {
      formatDate,
      editCheck,
      deleteCheck
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
