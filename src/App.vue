<template>
  <router-view></router-view>
  <ToastContainer />
</template>

<script>
import ToastContainer from '@/views/Private/utils/toastContainerView.vue'

export default {
  name: 'App',
  components: { ToastContainer },
}
</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

</style>
