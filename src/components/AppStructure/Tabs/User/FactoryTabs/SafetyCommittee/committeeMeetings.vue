<template>
    <div>
        <v-card-text class="pa-0">
            <div class="table-wrapper">
                <v-simple-table class="modern-table">
                    <thead>
                        <tr>
                            <th class="table-header" style="width: 30%;">כותרת הפגישה</th>
                            <th class="table-header" style="width: 15%;">תאריך יצירה</th>
                            <th class="table-header" style="width: 20%;">נוצר על ידי</th>
                            <th class="table-header" style="width: 25%;">סיכום</th>
                            <th class="table-header actions-header" style="width: 5%;">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="meeting in meetings" :key="meeting.id" class="table-row">
                            <td class="table-cell" style="width: 30%;">
                                <div class="meeting-info">
                                    <a v-if="meeting.fileName" :href="meeting.fileName" target="_blank" class="meeting-link">
                                        {{ meeting.title }}
                                    </a>
                                    <span v-else class="meeting-title">{{ meeting.title }}</span>
                                </div>
                            </td>
                            <td class="table-cell" style="width: 15%;">{{ formatDate(meeting.createdAt) }}</td>
                            <td class="table-cell" style="width: 20%;">{{ meeting.createdBy }}</td>
                            <td class="table-cell" style="width: 25%;">
                                <div class="summary-text">{{ meeting.summary }}</div>
                            </td>
                            <td class="table-cell actions-cell" style="width: 5%;">
                                <v-btn icon size="small" @click="editMeeting(meeting)" color="primary" class="action-btn">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </v-simple-table>
            </div>
        </v-card-text>
    </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'
import { useUserStore } from '@/stores/UserStore'

export default {
    name: 'SafetyCommitteeMeetings',
    props: {
        editMeeting: {
            type: Function,
            required: true
        }
    },
    setup() {
        const safetyCommitteeStore = useSafetyCommitteeStore()

        const meetings = computed(() => {
            return safetyCommitteeStore.getMeetings
        })

        function formatDate(dateString) {
            if (!dateString) return ''
            const date = new Date(dateString)
            return date.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }

        onMounted(async () => {
            try {
                const userStore = useUserStore()
                await safetyCommitteeStore.fetchMeetings(userStore.selectedFactory.id)
            } catch (error) {
                console.error('Failed to fetch committee meetings:', error)
            }
        })

        return {
            meetings,
            formatDate
        }
    }
}
</script>

<style scoped>
.v-card-text {
    padding: 0 !important;
    margin: 0 !important;
}

.table-wrapper {
    margin: 0 !important;
    padding: 0 !important;
}

.modern-card {
    margin: 0 !important;
    padding: 0 !important;
}

/* Remove any default spacing from Vuetify components */
::v-deep .v-card {
    margin: 0 !important;
}

::v-deep .v-card-text {
    padding: 0 !important;
    margin: 0 !important;
}

.meeting-link {
    color: #1976d2;
    text-decoration: none;
    font-weight: 500;
}

.meeting-link:hover {
    text-decoration: underline;
}

.meeting-title {
    font-weight: 500;
}

.summary-text {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.action-btn {
    margin: 0 2px;
}
</style>