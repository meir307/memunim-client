<template>
  <div class="pa-4">
    <div class="sticky-header d-flex align-center justify-space-between mb-4">
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
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
import { useHazardStore } from '@/stores/HazardStore'
import { useSafetyProceduresStore } from '@/stores/SafetyProceduresStore'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'

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
    // Reset all factory-related stores when entering UserMain
    const routineCheckStore = useRoutineCheckStore()
    routineCheckStore.reset()
    
    const hazardStore = useHazardStore()
    hazardStore.reset()
    
    const safetyProceduresStore = useSafetyProceduresStore()
    safetyProceduresStore.reset()
    
    const safetyCommitteeStore = useSafetyCommitteeStore()
    safetyCommitteeStore.reset()
    
    await this.userStore.getFactories()
    
    // If user role is 2, automatically view the first factory
    if (this.userStore.user.role === 2 && this.userStore.factories && this.userStore.factories.length > 0) {
      this.viewFactory(this.userStore.factories[0])
    }
  },
  beforeRouteEnter(to, from, next) {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('user') || false
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      next('/about')
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
      // Set selected factory in store
      const userStore = useUserStore()
      userStore.selectedFactory = factory

      // Navigate to FactoryMain
      this.$router.push({
        name: 'FactoryMain'
      })
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

