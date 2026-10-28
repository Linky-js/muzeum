<script setup>
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()


const bus = useBroadcastBus({ role: 'monitor', pairId: '2', debug: false })
initMonitorSync(router, bus, '2')

const VIDEO_SRC = '/touch2/monitor2.webm'
</script>
<template>
  <div class="contentMonitor animVideo">
    <div class="title">
      МЕТЕОР: <br>
Всероссийский регистр пациентов <br> с метаболическим синдромом
    </div>
    <video class="" :src="VIDEO_SRC" autoplay muted loop playsinline></video>
  </div>
</template>
<style scoped>
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  font-size: 3.5rem;
  transform: translate(-50%, -50%);
  font-family: 'TT Hoves';
  font-style: normal;
  font-weight: 500;
  font-size: 130px;
  line-height: 100%;
  color: #FFFFFF;
  text-align: center;
}
</style>