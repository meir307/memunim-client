import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoaderStore } from './LoaderStore'

export const useUserStore = defineStore('UserStore', {
  state: () => ({
    apiUrl: process.env.VUE_APP_API_ADDRESS,
    loaderStore: useLoaderStore(),
    selectedFactory: null,
    user: (() => {
      const stored = localStorage.getItem('user')
      return stored && stored !== 'undefined' ? JSON.parse(stored) : {}
    })(),
    factories: (() => {
      const stored = localStorage.getItem('factories')
      return stored && stored !== 'undefined' ? JSON.parse(stored) : []
    })(),

    //factories: [],
    count: 2,
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    apiUrl1: (state) => state.apiUrl
  },
  
  actions: {

    

    async updateFactory(factory) {
      
      this.preAction()
      try {
        console.log('addFactory')  
        const response = await axios.post(this.apiUrl + 'user/updateFactory', factory, {
          headers: {
            'sessionId': this.user.sessionId || ''
          }
        })
        this.factories = response.data.factories
        // Save to localStorage
        localStorage.setItem('factories', JSON.stringify(this.factories))

      } catch (error) {
        alert(error.message)
        this.error = error.message
      } finally {
        this.postAction()
      }
    },


    async addFactory(factory) {
      
      this.preAction()
      try {
        console.log('addFactory')  
        const response = await axios.post(this.apiUrl + 'user/addFactory', factory, {
          headers: {
            'sessionId': this.user.sessionId || ''
          }
        })
        this.factories = response.data.factories
        // Save to localStorage
        localStorage.setItem('factories', JSON.stringify(this.factories))

      } catch (error) {
        alert(error.message)
        this.error = error.message
      } finally {
        this.postAction()
      }
    },


    async getFactories() {
      
      this.preAction()
      try {
        console.log('getFactories')  
        const response = await axios.post(this.apiUrl + 'user/getFactories', null,{
          headers: {
            'sessionId': this.user.sessionId || ''
          }
        })
        this.factories = response.data.factories
        // Save to localStorage
        localStorage.setItem('factories', JSON.stringify(this.factories))
          
      } catch (error) {
        //if (error.response && error.response.status === 500) {
          alert(error.response.data.message);
          // Redirect to login page or show login modal
        //}
        //alert(error.message)
        this.error = error.message
      } finally {
        this.postAction()
      }
    },

    async login(credentials) {
      this.preAction()
      try {
        console.log('login')  
        const response = await axios.post(this.apiUrl + 'user/login', credentials)
        this.user = response.data.user
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        
      } catch (error) {
        alert(error.response.data.message)
        this.error = error.response.data.message
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