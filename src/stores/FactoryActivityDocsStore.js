import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useFactoryActivityDocsStore = defineStore('factoryActivityDocs', {
  state: () => ({
    docs: [],
    error: null
  }),

  getters: {
    getDocs: (state) => state.docs,
    getError: (state) => state.error
  },

  actions: {
    async fetchDocs(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(
          commonStore.apiUrl + 'factoryactivitydocs/getDocs',
          { factoryId },
          {
            headers: {
              sessionId: userStore.user.sessionId
            }
          }
        )
        this.docs = response.data.docs || []
        return this.docs
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch activity docs'
        this.docs = []
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    async addDoc(formData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'factoryactivitydocs/addDoc', formData, {
          headers: {
            sessionId: userStore.user.sessionId
          }
        })

        const doc = response.data.doc
        if (doc) {
          this.docs.unshift(doc)
        }
        return doc
      } catch (error) {
        this.error = error.response?.data?.message || 'תקלה בשמירת מסמך הפעילות'
        alert(this.error)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    async updateDoc(formData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'factoryactivitydocs/updateDoc', formData, {
          headers: {
            sessionId: userStore.user.sessionId
          }
        })

        const doc = response.data.doc
        if (doc) {
          const index = this.docs.findIndex(d => Number(d.id) === Number(doc.id))
          if (index !== -1) {
            this.docs[index] = { ...this.docs[index], ...doc }
          }
        }
        return doc
      } catch (error) {
        this.error = error.response?.data?.message || 'תקלה בעדכון מסמך הפעילות'
        alert(this.error)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    async deleteDoc(id) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        await axios.post(
          commonStore.apiUrl + 'factoryactivitydocs/deleteDoc',
          { id },
          {
            headers: {
              sessionId: userStore.user.sessionId
            }
          }
        )
        this.docs = this.docs.filter(d => Number(d.id) !== Number(id))
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'תקלה במחיקת מסמך הפעילות'
        alert(this.error)
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    reset() {
      this.docs = []
      this.error = null
    }
  }
})
