<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps({
  currentHero: Object,
})

const currentVideo = computed(() => {
  return spheresVideos[props.currentHero?.sphere] || null
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
const videoRef0 = ref(null)
const videoRef1 = ref(null)
const videoRefs = [videoRef0, videoRef1]

const activeIndex = ref(0)
const sources = ref([null, null])

/* 🔁 переключение видео */
function switchVideo(newSrc) {
  if (!newSrc) return

  const nextIndex = activeIndex.value === 0 ? 1 : 0
  const nextVideo = videoRefs[nextIndex].value
  const currentVideoEl = videoRefs[activeIndex.value].value

  if (!nextVideo || !currentVideoEl) return
  if (sources.value[activeIndex.value] === newSrc) return

  sources.value[nextIndex] = newSrc
  nextVideo.oncanplay = null

  const start = () => {
    nextVideo.currentTime = 0
    nextVideo.play().catch(() => { })

    nextVideo.classList.add('active')
    currentVideoEl.classList.remove('active')

    setTimeout(() => currentVideoEl.pause(), 800)
    activeIndex.value = nextIndex
  }

  if (nextVideo.readyState >= 3) {
    start()
  } else {
    nextVideo.addEventListener('canplay', start, { once: true })
  }
}

/* 👀 реагируем на смену сферы */
watch(currentVideo, async (newSrc) => {
  if (!newSrc) return
  await nextTick()
  switchVideo(newSrc)
})

onMounted(() => {
  const animItems = document.querySelectorAll('.animLayer')
  animItems.forEach(i => i.classList.add('showAnim'))
})

onBeforeUnmount(() => {
  const animItems = document.querySelectorAll('.animLayer')
  animItems.forEach(i => i.classList.remove('showAnim'))
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
    <div class="video__wrapper" v-show="currentVideo">
      <video ref="videoRef0" class="video-layer active" :src="sources[0]" muted autoplay loop playsinline />
      <video ref="videoRef1" class="video-layer" :src="sources[1]" muted loop playsinline />
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

.tabAi__img {
  border-radius: 45px;
  width: 781px;
  height: 823px;
  overflow: hidden;

}

.tabAi__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video__wrapper {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.video-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  opacity: 0;
  transition: opacity 0.8s ease;
}

.video-layer.active {
  opacity: 1;
}
</style>