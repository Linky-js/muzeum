<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const VIDEO_BG_SRC = '/video/monitors/metabol_sindrom.webm'

const offVideo = ref(null)
const currentVideo = ref(VIDEO_BG_SRC)
const nextVideo = ref(null)
const isTransitioning = ref(false)

// рефы на видеотеги
const currentVideoRef = ref(null)
const nextVideoRef = ref(null)

function handleVideoControl(cmd) {
  console.log(cmd);

  const video = currentVideoRef.value
  if (!video) return

  switch (cmd.action) {
    case 'play':
      video.play()
      break

    case 'pause':
      video.pause()
      break

    case 'mute':
      video.muted = cmd.value
      break

    case 'seek':
      video.currentTime = cmd.time
      break

    case 'change_video':
      handleVideoCommand(cmd)
      break
  }
}
bus.on('currentVideo', handleVideoCommand)
function handleVideoCommand(chapter) {
  console.log('chapter', chapter);

  const newSrc = chapter.video
  if (newSrc === currentVideo.value) return

  nextVideo.value = newSrc
  isTransitioning.value = true

  setTimeout(async () => {
    currentVideo.value = newSrc
    nextVideo.value = null
    isTransitioning.value = false

    // дождёмся обновления DOM
    await nextTick()

    if (currentVideoRef.value) {
      currentVideoRef.value.currentTime = 0.8
      currentVideoRef.value.play()
    }
  }, 800)
}

onMounted(() => {
  offVideo.value = bus.on('video_control', handleVideoControl)

  nextTick(() => {
    const video = currentVideoRef.value
    if (!video) return

    video.addEventListener('timeupdate', handleTimeUpdate)
  })
})

function handleTimeUpdate() {
  const video = currentVideoRef.value
  if (!video) return

  bus.send('video_state', {
    time: video.currentTime
  })
}

onBeforeUnmount(() => {
  // снимаем listener с события
  const video = currentVideoRef.value
  if (video) {
    video.removeEventListener('timeupdate', handleTimeUpdate)
  }

  // отписка от bus
  if (offVideo.value) {
    offVideo.value()
  }
})
</script>

<template>
  <div class="animVideo contentMonitor">
    <!-- основное видео -->
    <video ref="currentVideoRef" key="main" class="video-layer animVideo" :src="currentVideo" autoplay muted
      :loop="currentVideo === VIDEO_BG_SRC" playsinline>
    </video>

    <!-- следующее видео поверх (только если идёт переход) -->
    <transition name="fade-blur">
      <video v-if="nextVideo" ref="nextVideoRef" key="next" class="video-layer" :src="nextVideo" autoplay muted loop
        playsinline>
      </video>
    </transition>

    <div class="btns__content">
      <div class="block_info"></div>
    </div>
  </div>
</template>

<style scoped>
.contentMonitor {
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
  top: 0;
  left: 0;
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