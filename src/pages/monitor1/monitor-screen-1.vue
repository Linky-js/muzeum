<script setup>
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()


const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')
const VIDEO_SRC = '/video/monitors/metabol_center.webm'
</script>
<template>
    <div class="contentMonitor">
        <video class="animVideo" :src="VIDEO_SRC" autoplay muted loop playsinline></video>
    </div>
</template>
<style scoped>
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>