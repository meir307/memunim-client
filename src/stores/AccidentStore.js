import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useAccidentStore = defineStore('accident', {
  state: () => ({
    accidents: [],
    error: null
  }),

  getters: {
    getAccidents: (state) => state.accidents,
    getError: (state) => state.error
  },

  actions: {
    // Fetch all accidents for a factory
    async fetchAccidents(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const response = await axios.post(commonStore.apiUrl + 'accidents/getAccidents', {
          factoryId
        }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.accidents = response.data.accidents || []
        return this.accidents
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch accidents'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Add new accident
    async addAccident(accidentData) {
        console.log('accidents');
        
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('factoryId', userStore.selectedFactory.id)
        formData.append('title', accidentData.title)
        
        // Create details JSON object with description and severity
        const details = {
          description: accidentData.description || ''
          //severity: accidentData.severity || 1
        }
        formData.append('details', JSON.stringify(details))
        formData.append('severity', String(accidentData.severity))
        
        // Convert date from DD/MM/YYYY to YYYY-MM-DD format
        let dateValue = accidentData.date
        if (dateValue && dateValue.includes('/')) {
          const parts = dateValue.split('/')
          if (parts.length === 3) {
            dateValue = `${parts[2]}-${parts[1]}-${parts[0]}` // YYYY-MM-DD
          }
        }
        formData.append('date', dateValue)

        // Append multiple files
        if (accidentData.files && accidentData.files.length > 0) {
          accidentData.files.forEach((file) => {
            formData.append('files', file)
          })
        }

        const response = await axios.post(commonStore.apiUrl + 'accidents/addAccident', formData, {
          headers: {
            'sessionid': userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })

        // Add the new accident to the local state
        this.accidents.push(response.data.accident)
        return response.data.accident
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to add accident'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing accident
    async updateAccident(accidentData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        // Create request body (no files - files are managed separately)
        const requestData = {
          id: accidentData.id,
          factoryId: userStore.selectedFactory.id,
          title: accidentData.title
        }
        
        // Create details JSON object with description and severity
        const details = {
          description: accidentData.description || '',
          severity: accidentData.severity || 1
        }
        requestData.details = JSON.stringify(details)
        requestData.severity = String(accidentData.severity || 1)

        const response = await axios.post(commonStore.apiUrl + 'accidents/updateAccident', requestData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Update the accident in the local state
        const index = this.accidents.findIndex(accident => accident.id === response.data.accident.id)
        if (index !== -1) {
          this.accidents[index] = response.data.accident
        }
        return response.data.accident
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to update accident'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete accident
    async deleteAccident(accidentId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'accidents/deleteAccident', { 
          id: accidentId,
          factoryId: userStore.selectedFactory.id 
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Remove the accident from the local state
        this.accidents = this.accidents.filter(accident => accident.id !== accidentId)
        return response.data
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete accident'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete file from accident
    async deleteAccidentFile(accidentId, fileName) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        // Extract filename from path if it contains a path
        let actualFileName = fileName
        if (fileName && (fileName.includes('/') || fileName.includes('\\'))) {
          // Handle URL paths
          try {
            const url = new URL(fileName)
            const pathParts = url.pathname.split('/')
            actualFileName = pathParts[pathParts.length - 1]
          } catch {
            // Not a valid URL, treat as file path
            const pathParts = fileName.replace(/\\/g, '/').split('/')
            actualFileName = pathParts[pathParts.length - 1]
          }
        }
        
        // Decode URL encoding (e.g., %20 to space)
        try {
          actualFileName = decodeURIComponent(actualFileName)
        } catch {
          // If decoding fails, use the original
        }
        
        const response = await axios.post(commonStore.apiUrl + 'accidents/deleteFile', { 
          accidentId: accidentId,
          fileName: actualFileName,
          factoryId: userStore.selectedFactory.id 
        }, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Update the accident in the local state with the returned file list
        const accident = this.accidents.find(acc => acc.id === accidentId)
        if (accident && response.data.files !== undefined) {
          accident.files = response.data.files || []
          if (accident.files.length === 0) {
            accident.fileName = null
          }
        }

        return response.data
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete file'
        this.error = errorMessage
        alert(errorMessage)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Upload single file to accident
    async uploadAccidentFile(accidentId, file) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('accidentId', accidentId)
        formData.append('factoryId', userStore.selectedFactory.id)
        formData.append('file', file)

        const response = await axios.post(commonStore.apiUrl + 'accidents/uploadFile', formData, {
          headers: {
            'sessionid': userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })

        // Update the accident in the local state with the returned file list
        const accident = this.accidents.find(acc => acc.id === accidentId)
        if (accident && response.data.files !== undefined) {
          accident.files = response.data.files || []
        }

        return response.data
      } catch (error) {
        console.error('API Error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to upload file'
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
      this.accidents = []
      this.error = null
    }
  }
})

