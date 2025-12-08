<template>
  <div>
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <!-- Step 1 Fields -->
        <v-col cols="12" md="5">
          <v-text-field v-model="factoryData.name" label="שם המפעל" :rules="[rules.required]" variant="outlined" reverse></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="factoryData.hetpei" label="ח.פ" :rules="[rules.required]" variant="outlined" reverse></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="factoryData.employees" label="מספר עובדים" :rules="[rules.required]" variant="outlined" type="number"
            reverse></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="factoryData.memuneHours" label="שעות ממונה בחודש" :rules="[rules.required]" variant="outlined" type="number"
            reverse></v-text-field>
        </v-col>
        <v-col cols="12" md="5">
          <v-text-field v-model="factoryData.address" label="כתובת" :rules="[rules.required]" variant="outlined" reverse></v-text-field>
        </v-col>

        <v-col cols="7">
          <v-textarea v-model="factoryData.description" label="תיאור המפעל" :rules="[rules.required]" variant="outlined" rows="2"
            reverse></v-textarea>
        </v-col>


      </v-row>

      <div  class="popup-btn-row">
       
        <v-btn color="primary" type="submit" :loading="loading">
          {{ submitButtonText }}
        </v-btn>
        <v-btn v-if="!hideCancel" variant="outlined" @click="close">
          ביטול
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/UserStore'
export default {
  name: 'UpsertFactory',
  props: {
    // Mode: 'add' or 'update'
    mode: String,
    // Initial data for update mode
    initialData: Object,
    // Hide cancel button
    hideCancel: {
      type: Boolean,
      default: false
    },
    // Reset form after saving
    resetAfterSave: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    loading: false,
    rules: {
      required: value => !!value || 'שדה זה הוא חובה'
    },
    factoryData: {
      name: '',
      hetpei: '',
      employees: '',
      address: '',
      description: '',
      memuneHours: '',

    }
  }),
  computed: {
      
    submitButtonText() {
     
      return this.mode === 'update' ? 'עדכן' : 'הוסף מפעל'
    },
    dialogTitle() {
      alert(this.mode)
      return this.mode === 'update' ? 'עדכן מפעל' : 'הוסף מפעל חדש'
    }
  },
  created() {
    // Initialize form data if initialData is provided
    this.initializeData()
  },
  watch: {
    // Watch for changes in initialData to update the form
    initialData: {
      handler(newData) {
        if (newData && Object.keys(newData).length > 0) {
          this.initializeData()
        }
      },
      deep: true
    }
  },
  methods: {
    initializeData() {
      if (this.initialData && Object.keys(this.initialData).length > 0) {
        this.factoryData = { ...this.factoryData, ...this.initialData }
      }
    },
    async submitForm() {
      // Validate form before submitting
      const { valid } = await this.$refs.form.validate()
      
      if (!valid) {
        return
      }

      this.loading = true
      try {
        const userStore = useUserStore()
        if (this.mode === 'add') {
          await userStore.addFactory(this.factoryData)
        } 
        else {
          await userStore.updateFactory(this.factoryData)
        }

        // Emit close event
        this.$emit('onClose')

        // Reset form only if resetAfterSave is true
        if (this.resetAfterSave) {
          this.factoryData = {
            name: '',
            hetpei: '',
            employees: '',
            address: '',
            description: '',
            memuneHours: '',
          }
        } else {
          // Update factoryData with the saved data to reflect any server-side changes
          if (this.mode === 'update' && this.initialData) {
            this.factoryData = { ...this.factoryData }
          }
        }
      } catch (error) {
        console.error('Error adding factory:', error)
      } finally {
        this.loading = false
      }
    },
    
    close() {
      this.$emit('onClose')
    }
  }
}
</script>