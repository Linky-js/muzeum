<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus'
import { initMasterSync } from '@/composables/syncRouterSimple'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const props = defineProps({
  title: String,
  description: String,
  duration: {
    type: Number,
    default: 0
  },
  markers: {
    type: Array,
    default: () => []
  },
  currentVideo: String
})

const bus = useBroadcastBus({ role: 'touch', pairId: '1', debug: false })
initMasterSync(useRouter(), bus, '1')

const isMuted = ref(false)
const isPlaying = ref(true)
const currentTime = ref(0)

function togglePlay() {
  isPlaying.value = !isPlaying.value
  bus.send('video_control', {
    action: isPlaying.value ? 'play' : 'pause'
  })
}
function nextMarker() {
  console.log(props.markers);
  
  const marker = props.markers.find(m => m > currentTime.value)
  if (marker) {
    console.log('marker',marker);
    
    seekToMarker(marker)
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value
  bus.send('video_control', {
    action: 'mute',
    value: isMuted.value
  })
}

function onSeek(e) {
  const newTime = Number(e.target.value)
  currentTime.value = newTime

  bus.send('video_control', {
    action: 'seek',
    time: newTime
  })
}

function seekToMarker(time) {
  currentTime.value = time
  bus.send('video_control', {
    action: 'seek',
    time
  })
}
bus.on('video_state', state => {
  currentTime.value = state.time

})
function minSecTime(time) {
  if (!time || isNaN(time)) return '00:00'

  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)

  const m = String(minutes).padStart(2, '0')
  const s = String(seconds).padStart(2, '0')

  return `${m}:${s}`
}
watch(() => props.currentVideo, () => {
  bus.send('currentVideo', { video: props.currentVideo })
})
onMounted(() => {
  bus.send('currentVideo', { video: props.currentVideo })
})
const closeWidjet = () => {
  bus.send('currentVideo', { video: '/video.mp4' })
  emit('close')
}
</script>

