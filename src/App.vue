<script setup>
import { onMounted } from 'vue';
import MusicControls from './components/ui/MusicControls.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const preloadAssets = (urls) => {
  urls.forEach(url => {
    fetch(url, { cache: 'force-cache' })
  })
}
onMounted(() => {
  // Запускаем второе окно только один раз
  // window.open(
  //   'http://localhost:5000/monitor1',
  //   '_blank',
  //   'width=1920,height=1080,left=5120,top=0'
  // )

})
</script>

<template>
  <div class="wrapper">
    <MusicControls v-if="route.meta.music" />
    <RouterView />
  </div>
</template>

<style scoped>
.wrapper {
  background: linear-gradient(23.51deg,
      #000000 -4.02%,
      #030e22 117.07%,
      #000000 171.71%);
}
</style>
