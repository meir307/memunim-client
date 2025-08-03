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
        <v-card-title class="text-h5 d-flex align-center">
          הוסף מפעל חדש
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showAddFactoryDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <AddFactory @factory-added="onFactoryAdded" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AddFactory from './AddFactory.vue'

export default {
  name: 'UserMain',
  components: {
    AddFactory
  },
  data: () => ({
    showAddFactoryDialog: false
  }),
  methods: {
    onFactoryAdded() {
      this.showAddFactoryDialog = false
      // TODO: Refresh factory list or show success message
      console.log('Factory added successfully')
    }
  }
}
</script>