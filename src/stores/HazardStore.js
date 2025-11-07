import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useHazardStore = defineStore('hazard', {
  state: () => ({
    hazards: [],
    error: null
  }),

  getters: {
    getHazards: (state) => state.hazards,
    getError: (state) => state.error
  },

  actions: {
    // Fetch all hazards for a factory
    async fetchHazards(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'hazards/getHazards', { factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.hazards = response.data.hazards || []
        return this.hazards
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch hazards'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Add new hazard
    async addHazard(hazardData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('factoryId', userStore.selectedFactory.id)
        formData.append('title', hazardData.title)
        formData.append('description', hazardData.description || '')
        
        // Convert date from DD/MM/YYYY to YYYY-MM-DD format
        let dateValue = hazardData.date
        if (dateValue && dateValue.includes('/')) {
          const parts = dateValue.split('/')
          if (parts.length === 3) {
            dateValue = `${parts[2]}-${parts[1]}-${parts[0]}` // YYYY-MM-DD
          }
        }
        formData.append('date', dateValue)
        
        // Ensure severity is a number
        formData.append('severity', String(hazardData.severity || 2))

        // Append file if any (single file, not array)
        if (hazardData.files && hazardData.files.length > 0 && hazardData.files[0]) {
          formData.append('file', hazardData.files[0])
        }

        const response = await axios.post(commonStore.apiUrl + 'hazards/addHazard', formData, {
          headers: {
            'sessionid': userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })

        // Add the new hazard to the local state
        this.hazards.push(response.data.hazard)
        return response.data.hazard
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to add hazard'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing hazard
    async updateHazard(hazardData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('id', hazardData.id)
        formData.append('factoryId', userStore.selectedFactory.id)
        formData.append('title', hazardData.title)
        formData.append('description', hazardData.description || '')
        
        // Convert date from DD/MM/YYYY to YYYY-MM-DD format
        let dateValue = hazardData.date
        if (dateValue && dateValue.includes('/')) {
          const parts = dateValue.split('/')
          if (parts.length === 3) {
            dateValue = `${parts[2]}-${parts[1]}-${parts[0]}` // YYYY-MM-DD
          }
        }
        formData.append('date', dateValue)
        
        // Ensure severity is a number
        formData.append('severity', String(hazardData.severity || 2))

        // Append file if any (single file, not array)
        if (hazardData.files && hazardData.files.length > 0 && hazardData.files[0]) {
          formData.append('file', hazardData.files[0])
        }

        const response = await axios.post(commonStore.apiUrl + 'hazards/updateHazard', formData, {
          headers: {
            'sessionid': userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })

        // Update the hazard in the local state
        const index = this.hazards.findIndex(hazard => hazard.id === response.data.hazard.id)
        if (index !== -1) {
          this.hazards[index] = response.data.hazard
        }
        return response.data.hazard
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to update hazard'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Save hazard remark (description only)
    async saveHazardRemark(hazardData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        await axios.post(commonStore.apiUrl + 'hazards/saveHazardRemark', {
          id: hazardData.id,
          description: hazardData.description || ''
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

      
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to save hazard remark'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Save hazard severity (severity only)
    async saveSeverity(hazardData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        await axios.post(commonStore.apiUrl + 'hazards/saveSeverity', {
          id: hazardData.id,
          severity: hazardData.severity || 2
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

      
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to save hazard severity'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete hazard
    async deleteHazard(hazardId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'hazards/deleteHazard', { 
          id: hazardId,
          factoryId: userStore.selectedFactory.id 
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Remove the hazard from the local state
        this.hazards = this.hazards.filter(hazard => hazard.id !== hazardId)
        return response.data
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete hazard'
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
      this.hazards = []
      this.error = null
    }
  }
})

