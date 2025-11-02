<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title" style="height: 55px; display: flex; align-items: center;">
        <div class="title-container">
          <v-tabs v-model="activeTab" class="tabs-in-title">
            <v-tab value="procedures">נהלי בטיחות</v-tab>
            <v-tab value="guides">מדריכי בטיחות</v-tab>
          </v-tabs>
          <div class="title-section">
            <h1 class="title-text">{{ titleText }}</h1>
          </div>
          
          <v-btn color="primary" @click="openDialog" class="add-btn">
            <v-icon left>{{ addButtonIcon }}</v-icon>
            {{ addButtonText }}
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-window v-model="activeTab">
          <v-window-item value="procedures">
            <SafetyProceduresContent 
              :edit-procedure="editProcedure" 
              :delete-procedure="deleteProcedure"
              ref="proceduresContentRef"
            />
          </v-window-item>
          <v-window-item value="guides">
            <SafetyGuides 
              :edit-guide="editGuide" 
              :delete-guide="deleteGuide"
              ref="guidesContentRef"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SafetyProceduresContent from './SafetyProceduresContent.vue'
import SafetyGuides from './SafetyGuides.vue'

const activeTab = ref('procedures')
const proceduresContentRef = ref(null)
const guidesContentRef = ref(null)

const titleText = computed(() => {
   return ''
  
})

const addButtonText = computed(() => {
  switch (activeTab.value) {
    case 'procedures':
      return 'הוסף נהל בטיחות'
    case 'guides':
      return 'הוסף מדריך בטיחות'
    default:
      return 'הוסף נהל בטיחות'
  }
})

const addButtonIcon = computed(() => {
  switch (activeTab.value) {
    case 'procedures':
      return 'mdi-plus'
    case 'guides':
      return 'mdi-book-plus'
    default:
      return 'mdi-plus'
  }
})

function openDialog() {
  if (activeTab.value === 'procedures') {
    if (proceduresContentRef.value) {
      proceduresContentRef.value.openDialog()
    }
  } else if (activeTab.value === 'guides') {
    if (guidesContentRef.value) {
      guidesContentRef.value.openDialog()
    }
  }
}

function editProcedure(procedure) {
  if (proceduresContentRef.value) {
    proceduresContentRef.value.editProcedure(procedure)
  }
}

function deleteProcedure(procedure) {
  if (proceduresContentRef.value) {
    proceduresContentRef.value.deleteProcedure(procedure)
  }
}

function editGuide(guide) {
  if (guidesContentRef.value) {
    guidesContentRef.value.editGuide(guide)
  }
}

function deleteGuide(guide) {
  if (guidesContentRef.value) {
    guidesContentRef.value.deleteGuide(guide)
  }
}
</script>

<style scoped>
.title-section {
  flex: 1;
  display: flex;
  align-items: center;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.tabs-in-title {
  background: transparent;
  min-height: auto;
  margin: 0 2px;
}

.tabs-in-title ::v-deep .v-tab {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  min-width: auto;
  padding: 2px 8px;
}

.tabs-in-title ::v-deep .v-tab--selected {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.tabs-in-title ::v-deep .v-tabs-slider {
  background: white;
}
</style>

