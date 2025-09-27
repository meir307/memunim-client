import { defineStore } from 'pinia'
import axios from 'axios'
import { useCommonStore } from './CommonStore'
import { useLoaderStore } from './LoaderStore'
import { useUserStore } from './UserStore'

export const useSafetyCommitteeStore = defineStore('safetyCommittee', {
  state: () => ({
    members: [],
    meetings: [],
    error: null
  }),

  getters: {
    getMembers: (state) => state.members,
    getMeetings: (state) => state.meetings,
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
        const response = await axios.post(commonStore.apiUrl + 'safetycommittee/getMembers', { 'factoryId': factoryId }, {
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
        const factoryId = userStore.selectedFactory.id

        await axios.post(commonStore.apiUrl + 'safetycommittee/deleteMember', { 'memberId': memberId, 'factoryId': factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
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

    // Add new safety committee member
    async addMeeting(memberData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetycommittee/addMeeting', memberData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Add the new meeting to the local state
        this.meetings.push(response.data.meeting)
        return response.data.meeting
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add safety committee meetting'
        throw this.error
      } finally {
        loaderStore.hide()
      }
    },

    // Fetch all safety committee meetings
    async fetchMeetings(factoryId) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetycommittee/getMeetings', { 'factoryId': factoryId }, {
          headers: {
            'sessionId': userStore.user.sessionId
          }
        })
        this.meetings = response.data.meetings
        return response.data.meetings
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch safety committee meetings'
        throw error
      } finally {
        loaderStore.hide()
      }
    },

    // Update existing safety committee meeting
    async updateMeeting(meetingData) {
      this.error = null
      const loaderStore = useLoaderStore()
      loaderStore.show()

      try {
        const commonStore = useCommonStore()
        const userStore = useUserStore()
        const response = await axios.post(commonStore.apiUrl + 'safetycommittee/updateMeeting', meetingData, {
          headers: {
            'sessionid': userStore.user.sessionId
          }
        })

        // Update the meeting in local state
        const index = this.meetings.findIndex(meeting => meeting.id == response.data.meeting.id)
        if (index !== -1) {
          this.meetings[index] = response.data.meeting
        }

        return response.data.meeting
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update safety committee meeting'
        throw this.error
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
      this.meetings = []
      this.error = null
    }
  }
}) 