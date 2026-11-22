<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        {{ dialogTitle }}
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
          <div class="select-with-button">
            <v-select
              v-model="editedItem.docTypeId"
              :items="docTypeOptions"
              label="סוג מסמך"
              reverse
              item-title="title"
              item-value="value"
              :rules="[v => v !== null && v !== undefined && v !== '' || 'סוג מסמך חובה']"
              class="select-field"
              no-data-text="לא הוגדרו סוגי תעוד פעילות"
            ></v-select>
            <v-btn
              icon="mdi-plus-circle-outline"
              variant="flat"
              size="small"
              class="select-button"
              color="success"
              @click="openDocTypeDialog"
            ></v-btn>
          </div>

          <v-text-field
            v-model="editedItem.docName"
            label="שם מסמך"
            required
            reverse
            :rules="[v => !!v || 'שם מסמך חובה']"
          ></v-text-field>

          <v-textarea
            v-model="editedItem.description"
            label="תיאור"
            reverse
            rows="2"
            auto-grow
          ></v-textarea>

          <v-text-field
            v-model="editedItem.activityAt"
            label="תאריך פעילות"
            required
            reverse
            :rules="[v => !!v || 'תאריך פעילות חובה', dateFormatRule]"
            placeholder="dd/MM/yyyy"
            prepend-icon="mdi-calendar"
            readonly
            @click:prepend="showDatePicker = true"
            @click="showDatePicker = true"
          ></v-text-field>

          <v-dialog v-model="showDatePicker" max-width="290">
            <v-date-picker
              v-model="datePickerValue"
              @update:model-value="handleDatePickerChange"
              locale="he"
              :first-day-of-week="0"
            ></v-date-picker>
          </v-dialog>

          <v-file-input
            v-model="editedItem.file"
            label="קובץ"
            prepend-icon="mdi-file-document"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            reverse
            show-size
            clearable
            :rules="isEditMode ? [] : [v => !!v || 'קובץ חובה']"
          ></v-file-input>

          <div class="popup-btn-row">
            <v-btn @click="save" color="primary" :loading="loading">שמור</v-btn>
            <v-btn @click="closeDialog">ביטול</v-btn>
            <v-spacer></v-spacer>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <UpsertDocType
    :show-dialog="showDocTypeDialog"
    types-field="docActivityTypes"
    @close-dialog="closeDocTypeDialog"
  />
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useFactoryActivityDocsStore } from '@/stores/FactoryActivityDocsStore'
import UpsertDocType from '../FactoryDetails/UpsertDocType.vue'
import {
  getTodayDDMMYYYY,
  getDatePickerValue,
  getDisplayValue,
  isValidDDMMYYYY,
  formatToDDMMYYYY,
  formatToYYYYMMDD,
  parseFromDDMMYYYY
} from '@/utils/DateFormater'

