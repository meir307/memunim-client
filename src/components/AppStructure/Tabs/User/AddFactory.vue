<template>
  <div>
    <!-- Wizard Steps Indicator -->
    <v-stepper v-model="currentStep" class="mb-4">
      <v-stepper-header>
        <template v-for="(step, index) in steps" :key="step.id">
          <v-stepper-item
            :value="index + 1"
            :title="step.title"
            :subtitle="step.subtitle"
          ></v-stepper-item>
          <v-divider v-if="index < steps.length - 1"></v-divider>
        </template>
      </v-stepper-header>
    </v-stepper>

    <!-- Step Content -->
    <v-stepper-window v-model="currentStep">
      <!-- Step 1: Basic Info -->
      <v-stepper-window-item :value="1">
        <v-form @submit.prevent="nextStep" class="mt-1">
          <v-row>
            <v-col cols="12" md="5">
              <v-text-field
                v-model="factoryData.name"
                label="שם המפעל"
                required
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="factoryData.id"
                label="ח.פ"
                required
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="factoryData.employees"
                label="מספר עובדים"
                required
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="factoryData.description"
                label="תיאור המפעל"
                variant="outlined"
                rows="3"
                reverse
              ></v-textarea>
            </v-col>
          </v-row>
          
          <div class="d-flex justify-end gap-2 mt-4">
            <v-btn
              variant="outlined"
              @click="$emit('cancel')"
            >
              ביטול
            </v-btn>
            <v-btn
              color="primary"
              @click="nextStep"
              :disabled="!factoryData.name || !factoryData.id || !factoryData.employees"
            >
              הבא
            </v-btn>
          </div>
        </v-form>
      </v-stepper-window-item>

      <!-- Step 2: Contact Details -->
      <v-stepper-window-item :value="2">
        <v-form @submit.prevent="nextStep">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="factoryData.address"
                label="כתובת"
                required
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="factoryData.phone"
                label="טלפון"
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="factoryData.email"
                label="אימייל"
                type="email"
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="factoryData.website"
                label="אתר אינטרנט"
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
          </v-row>
          
          <div class="d-flex justify-space-between gap-2 mt-4">
            <v-btn
              variant="outlined"
              @click="previousStep"
            >
              הקודם
            </v-btn>
            <v-btn
              color="primary"
              @click="nextStep"
              :disabled="!factoryData.address"
            >
              הבא
            </v-btn>
          </div>
        </v-form>
      </v-stepper-window-item>

      <!-- Step 3: Additional Info -->
      <v-stepper-window-item :value="3">
        <v-form @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="factoryData.industry"
                label="תחום עיסוק"
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="factoryData.employees"
                label="מספר עובדים"
                type="number"
                variant="outlined"
                reverse
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="factoryData.notes"
                label="הערות נוספות"
                variant="outlined"
                rows="3"
                reverse
              ></v-textarea>
            </v-col>
          </v-row>
          
          <div class="d-flex justify-space-between gap-2 mt-4">
            <v-btn
              variant="outlined"
              @click="previousStep"
            >
              הקודם
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
            >
              הוסף מפעל
            </v-btn>
          </div>
        </v-form>
      </v-stepper-window-item>
    </v-stepper-window>
  </div>
</template>

<script>
export default {
  name: 'AddFactory',
  data: () => ({
    loading: false,
    currentStep: 1,
    steps: [
      { id: 1, title: 'מידע בסיסי', subtitle: 'שם ותיאור המפעל' },
      { id: 2, title: 'אתרים', subtitle: 'אתרי המפעל בהם אתה ממונה בטיחות' },
      { id: 3, title: 'מידע נוסף', subtitle: 'פרטים נוספים על המפעל' }
    ],
    factoryData: {
      name: '',
      id: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      industry: '',
      employees: '',
      notes: ''
    }
  }),
  methods: {
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++
      }
    },
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    async submitForm() {
      this.loading = true
      try {
        // TODO: Add API call to save factory
        console.log('Saving factory:', this.factoryData)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Emit event to parent
        this.$emit('factory-added', this.factoryData)
        
        // Reset form and wizard
        this.factoryData = {
          name: '',
          id: '',
          description: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          industry: '',
          employees: '',
          notes: ''
        }
        this.currentStep = 1
      } catch (error) {
        console.error('Error adding factory:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>