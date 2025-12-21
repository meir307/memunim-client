<template>
  <div class="admin-services-container">
    <v-card class="modern-card">
      <v-card-title class="modern-title">
        <div class="title-container">
          <h2 class="title-text">שירותים</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openDialog" class="add-btn">
            <v-icon left>mdi-plus</v-icon>
            הוסף שירות
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <p class="text-center text-medium-emphasis py-8">ניהול שירותים - יושלם בקרוב</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'AdminServices',
  methods: {
    openDialog() {
      // TODO: Implement add service dialog
    }
  }
}
</script>

<style scoped>
.admin-services-container {
  padding: 6px !important;
  margin: 0 !important;
}

/* Use same style as FactoryTabs - ensure gradient applies */
:deep(.v-card-title.modern-title) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 10px !important;
}

:deep(.modern-title) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 10px !important;
}

:deep(.v-card-title.modern-title *),
:deep(.modern-title *) {
  color: white !important;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-text {
  flex: 0 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 !important;
  font-size: 1.1rem !important;
  font-weight: 100 !important;
  color: white !important;
}

/* Ensure h2 doesn't make it bigger - match FactoryTabs exactly */
h2.title-text {
  font-size: 1.1rem !important;
  font-weight: 100 !important;
  line-height: 1.2 !important;
}

/* Override AdminTabs.css black text color - must be more specific */
.admin-services-container .title-text,
.admin-wrapper .admin-services-container .title-text,
.admin-container .admin-services-container .title-text,
.admin-wrapper .admin-services-container h2.title-text,
.admin-container .admin-services-container h2.title-text,
.admin-services-container h2.title-text {
  color: white !important;
}

/* Also override for all elements inside title-container */
.admin-services-container .title-container,
.admin-services-container .title-container *,
.admin-wrapper .admin-services-container .title-container,
.admin-wrapper .admin-services-container .title-container *,
.admin-container .admin-services-container .title-container,
.admin-container .admin-services-container .title-container * {
  color: white !important;
}

.add-btn {
  flex-shrink: 0 !important;
  min-width: auto;
}
</style>