export default {
  name: 'UpsertActivityDoc',
  components: {
    UpsertDocType
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    editDoc: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog', 'doc-saved'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    const activityDocsStore = useFactoryActivityDocsStore()

    const dialog = computed({
      get: () => props.showDialog,
      set: (value) => {
        if (!value) emit('close-dialog')
      }
    })

    const form = ref(null)
    const loading = ref(false)
    const showDocTypeDialog = ref(false)
    const previousTypeIds = ref(new Set())
    const showDatePicker = ref(false)
    const datePickerValue = ref('')

    const editedItem = ref({
      docTypeId: null,
      docName: '',
      description: '',
      activityAt: getTodayDDMMYYYY(),
      file: null
    })

    const isEditMode = computed(() => !!props.editDoc)

    const dialogTitle = computed(() =>
      isEditMode.value ? 'ערוך מסמך פעילות' : 'הוסף מסמך פעילות'
    )

    const dateFormatRule = (value) => {
      if (!value) return true
      return isValidDDMMYYYY(value) || 'פורמט תאריך לא תקין. השתמש בפורמט dd/MM/yyyy'
    }

    const docTypeOptions = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.docActivityTypes) return []

      try {
        const parsed = typeof factory.docActivityTypes === 'string'
          ? JSON.parse(factory.docActivityTypes)
          : factory.docActivityTypes
        if (!Array.isArray(parsed)) return []
        return parsed.map(type => ({
          title: type.TypeName || '',
          value: Number(type.TypeId)
        }))
      } catch (e) {
        console.error('Error parsing docActivityTypes:', e)
        return []
      }
    })

    watch(() => props.showDialog, (newVal) => {
      if (newVal) {
        initializeForm()
      }
    })

    function toDisplayDate(value) {
      if (!value) return getTodayDDMMYYYY()
      if (typeof value === 'string' && isValidDDMMYYYY(value)) return value
      if (typeof value === 'string') {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (match) {
          return `${match[3]}/${match[2]}/${match[1]}`
        }
      }
      return formatToDDMMYYYY(value) || getTodayDDMMYYYY()
    }

    function initializeForm() {
      if (isEditMode.value && props.editDoc) {
        editedItem.value = {
          docTypeId: props.editDoc.docTypeId != null ? Number(props.editDoc.docTypeId) : null,
          docName: props.editDoc.docName || '',
          description: props.editDoc.description || '',
          activityAt: toDisplayDate(props.editDoc.activityAt),
          file: null
        }
      } else {
        resetForm()
      }
      datePickerValue.value = getDatePickerValue(editedItem.value.activityAt)
      if (form.value) {
        form.value.resetValidation()
      }
    }

    function resetForm() {
      editedItem.value = {
        docTypeId: null,
        docName: '',
        description: '',
        activityAt: getTodayDDMMYYYY(),
        file: null
      }
      datePickerValue.value = getDatePickerValue(editedItem.value.activityAt)
    }

    function handleDatePickerChange(value) {
      if (value) {
        editedItem.value.activityAt = getDisplayValue(value)
        showDatePicker.value = false
      }
    }

    function closeDialog() {
      emit('close-dialog')
      resetForm()
    }

    function openDocTypeDialog() {
      previousTypeIds.value = new Set(docTypeOptions.value.map(type => type.value))
      showDocTypeDialog.value = true
    }

    function closeDocTypeDialog() {
      showDocTypeDialog.value = false

      const addedType = docTypeOptions.value.find(
        type => !previousTypeIds.value.has(type.value)
      )
      if (addedType) {
        editedItem.value.docTypeId = addedType.value
      }

      previousTypeIds.value = new Set(docTypeOptions.value.map(type => type.value))
    }

    async function save() {
      const { valid } = await form.value.validate()
      if (!valid) return

      const factory = userStore.selectedFactory
      if (!factory) {
        alert('מפעל לא נבחר')
        return
      }

      const activityDate = parseFromDDMMYYYY(editedItem.value.activityAt)
      if (!activityDate) {
        alert('פורמט תאריך לא תקין. השתמש בפורמט dd/MM/yyyy')
        return
      }

      loading.value = true
      try {
        const formData = new FormData()
        formData.append('factoryId', factory.id)
        formData.append('docTypeId', editedItem.value.docTypeId)
        formData.append('docName', editedItem.value.docName)
        formData.append('description', editedItem.value.description || '')
        formData.append('activityAt', formatToYYYYMMDD(activityDate))

        const file = Array.isArray(editedItem.value.file)
          ? editedItem.value.file[0]
          : editedItem.value.file

        if (isEditMode.value) {
          formData.append('id', props.editDoc.id)
          if (file) {
            formData.append('file', file)
          }
          await activityDocsStore.updateDoc(formData)
        } else {
          if (!file) {
            alert('קובץ חובה')
            return
          }
          formData.append('file', file)
          await activityDocsStore.addDoc(formData)
        }

        emit('doc-saved')
        closeDialog()
      } catch (error) {
        console.error('Failed to save activity doc:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      form,
      loading,
      editedItem,
      isEditMode,
      dialogTitle,
      docTypeOptions,
      showDocTypeDialog,
      showDatePicker,
      datePickerValue,
      dateFormatRule,
      handleDatePickerChange,
      closeDialog,
      openDocTypeDialog,
      closeDocTypeDialog,
      save
    }
  }
}
</script>
