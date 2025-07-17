<template>
  <div class="d-flex main-content">
    <v-tabs v-model="tab" align-tabs="center" color="deep-purple-accent-1" selected-class="my-selected-tab">
      <v-tab v-for="tabItem in tabs" :key="tabItem.id">
        {{ tabItem.text }}
      </v-tab>
    </v-tabs>
  </div>

  <v-window v-model="tab">
    <v-window-item v-for="tabItem in tabs" :key="tabItem.id" :value="tabItem.id">
      <component :is="tabItem.component" />
    </v-window-item>
  </v-window>
</template>

<script>
import MainRegulations from './Tabs/Regulations/MainRegulations.vue'
import MainServices from './Tabs/ProServices/MainServices.vue'

export default {
  name: 'MainBody',
  components: { MainRegulations, MainServices },
  data: () => ({
    tab: 0,
    links: [
     
      {
        id: 0,
        text: 'חוקים ותקנות',
        component: 'MainRegulations'
      },
      {
        id: 1,
        text: 'נותני שרות',
        component: 'MainServices'
      },
      {
        id: 2,
        text: 'איזור אישי',
        component: 'MainRegulations'
      },
      
     
    ]
  }),

  computed: {
    tabs: {
      get() {
        return this.links.slice(0, -1)
      },
      // set() {   //I dont need this. only to avoid error
      // }
    }
  }
}
</script>

<style>
.main-content {
  margin-top: 50px;
}

.my-selected-tab {
  font-weight: bold;
  color: #ff9800 !important;
  /* Example: orange */
  background-color: #e7edff !important;
  /* Example: light background */
  border-bottom: 7px solid #367dbe !important;
  /* Example: underline */
  /* Add any other styles you want */
}
</style>