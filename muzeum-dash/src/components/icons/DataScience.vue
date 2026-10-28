<script setup>
import { ref, onMounted, nextTick } from 'vue'

const path = '/video/ico_2.webm'

onMounted(async () => {
})
</script>

<template>
  <video :src="path" autoplay muted loop playsinline></video>
</template>
