<template>
  <div class="filter-users-container">
    <div class="search-row">
      <v-text-field
        v-model="searchQuery"
        label="חפש משתמש (שם, אימייל, טלפון)"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        clearable
        reverse
        hide-details
        @click:clear="handleClear"
        @keyup.enter="handleSearch"
        class="search-input"
      ></v-text-field>
      <v-btn 
        color="primary" 
        @click="handleSearch"
        class="search-btn"
      >
        <v-icon left>mdi-magnify</v-icon>
        חפש
      </v-btn>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'FilterUsers',
  emits: ['search'],
  setup(props, { emit }) {
    const searchQuery = ref('')

    function handleSearch() {
      emit('search', searchQuery.value)
    }

    function handleClear() {
      searchQuery.value = ''
      emit('search', '')
    }

    return {
      searchQuery,
      handleSearch,
      handleClear
    }
  }
}
</script>

<style scoped>
.filter-users-container {
  padding: 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  flex: 1;
}

.search-btn {
  flex-shrink: 0;
  min-width: 100px;
}
</style>

