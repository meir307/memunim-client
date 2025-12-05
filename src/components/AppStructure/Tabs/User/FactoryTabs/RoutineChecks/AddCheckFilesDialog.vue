<template>
    <v-dialog :model-value="showDialog" @update:model-value="$emit('close-dialog')" max-width="600px" persistent>
        <v-card>
            <v-card-title class="popup-title d-flex align-center justify-space-between">
                העלאת קבצים עבור הפעילות מתאריך - {{ formatDate(checkDate) }}
                <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="save">
                    <v-file-input
                        v-model="selectedFiles"
                        label="העלאת קבצים"
                        multiple
                        reverse
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    ></v-file-input>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="closeDialog">ביטול</v-btn>
                <v-btn color="primary" variant="elevated" @click="save" :disabled="!selectedFiles || selectedFiles.length === 0">
                    <v-icon left>mdi-content-save</v-icon>
                    שמור
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
import { processFiles } from '@/utils/ImageCompressor'

export default {
    name: 'AddCheckFilesDialog',
    props: {
        showDialog: {
            type: Boolean,
            default: false
        },
        checkId: {
            type: [String, Number],
            default: null
        },
        checkDate: {
            type: String,
            default: ''
        }
    },
    emits: ['close-dialog', 'checkFilesChanged'],
    data() {
        return {
            selectedFiles: []
        }
    },
    watch: {
        showDialog(newVal) {
            if (newVal) {
                // Reset files whenever the dialog is opened
                this.selectedFiles = []
            }
        }
    },
    methods: {
        closeDialog() {
            this.$emit('close-dialog')
        },
        formatDate(dateString) {
            if (!dateString) return ''
            const date = new Date(dateString)
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear()
            return `${day}/${month}/${year}`
        },
        async save() {
            if (!this.selectedFiles || this.selectedFiles.length === 0) {
                alert('אנא בחר קבצים להעלאה')
                return
            }

            try {
                // Process files to compress images before uploading
                const processedFiles = await processFiles(this.selectedFiles, 100)
                
                const routineCheckStore = useRoutineCheckStore()
                const checkFiles = await routineCheckStore.addCheckFiles(this.checkId, processedFiles)

                this.$emit('checkFilesChanged', checkFiles)

                this.closeDialog()
            } catch (error) {
                console.error('Error uploading files:', error)
                alert('שגיאה בהעלאת הקבצים: ' + (error.message || 'שגיאה לא ידועה'))
            }
        }
    }
}
</script>
