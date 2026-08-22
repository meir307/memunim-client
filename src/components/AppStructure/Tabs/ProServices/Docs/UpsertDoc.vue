<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        {{ dialogTitle }}
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
          <v-text-field
            v-model="docForm.name"
            label="שם מסמך"
            required
            reverse
            :rules="[v => !!v || 'שם מסמך חובה']"
          ></v-text-field>

          <v-textarea
            v-model="docForm.description"
            label="תיאור"
            reverse
            rows="3"
            auto-grow
          ></v-textarea>

          <v-file-input
            v-model="docForm.file"
            label="קובץ"
            prepend-icon="mdi-file-document"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            reverse
            show-size
            clearable
            :rules="editDoc ? [] : [v => !!v || 'קובץ חובה']"
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
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'UpsertDoc',
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
    const form = ref(null)
    const loading = ref(false)

    const docForm = ref({
      name: '',
      description: '',
      file: null
    })

    const isEditMode = computed(() => !!props.editDoc)

    const dialogTitle = computed(() =>
      isEditMode.value ? 'ערוך מסמך' : 'הוסף מסמך'
    )

    const dialog = computed({
      get: () => props.showDialog,
      set: (value) => {
        if (!value) emit('close-dialog')
      }
    })

    watch(() => props.showDialog, (newVal) => {
      if (newVal) {
        initializeForm()
      }
    })

    function initializeForm() {
      if (isEditMode.value && props.editDoc) {
        docForm.value = {
          name: props.editDoc.name || '',
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
      docForm.value = {
        name: '',
        description: '',
        file: null
      }
    }

    function closeDialog() {
      emit('close-dialog')
      resetForm()
    }

    async function save() {
      const { valid } = await form.value.validate()
      if (!valid) return

      loading.value = true
      try {
        emit('doc-saved', {
          ...(isEditMode.value && props.editDoc ? { id: props.editDoc.id } : {}),
          name: docForm.value.name,
          description: docForm.value.description,
          file: docForm.value.file
        })
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      form,
      loading,
      docForm,
      dialogTitle,
      closeDialog,
      save
    }
  }
}
</script>
