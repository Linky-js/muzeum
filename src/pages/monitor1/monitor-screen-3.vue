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

function switchVideo(newSrc) {
  const nextIndex = activeIndex.value === 0 ? 1 : 0
  const nextVideo = videoRefs[nextIndex].value
  const currentVideo = videoRefs[activeIndex.value].value

  if (!nextVideo || !currentVideo) return
  if (sources.value[activeIndex.value] === newSrc) return

  // снимаем timeupdate со старого видео
  detachTimeUpdate(currentVideo)

  sources.value[nextIndex] = newSrc
  nextVideo.load()
  nextVideo.currentTime = 0
  nextVideo.play()

  nextVideo.classList.add('active')
  currentVideo.classList.remove('active')

  setTimeout(() => {
    currentVideo.pause()
  }, 800)

  activeIndex.value = nextIndex

  // вешаем timeupdate на новое активное видео
  attachTimeUpdate(nextVideo)
}

function handleVideoCommand(chapter) {
  console.log('chapter', chapter);

  if (!chapter?.video) return
  switchVideo(chapter.video)
}

bus.on('currentVideo', handleVideoCommand)

function handleTimeUpdate() {
  const video = videoRefs[activeIndex.value].value
  if (!video) return

  bus.send('video_state', {
    time: video.currentTime,
    duration: video.duration || 0
  })
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

  bus.on('video_control', cmd => {
    const video = videoRefs[activeIndex.value].value
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

  opacity: 0;
  transition: opacity 0.8s ease;
  pointer-events: none;
}

.video-layer.active {
  opacity: 1;
  z-index: 1;
}
</style>