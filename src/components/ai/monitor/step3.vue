<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  currentHero: Object,
})

const attitudeVideos = {
  'Положительное': '/video/heroes/Positive_particles.webm',
  'Нейтральное': '/video/heroes/Neutral_particles.webm',
  'Отрицательное': '/video/heroes/Negative_particles.webm',
  'Затрудняюсь': '/video/heroes/Difficult_particles.webm'
}

const currentReaction = computed(() => {
  return attitudeVideos[props.currentHero?.attitude?.name] || ''
})

// ✔ state для плавных переходов
const visibleReaction = ref(currentReaction.value)
const isFading = ref(false)

// Следим за сменой реакции
watch(currentReaction, async (newVal, oldVal) => {
  if (newVal === oldVal) return

  // анимашка видео реакций
  isFading.value = true 
  await new Promise(r => setTimeout(r, 300)) 

  visibleReaction.value = newVal 

  isFading.value = false
})
onMounted(() => {
  let animItems = document.querySelectorAll('.animLayer')
  if (animItems.length > 0) {
    animItems.forEach(item => {
      item.classList.add('showAnim')
    })
  }
})
onBeforeUnmount(() => {
  let animItems = document.querySelectorAll('.animLayer')
  if (animItems.length > 0) {
    animItems.forEach(item => {
      item.classList.remove('showAnim')
    })
  }
})
</script>

<template>
  <div class="wrapper-step">
    <div class="headAi">
      <div class="title animLayer">
        {{ currentHero?.ai?.name }}
      </div>
      <div class="description animLayer">
        {{ currentHero?.ai?.responsibilities }}
      </div>
    </div>

    <div class="videos">
      <video class="video-layer active animLayer" :src="currentHero?.ai?.video" autoplay muted loop playsinline />

      <!-- Реакция -->
      <video class="reactions" :class="{ fade: isFading }" :src="visibleReaction" autoplay muted loop playsinline />
    </div>
  </div>
</template>
<style scoped>
.headAi {
  position: absolute;
  top: 215px;
  left: 50%;
  transform: translateX(-50%);
}

.wrapper-step {
  padding-top: 215px;
  display: flex;
  flex-direction: column;
  gap: 62px;
}

.video-layer {
  width: 921px;
  height: 1001px;
  filter: grayscale(1);
  transition: all 0.3s ease-in-out;
  position: relative;
  z-index: 2;
}

video.active {
  filter: grayscale(0);
  transform: scale(1.2);
}

.videos {
  display: flex;
  gap: 62px;
  justify-content: center;

  width: max-content;
  margin: 0 auto;
  margin-top: 328px;
}

.reactions {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;

  opacity: 1;
  transition: opacity 0.3s ease;
}

.reactions.fade {
  opacity: 0; /* fadeOut */
}

</style>