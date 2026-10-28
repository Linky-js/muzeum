<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// UI state
const volumeShow = ref(false)
const FADE_DURATION = 600
const STEP_MS = 30
const audio = ref(null)
let fadeTimer = null
// derived state
const isPlaying = computed(() => store.state.musicFon.status === 'play')

const volume = computed({
  get: () => store.state.musicFon.volume,
  set: (val) => {
    store.state.musicFon.volume = val
  }
})

// mute / unmute
const toggle = () => {
  if (store.state.musicFon.volume === 0) {
    store.state.musicFon.volume = 1
  } else {
    store.state.musicFon.volume = 0
  }
}

// slider background
const sliderStyle = computed(() => {
  const percent = volume.value * 100
  return {
    background: `
      linear-gradient(
        to right,
        #ffffff 0%,
        #ffffff ${percent}%,
        rgba(255,255,255,0.1) ${percent}%,
        rgba(255,255,255,0.1) 100%
      )
    `
  }
})

const clearFade = () => {
  if (fadeTimer) {
    clearInterval(fadeTimer)
    fadeTimer = null
  }
}

const fadeTo = (targetVolume, onEnd) => {
  if (!audio.value) return
  console.log('fadeTo', targetVolume);
  
  clearFade()

  const steps = FADE_DURATION / STEP_MS
  const startVolume = audio.value.volume
  const diff = targetVolume - startVolume
  let step = 0

  fadeTimer = setInterval(() => {
    step++

    audio.value.volume = Math.max(
      0,
      Math.min(1, startVolume + (diff * step) / steps)
    )

    if (step >= steps) {
      audio.value.volume = targetVolume
      clearFade()
      onEnd?.()
    }
  }, STEP_MS)
}
watch(
  () => store.state.musicFon.fadeRequest,
  () => {
    const target = store.state.musicFon.fadeTarget
    if (target == null) return

    // 👇 ВАЖНО
    if (target > 0 && audio.value.paused) {
      audio.value.play().catch(() => {})
    }

    fadeTo(target, () => {
      if (target === 0) {
        audio.value.pause()
      }
    })
  }
)


</script>

<template>
  <div class="music-wrapper">
    <button class="music-toggle" :class="{ playing: isPlaying }" @click="volumeShow = !volumeShow"
      aria-label="Фоновая музыка">
      <div class="tint"></div>
      <svg v-if="isPlaying" width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M35.89 30.0298C39.6394 26.2792 41.7457 21.1931 41.7457 15.8898C41.7457 10.5865 39.6394 5.50034 35.89 1.74979M28.83 22.9698C30.7047 21.0945 31.7579 18.5514 31.7579 15.8998C31.7579 13.2481 30.7047 10.7051 28.83 8.82979M19.75 29.8898L9.75 21.8898H1.75L1.75 9.88978H9.75L19.75 1.88978L19.75 29.8898Z"
          stroke="#F0F0F0" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span v-else>▶</span>
    </button>
    <div v-if="volumeShow" class="music_volume">
      <div class="tint"></div>
      <div class="icon" @click="toggle">
        <svg width="31" height="22" viewBox="0 0 31 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M29.5 14.8332L21.5 6.83317M21.5 14.8332L29.5 6.83317M13.5 20.1665L6.83333 14.8332H1.5L1.5 6.83317H6.83333L13.5 1.49984L13.5 20.1665Z"
            stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <input class="slider" type="range" min="0" max="1" step="0.01" v-model="volume" :style="sliderStyle" />
    </div>
  </div>
  <audio ref="audio" :volume="store.state.musicFon.volume" :src="store.state.musicFon.path" autoplay loop></audio>

</template>

<style scoped>
.music-wrapper {
  position: fixed;
  bottom: 10rem;
  left: 31.875rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 35px;
  height: 110px;
}

.icon {
  position: relative;
  z-index: 5;
}

.music-toggle {
  width: 100px;
  height: 100px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6.875rem;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);

  position: relative;
}

.music-toggle:hover {
  transform: scale(1.05);
}

.music_volume {
  position: relative;
  border-radius: 180px;
  width: 508px;
  height: 110px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
  gap: 48px;
  overflow: hidden;
}

.slider {
  width: 305px;
  height: 12px;
  border-radius: 6px;
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  position: relative;
  z-index: 5;
}

/* Webkit */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Firefox */
.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  cursor: pointer;
}

.menu-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(287deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

span {
  position: relative;
  z-index: 2;
}
</style>
