import { defineStore } from 'pinia'
import { toRaw } from 'vue'
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
    getRoutineCheckTypes: (state) => {
            // Convert proxy to raw object
      const rawData = toRaw(state.data)
      return rawData.su_params.su_routine_check_types
    },
    getError: (state) => state.error
  },

  actions: {
    async fetchInitData() {
      this.preAction()
      try {
        const response = await axios.post(this.apiUrl + 'common/init')
        this.data = response.data
        console.log(this.data)
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