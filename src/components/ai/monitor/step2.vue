<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";


const props = defineProps({
  currentHero: Object,
})

const currentName = ref("")
const currentResponsibilities = ref("")
const heroes = ref([
  {
    id: 1,
    name: "Хрустальный шар",
    responsibilities: "ИИ мыслит иначе, чем человек, и дает неожиданные прогнозы",
    video: '/video/heroes/mag_loop.webm'
  },
  {
    id: 2,
    name: "Стажер",
    responsibilities: "ИИ требует надзора, но со временем учится",
    video: '/video/heroes/stasher_loop.webm'
  },
  {
    id: 3,
    name: "Супермен",
    responsibilities: "ИИ делает человеческие задачи быстрее и эффективнее",
    video: '/video/heroes/super_loop.webm'
  },
  {
    id: 4,
    name: "Шерлок Холмс",
    responsibilities: "ИИ находит скрытые связи и объясняет непонятное",
    video: '/video/heroes/sherlok_loop.webm'
  },
  {
    id: 5,
    name: "Золушка",
    responsibilities: "ИИ берет на себя рутинную работу и освобождает ваше время",
    video: '/video/heroes/zolushka_loop.webm'
  }
])
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
      <div class="description animLayern" v-html="currentHero?.ai?.responsibilities">
      </div>
    </div>
    <div class="videos">
      <video v-for="v in heroes" :key="v.id" class="video-layer animLayer" :src="v.video" autoplay muted loop
        playsinline :class="v.name === currentHero?.ai?.name ? 'active' : ''"></video>

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

video {
  width: 921px;
  height: 1001px;
  filter: grayscale(1);
  opacity: 0.5;
  transition: all 0.3s ease-in-out;
}

video.active {
  filter: grayscale(0);
  opacity: 1;
  transform: scale(1.2);
}

.videos {
  display: flex;
  gap: 62px;
  justify-content: center;
  margin-top: 328px;
  position: relative;
}

.video-layer {
  transform: scale(1);
}
</style>