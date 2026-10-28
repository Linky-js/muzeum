<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useIdleIntro } from "@/composables/useIdleIntro.js";

const VIDEO_SRC = "/dash/dash2.webm";

const { visible } = useIdleIntro();
const videoRef = ref(null);

const syncPlayback = () => {
  const video = videoRef.value;
  if (!video) return;

  if (visible.value) {
    video.currentTime = 0;
    video.play().catch(() => {});
    return;
  }

  video.pause();
};

watch(visible, syncPlayback);

const onVisibilityChange = () => {
  const video = videoRef.value;
  if (!video) return;

  if (document.hidden) {
    video.pause();
  } else if (visible.value) {
    video.play().catch(() => {});
  }
};

onMounted(() => {
  syncPlayback();
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", onVisibilityChange);
  videoRef.value?.pause();
});
</script>

<template>
  <div
    class="intro-overlay"
    :class="{ 'intro-overlay--hidden': !visible }"
    aria-hidden="true"
  >
    <video
      ref="videoRef"
      class="intro-overlay__video"
      :src="VIDEO_SRC"
      muted
      loop
      playsinline
      preload="auto"
    />
  </div>
</template>

<style scoped>
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.8s ease;
  will-change: opacity;
}

.intro-overlay--hidden {
  opacity: 0;
  pointer-events: none;
}

.intro-overlay__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
