<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        {{ dialogTitle }}
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="formattedCheckDate"
                label="תאריך בדיקה"
                required
                reverse
                :rules="[v => !!v || 'תאריך בדיקה חובה', dateFormatRule]"
                @input="handleCheckDateChange"
                placeholder="dd/MM/yyyy"
                prepend-icon="mdi-calendar"
                readonly
                @click:prepend="showDatePicker = true"
              ></v-text-field>
              
              <v-dialog v-model="showDatePicker" max-width="290">
                <v-date-picker
                  v-model="datePickerValue"
                  @update:model-value="handleDatePickerChange"
                  locale="he"
                  :first-day-of-week="0"
                ></v-date-picker>
              </v-dialog>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-text-field
                v-model="editedItem.checkFrequency"
                label="תדירות בדיקה (חודשים)"
                type="number"
                readonly
                reverse
                hint="נקבע על פי סוג הפעילות"
                persistent-hint
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="formattedNextCheck"
                label="תאריך הפעולה הבאה"
                readonly
                reverse
                hint="מחושב אוטומטית"
                persistent-hint
                placeholder="dd/MM/yyyy"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.description"
                label="תיאור"
                reverse
                hint="תיאור אופציונלי"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input
                v-model="editedItem.documents"
                label="העלאת מסמכים"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                prepend-icon="mdi-file-document"
                reverse
                show-size
                counter
                hint="ניתן להעלות מספר קבצים"
                persistent-hint
              ></v-file-input>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <div class="popup-btn-row">
        <v-btn @click="save" color="primary" :loading="loading">
          {{ isEditMode ? 'עדכן' : 'שמור' }}
        </v-btn>
        <v-btn @click="closeDialog">
          ביטול
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, toRaw } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useRoutineCheckStore } from '@/stores/RoutineCheckStore'
import { 
  getTodayDDMMYYYY, 
  addMonthsToDate, 
  getDatePickerValue, 
  getDisplayValue,
  isValidDDMMYYYY
} from '@/utils/DateFormater'

export default {
  name: 'UpsertCheckDialog',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    checkType: {
      type: Object,
      default: null
    },
    editCheck: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    const routineCheckStore = useRoutineCheckStore()
    
    const dialog = ref(false)
    const loading = ref(false)
    const form = ref(null)
    const showDatePicker = ref(false)
    const datePickerValue = ref('')
    
    const editedItem = ref({
      checkDate: '',
      checkFrequency: '',
      nextCheck: '',
      description: '',
      documents: null
    })

    const isEditMode = computed(() => !!props.editCheck)
    
    const dialogTitle = computed(() => {
      if (isEditMode.value) {
        return `עדכון בדיקה עבור ${props.checkType?.checkTypeName || ''}`
      }
      return `בדיקה חדשה עבור ${props.checkType?.checkTypeName || ''}`
    })

    const formattedCheckDate = computed({
      get() {
        return editedItem.value.checkDate
      },
      set(value) {
        editedItem.value.checkDate = value
      }
    })

    const formattedNextCheck = computed(() => {
      return editedItem.value.nextCheck
    })

    // Date format validation rule
    const dateFormatRule = (value) => {
      if (!value) return true
      return isValidDDMMYYYY(value) || 'פורמט תאריך לא תקין. השתמש בפורמט dd/MM/yyyy'
    }

    // Watch for prop changes
    watch(() => props.showDialog, (newVal) => {
      dialog.value = newVal
      if (newVal) {
        initializeForm()
      }
    })

    // Watch for dialog changes and emit to parent
    watch(dialog, (newVal) => {
      if (!newVal) {
        emit('close-dialog')
      }
    })

    function initializeForm() {
      if (isEditMode.value && props.editCheck) {
        // Edit mode - populate with existing data
        editedItem.value = {
          checkDate: props.editCheck.checkDate || getTodayDDMMYYYY(),
          checkFrequency: props.editCheck.checkFrequency || props.checkType?.checkPeriodInMonth || '',
          nextCheck: props.editCheck.nextCheck || '',
          description: props.editCheck.description || '',
          documents: null
        }
      } else {
        // Add mode - set defaults
        editedItem.value = {
          checkDate: getTodayDDMMYYYY(),
          checkFrequency: props.checkType?.checkPeriodInMonth || '',
          nextCheck: '',
          description: '',
          documents: null
        }
        calculateNextCheck()
      }
      
      // Set date picker value using utility
      datePickerValue.value = getDatePickerValue(editedItem.value.checkDate)
    }

    function handleCheckDateChange() {
      // Trigger calculation when check date changes
      calculateNextCheck()
    }

    function handleDatePickerChange(value) {
      if (value) {
        editedItem.value.checkDate = getDisplayValue(value)
        showDatePicker.value = false
        calculateNextCheck()
      }
    }

    function calculateNextCheck() {
      if (editedItem.value.checkDate && editedItem.value.checkFrequency) {
        const months = parseInt(editedItem.value.checkFrequency)
        if (!isNaN(months) && months > 0) {
          editedItem.value.nextCheck = addMonthsToDate(editedItem.value.checkDate, months)
        }
      }
    }

    function closeDialog() {
      dialog.value = false
      resetForm()
    }

    function resetForm() {
      editedItem.value = {
        checkDate: '',
        checkFrequency: '',
        nextCheck: '',
        description: '',
        documents: null
      }
    }

    async function save() {
      if (!form.value.validate()) {
        return
      }

      loading.value = true
      
      try {
        const factoryId = userStore.selectedFactory.id
        
        // Get raw data to avoid proxy issues
        const rawData = toRaw(editedItem.value)
        
        // Create FormData for file uploads
        const formData = new FormData()
        formData.append('checkTypeId', props.checkType.checkTypeId)
        formData.append('checkDate', rawData.checkDate)
        formData.append('nextCheck', rawData.nextCheck)
        formData.append('description', rawData.description || '')
        formData.append('factoryId', factoryId)
        
        // Add documents if any - THIS IS WHERE FILES ARE ATTACHED
        if (rawData.documents) {
          if (Array.isArray(rawData.documents)) {
            // Multiple files
            rawData.documents.forEach((file) => {
              formData.append(`documents`, file)
            })
          } else {
            // Single file
            formData.append('documents', rawData.documents)
          }
        }
        
        if (isEditMode.value) {
          formData.append('id', props.editCheck.id)
        }
        
        if (isEditMode.value) {
          // TODO: Call update check API
          console.log('Update check with FormData:', formData)
          alert('בדיקה עודכנה בהצלחה')
        } else {
          // Call add check API with FormData
          await routineCheckStore.addRoutineCheck(formData)
          alert('בדיקה נוספה בהצלחה')
        }
        
        closeDialog()
        
      } catch (error) {
        console.error('Failed to save check:', error)
        alert('שגיאה בשמירת הבדיקה: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      loading,
      form,
      editedItem,
      isEditMode,
      dialogTitle,
      formattedCheckDate,
      formattedNextCheck,
      showDatePicker,
      datePickerValue,
      dateFormatRule,
      closeDialog,
      save,
      handleCheckDateChange,
      handleDatePickerChange,
      calculateNextCheck
    }
  }
}
</script>