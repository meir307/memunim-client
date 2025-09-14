import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useSafetyProceduresStore = defineStore('safetyProcedures', {
  state: () => ({
    procedures: [],
    error: null
  }),

  getters: {
    getProcedures: (state) => state.procedures,
    getError: (state) => state.error
  },

  actions: {
    // Fetch all safety procedures
    async fetchProcedures(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/getProcedures', {'factoryId': factoryId}, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.procedures = response.data.procedures
        return response.data.procedures
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch safety procedures'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Add new safety procedure
    async addProcedure(procedureData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/addProcedure', procedureData, {
          headers: {
            'sessionid': userStore.user.sessionId
            // Don't set Content-Type - let browser handle it automatically for FormData
          }
        })
        
        // Add the new procedure to the local state
        this.procedures.push(response.data.procedure)
        return response.data.procedure
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add safety procedure'
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing safety procedure
    async updateProcedure(procedureId, procedureData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/updateProcedure', procedureData, {
            headers: {
              'sessionid': userStore.user.sessionId
            }
          })
        
        // Update the procedure in local state
        const index = this.procedures.findIndex(procedure => procedure.id === procedureId)
        if (index !== -1) {
          this.procedures[index] = response.data
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message 
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete safety procedure
    async deleteProcedure(procedureId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        await axios.delete(`${commonStore.apiUrl}safety-procedures/procedures/${procedureId}`, {
          headers: {
            'sessionId': userStore.sessionId
          }
        })
        
        // Remove the procedure from local state
        this.procedures = this.procedures.filter(procedure => procedure.id !== procedureId)
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete safety procedure'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Upload file for procedure
    async uploadProcedureFile(procedureId, file) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const formData = new FormData()
        formData.append('file', file)
        formData.append('procedureId', procedureId)
        
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/uploadFile', formData, {
          headers: {
            'sessionid': userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })
        
        // Update the procedure in local state with new file info
        const index = this.procedures.findIndex(procedure => procedure.id === procedureId)
        if (index !== -1) {
          this.procedures[index] = response.data.procedure
        }
        
        return response.data.procedure
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to upload procedure file'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Download procedure file
    async downloadProcedureFile(procedureName, factoryId) {
      alert(factoryId)
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/downloadProcedure',
                                                         {'factoryId': factoryId, 'procedureName': procedureName}, {
          headers: {
            'sessionId': userStore.sessionId
          },
          responseType: 'blob'
        })
       
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `procedure-${procedureName}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to download procedure file'
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
      this.procedures = []
      this.error = null
    }
  }
}) 