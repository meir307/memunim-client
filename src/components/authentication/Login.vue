<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">
            <h2>התחברות</h2>
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                label="אימייל"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                label="סיסמה"
                type="password"
                required
              ></v-text-field>
              <v-btn color="primary" block>התחבר</v-btn>
            </v-form>
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