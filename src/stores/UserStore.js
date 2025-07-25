import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoaderStore } from './LoaderStore'

export const useUserStore = defineStore('UserStore', {
  state: () => ({
    apiUrl: process.env.VUE_APP_API_ADDRESS,
    loaderStore: useLoaderStore(),
    user: {},
    count: 2,
    isAuthenticated: false,
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    apiUrl1: (state) => state.apiUrl
  },
  
  actions: {
    async login(credentials) {
      this.preAction()
      try {
        console.log(credentials)
        const response = await axios.post(this.apiUrl + 'user/login', credentials)
        this.data = response.data
      } catch (error) {
        alert(error.message)
        this.error = error.message
      } finally {
        this.postAction()
      }
    },
 
    preAction() {
      this.loaderStore.show()
    },

    postAction() {
      this.loaderStore.hide()
    }
  }
}) 