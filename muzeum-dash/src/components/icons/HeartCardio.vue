<script setup>
import { ref, onMounted, nextTick } from 'vue'

const path = '/video/ico_1.webm'

onMounted(async () => {
})
</script>

<template>
  <video :src="path" autoplay muted loop playsinline></video>
</template>
<style scoped>
video {
  width: 10.2rem !important;
}
</style>
