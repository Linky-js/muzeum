<script setup>
const VIDEO_BG_SRC = '/video/ai/bg_ii.webm'
</script>
<template>
    <div class="contentMonitor">
        <!-- основное видео -->
        <video ref="currentVideoRef" key="main" class="video-layer" :src="VIDEO_BG_SRC" autoplay muted loop playsinline>
        </video>
        <div class="headAi">
            <div class="title">
                Как вы воспринимаете <br>Искусственный Интеллект?
            </div>
            <div class="description">
                ... и как его воспринимают другие
            </div>
        </div>
    </div>
</template>
<style scoped>
.contentMonitor {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}

.video-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.headAi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 58px;
  text-align: center;
  position: relative;
}

</style>