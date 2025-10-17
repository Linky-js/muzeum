<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: true })
initMonitorSync(router, bus, '1')

const VIDEO_BG_SRC = '/video.mp4'
const OZHIRENIE = '/video/ozhirenie.mp4'
const ARTERIA = '/video/arterya.mp4'
const DISLIPIDEMIA = '/video/dislipidemia.mp4'
const SERDCE = '/video/serdce.mp4'
const POCHKA = '/video/pochka.mp4'

const currentVideo = ref(VIDEO_BG_SRC)
const nextVideo = ref(null)
const isTransitioning = ref(false)

// рефы на видеотеги
const currentVideoRef = ref(null)
const nextVideoRef = ref(null)

function getVideoByChapter(chapter) {
  switch (chapter) {
    case 'OZHIRENIE': return OZHIRENIE
    case 'ARTERIA': return ARTERIA
    case 'DISLIPIDEMIA': return DISLIPIDEMIA
    case 'SERDCE': return SERDCE
    case 'POCHKA': return POCHKA
    default: return VIDEO_BG_SRC
  }
}

function handleVideoCommand(chapter) {
  const newSrc = getVideoByChapter(chapter.chapter)
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

let offListener = null
onMounted(() => {
  offListener = bus.on('msVideos', handleVideoCommand)
})

onBeforeUnmount(() => {
  if (offListener) offListener()
})
</script>

<template>
  <div class="contentMonitor">
    <!-- основное видео -->
    <video 
      ref="currentVideoRef"
      key="main"
      class="video-layer"
      :src="currentVideo"
      autoplay 
      muted 
      loop 
      playsinline>
    </video>

    <!-- следующее видео поверх (только если идёт переход) -->
    <transition name="fade-blur">
      <video 
        v-if="nextVideo"
        ref="nextVideoRef"
        key="next"
        class="video-layer"
        :src="nextVideo"
        autoplay 
        muted 
        loop 
        playsinline>
      </video>
    </transition>

    <div class="btns__content">
      <div class="block_info"></div>
    </div>
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