<template>

  <div class="videoWidjet">
    <div class="head">
      <div class="head_info">
        <div class="title">{{ title }}</div>
        <div class="descriptionVideo">{{ description }}</div>
      </div>
      <div @click="closeWidjet()" class="close">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.48528 6.59971L15.085 0L16.9706 1.88561L10.3709 8.48531L16.9706 15.0849L15.085 16.9705L8.48528 10.3709L1.88563 16.9705L0 15.0849L6.59968 8.48531L0 1.88561L1.88563 0L8.48528 6.59971Z"
            fill="white" />
        </svg>
      </div>
    </div>
    <div class="track">
      <div class="currentTime">{{ minSecTime(currentTime) }}</div>
      <div class="remainingTime">{{ minSecTime(duration - currentTime) }}</div>
      <div class="progress" :style="{ width: (currentTime / duration * 100) + '%' }"></div>
      <!-- точки -->
      <div class="markers">
        <div v-for="m in markers" :key="m" class="marker" :style="{ left: (m / duration * 100) + '%' }"
          @click="seekToMarker(m)" :title="m"></div>
      </div>
    </div>

    <!-- кнопки -->
    <div class="audio__btns">
      <div class="btnAudio mute" @click="toggleMute">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path v-if="isMuted"
            d="M7.85055 21.3335H2.66536C1.92899 21.3335 1.33203 20.7365 1.33203 20.0001V12.0001C1.33203 11.2637 1.92899 10.6668 2.66536 10.6668H7.85055L14.9099 4.89095C15.1948 4.6578 15.6148 4.6998 15.848 4.98476C15.9455 5.10387 15.9987 5.25303 15.9987 5.40692V26.5932C15.9987 26.9615 15.7002 27.2599 15.332 27.2599C15.1782 27.2599 15.029 27.2067 14.9099 27.1092L7.85055 21.3335ZM27.2176 16.0001L31.9316 20.7141L30.046 22.5997L25.332 17.8857L20.618 22.5997L18.7324 20.7141L23.4464 16.0001L18.7324 11.2861L20.618 9.40043L25.332 14.1145L30.046 9.40043L31.9316 11.2861L27.2176 16.0001Z"
            fill="white" />
          <path v-else
            d="M15.3701 21.4272H10.1849C9.44852 21.4272 8.85156 20.8302 8.85156 20.0938V12.0938C8.85156 11.3574 9.44852 10.7605 10.1849 10.7605H15.3701L22.4294 4.9847C22.7143 4.75155 23.1343 4.79355 23.3675 5.07851C23.465 5.19762 23.5182 5.34678 23.5182 5.50067V26.6869C23.5182 27.0552 23.2197 27.3536 22.8515 27.3536C22.6977 27.3536 22.5485 27.3004 22.4294 27.2029L15.3701 21.4272Z"
            fill="white" />
        </svg>
      </div>

      <div class="btnAudio play" @click="togglePlay">
        <svg v-if="isPlaying" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 8.33337H13.3333V31.6667H10V8.33337ZM26.6667 8.33337H30V31.6667H26.6667V8.33337Z" fill="white" />
        </svg>
        <svg v-else width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32.292 20.6935L14.6276 32.4696C14.2447 32.725 13.7273 32.6215 13.472 32.2386C13.3807 32.1016 13.332 31.9408 13.332 31.7763V8.22384C13.332 7.76359 13.7051 7.3905 14.1654 7.3905C14.3299 7.3905 14.4907 7.4392 14.6276 7.53045L32.292 19.3066C32.6749 19.562 32.7784 20.0795 32.523 20.4623C32.462 20.5538 32.3835 20.6325 32.292 20.6935Z"
            fill="white" />
        </svg>
      </div>
      <div class="btnAudio nextTick" :class="{disabled: markers.length === 0 || currentTime >= markers[markers.length - 1]}" @click="nextMarker()">
        <svg width="21" height="25" viewBox="0 0 21 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.1875 11.4583L1.21453 0.809734C0.855625 0.570406 0.370625 0.667406 0.131248 1.02642C0.0456238 1.15475 0 1.30555 0 1.45978V23.5402C0 23.9717 0.349844 24.3214 0.78125 24.3214C0.935469 24.3214 1.08625 24.2758 1.21453 24.1903L17.1875 13.5417V23.4375C17.1875 24.3005 17.8871 25 18.75 25C19.6129 25 20.3125 24.3005 20.3125 23.4375V1.5625C20.3125 0.699562 19.6129 0 18.75 0C17.8871 0 17.1875 0.699562 17.1875 1.5625V11.4583Z"
            fill="white" />
        </svg>
      </div>
    </div>

  </div>
</template>
<style scoped>
.videoWidjet {
  border-radius: 48px;
  width: 805px;
  height: 384px;
  background: linear-gradient(34deg, rgba(217, 217, 217, 0.1) 0%, rgba(115, 115, 115, 0.1) 100%);
  position: fixed;
  top: 876px;
  right: 250px;
  z-index: 10000;
  padding: 40px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 76px;
  margin-bottom: 40px;
}

.title {
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #fff;
}

.head_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.descriptionVideo {
  font-weight: 400;
  font-size: 24px;
  line-height: 100%;
  letter-spacing: -0.02em;
  text-align: center;
  color: #fff;
  opacity: 0.5;
}

.close {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1000px;
  padding: 19px;
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.track {
  width: 100%;
  background: #3F4042;
  height: 12px;
  border-radius: 1000px;
  position: relative;
  margin: 24px 0;
  margin-top: 78px;
}

.progress {
  height: 100%;
  background: #fff;
  border-radius: 1000px;
  position: absolute;
  top: 0;
  left: 0;
}

.markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btnAudio {
  border-radius: 1562px;
  padding: 30px;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.btnAudio:active {
  background: rgba(255, 255, 255, 0.25);
}
.btnAudio.disabled{
  pointer-events: none;
  opacity: 0.2;
}

.marker {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 1000px;
  border: 2px solid #fff;
  background: #103FA4;
}

.audio__btns {
  display: flex;
  justify-content: center;
  gap: 24px;
  width: 100%;
  margin-top: 38px;
}

.currentTime, .remainingTime {
  font-weight: 400;
  font-size: 15px;
  line-height: 100%;
  letter-spacing: -0.02em;
  color: #fff;
  width: max-content;
  position: absolute;
  top: -25px;
}
.remainingTime{
  right: 0;
}
</style>