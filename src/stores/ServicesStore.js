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
    getDocs: (state) => state.docs,
    getError: (state) => state.error
  },

  actions: {
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
    }
  }
})
