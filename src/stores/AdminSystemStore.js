import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useAdminSystemStore = defineStore('adminSystem', {
  state: () => ({
    users: [],
    error: null
  }),

  getters: {
    getUsers: (state) => state.users,
    getError: (state) => state.error
  },

  actions: {
    // Search users by name, email, or phone
    async searchUsers(searchQuery) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const requestData = {}
        if (searchQuery && searchQuery.trim() !== '') {
          requestData.searchQuery = searchQuery.trim()
        }
        
        const response = await axios.post(commonStore.apiUrl + 'admin/getUsers', requestData, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        this.users = response.data.users || []
        return this.users
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to search users'
        this.users = []
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Create a new user
    async createUser(userData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const response = await axios.post(commonStore.apiUrl + 'admin/createUser', userData, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create user'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Update an existing user
    async updateUser(userData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const response = await axios.post(commonStore.apiUrl + 'admin/updateUser', userData, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete a user
    async deleteUser(userId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const response = await axios.post(commonStore.apiUrl + 'admin/deleteUser', { id: userId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete user'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete user session
    async deleteUserSession(userId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const response = await axios.post(commonStore.apiUrl + 'admin/deleteUserSession', { userId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete user session'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Login as user (admin impersonation)
    async loginAsUser(userId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const response = await axios.post(commonStore.apiUrl + 'admin/loginAsUser', { userId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        // Replace the user state in UserStore with the new user (same as login method)
        userStore.user = response.data.user
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userStore.user))
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to login as user'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Get user factories
    async getUserFactories(userId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        
        const response = await axios.post(commonStore.apiUrl + 'admin/getUserFactories', { userId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        
        return response.data.factories || []
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to get user factories'
        throw error
      } finally {
        loaderStore.hide()
      }
    }
  }
})

