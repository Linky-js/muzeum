<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const VIDEO_BG_SRC = '/video/monitors/Data_Science.webm'


</script>

<template>
  <div class="contentMonitor">
    <!-- основное видео -->
    <video 
      ref="currentVideoRef"
      key="main"
      class="video-layer animVideo"
      :src="VIDEO_BG_SRC"
      autoplay 
      muted 
      loop
      playsinline>
    </video>
  </div>
</template>

<style scoped>
.contentMonitor{
  position: relative;
  overflow: hidden;
}
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Плавный fade + blur */
.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: opacity 0.8s ease, filter 0.8s ease;
}
.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  filter: blur(10px);
}
</style>