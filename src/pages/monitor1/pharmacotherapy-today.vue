<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const VIDEO_BG_SRC = '/video/farm-today/normatenziya.webm'

const videoRef0 = ref(null)
const videoRef1 = ref(null)
const centeredVideoRef = ref(true)
const currentVideoEl = ref(null)
const videoRefs = [videoRef0, videoRef1]
const activeIndex = ref(0)

const sources = ref([VIDEO_BG_SRC, null])

function playVideoSafely(video) {
  if (!video) return

  const playPromise = video.play()
  if (!playPromise || typeof playPromise.catch !== 'function') return

  playPromise.catch((error) => {
    if (error?.name === 'AbortError') return
    console.error('[monitor pharmacotherapy] Video play failed:', error)
  })
}

function sendVideoMeta(videoSrc, durationSec) {
  if (!videoSrc) return

  const safeDurationSec = Number.isFinite(durationSec) ? durationSec : 0
  const durationMs = Math.max(Math.round(safeDurationSec * 1000), 0)

  bus.send('video_meta', {
    video: videoSrc,
    duration: safeDurationSec,
    durationMs,
  })
}

function switchVideo(newSrc) {
  const nextIndex = activeIndex.value === 0 ? 1 : 0
  const nextVideo = videoRefs[nextIndex].value
  const currentVideo = videoRefs[activeIndex.value].value

  if (!nextVideo || !currentVideo) return
  if (sources.value[activeIndex.value] === newSrc) return

  // снимаем события со старого видео
  detachTimeUpdate(currentVideo)
  detachEnded(currentVideo)

  sources.value[nextIndex] = newSrc

  let metaSent = false
  const handleLoadedMetadata = () => {
    if (metaSent) return
    metaSent = true
    sendVideoMeta(newSrc, nextVideo.duration)
  }

  nextVideo.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
  nextVideo.load()

  // Иногда метаданные уже доступны к моменту вызова load/play.
  if (nextVideo.readyState >= 1) {
    handleLoadedMetadata()
  }

  nextVideo.currentTime = 0
  playVideoSafely(nextVideo)

  nextVideo.muted = false
  nextVideo.volume = 0

  nextVideo.classList.add('active')
  currentVideo.classList.remove('active')

  setTimeout(() => {
    currentVideo.pause()
  }, 800)

  activeIndex.value = nextIndex

  // вешаем события на новое активное видео
  attachTimeUpdate(nextVideo)
  attachEnded(nextVideo)
}


function handleVideoCommand(chapter) {
  console.log('chapter', chapter);

  if (!chapter?.video) return
  if (chapter.position === 'center') {
    centeredVideoRef.value = true
  }
  switchVideo(chapter.video)
}

bus.on('pharmacoState', handleVideoCommand)

function handleTimeUpdate() {
  const video = videoRefs[activeIndex.value].value
  if (!video) return

  bus.send('video_state', {
    time: video.currentTime,
    duration: video.duration || 0
  })
}

function handleEnded() {
  const video = videoRefs[activeIndex.value].value
  if (!video) return

  const src = sources.value[activeIndex.value]

  // игнорируем фоновое видео
  if (src === VIDEO_BG_SRC) return

  bus.send('video_ended', {
    src,
    time: video.currentTime,
    duration: video.duration
  })
}
function attachEnded(video) {
  if (!video) return
  video.addEventListener('ended', handleEnded)
}

function detachEnded(video) {
  if (!video) return
  video.removeEventListener('ended', handleEnded)
}

function attachTimeUpdate(video) {
  if (!video) return
  video.addEventListener('timeupdate', handleTimeUpdate)
}

function detachTimeUpdate(video) {
  if (!video) return
  video.removeEventListener('timeupdate', handleTimeUpdate)
}
onMounted(() => {
  const video = videoRefs[activeIndex.value].value
  attachTimeUpdate(video)
  attachEnded(video)

  bus.on('video_control', cmd => {
    const video = videoRefs[activeIndex.value].value
    if (!video) return

    switch (cmd.action) {
      case 'play': playVideoSafely(video); break
      case 'pause': video.pause(); break
      case 'mute': video.muted = cmd.value; break
      case 'volume': video.volume = cmd.value; break
      case 'seek':
        if (Number.isFinite(cmd.time)) {
          video.currentTime = cmd.time
        }
        break
    }
  })
})

</script>

<template>
  <div class="animVideo contentMonitor">
    <img src="/1.jpg" alt="" class="bg_image">
    <video ref="videoRef0" class="video-layer active" :src="sources[0]" muted :loop="centeredVideoRef" autoplay
      playsinline />

    <video ref="videoRef1" class="video-layer" :src="sources[1]" muted :loop="centeredVideoRef" autoplay playsinline />

    <div class="btns__content">
      <div class="block_info"></div>
    </div>
  </div>

</template>

<style scoped>
.bg_image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
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
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  opacity: 0;
  transition: opacity 0.8s ease;
  pointer-events: none;
}

.video-layer.active {
  opacity: 1;
  z-index: 1;
}
</style>