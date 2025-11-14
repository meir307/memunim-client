<template>
    <div>
        <v-card-text class="pa-0">
            <div class="table-wrapper">
                <v-data-table
                    :headers="headers"
                    :items="meetings"
                    :loading="loading"
                    class="modern-table"
                    no-data-text="אין פגישות ועדה"
                    loading-text="טוען נתונים..."
                    hide-default-footer
                >
                    <template #item="{ item, columns }">
                        <tr>
                            <td v-for="column in columns" :key="column.key">
                                <div v-if="column.key === 'title'" class="meeting-info">
                                    <a v-if="item.fileName" :href="item.fileName" target="_blank" class="meeting-link">
                                        {{ item.title }}
                                    </a>
                                    <span v-else class="meeting-title">{{ item.title }}</span>
                                </div>
                                <span v-else-if="column.key === 'createdAt'">{{ formatDate(item.createdAt) }}</span>
                                <div v-else-if="column.key === 'summary'" class="summary-text">{{ item.summary }}</div>
                                <span v-else-if="column.key === 'actions'">
                                    <v-btn icon size="small" @click="editMeeting(item)" color="primary" class="action-btn">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon size="small" @click="deleteMeeting(item)" color="error" class="action-btn">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </span>
                                <span v-else>{{ item[column.key] }}</span>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </div>
        </v-card-text>
    </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useSafetyCommitteeStore } from '@/stores/SafetyCommitteeStore'
import { useUserStore } from '@/stores/UserStore'
import '@/assets/DataTable.css'

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
        const loading = ref(false)

        const meetings = computed(() => {
            return safetyCommitteeStore.getMeetings
        })

        const headers = [
            { title: 'כותרת הפגישה', key: 'title', sortable: true, width: '200px' },
            { title: 'תאריך', key: 'createdAt', sortable: true, width: '130px' },
            { title: 'נוצר על ידי', key: 'createdBy', sortable: false, width: '120px' },
            { title: 'סיכום', key: 'summary', sortable: false, width: '300px' },
            { title: '', key: 'actions', sortable: false, align: 'center', width: '120px' }
            
        ]

        function formatDate(dateString) {
            if (!dateString) return ''
            const date = new Date(dateString)
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear()
            return `${day}/${month}/${year}`
        }

        async function deleteMeeting(meeting) {
            const confirmed = confirm(`האם למחוק את פגישת הוועדה "${meeting.title}"?`)
            if (!confirmed) return

            try {
                loading.value = true
                await safetyCommitteeStore.deleteMeeting(meeting.id)
                alert('פגישה נמחקה בהצלחה')
            } catch (error) {
                console.error('Failed to delete committee meeting:', error)
                alert('שגיאה במחיקת הפגישה: ' + (error.response?.data?.message || error.message || 'שגיאה לא ידועה'))
            } finally {
                loading.value = false
            }
        }

        onMounted(async () => {
            try {
                loading.value = true
                const userStore = useUserStore()
                await safetyCommitteeStore.fetchMeetings(userStore.selectedFactory.id)
            } catch (error) {
                console.error('Failed to fetch committee meetings:', error)
            } finally {
                loading.value = false
            }
        })

        return {
            meetings,
            headers,
            loading,
            formatDate,
            deleteMeeting
        }
    }
}
</script>

<style scoped>
.v-card-text {
    padding: 0 !important;
    margin: 0 !important;
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
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Make the title column width (1st column) */
.modern-table ::v-deep(thead th:nth-child(1)),
.modern-table ::v-deep(tbody td:nth-child(1)) {
    width: 200px !important;
    min-width: 200px !important;
    max-width: 200px !important;
}

/* Make the date column width (2nd column) */
.modern-table ::v-deep(thead th:nth-child(2)),
.modern-table ::v-deep(tbody td:nth-child(2)) {
    width: 130px !important;
    min-width: 130px !important;
    max-width: 130px !important;
}

/* Make the createdBy column width (3rd column) */
.modern-table ::v-deep(thead th:nth-child(3)),
.modern-table ::v-deep(tbody td:nth-child(3)) {
    width: 120px !important;
    min-width: 120px !important;
    max-width: 120px !important;
}

/* Make the summary column width (4th column) */
.modern-table ::v-deep(thead th:nth-child(4)),
.modern-table ::v-deep(tbody td:nth-child(4)) {
    width: 300px !important;
    min-width: 300px !important;
    max-width: 300px !important;
}

/* Component-specific mobile column hiding */
@media (max-width: 768px) {
    /* Hide columns except title (1st) and date (2nd) */
    .modern-table ::v-deep(thead th:nth-child(3)),
    .modern-table ::v-deep(thead th:nth-child(4)),
    .modern-table ::v-deep(thead th:nth-child(5)) {
        display: none !important;
    }
    
    .modern-table ::v-deep(tbody td:nth-child(3)),
    .modern-table ::v-deep(tbody td:nth-child(4)),
    .modern-table ::v-deep(tbody td:nth-child(5)) {
        display: none !important;
    }
}
</style>