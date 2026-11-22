<template>
  <div>
    <v-card class="modern-card">
      <v-card-title class="modern-title" style="height: 55px; display: flex; align-items: center;">
        <div class="title-container">
          <v-tabs v-model="activeTab" color="white" class="tabs-in-title">
            <v-tab value="docs">מסמכים</v-tab>
            <v-tab value="activity">תעוד פעילות</v-tab>
          </v-tabs>
          <v-spacer></v-spacer>
          <v-btn
            v-if="userStore.user.role === 1"
            color="primary"
            @click="openAddDialog"
            class="add-btn"
          >
            <v-icon left>mdi-plus</v-icon>
            {{ addButtonText }}
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-window v-model="activeTab">
          <v-window-item value="docs">
            <FactoryDocsList ref="docsListRef" />
          </v-window-item>
          <v-window-item value="activity">
            <ActivityDocsMain ref="activityDocsRef" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import FactoryDocsList from './FactoryDocsList.vue'
import ActivityDocsMain from './ActivityDocsMain.vue'

export default {
  name: 'FactoryDocsMain',
  components: {
    FactoryDocsList,
    ActivityDocsMain
  },
  setup() {
    const userStore = useUserStore()
    const activeTab = ref('docs')
    const docsListRef = ref(null)
    const activityDocsRef = ref(null)

    const addButtonText = computed(() =>
      activeTab.value === 'activity' ? 'הוסף מסמך פעילות' : 'הוסף מסמך'
    )

    function openAddDialog() {
      if (activeTab.value === 'activity' && activityDocsRef.value) {
        activityDocsRef.value.openAddDialog()
        return
      }
      if (docsListRef.value) {
        docsListRef.value.openAddDialog()
      }
    }

    return {
      userStore,
      activeTab,
      docsListRef,
      activityDocsRef,
      addButtonText,
      openAddDialog
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
  height: 100%;
}

.tabs-in-title {
  background: transparent;
  min-height: auto;
  margin: 0 2px;
}

.add-btn {
  flex-shrink: 0;
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

@media (max-width: 768px) {
  :deep(.modern-title) {
    padding: 8px 10px !important;
    height: auto !important;
    min-height: 55px;
  }

  .tabs-in-title :deep(.v-tab) {
    padding: 2px 8px !important;
    font-size: 0.9rem !important;
  }
}
</style>
