<template>
  <div>

    <TopStrip></TopStrip>
    <MainBody></MainBody>

  </div>
</template>

<script>
import { useCommonStore } from '@/stores/CommonStore'
import TopStrip from './TopStrip.vue'
import MainBody from './MainBody.vue'
//import { MainBody } from './MainBody.vue'


export default {
  name: 'HelloWorld',
  components: { TopStrip, MainBody },
  data: () => ({

  }),
  methods: {
    async init() {

      const commonStore = useCommonStore()
      await commonStore.fetchInitData()
    }
  },
  created() {

    this.init()
  }
}
</script>
