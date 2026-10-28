<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// singleton audio
const audio = ref(null)

// fade settings




// 👉 единственный источник истины — store
watch(
  () => store.state.musicFon.status,
  (status) => {
    if (status === 'play') play()
    if (status === 'pause') pause()
  },
  { immediate: true }
)

// volume sync
watch(
  () => store.state.musicFon.volume,
  (volume) => {
    if (!audio.value) return
    if (!audio.value.paused) {
      audio.value.volume = volume
    }
  }
)

</script>

<template>
</template>
