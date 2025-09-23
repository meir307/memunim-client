<template>
    <div>
        <v-card class="modern-card">
            <v-card-title class="modern-title">
                <div class="title-container">
                    <v-tabs v-model="activeTab" class="tabs-in-title">
                        <v-tab value="committee">נאמני בטיחות</v-tab>
                        <v-tab value="meetings">פגישות ועדה</v-tab>
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
        </v-card>

        <v-card class="content-card">
            <v-card-text>
                <v-window v-model="activeTab">
                    <v-window-item value="committee">
                        <SafetyCommittee 
                            :edit-user="editUser" 
                            :delete-user="deleteUser" 
                        />
                    </v-window-item>
                    <v-window-item value="meetings">
                        <SafetyCommitteeMeetings />
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>

        <!-- Safety Trustees Dialog Component -->
        <SafetyTrusteesDialog 
            ref="safetyTrusteesDialog"
            :show-dialog="showDialog" 
            @close-dialog="closeDialog" 
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SafetyCommittee from './SafetyCommittee.vue'
import SafetyCommitteeMeetings from './SafetyCommitteeMeetings.vue'
import SafetyTrusteesDialog from './SafetyTrusteesDialog.vue'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'
import { useUserStore } from '@/stores/UserStore'

const safetyCommitteeStore = useSafetyCommitteeStore()
const userStore = useUserStore()

const activeTab = ref('committee')
const showDialog = ref(false)
const safetyTrusteesDialog = ref(null)

const titleText = computed(() => {
    switch (activeTab.value) {
        case 'committee':
            return 'הגדר מי הם נאמני הבטיחות במפעל והאם הם חברי ועדת הבטיחות'
        case 'meetings':
            return 'נהל פגישות ועדת הבטיחות'
        default:
            return 'הגדר מי הם נאמני הבטיחות במפעל והאם הם חברי ועדת הבטיחות'
    }
})

const addButtonText = computed(() => {
    switch (activeTab.value) {
        case 'committee':
            return 'הוסף נאמן בטיחות'
        case 'meetings':
            return 'הוסף פגישה'
        default:
            return 'הוסף נאמן בטיחות'
    }
})

const addButtonIcon = computed(() => {
    switch (activeTab.value) {
        case 'committee':
            return 'mdi-plus'
        case 'meetings':
            return 'mdi-calendar-plus'
        default:
            return 'mdi-plus'
    }
})

function openDialog() {
    showDialog.value = true
}

function closeDialog() {
    showDialog.value = false
}

function editUser(user) {
    // Call the dialog component's editUser method
    if (safetyTrusteesDialog.value) {
        safetyTrusteesDialog.value.editUser(user)
    }
}

function deleteUser(user) {
    // Call the dialog component's deleteUser method
    if (safetyTrusteesDialog.value) {
        safetyTrusteesDialog.value.deleteUser(user)
    }
}

onMounted(async () => {
    try {
        await safetyCommitteeStore.fetchMembers(userStore.selectedFactory.id)
    } catch (error) {
        console.error('Failed to fetch safety committee members:', error)
    }
})
</script>

<style scoped>
.title-section {
    flex: 1;
}

.tabs-in-title {
    background: transparent;
    min-height: auto;
    margin: 0 16px;
}

.tabs-in-title ::v-deep .v-tab {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    min-width: auto;
    padding: 8px 16px;
}

.tabs-in-title ::v-deep .v-tab--selected {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.tabs-in-title ::v-deep .v-tabs-slider {
    background: white;
}

.content-card {
    margin-top: 0;
    border-radius: 0 0 6px 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>