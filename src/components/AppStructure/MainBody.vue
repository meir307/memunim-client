<template>

<div class="d-flex  main-content"  >
<v-tabs
      v-model="tab"
      align-tabs="center"
    
      color="deep-purple-accent-1"
      
    >
    <v-tab :value="2">חוקים ותקנות</v-tab>
      <v-tab :value="1">בעלי מקצוע</v-tab>

      
    </v-tabs>
</div>

<v-container>

    

      <v-row class="text-center">
        <v-col cols="12">
          <v-img
            :src="require('../../assets/logo.svg')"
            class="my-3"
            contain
            height="900"
          />
        </v-col>

        <v-col class="mb-4">
          <h1 class="display-2 font-weight-bold mb-3">
            אפליקציה לניהול בטיחות במפעלים
          </h1>
        </v-col>

      </v-row>
    </v-container>

</template>
<script>
export default {
    name: 'MainBody',
    
    data: () => ({
      tab:1
    }),
    methods: {
     
      
    },
    created() {
     
    }
  }
  </script>
  
<style>
.main-content {
  margin-top: 50px;
}
</style>
  