import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useSafetyCommitteeStore = defineStore('safetyCommittee', {
  state: () => ({
    members: [],
    error: null
  }),

  getters: {
    getMembers: (state) => state.members,
    getError: (state) => state.error,
    getCommitteeMembers: (state) => state.members.filter(member => member.isCommitteeMember),
    getNonCommitteeMembers: (state) => state.members.filter(member => !member.isCommitteeMember)
  },

  actions: {
    // Fetch all safety committee members
    async fetchMembers(factoryId) {
        
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetycommittee/getMembers', {'factoryId': factoryId}, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.members = response.data.members
        return response.data.members
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch safety committee members'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Add new safety committee member
    async addMember(memberData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetycommittee/addMember', memberData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })
        
        // Add the new member to the local state
        this.members.push(response.data.member)
        return response.data.member
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add safety committee member'
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing safety committee member
    async updateMember(memberId, memberData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetycommittee/updateMember', memberData, {
            headers: {
              'sessionid': userStore.user.sessionId
            }
          })
        
        // Update the member in local state
        const index = this.members.findIndex(member => member.id === memberId)
        if (index !== -1) {
          this.members[index] = response.data.member
        }
        
        return response.data.member
      } catch (error) {
        this.error = error.response?.data?.message 
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Delete safety committee member
    async deleteMember(memberId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        await axios.delete(`${commonStore.apiUrl}safety-committee/members/${memberId}`, {
          headers: {
            'sessionId': userStore.sessionId
          }
        })
        
        // Remove the member from local state
        this.members = this.members.filter(member => member.id !== memberId)
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete safety committee member'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Update committee membership status
    async updateCommitteeStatus(memberId, isCommitteeMember) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()
      
      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.patch(`${commonStore.apiUrl}safety-committee/members/${memberId}/status`, {
          isCommitteeMember
        }, {
          headers: {
            'sessionId': userStore.sessionId
          }
        })
        
        // Update the member status in local state
        const index = this.members.findIndex(member => member.id === memberId)
        if (index !== -1) {
          this.members[index].isCommitteeMember = isCommitteeMember
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update committee status'
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
      this.members = []
      this.error = null
    }
  }
}) 