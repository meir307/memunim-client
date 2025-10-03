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
    // Fetch all routine checks for a factory
    async fetchRoutineChecks(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routinecheck/getRoutineChecks', { 'factoryId': factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.routineChecks = response.data.routineChecks
        return response.data.routineChecks
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch routine checks'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Fetch all routine check types for a factory
    async fetchRoutineCheckTypes(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routinecheck/getCheckTypes', { 'factoryId': factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.routineCheckTypes = response.data.routineCheckTypes
        return response.data.routineCheckTypes
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch routine check types'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Add new routine check
    async addRoutineCheck(routineCheckData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routinecheck/addRoutineCheck', routineCheckData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Add the new routine check to the local state
        this.routineChecks.push(response.data.routineCheck)
        return response.data.routineCheck
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add routine check'
        throw this.error
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
        this.error = error.response?.data?.message || 'Failed to add routine check type'
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing routine check
    async updateRoutineCheck(routineCheckData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routinecheck/updateRoutineCheck', routineCheckData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Update the routine check in local state
        const index = this.routineChecks.findIndex(check => check.id == response.data.routineCheck.id)
        if (index !== -1) {
          this.routineChecks[index] = response.data.routineCheck
        }

        return response.data.routineCheck
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update routine check'
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing routine check type
    async updateRoutineCheckType(routineCheckTypeData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routinecheck/updateRoutineCheckType', routineCheckTypeData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Update the routine check type in local state
        const index = this.routineCheckTypes.findIndex(type => type.id == response.data.routineCheckType.id)
        if (index !== -1) {
          this.routineCheckTypes[index] = response.data.routineCheckType
        }

        return response.data.routineCheckType
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update routine check type'
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete routine check
    async deleteRoutineCheck(routineCheckId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const factoryId = userStore.selectedFactory.id

        await axios.post(commonStore.apiUrl + 'routinecheck/deleteRoutineCheck', { 'routineCheckId': routineCheckId, 'factoryId': factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })

        // Remove the routine check from local state
        this.routineChecks = this.routineChecks.filter(check => check.id !== routineCheckId)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete routine check'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete routine check type
    async deleteRoutineCheckType(routineCheckTypeId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const factoryId = userStore.selectedFactory.id

        await axios.post(commonStore.apiUrl + 'routinecheck/deleteRoutineCheckType', { 'routineCheckTypeId': routineCheckTypeId, 'factoryId': factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })

        // Remove the routine check type from local state
        this.routineCheckTypes = this.routineCheckTypes.filter(type => type.id !== routineCheckTypeId)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete routine check type'
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
      this.routineChecks = []
      this.routineCheckTypes = []
      this.error = null
    }
  }
})
