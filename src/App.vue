<script setup>
import { onMounted } from 'vue';
const preloadAssets = (urls) => {
  urls.forEach(url => {
    fetch(url, { cache: 'force-cache' })
  })
}
onMounted(() => {
  // preloadAssets([
  //   '/video/monitors/metabol_sindrom.webm',
  //   '/video/ms/ozhirenie.webm',
  //   '/video/ms/arterya.webm',
  //   '/video/ms/dislipidemia.webm',
  //   '/video/ms/serdce.webm',
  //   '/video/ms/pochka.webm',
  //   '/video/ms/diabet.webm',
  //   '/video/ai/AI_tele.webm',
  //   '/video/ai/AI_diagnostic.webm',
  //   '/video/ai/AI_Farma.webm',
  //   '/video/ai/AI_Manage.webm',
  //   '/video/ai/AI_Personalize.webm',
  //   '/video/ai/AI_education.webm',
  //   '/video/ai/AI_Epidemiology.webm'
  // ])
})
</script>

<template>
  <div class="wrapper">
    <RouterView />
  </div>
</template>

<style scoped>
.wrapper {
  background: linear-gradient(23.51deg,
      #000000 -4.02%,
      #030e22 117.07%,
      #000000 171.71%);
}
</style>
