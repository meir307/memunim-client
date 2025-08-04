<template>
  <div>
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <!-- Step 1 Fields -->
        <v-col cols="12" md="5">
          <v-text-field v-model="factoryData.name" label="שם המפעל" :rules="[rules.required]" variant="outlined" reverse></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="factoryData.id" label="ח.פ" :rules="[rules.required]" variant="outlined" reverse></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="factoryData.employees" label="מספר עובדים" :rules="[rules.required]" variant="outlined" type="number"
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
        <v-btn variant="outlined" @click="close">
          ביטול
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
export default {
  name: 'UpsertFactory',
  props: {
    // Mode: 'add' or 'update'
    mode: String,
    // Initial data for update mode
    initialData: Object
  },
  data: () => ({
    loading: false,
    rules: {
      required: value => !!value || 'שדה זה הוא חובה'
    },
    factoryData: {
      name: '',
      id: '',
      employees: '',
      address: '',
      description: '',

    }
  }),
  computed: {
    submitButtonText() {
      return this.mode === 'update' ? 'עדכן מפעל' : 'הוסף מפעל'
    },
    dialogTitle() {
      return this.mode === 'update' ? 'עדכן מפעל' : 'הוסף מפעל חדש'
    }
  },
  created() {
    // Initialize form data if initialData is provided
    if (this.initialData && Object.keys(this.initialData).length > 0) {
      this.factoryData = { ...this.factoryData, ...this.initialData }
    }
  },
  methods: {
    async submitForm() {
      // Validate form before submitting
      const { valid } = await this.$refs.form.validate()
      
      if (!valid) {
        return
      }

      this.loading = true
      try {
        // TODO: Add API call to save factory
        console.log('Saving factory:', this.factoryData)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Emit event to parent
        this.$emit('factory-added', this.factoryData)

        // Emit close event
        this.$emit('onClose')

        // Reset form
        this.factoryData = {
          name: '',
          id: '',
          employees: '',
          address: '',
          description: '',
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