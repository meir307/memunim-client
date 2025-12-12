<template>
  <div class="severity-radio-group">
    <v-radio-group
      :model-value="modelValue || 2"
      @update:model-value="handleUpdate"
      inline
      density="compact"
      hide-details
      class="severity-radios"
      :disabled="disabled"
    >
      <v-radio
        :value="1"
        label="נמוכה"
        class="severity-radio severity-radio-1"
      ></v-radio>
      <v-radio
        :value="2"
        label="בינונית"
        class="severity-radio severity-radio-2"
      ></v-radio>
      <v-radio
        :value="3"
        label="גבוהה"
        class="severity-radio severity-radio-3"
      ></v-radio>
    </v-radio-group>
  </div>
</template>

<script>
export default {
  name: 'SeverityControl',
  props: {
    modelValue: {
      type: Number,
      default: 2
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function handleUpdate(value) {
      emit('update:modelValue', value)
    }

    return {
      handleUpdate
    }
  }
}
</script>

<style scoped>
.severity-radio-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.severity-radios {
  margin: 0 !important;
  padding: 0 !important;
}

.severity-radio {
  margin-right: 16px;
}

.severity-radio-1 ::v-deep(.v-label) {
  color: #2e7d32 !important;
  font-weight: 600;
}

.severity-radio-1 ::v-deep(.v-selection-control-group__input) {
  color: #2e7d32 !important;
}

.severity-radio-2 ::v-deep(.v-label) {
  color: #f57c00 !important;
  font-weight: 600;
}

.severity-radio-2 ::v-deep(.v-selection-control-group__input) {
  color: #f57c00 !important;
}

.severity-radio-3 ::v-deep(.v-label) {
  color: #c62828 !important;
  font-weight: 600;
}

.severity-radio-3 ::v-deep(.v-selection-control-group__input) {
  color: #c62828 !important;
}
</style>

