<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="popup-title">
            <h3>כניסה</h3>
          </v-card-title>
          <v-card-text>

            <v-text-field reverse label="אימייל" type="email" required></v-text-field>
            <v-text-field reverse label="סיסמה" type="password" required></v-text-field>
            <div class="popup-btn-row">
              <v-btn color="primary" >התחבר</v-btn>
              <v-btn @click="$emit('btnCancel')">סגור</v-btn>
              <v-spacer></v-spacer>
            </div>

            <!-- <div class="login-btn-row">
                <v-btn color="primary">התחבר</v-btn>
                <v-btn @click="$emit('btnCancel')">סגור</v-btn>
              </div>
             -->


          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LoginComponent',
  data: () => ({
    //
  }),
};
</script>

<style scoped>

</style>