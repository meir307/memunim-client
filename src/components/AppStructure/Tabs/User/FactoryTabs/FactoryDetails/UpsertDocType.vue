<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        {{ dialogTitle }}
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="save" ref="form">
          <v-text-field
            v-model="editedItem.TypeName"
            label="שם סוג המסמך"
            required
            reverse
            :rules="[v => !!v || 'שם סוג המסמך חובה']"
          ></v-text-field>
        </v-form>
        <div class="popup-btn-row">
          <v-btn @click="save" color="primary" :loading="loading">שמור</v-btn>
          <v-btn @click="closeDialog">ביטול</v-btn>
          <v-spacer></v-spacer>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'UpsertDocType',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    editDocType: {
      type: Object,
      default: null
    }
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const userStore = useUserStore()

    const dialog = ref(false)
    const loading = ref(false)
    const form = ref(null)

    const editedItem = ref({
      TypeName: ''
    })

    const isEditMode = computed(() => !!props.editDocType)

    const dialogTitle = computed(() =>
      isEditMode.value ? 'ערוך סוג מסמך' : 'הוסף סוג מסמך'
    )

    watch(() => props.showDialog, (newVal) => {
      dialog.value = newVal
      if (newVal) {
        initializeForm()
      }
    })

    watch(dialog, (newVal) => {
      if (!newVal) {
        emit('close-dialog')
      }
    })

    function initializeForm() {
      if (isEditMode.value && props.editDocType) {
        editedItem.value = {
          TypeName: props.editDocType.TypeName || ''
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
        TypeName: ''
      }
    }

    function closeDialog() {
      dialog.value = false
      resetForm()
    }

    function parseDocTypes(factory) {
      let docTypes = []
      try {
        const raw = factory.docTypes
        if (!raw) return []
        docTypes = typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch (e) {
        docTypes = []
      }
      return Array.isArray(docTypes) ? docTypes : []
    }

    async function save() {
      const { valid } = await form.value.validate()
      if (!valid) return

      loading.value = true
      try {
        const factory = userStore.selectedFactory
        if (!factory) {
          alert('מפעל לא נבחר')
          return
        }

        let docTypes = parseDocTypes(factory)

        if (isEditMode.value && props.editDocType) {
          const index = docTypes.findIndex(
            t => Number(t.TypeId) === Number(props.editDocType.TypeId)
          )
          if (index !== -1) {
            docTypes[index] = {
              ...docTypes[index],
              TypeName: editedItem.value.TypeName.trim()
            }
          }
        } else {
          const maxId = docTypes.length > 0
            ? Math.max(...docTypes.map(t => Number(t.TypeId) || 0))
            : 0

          docTypes.push({
            TypeId: maxId + 1,
            TypeName: editedItem.value.TypeName.trim()
          })
        }

        const updatedFactory = {
          ...factory,
          docTypes: JSON.stringify(docTypes)
        }

        await userStore.updateFactory(updatedFactory)
        userStore.selectedFactory = updatedFactory
        closeDialog()
      } catch (error) {
        console.error('Failed to save doc type:', error)
        alert('שגיאה בשמירת סוג מסמך')
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      loading,
      form,
      editedItem,
      dialogTitle,
      closeDialog,
      save
    }
  }
}
</script>
