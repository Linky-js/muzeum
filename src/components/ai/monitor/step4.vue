<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps({
  currentHero: Object,
})

const currentVideo = computed(() => {
  return spheresVideos[props.currentHero?.sphere] || ''
})

const spheresVideos = {
  'Общественное здравоохранение': '/video/type-ai/obshestvennoe_zdravo.webm',
  'Точная диагностика': '/video/type-ai/tochnaya_diagnoz.webm',
  'Доступная диагностика': '/video/type-ai/dostupnaya_diagnoz.webm',
  'Исследования': '/video/type-ai/issledovaniya.webm',
  'Образование': '/video/type-ai/obrazovaniya.webm'
}
const spheres = [
  {
    name: "Общественное здравоохранение",
    img: "./ai/sphere-1.png",
  },
  {
    name: "Точная диагностика",
    img: "./ai/sphere-2.png",
  },
  {
    name: "Доступная диагностика",
    img: "./ai/sphere-3.png",
  },
  {
    name: "Исследования",
    img: "./ai/sphere-4.png",
  },
  {
    name: "Образование",
    img: "./ai/sphere-5.png",
  },
];
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
  <div>
    <div v-if="!currentVideo" class="headAi">
      <div class="title animLayer">
        Какие сферы получат наибольшие <br> выгоды от ИИ?
        {{ currentVideo }}
      </div>
    </div>
    <div v-if="!currentVideo" class="tabsAi">
      <div v-for="sphere in spheres" class="tabAi animLayer">
        <div class="tabAi__head">
          {{ sphere.name }}
        </div>
        <div class="tabAi__img">
          <img :src="sphere.img" alt="">
        </div>
      </div>
    </div>
   <transition>
      <div v-if="currentVideo" class="video__wrapper">
        <video  :src="currentVideo" autoplay muted loop playsinline></video>
      </div>
   </transition>
  </div>
</template>
<style scoped>
.headAi {
  position: absolute;
  top: 215px;
  left: 50%;
  transform: translateX(-50%);
}

.tabsAi {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding-top: 610px;
}

.tabAi {
  display: flex;
  flex-direction: column;
  gap: 48px;
  flex-shrink: 0;
  width: 781px;
  align-items: center;
}

.tabAi__head {
  font-weight: 500;
  font-size: 44px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #fff;
}
.tabAi__img{
  border-radius: 45px;
width: 781px;
height: 823px;
overflow: hidden;

}
.tabAi__img img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video__wrapper{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
</style>