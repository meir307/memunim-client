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

    // Add new routine check
    async addRoutineCheck(routineCheckData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routineChecks/addCheck', routineCheckData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // addCheck API returns what ever fetchRoutineChecks returns
        this.routineCheckTypes = response.data.routineChecks

      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to add routine check'
        this.error = errorMessage
        alert(errorMessage)
        throw error
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
        const response = await axios.post(commonStore.apiUrl + 'routineChecks/updateCheck', routineCheckData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Update the routine check in the local state
        const index = this.routineChecks.findIndex(check => check.id === response.data.routineCheck.id)
        if (index !== -1) {
          this.routineChecks[index] = response.data.routineCheck
        }
        return response.data.routineCheck
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to update routine check'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete routine check
    async deleteHistoryCheck(checkId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routineChecks/deleteHistoryCheck', { checkId }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Remove the routine check from the local state
        this.routineChecks = this.routineChecks.filter(check => check.id !== checkId)
        return response.data
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete routine check'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Update routine check type
    async updateRoutineCheckType(id, updateData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        await axios.post(commonStore.apiUrl + 'routineChecks/updateCheckTypeRemark', {
          id: id,
          remark: updateData.remark
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message
        this.error = errorMessage

      } finally {
        loaderStore.hide()
      }
    },

    // Get check history for a specific check type
    async getCheckHistory(id, checkTypeId, factoryId) {

      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routineChecks/getCheckHistory', {
          id: id,
          checkTypeId: checkTypeId,
          factoryId: factoryId
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        return response.data.checkHistory || []
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to fetch check history'
        this.error = errorMessage
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Add files to a specific check
    async addCheckFiles(checkId, files) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('checkId', checkId)
        formData.append('factoryId', userStore.selectedFactory.id)

        // Append all selected files
        files.forEach((file) => {
          formData.append('files', file)
        })

        const response = await axios.post(commonStore.apiUrl + 'routineChecks/addCheckFiles', formData, {
          headers: {
            'sessionid': userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })

        return response.data.checkFiles
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to upload files'
        this.error = errorMessage
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Update remark for a specific check
    async updateCheckRemark(checkId, remark) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        await axios.post(commonStore.apiUrl + 'routineChecks/updateCheckRemark', {
          checkId,
          remark
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        return true
      } catch (error) {

        const errorMessage = error.response?.data?.message || 'Failed to update check remark'
        this.error = errorMessage
        alert(errorMessage)
        return false
      } finally {
        loaderStore.hide()
      }
    },

    // Delete file from a specific check
    async deleteCheckFile(checkId, fileName) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        await axios.post(commonStore.apiUrl + 'routineChecks/deleteCheckFile', {
          checkId,
          fileName,
          factoryId: userStore.selectedFactory.id
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        return true
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete file'
        this.error = errorMessage
        return false
      } finally {
        loaderStore.hide()
      }
    },
    // Delete routine check type
    async deleteRoutineCheckType(id) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'routineChecks/deleteCheckType', {
          id
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Remove the check type from local state
        this.routineCheckTypes = this.routineCheckTypes.filter(checkType => checkType.id !== id)
        return response.data
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete routine check type'
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
      this.routineChecks = []
      this.routineCheckTypes = []
      this.error = null
    }
  }
})