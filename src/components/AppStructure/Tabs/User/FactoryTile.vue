<template>
  <v-card
    class="factory-tile mb-4"
    elevation="2"
    hover
    dir="rtl"
    :width="$vuetify.display.mdAndUp ? '800' : '98%'"
  >
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-avatar
          color="primary"
          size="40"
          class="me-3"
        >
          <v-icon color="white">mdi-factory</v-icon>
        </v-avatar>
        <div>
          <h3 class="text-h6 mb-1">{{ factory.name }}</h3>
          <p class="text-caption text-medium-emphasis mb-0">ח.פ.      {{ factory.hetpei }}</p>
        </div>
      </div>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            v-bind="props"
            size="small"
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
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
             <v-row>
         <v-col cols="7">
           <div class="mb-3">
             <div class="text-caption text-medium-emphasis mb-1">כתובת</div>
             <div class="text-body-2">{{ factory.address || 'לא צוין' }}</div>
           </div>
           
           <div class="mb-3">
             <div class="text-caption text-medium-emphasis mb-1">תאור המפעל</div>
             <div class="text-body-2">{{ factory.description || 'לא צוין' }}</div>
           </div>
         </v-col>
         
         <v-col cols="5">
           <div class="mb-3">
             <div class="text-caption text-medium-emphasis mb-1">מספר עובדים</div>
             <div class="text-body-2">{{ factory.employees || 'לא צוין' }}</div>
           </div>
           <div class="mb-3">
             <div class="text-caption text-medium-emphasis mb-1">שעות ממונה בחודש</div>
             <div class="text-body-2">{{ factory.memuneHours || 'לא צוין' }}</div>
           </div>
         </v-col>
       </v-row>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-factory"
        @click="$emit('view', factory)"
      >
        פעילות
      </v-btn>
      <v-btn
        color="primary"
        prepend-icon="mdi-pencil"
        @click="$emit('edit', factory)"
      >
        ערוך
      </v-btn>
    </v-card-actions>
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

/* RTL specific adjustments */
.factory-tile :deep(.v-card-title) {
  direction: rtl;
}

.factory-tile :deep(.v-card-text) {
  direction: rtl;
}

.factory-tile :deep(.v-card-actions) {
  direction: rtl;
}
</style>
