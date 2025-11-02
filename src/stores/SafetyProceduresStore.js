import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useSafetyProceduresStore = defineStore('safetyProcedures', {
  state: () => ({
    procedures: [],
    guides: [],
    error: null
  }),

  getters: {
    getProcedures: (state) => state.procedures,
    getGuides: (state) => state.guides,
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

    // Fetch all safety guides
    async fetchGuides(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/getGuides', {'factoryId': factoryId}, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.guides = response.data.guides
        return response.data.guides
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch safety guides'
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
        this.error = error.response?.data?.message || 'תקלה בשמירת הנהל'
        alert(this.error)
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing safety procedure
    async updateProcedure(procedureData) {
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
        const index = this.procedures.findIndex(procedure => procedure.id == response.data.procedure.id )
        if (index !== -1) {
          this.procedures[index] = response.data.procedure
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message 
        alert(this.error)
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete safety procedure
    async deleteProcedure(procedure) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const res = await axios.post(commonStore.apiUrl + 'safetyprocedures/deleteProcedure', procedure, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })
        
        // Remove the procedure from local state
        this.procedures = this.procedures.filter(procedure => res.data.procedureId !== procedure.id)
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete safety procedure'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Add new safety guide
    async addGuide(guideData) {

      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/addGuide', guideData, {
          headers: {
            'sessionid': userStore.user.sessionId
            // Don't set Content-Type - let browser handle it automatically for FormData
          }
        })
        
        // Add the new guide to the local state
        this.guides.push(response.data.guide)
        return response.data.guide
      } catch (error) {
        this.error = error.response?.data?.message || 'תקלה בשמירת המדריך'
        alert(this.error)
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing safety guide
    async updateGuide(guideData) {
      
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetyprocedures/updateGuide', guideData, {
            headers: {
              'sessionid': userStore.user.sessionId
            }
          })
   
        // Update the guide in local state
        const index = this.guides.findIndex(guide => guide.id == response.data.guide.id )
        if (index !== -1) {
          this.guides[index] = response.data.guide
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message 
        alert(this.error)
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete safety guide
    async deleteGuide(guide) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const res = await axios.post(commonStore.apiUrl + 'safetyprocedures/deleteGuide', guide, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })
        
        // Remove the guide from local state
        this.guides = this.guides.filter(guide => res.data.guideId !== guide.id)
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete safety guide'
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
      this.guides = []
      this.error = null
    }
  }
}) 