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
            :label="nameLabel"
            required
            reverse
            :rules="[v => !!v || `${nameLabel} חובה`]"
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
    },
    typesField: {
      type: String,
      default: 'docTypes'
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
    const isActivityTypes = computed(() => props.typesField === 'docActivityTypes')

    const nameLabel = computed(() =>
      isActivityTypes.value ? 'שם סוג תעוד פעילות' : 'שם סוג המסמך'
    )

    const dialogTitle = computed(() => {
      if (isActivityTypes.value) {
        return isEditMode.value ? 'ערוך סוג תעוד פעילות' : 'הוסף סוג תעוד פעילות'
      }
      return isEditMode.value ? 'ערוך סוג מסמך' : 'הוסף סוג מסמך'
    })

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

    function parseTypes(factory) {
      let types = []
      try {
        const raw = factory[props.typesField]
        if (!raw) return []
        types = typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch (e) {
        types = []
      }
      return Array.isArray(types) ? types : []
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

        let types = parseTypes(factory)

        if (isEditMode.value && props.editDocType) {
          const index = types.findIndex(
            t => Number(t.TypeId) === Number(props.editDocType.TypeId)
          )
          if (index !== -1) {
            types[index] = {
              ...types[index],
              TypeName: editedItem.value.TypeName.trim()
            }
          }
        } else {
          const maxId = types.length > 0
            ? Math.max(...types.map(t => Number(t.TypeId) || 0))
            : 0

          types.push({
            TypeId: maxId + 1,
            TypeName: editedItem.value.TypeName.trim()
          })
        }

        const updatedFactory = {
          ...factory,
          [props.typesField]: JSON.stringify(types)
        }

        await userStore.updateFactory(updatedFactory)
        const synced = (userStore.factories || []).find(
          f => Number(f.id) === Number(factory.id)
        )
        userStore.selectedFactory = synced || updatedFactory
        closeDialog()
      } catch (error) {
        console.error('Failed to save doc type:', error)
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
      nameLabel,
      closeDialog,
      save
    }
  }
}
</script>
