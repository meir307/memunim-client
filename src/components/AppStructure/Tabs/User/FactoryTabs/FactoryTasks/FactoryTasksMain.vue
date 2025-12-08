<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">משימות</h2>
          <v-spacer></v-spacer>
          <v-btn v-if="userStore.user.role === 1" color="primary" @click="openDialog" class="add-btn">
            <v-icon left>mdi-note-plus</v-icon>
            הוסף פתקית
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <YellowNotes ref="yellowNotesRef" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import YellowNotes from './YellowNotes.vue'

const userStore = useUserStore()

const yellowNotesRef = ref(null)

function openDialog() {
  if (yellowNotesRef.value) {
    yellowNotesRef.value.openDialog()
  }
}
</script>

<style scoped>
.title-container {
  display: flex !important;
  align-items: center !important;
  width: 100%;
  flex-wrap: nowrap !important;
  flex-direction: row !important;
  gap: 16px;
}

.title-text {
  flex: 0 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 !important;
  font-size: 1.2rem !important;
}

.add-btn {
  flex-shrink: 0 !important;
  min-width: auto;
}

@media (max-width: 768px) {
  .title-container {
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
  }
  
  .title-text {
    text-align: left !important;
    margin-right: 16px !important;
  }
  
  .add-btn {
    flex-shrink: 0 !important;
  }
}
</style>
