import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoaderStore } from './LoaderStore'

export const useUserStore = defineStore('UserStore', {
  state: () => ({
    apiUrl: process.env.VUE_APP_API_ADDRESS,
    loaderStore: useLoaderStore(),
    user: JSON.parse(localStorage.getItem('user')) || {},
    count: 2,
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    apiUrl1: (state) => state.apiUrl
  },
  
  actions: {
    async login(credentials) {
      this.preAction()
      try {
        console.log('login')  
        const response = await axios.post(this.apiUrl + 'user/login', credentials)
        this.user = response.data.user
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        
      } catch (error) {
        alert(error.message)
        this.error = error.message
      } finally {
        this.postAction()
      }
    },

    logout() {
      this.user = {}
            // Clear localStorage
      localStorage.removeItem('user')
    },
 
    preAction() {
      this.loaderStore.show()
    },

    postAction() {
      this.loaderStore.hide()
    }
  }
}) 