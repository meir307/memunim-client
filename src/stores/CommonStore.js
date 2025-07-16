import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoaderStore } from './LoaderStore'

export const CommonStore = defineStore('common', {
  state: () => ({
    apiUrl: process.env.VUE_APP_API_ADDRESS,
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
      const loaderStore = useLoaderStore()
      loaderStore.show()
      this.loading = true
      try {
        const response = await axios.post(this.apiUrl + 'common/init')
        this.data = response.data
        this.handleSuccess();
      } catch (error) {
        alert(error.message)
        this.error = error.message
      } finally {
        this.loading = false
        loaderStore.hide()
      }
    },
    handleSuccess() {
      // This can be called from any action
      console.log('API call succeeded!')
    }
  },
}) 