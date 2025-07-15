<template>

<v-sheet
  color="primary"
  height="50"
  class="d-flex align-center topstrip-fixed"
>
<v-spacer></v-spacer>
  <v-btn variant="text" href="http://">התחברות</v-btn>
  <v-btn variant="text" href="http://">הרשמה</v-btn>

</v-sheet>

</template>

<script>
export default {
    name: 'TopStrip',
    
    data: () => ({
      
    }),
    methods: {
     
      
    },
    created() {
     
    }
  }
  </script>


<style>
.topstrip-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}
</style>