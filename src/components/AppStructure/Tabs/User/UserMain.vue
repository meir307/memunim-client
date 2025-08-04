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
    
    <!-- Factory list will go here -->
    <v-card class="mt-4">
      <v-card-text>
        <p>רשימת המפעלים תוצג כאן</p>
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
            @onClose="showAddFactoryDialog = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UpsertFactory from './UpsertFactory.vue'

export default {
  name: 'UserMain',
  components: {
    UpsertFactory
  },
  data: () => ({
    showAddFactoryDialog: false
  }),
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
    // Methods can be added here when needed
  }
}
</script>