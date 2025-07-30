<template>
  <div class="main-content">
    <h1>ברוכים הבאים ל-Memunim</h1>
    <p>בחרו את האפשרות הרצויה מהתפריט למעלה</p>
  </div>
</template>

<script>
import { useCommonStore } from '@/stores/CommonStore'

export default {
  name: 'HelloWorld',
  async created() {
    const commonStore = useCommonStore()
    await commonStore.fetchInitData()
  }
}
</script>

<style scoped>
.main-content {
  padding: 20px;
  text-align: center;
}
</style>
