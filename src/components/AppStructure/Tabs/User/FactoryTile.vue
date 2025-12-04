<template>
  <v-card
    class="factory-tile mb-4"
    elevation="2"
    hover
    dir="rtl"
    :width="$vuetify.display.mdAndUp ? '800' : '98%'"
  >
    <v-card-text class="pa-3">
      <div class="factory-content">
        <!-- Line 1: Name and Menu -->
        <div class="factory-line-1 d-flex align-center justify-space-between">
          <div class="d-flex align-center flex-grow-1">
            <v-avatar
              color="primary"
              size="32"
              class="me-2"
            >
              <v-icon color="white" size="18">mdi-factory</v-icon>
            </v-avatar>
            <h3 class="text-h6 mb-0 me-2 font-weight-bold">{{ factory.name }}</h3>
            <span class="text-caption text-medium-emphasis">ח.פ. {{ factory.hetpei }}</span>
          </div>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                v-bind="props"
                size="small"
                density="compact"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item
                prepend-icon="mdi-pencil"
                title="ערוך"
                @click="$emit('edit', factory)"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-delete"
                title="מחק"
                @click="$emit('delete', factory)"
              ></v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Line 2: Address and Description -->
        <div class="factory-line-2 text-body-2 text-medium-emphasis">
          <span v-if="factory.address" class="me-3">
            <v-icon size="14" class="me-1">mdi-map-marker</v-icon>{{ factory.address }}
          </span>
          <span v-if="factory.description" class="text-truncate d-inline-block" style="max-width: 400px;">
            {{ factory.description }}
          </span>
        </div>

        <!-- Line 3: Employees, Hours, and Actions -->
        <div class="factory-line-3 d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-3">
            <span v-if="factory.employees" class="text-body-2">
              <v-icon size="14" class="me-1">mdi-account-group</v-icon>{{ factory.employees }} עובדים
            </span>
            <span v-if="factory.memuneHours" class="text-body-2">
              <v-icon size="14" class="me-1">mdi-clock-outline</v-icon>{{ factory.memuneHours }} שעות ממונה
            </span>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-factory"
              size="small"
              @click="$emit('view', factory)"
            >
              פעילות
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-pencil"
              size="small"
              @click="$emit('edit', factory)"
            >
              ערוך
            </v-btn>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'FactoryTile',
  props: {
    factory: {
      type: Object,
      required: true,
      default: () => ({
        name: '',
        hetpei: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        memuneHours: ''
      })
    }
  },
  emits: ['edit', 'delete', 'view']
}
</script>

<style scoped>
.factory-tile {
  transition: all 0.3s ease;
}

.factory-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.factory-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.factory-line-1,
.factory-line-2,
.factory-line-3 {
  min-height: 32px;
  display: flex;
  align-items: center;
}

.factory-line-2 {
  flex-wrap: wrap;
  gap: 8px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

/* RTL specific adjustments */
.factory-tile :deep(.v-card-text) {
  direction: rtl;
  padding: 12px !important;
}

@media (max-width: 768px) {
  .factory-line-3 {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .factory-line-3 > div:last-child {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
