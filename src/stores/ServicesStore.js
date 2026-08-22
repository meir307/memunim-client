import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useServicesStore = defineStore('services', {
  state: () => ({
    docs: [],
    error: null
  }),

  getters: {
    getError: (state) => state.error
  },

  actions: {
    async getDocs() {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        const response = await axios.post(commonStore.apiUrl + 'services/getDocs', {}, {
          headers: {
            sessionId: userStore.user.sessionId
          }
        })

        this.docs = response.data.docs || []
        return this.docs
      } catch (error) {
        console.error('API Error:', error)
        this.error = error.response?.data?.message || 'Failed to fetch documents'
        this.docs = []
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    async addDoc(docData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        const formData = new FormData()
        formData.append('name', docData.name || '')
        formData.append('description', docData.description || '')

        const file = Array.isArray(docData.file) ? docData.file[0] : docData.file
        if (file) {
          formData.append('file', file)
        }

        const response = await axios.post(commonStore.apiUrl + 'services/addDoc', formData, {
          headers: {
            sessionId: userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })

        const newDoc = response.data.doc || response.data
        if (newDoc) {
          this.docs.push(newDoc)
        }
        return newDoc
      } catch (error) {
        console.error('API Error:', error)
        this.error = error.response?.data?.message || 'Failed to add document'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    async updateDoc(docData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()

        const formData = new FormData()
        formData.append('id', docData.id)
        formData.append('name', docData.name || '')
        formData.append('description', docData.description || '')

        const file = Array.isArray(docData.file) ? docData.file[0] : docData.file
        if (file) {
          formData.append('file', file)
        }

        const response = await axios.post(commonStore.apiUrl + 'services/updateDoc', formData, {
          headers: {
            sessionId: userStore.user.sessionId,
            'Content-Type': 'multipart/form-data'
          }
        })

        const updatedDoc = response.data.doc || response.data
        if (updatedDoc) {
          const index = this.docs.findIndex(d => Number(d.id) === Number(updatedDoc.id))
          if (index !== -1) {
            this.docs[index] = updatedDoc
          }
        }
        return updatedDoc
      } catch (error) {
        console.error('API Error:', error)
        this.error = error.response?.data?.message || 'Failed to update document'
        throw error
      } finally {
        loaderStore.hide()
      }
    }
  }
})
