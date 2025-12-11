<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title" style="height: 55px; display: flex; align-items: center;">
        <div class="title-container">
          <v-tabs v-model="activeTab" color="white" class="tabs-in-title">
            <v-tab value="details">פרטי המפעל</v-tab>
            <v-tab value="contacts">אנשי קשר</v-tab>
            <v-tab value="areas">אזורים</v-tab>
          </v-tabs>
          <div class="title-section">
            <h1 class="title-text">{{ titleText }}</h1>
          </div>
          
          <v-btn v-if="userStore.user.role === 1 && (activeTab === 'contacts' || activeTab === 'areas')" color="primary" @click="openDialog" class="add-btn ">
            <v-icon left>{{ addButtonIcon }}</v-icon>
            {{ addButtonText }}
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-window v-model="activeTab">
          <v-window-item value="details">
            <div class="pa-4">
              <UpsertFactory 
                mode="update" 
                :initial-data="userStore.selectedFactory"
                :hide-cancel="true"
                :reset-after-save="false"
                @onClose="onFactoryUpdated"
              />
            </div>
          </v-window-item>
          <v-window-item value="contacts">
            <Contacts ref="contactsRef" />
          </v-window-item>
          <v-window-item value="areas">
            <Areas ref="areasRef" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import Contacts from './Contacts.vue'
import Areas from './Areas.vue'
import UpsertFactory from '../../UpsertFactory.vue'

const userStore = useUserStore()

const activeTab = ref('details')
const contactsRef = ref(null)
const areasRef = ref(null)

const titleText = computed(() => {
  return ''
})

const addButtonText = computed(() => {
  if (activeTab.value === 'contacts') {
    return 'הוסף איש קשר'
  }
  if (activeTab.value === 'areas') {
    return 'הוסף אזור'
  }
  return ''
})

const addButtonIcon = computed(() => {
  if (activeTab.value === 'contacts') {
    return 'mdi-plus'
  }
  return 'mdi-plus'
})

function openDialog() {
  if (activeTab.value === 'contacts' && contactsRef.value) {
    contactsRef.value.openDialog()
  }
  if (activeTab.value === 'areas' && areasRef.value) {
    areasRef.value.openDialog()
  }
}

async function onFactoryUpdated() {
  // The updateFactory method already updates the factories array
  // So we just need to refresh the selectedFactory from the updated list
  if (userStore.selectedFactory) {
    // Find the updated factory by hetpei (or id if available)
    const identifier = userStore.selectedFactory.id || userStore.selectedFactory.hetpei
    const updatedFactory = userStore.factories?.find(f => 
      (f.id && f.id === identifier) || (f.hetpei && f.hetpei === identifier)
    )
    if (updatedFactory) {
      userStore.selectedFactory = updatedFactory
    }
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

