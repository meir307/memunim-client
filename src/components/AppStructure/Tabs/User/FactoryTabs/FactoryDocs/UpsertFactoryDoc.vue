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
              no-data-text="לא הוגדרו סוגי מסמכים"
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
    @close-dialog="closeDocTypeDialog"
  />
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useFactoryDocsStore } from '@/stores/FactoryDocsStore'
import UpsertDocType from '../FactoryDetails/UpsertDocType.vue'

export default {
  name: 'UpsertFactoryDoc',
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
    const factoryDocsStore = useFactoryDocsStore()

    const dialog = computed({
      get: () => props.showDialog,
      set: (value) => {
        if (!value) emit('close-dialog')
      }
    })

    const form = ref(null)
    const loading = ref(false)
    const showDocTypeDialog = ref(false)
    const previousDocTypeCount = ref(0)

    const editedItem = ref({
      docTypeId: null,
      docName: '',
      description: '',
      file: null
    })

    const isEditMode = computed(() => !!props.editDoc)

    const dialogTitle = computed(() =>
      isEditMode.value ? 'ערוך מסמך' : 'הוסף מסמך'
    )

    const docTypeOptions = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.docTypes) return []

      try {
        const parsed = typeof factory.docTypes === 'string'
          ? JSON.parse(factory.docTypes)
          : factory.docTypes
        if (!Array.isArray(parsed)) return []
        return parsed.map(type => ({
          title: type.TypeName || '',
          value: Number(type.TypeId)
        }))
      } catch (e) {
        console.error('Error parsing docTypes:', e)
        return []
      }
    })

    watch(() => props.showDialog, (newVal) => {
      if (newVal) {
        initializeForm()
      }
    })

    function initializeForm() {
      if (isEditMode.value && props.editDoc) {
        editedItem.value = {
          docTypeId: props.editDoc.docTypeId != null ? Number(props.editDoc.docTypeId) : null,
          docName: props.editDoc.docName || '',
          description: props.editDoc.description || '',
          file: null
        }
      } else {
        resetForm()
      }
      if (form.value) {
        form.value.resetValidation()
      }
    }

    function resetForm() {
      editedItem.value = {
        docTypeId: null,
        docName: '',
        description: '',
        file: null
      }
    }

    function closeDialog() {
      emit('close-dialog')
      resetForm()
    }

    function openDocTypeDialog() {
      previousDocTypeCount.value = docTypeOptions.value.length
      showDocTypeDialog.value = true
    }

    function closeDocTypeDialog() {
      showDocTypeDialog.value = false

      if (docTypeOptions.value.length > previousDocTypeCount.value) {
        const newType = docTypeOptions.value.reduce((max, type) =>
          type.value > max.value ? type : max
        )
        if (newType && newType.value) {
          editedItem.value.docTypeId = newType.value
        }
      }

      previousDocTypeCount.value = docTypeOptions.value.length
    }

    async function save() {
      const { valid } = await form.value.validate()
      if (!valid) return

      const factory = userStore.selectedFactory
      if (!factory) {
        alert('מפעל לא נבחר')
        return
      }

      loading.value = true
      try {
        const formData = new FormData()
        formData.append('factoryId', factory.id)
        formData.append('docTypeId', editedItem.value.docTypeId)
        formData.append('docName', editedItem.value.docName)
        formData.append('description', editedItem.value.description || '')

        const file = Array.isArray(editedItem.value.file)
          ? editedItem.value.file[0]
          : editedItem.value.file

        if (isEditMode.value) {
          formData.append('id', props.editDoc.id)
          if (file) {
            formData.append('file', file)
          }
          await factoryDocsStore.updateDoc(formData)
        } else {
          if (!file) {
            alert('קובץ חובה')
            return
          }
          formData.append('file', file)
          await factoryDocsStore.addDoc(formData)
        }

        emit('doc-saved')
        closeDialog()
      } catch (error) {
        console.error('Failed to save factory doc:', error)
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
      closeDialog,
      openDocTypeDialog,
      closeDocTypeDialog,
      save
    }
  }
}
</script>
