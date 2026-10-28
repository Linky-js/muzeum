<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const VIDEO_BG_SRC = '/video/monitors/metabol_sindrom.webm'

const videoRef0 = ref(null)
const videoRef1 = ref(null)

const currentVideoEl = ref(null)
const videoRefs = [videoRef0, videoRef1]
const activeIndex = ref(0)

const sources = ref([VIDEO_BG_SRC, null])

function releaseVideo(index) {
  const video = videoRefs[index].value
  if (!video) return
  video.pause()
  sources.value[index] = null
  video.removeAttribute('src')
  video.load()
}

function switchVideo(newSrc) {
  const fromIndex = activeIndex.value
  const nextIndex = fromIndex === 0 ? 1 : 0
  const nextVideo = videoRefs[nextIndex].value
  const currentVideo = videoRefs[fromIndex].value

  if (!nextVideo || !currentVideo) return
  if (sources.value[fromIndex] === newSrc) return

  detachTimeUpdate(currentVideo)
  detachEnded(currentVideo)

  sources.value[nextIndex] = newSrc
  nextVideo.load()
  nextVideo.currentTime = 0
  nextVideo.play()

  nextVideo.muted = false
  nextVideo.volume = 0

  nextVideo.classList.add('active')
  currentVideo.classList.remove('active')

  setTimeout(() => {
    if (activeIndex.value === fromIndex) return
    releaseVideo(fromIndex)
  }, 800)

  activeIndex.value = nextIndex

  attachTimeUpdate(nextVideo)
  attachEnded(nextVideo)
}


function handleVideoCommand(chapter) {
  console.log('chapter', chapter);

  if (!chapter?.video) return
  switchVideo(chapter.video)
}

bus.on('currentVideo', handleVideoCommand)

let lastStateSent = 0
function handleTimeUpdate() {
  const video = videoRefs[activeIndex.value].value
  if (!video) return
  const now = performance.now()
  if (now - lastStateSent < 250) return
  lastStateSent = now

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
      case 'play': video.play(); break
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
    <video ref="videoRef0" class="video-layer active" :src="sources[0]" muted :loop="sources[0] === VIDEO_BG_SRC"
      autoplay playsinline />

    <video ref="videoRef1" class="video-layer" :src="sources[1]" muted :loop="sources[1] === VIDEO_BG_SRC" autoplay
      playsinline />

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
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translateZ(0);

  opacity: 0;
  transition: opacity 0.8s ease;
  pointer-events: none;
}

.video-layer.active {
  opacity: 1;
  z-index: 1;
}
</style>