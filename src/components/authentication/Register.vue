<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="popup-title">
            <h3>הרשמה</h3>
          </v-card-title>
          <v-card-text>
            <!-- <v-form ref="form"> -->
              <v-text-field
                v-model="user.fullName"
                :rules="validationRules.fullNameRules"
                label="שם מלא"
                type="text"
                reverse
              ></v-text-field>
              <v-text-field
                v-model="user.email"
                :rules="validationRules.emailRules"
                label="אימייל"
                type="email"
                reverse
                
              ></v-text-field>
              <v-text-field 
                v-model="user.phone"  
                :rules="validationRules.phoneRules"
                label="טלפון" type="text"  
                reverse>
             </v-text-field>


              <v-text-field 
                v-model="user.password" 
                 :rules="validationRules.passwordRules"
                label="סיסמה" 
                type="password" 
                reverse>
            </v-text-field>
              
              
              
              <div class="popup-btn-row">
                <v-btn @click="regUser" color="primary">הרשם</v-btn>
                <v-btn @click="$emit('btnCancel')">סגור</v-btn>
                <v-spacer></v-spacer>
              </div>
            <!-- </v-form> -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
 import * as validationRules from '@/utils/ValidationRules'
export default {
  name: 'RegistrationComponent',
  data() {
    return {
      user: {
        fullName: '',
        email: '',
        phone: '',
        password: ''
      },
      validationRules,
      
    }
  },
  methods: {
    regUser() {
        const emailValid = this.validationRules.emailRules.every(rule => rule(this.user.email) === true);
        const passwordValid = this.validationRules.passwordRules.every(rule => rule(this.user.password) === true);
        const fullNameValid = this.validationRules.fullNameRules.every(rule => rule(this.user.fullName) === true);
        const phoneValid = this.validationRules.phoneRules.every(rule => rule(this.user.phone) === true);
        
        if (emailValid && passwordValid && fullNameValid && phoneValid)
            alert('valid')
        else
            alert('not valid')
    
        
    }
  }
}
</script>

<style scoped>

</style>