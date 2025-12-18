<script setup>
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'


const router = useRouter();

const bus = useBroadcastBus({ role: 'touch', pairId: '1', debug: false })
initMasterSync(router, bus, 'touch1')

bus.on("defaultScreen", (payload) => {
  router.push('/touch1/screen-1')
})
import { onMounted } from 'vue';
onMounted(() => {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      document.documentElement.requestFullscreen().catch(() => { });
    }, 500);
  });
})
const video = "/bg2.mp4";
</script>
<template>
  <div class="wrapper-content">
    <video class="bg" :src="video" autoplay muted loop playsinline></video>
    <router-view></router-view>
  </div>
</template>
<style scoped>
.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
  position: relative;
  width: 100%;
  height: 100vh;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left bottom;
  z-index: 0;
}

.relative {
  position: relative;
}
</style>