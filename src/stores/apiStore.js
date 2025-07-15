import { defineStore } from 'pinia'
import axios from 'axios'

export const useApiStore = defineStore('api', {
  state: () => ({
    data: null,
    loading: false,
    error: null
  }),

  getters: {
    getData: (state) => state.data,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async fetchInitData() {
      this.loading = true
      this.error = null
     
      const apiUrl = process.env.VUE_APP_API_ADDRESS;
      console.log(apiUrl)
      try {
        const response = await axios.post(apiUrl + 'common/init')
        this.data = response.data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching data:', error)
      } finally {
        this.loading = false
      }
    },


    async demo() {
      this.loading = true
      this.error = null
      const payload = { name: 'John', age: 30 };
      const apiUrl = process.env.VUE_APP_API_ADDRESS;
      console.log(apiUrl)
      try {
        const response = await axios.post(apiUrl + 'users/postMyUser1/', payload)
        this.data = response.data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching data:', error)
      } finally {
        this.loading = false
      }
    }
  }
}) 