import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoaderStore } from './LoaderStore'

export const useCommonStore = defineStore('common', {
  state: () => ({
    loaderStore: useLoaderStore(),
    apiUrl: process.env.VUE_APP_API_ADDRESS,
    data: null,
    error: null
  }),

  getters: {
    getData: (state) => state.data,
    getFactoryWork:  (state) => state.data.su_factory_work,
    getError: (state) => state.error
  },

  actions: {
    async fetchInitData() {
      this.preAction()
      try {
        const response = await axios.post(this.apiUrl + 'common/init')
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
  },
}) 