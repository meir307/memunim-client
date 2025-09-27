<template>
    <div>
      <v-card class="modern-card">
        <v-card-title class="modern-title">
          <div class="title-container">
            <h2 class="title-text">בדיקות תקופתיות</h2>
            <v-btn color="primary" @click="openDialog" class="add-btn">
              <v-icon left>mdi-plus</v-icon>
              הוסף בדיקה תקופתית
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pa-0">
          <!-- Content will go here -->
        </v-card-text>
      </v-card>

      <!-- Routine Check Dialog Component -->
      <UpsertRoutineCheckDialog 
        ref="routineCheckDialog"
        :show-dialog="showDialog" 
        @close-dialog="closeDialog" 
      />
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import UpsertRoutineCheckDialog from './UpsertRoutineCheckDialog.vue'
  
  export default {
    name: 'RoutineChecksMain',
    components: {
      UpsertRoutineCheckDialog
    },
    setup() {
      const showDialog = ref(false)
      const routineCheckDialog = ref(null)

      function openDialog() {
        console.log('Opening dialog to add new routine check')
        showDialog.value = true
      }

      function closeDialog() {
        showDialog.value = false
      }

      return {
        showDialog,
        routineCheckDialog,
        openDialog,
        closeDialog
      }
    }
  }
  </script>

  <style scoped>
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }


  .add-btn {
    margin-left: 16px;
  }
  </style> 