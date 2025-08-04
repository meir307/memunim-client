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
                        <!-- <v-form ref="form"> -->
                        <v-text-field v-model="user.fullName" :rules="validationRules.fullNameRules" label="שם מלא"
                            type="text" reverse></v-text-field>
                        <v-text-field v-model="user.email" :rules="validationRules.emailRules" label="אימייל"
                            type="email" reverse></v-text-field>
                        <v-text-field v-model="user.phone" :rules="validationRules.phoneRules" label="טלפון" type="text"
                            reverse>
                        </v-text-field>


                        <v-text-field v-model="user.password" :rules="validationRules.passwordRules" label="סיסמה"
                            type="password" reverse>
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
            loaderStore: useLoaderStore()
        }
    },
    methods: {
        async regUser() {
            const emailValid = this.validationRules.emailRules.every(rule => rule(this.user.email) === true);
            const passwordValid = this.validationRules.passwordRules.every(rule => rule(this.user.password) === true);
            const fullNameValid = this.validationRules.fullNameRules.every(rule => rule(this.user.fullName) === true);
            const phoneValid = this.validationRules.phoneRules.every(rule => rule(this.user.phone) === true);

            if (emailValid && passwordValid && fullNameValid && phoneValid) {
                this.loaderStore.show()
                try {
                    const commonStore = useCommonStore()
                    const response = await axios.post(commonStore.apiUrl + 'user/register', this.user)
                    alert('Registration successful!')
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