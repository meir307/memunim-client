<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title" style="height: 55px; display: flex; align-items: center;">
        <div class="title-container">
          <v-tabs v-model="activeTab" color="white" class="tabs-in-title">
            <v-tab value="procedures">נהלי בטיחות</v-tab>
            <v-tab value="guides">הדרכות בטיחות</v-tab>
          </v-tabs>
          <div class="title-section">
            <h1 class="title-text">{{ titleText }}</h1>
          </div>
          
          <v-btn v-if="userStore.user.role === 1" color="primary" @click="openDialog" class="add-btn hide-on-mobile">
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
import { useUserStore } from '@/stores/UserStore'
import SafetyProceduresContent from './SafetyProceduresContent.vue'
import SafetyGuides from './SafetyGuides.vue'

const userStore = useUserStore()

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
      return 'הוסף הדרכת בטיחות'
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

@media (max-width: 768px) {
  :deep(.modern-title) {
    padding: 8px 10px !important;
    height: auto !important;
    min-height: 55px;
    display: flex !important;
    align-items: center !important;
  }
  
  .title-container {
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
  }
  
  .title-section {
    display: none;
  }
  
  .tabs-in-title {
    flex: 0 0 auto;
    margin: 0 2px;
    align-self: center;
    display: flex;
    align-items: center;
  }
  
  .tabs-in-title :deep(.v-tabs) {
    justify-content: flex-start;
    min-height: auto !important;
    height: auto !important;
    display: flex;
    align-items: center;
  }
  
  .tabs-in-title :deep(.v-slide-group) {
    min-height: auto !important;
    height: auto !important;
    display: flex;
    align-items: center;
  }
  
  .tabs-in-title :deep(.v-slide-group__wrapper) {
    min-height: auto !important;
    height: auto !important;
    display: flex;
    align-items: center;
  }
  
  .tabs-in-title :deep(.v-tab) {
    padding: 2px 8px !important;
    min-height: auto !important;
    height: auto !important;
    max-height: none !important;
    display: flex;
    align-items: center;
    font-size: 0.9rem !important;
    line-height: 1.5 !important;
    overflow: visible !important;
  }
  
  .tabs-in-title :deep(.v-tab__content) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    padding: 0 !important;
    line-height: 1.5 !important;
    overflow: visible !important;
  }
  
  .tabs-in-title :deep(.v-tab__wrapper) {
    padding: 0 !important;
    margin: 0 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  
  .tabs-in-title :deep(.v-tab__text) {
    line-height: 1.5 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
}

.tabs-in-title :deep(.v-tab) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  min-width: auto;
  padding: 2px 8px;
}

.tabs-in-title :deep(.v-tab--selected) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.tabs-in-title :deep(.v-tabs-slider) {
  background: white;
  height: 2px;
  opacity: 1;
}
</style>

