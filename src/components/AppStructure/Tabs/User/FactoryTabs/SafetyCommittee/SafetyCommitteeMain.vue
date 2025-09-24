<template>
    <div>
        <v-card class="modern-card">
            <v-card-title class="modern-title" style="height: 55px; display: flex; align-items: center;" >
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
            <v-card-text class="pa-0">
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

        <!-- Committee Meeting Dialog Component -->
        <CommitteeMeetingDialog 
            ref="committeeMeetingDialog"
            :show-dialog="showMeetingDialog" 
            @close-dialog="closeMeetingDialog" 
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SafetyCommittee from './SafetyCommittee.vue'
import SafetyCommitteeMeetings from './committeeMeetings.vue'
import SafetyTrusteesDialog from './SafetyTrusteesDialog.vue'
import CommitteeMeetingDialog from './committeeMeetingDialog.vue'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'
import { useUserStore } from '@/stores/UserStore'

const safetyCommitteeStore = useSafetyCommitteeStore()
const userStore = useUserStore()

const activeTab = ref('committee')
const showDialog = ref(false)
const showMeetingDialog = ref(false)
const safetyTrusteesDialog = ref(null)
const committeeMeetingDialog = ref(null)

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
    if (activeTab.value === 'committee') {
        // For committee tab - open the safety trustees dialog
        showDialog.value = true
    } else if (activeTab.value === 'meetings') {
        // For meetings tab - open a different dialog or action
        openMeetingsDialog()
    }
}

function openMeetingsDialog() {
    showMeetingDialog.value = true
}

function closeMeetingDialog() {
    showMeetingDialog.value = false
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