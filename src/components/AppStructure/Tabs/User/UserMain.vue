<template>
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1>המפעלים שלי</h1>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showAddFactoryDialog = true"
      >
        הוסף מפעל
      </v-btn>
    </div>
    
    <!-- Factory list -->
    <div v-if="userStore.factories && userStore.factories.length > 0" class="d-flex justify-center">
      <div class="d-flex flex-column align-center" style="width: 100%; max-width: none;">
        <FactoryTile
          v-for="factory in userStore.factories"
          :key="factory.hetpei"
          :factory="factory"
          @edit="editFactory"
          @delete="deleteFactory"
          @view="viewFactory"
        />
      </div>
    </div>
    
    <!-- Empty state -->
    <v-card v-else class="mt-4">
      <v-card-text class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-factory</v-icon>
        <h3 class="text-h6 mb-2">אין מפעלים</h3>
        <p class="text-body-2 text-medium-emphasis">עדיין לא הוספת מפעלים. לחץ על "הוסף מפעל" כדי להתחיל.</p>
      </v-card-text>
    </v-card>

    <!-- Add Factory Dialog -->
    <v-dialog
      v-model="showAddFactoryDialog"
      max-width="800"
      persistent
    >
      <v-card>
        <v-card-title class="popup-title d-flex align-center justify-space-between">
          הוסף מפעל חדש
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showAddFactoryDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <UpsertFactory 
            mode="add"
            @onClose="onFactoryAdded"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit Factory Dialog -->
    <v-dialog
      v-model="showEditFactoryDialog"
      max-width="800"
      persistent
    >
      <v-card>
        <v-card-title class="popup-title d-flex align-center justify-space-between">
          ערוך מפעל
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showEditFactoryDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <UpsertFactory 
            mode="update"
            :initial-data="selectedFactory"
            @onClose="onFactoryEdited"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UpsertFactory from './UpsertFactory.vue'
import FactoryTile from './FactoryTile.vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'UserMain',
  components: {
    UpsertFactory,
    FactoryTile
  },
  data: () => ({
    showAddFactoryDialog: false,
    showEditFactoryDialog: false,
    selectedFactory: null
  }),
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  async created() {
    await this.userStore.getFactories()
  },
  beforeRouteEnter(to, from, next) {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('user') || false
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      next('/regulations')
      return
    }
    
    next() // Allow access to component
  },
  methods: {
    editFactory(factory) {
      this.selectedFactory = factory
      this.showEditFactoryDialog = true
    },
    
    deleteFactory(factory) {
      // TODO: Implement delete functionality
      console.log('Delete factory:', factory)
    },
    
    viewFactory(factory) {
      // TODO: Implement view functionality
      console.log('View factory:', factory)
    },
    
    onFactoryAdded() {
      this.showAddFactoryDialog = false
      // Refresh factories list
      //this.userStore.getFactories()
    },
    
    onFactoryEdited() {
      this.showEditFactoryDialog = false
      this.selectedFactory = null
      // Refresh factories list
      //this.userStore.getFactories()
    }
  }
}
</script>