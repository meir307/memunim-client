<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card>
                    <v-card-title class="popup-title d-flex align-center justify-space-between">
                        הרשמה
                        <v-btn icon="mdi-close" variant="text" @click="$emit('btnClose')"></v-btn>
                    </v-card-title>
                    <v-card-text>
                        <p class="text-center mb-4" style="color: #666; font-size: 16px; font-weight: bold;">
                            ההרשמה למערכת היא עבור ממוני בטיחות מוסמכים בלבד.
                        </p>
                        <!-- <v-form ref="form"> -->
                        <v-text-field v-model="user.fullName" :rules="validationRules.fullNameRules" label="שם מלא"
                            type="text" reverse></v-text-field>
                        <v-text-field v-model="user.email" :rules="validationRules.emailRules" label="אימייל"
                            type="email" reverse></v-text-field>
                        <v-text-field v-model="user.phone" :rules="validationRules.phoneRules" label="טלפון" type="text"
                            reverse>
                        </v-text-field>


                        <v-text-field 
                            v-model="user.password" 
                            :rules="validationRules.passwordRules" 
                            label="סיסמה"
                            :type="showPassword ? 'text' : 'password'"
                            reverse
                            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showPassword = !showPassword"
                        >
                        </v-text-field>

                        <v-text-field 
                            v-model="confirmPassword" 
                            :rules="passwordConfirmRules" 
                            label="אימות סיסמה"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            reverse
                            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showConfirmPassword = !showConfirmPassword"
                        >
                        </v-text-field>

                        <div class="popup-btn-row">
                            <v-btn @click="regUser" color="primary">הרשם</v-btn>
                            <v-btn @click="$emit('btnClose')">סגור</v-btn>
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
import axios from 'axios'
import { useCommonStore } from '@/stores/CommonStore'
import { useLoaderStore } from '@/stores/LoaderStore'

export default {
    name: 'RegistrationComponent',
    data() {
        return {
            user: {
                fullName: '',
                email: '',
                phone: '',
                password: '',
                role: 1
            },
            validationRules,
            loaderStore: useLoaderStore(),
            showPassword: false,
            showConfirmPassword: false,
            confirmPassword: ''
        }
    },
    computed: {
        passwordConfirmRules() {
            return [
                this.validationRules.required,
                (v) => v === this.user.password || 'הסיסמאות אינן תואמות'
            ]
        }
    },
    methods: {
        async regUser() {
            const emailValid = this.validationRules.emailRules.every(rule => rule(this.user.email) === true);
            const passwordValid = this.validationRules.passwordRules.every(rule => rule(this.user.password) === true);
            const fullNameValid = this.validationRules.fullNameRules.every(rule => rule(this.user.fullName) === true);
            const phoneValid = this.validationRules.phoneRules.every(rule => rule(this.user.phone) === true);
            const passwordConfirmValid = this.passwordConfirmRules.every(rule => rule(this.confirmPassword) === true);

            if (emailValid && passwordValid && fullNameValid && phoneValid && passwordConfirmValid) {
                this.loaderStore.show()
                try {
                    const commonStore = useCommonStore()
                    const response = await axios.post(commonStore.apiUrl + 'user/register', this.user)
                    alert('הרשמה בוצעה בהצלחה.\nנשלח אליך מייל עם קישור להפעלת החשבון.\nיש להפעיל את החשבון כדי להתחיל להשתמש במערכת.')
                    console.log(response)
                    this.$emit('btnClose')
                } catch (error) {
                    alert(error.response?.data?.message || 'Registration failed')
                } finally {
                    this.loaderStore.hide()
                }
            } else {
                alert('not valid')
            }
        }
    }
}
</script>

<style scoped></style>