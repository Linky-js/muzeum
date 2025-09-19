<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: true })
initMonitorSync(router, bus, '1')

const videoEl = ref(null)
const VIDEO_SRC = '/2.mp4'

function preloadViaLink(url) {
  try {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'video'
    link.href = url
    document.head.appendChild(link)
  } catch (e) {
    console.warn('preload failed', e)
  }
}

async function safePlay(retries = 3) {
  if (!videoEl.value) return
  for (let i = 0; i < retries; i++) {
    console.log('safePlay', i);
    
    try {
      await videoEl.value.play()
      return
    } catch (err) {
      await new Promise(r => setTimeout(r, 100))
    }
  }
}

// обработка команд
function handleVideoCommand({ cmd, payload }) {
  if (!videoEl.value) return
  const v = videoEl.value

  switch (cmd) {
    case 'load':
      v.src = VIDEO_SRC
      v.load()
      break
    case 'play':
      safePlay()
      break
    case 'pause':
      v.pause()
      break
    case 'stop':
      v.pause()
      v.currentTime = 0
      break
    case 'mute': // вместо muted просто volume=0
      v.volume = 0
      break
    case 'unmute':
      v.volume = 1
      break
    case 'toggleMute':
      v.volume = v.volume > 0 ? 0 : 1
      break
    case 'seek':
      if (payload?.seconds !== undefined) {
        v.currentTime = payload.seconds
      }
      break
  }
}

let offListener = null

onMounted(async () => {
  preloadViaLink(VIDEO_SRC)
  if (videoEl.value) {
    videoEl.value.src = VIDEO_SRC
    videoEl.value.volume = 0 // начинаем без звука
    videoEl.value.muted = true // только для первого запуска!
    await safePlay()
    videoEl.value.muted = false // снимаем флаг после инициализации
    videoEl.value.volume = 1
    console.log('videoEl.value', videoEl.value.volume);
    
  }
  offListener = bus.on('videoCommand', handleVideoCommand)
})

onBeforeUnmount(() => {
  if (offListener) offListener()
})
</script>

<template>
  <div class="home">
    <video
      ref="videoEl"
      preload="auto"
      playsinline
      controls
      style="width: 100%; height: auto"
    ></video>
  </div>
</template>

<style scoped>
.home {
  height: 100%;
  width: 100%;
}
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
