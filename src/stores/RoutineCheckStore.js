import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useRoutineCheckStore = defineStore('routineCheck', {
  state: () => ({
    routineChecks: [],
    routineCheckTypes: [],
    error: null
  }),

  getters: {
    getRoutineChecks: (state) => state.routineChecks,
    getRoutineCheckTypes: (state) => state.routineCheckTypes,
    getError: (state) => state.error
  },

  actions: {

    // Fetch all routine check types for a factory
    async fetchRoutineChecks(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show() 

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routineChecks/getRoutineChecks', { 'factoryId': factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.routineCheckTypes = response.data.routineChecks
        return response.data.routineChecks
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch routine check types'
        throw error
      } finally {
        loaderStore.hide()
      }
    },


    // Add new routine check type
    async addRoutineCheckType(routineCheckTypeData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routineChecks/addCheckType', routineCheckTypeData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })


        // Add the new routine check type to the local state
        this.routineCheckTypes.push(response.data.routineCheckType)
        return response.data.routineCheckType
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to add routine check type'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },





    // Clear error
    clearError() {
      this.error = null
    },

    // Reset store state
    reset() {
      this.routineCheckTypes = []
      this.error = null
    }
  }
})
