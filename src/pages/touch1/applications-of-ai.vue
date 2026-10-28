<script setup>
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import GlassBtn from "@/components/touchScreenComponents/GlassBtn.vue";
import { ref } from "vue";
import IconArrow from "@/components/icons/IconArrow.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import VideoModal from "@/components/video/VideoModal.vue";

import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({
  role: 'touch',
  pairId: '1',
  debug: false,
})
initMasterSync(router, bus, '1')
const widjetShow = ref(false)

const currentVideo = ref(VIDEO_BG_SRC)
const titleVideo = ref('')
const descriptionVideo = ref('')
const durationVideo = ref(0)
const markersVideo = ref([])

const VIDEO_BG_SRC = '/video/monitors/ai.webm'

const AI_tele = '/video/ai/AI_tele.webm'
const AI_diagnostic = '/video/ai/AI_diagnostic.webm'
const AI_Farma = '/video/ai/AI_Farma.webm'
const AI_Manage = '/video/ai/AI_Manage.webm'
const AI_Personalize = '/video/ai/AI_Personalize.webm'
const AI_education = '/video/ai/AI_education.webm'
const AI_Epidemiology = '/video/ai/AI_Epidemiology.webm'

const breadcrumbsList = ref([
  {
    id: 0,
    title: "Главная",
    link: "screen-1",
  },
  {
    id: 1,
    title: "Data Science",
    link: "screen-2",
  },
  {
    id: 2,
    title: "Области применения ИИ",
    link: "screen-4",
  },
]);

function touchSendVideo(chapter) {
  currentVideo.value = getVideoByChapter(chapter)
  titleVideo.value = getTitleByChapter(chapter)
  descriptionVideo.value = getDescriptionByChapter(chapter)
  durationVideo.value = getDurationByChapter(chapter)
  widjetShow.value = true
}


function getVideoByChapter(chapter) {
  switch (chapter) {
    case 'фармация': return AI_Farma
    case 'управление': return AI_Manage
    case 'диагностика': return AI_diagnostic
    case 'телемедицина': return AI_tele
    case 'персонализация': return AI_Personalize
    case 'образование': return AI_education
    case 'эпидемиология': return AI_Epidemiology
  }
}
function getTitleByChapter(chapter) {
  switch (chapter) {
   case 'фармация': return 'ИИ фармация'
    case 'управление': return 'ИИ управление'
    case 'диагностика': return 'ИИ диагностика'
    case 'телемедицина': return 'ИИ телемедицина'
    case 'персонализация': return 'ИИ персонализация'
    case 'образование': return 'ИИ образование'
    case 'эпидемиология': return 'ИИ эпидемиология'
  }
}
function getDescriptionByChapter(chapter) {
  switch (chapter) {
    case 'фармация': return 'Области применения ИИ'
    case 'управление': return 'Области применения ИИ'
    case 'диагностика': return 'Области применения ИИ'
    case 'телемедицина': return 'Области применения ИИ'
    case 'персонализация': return 'Области применения ИИ'
    case 'образование': return 'Области применения ИИ'
    case 'эпидемиология': return 'Области применения ИИ'
  }
}
function getDurationByChapter(chapter) {
  switch (chapter) {
   case 'фармация': return 30
    case 'управление': return 30
    case 'диагностика': return 30
    case 'телемедицина': return 30
    case 'персонализация': return 30
    case 'образование': return 30
    case 'эпидемиология': return 30
  }
}
</script>
<template>
  <div class="header">
    <Breadcrums :list="breadcrumbsList" />
    
  </div>
  <div class="content relative">
    <div class="content__top">
      <h1 class="content__title animBtn">DATA SCIENCE</h1>
      <p class="content__subtitle animBtn">Области применения ИИ</p>
      <div @click="$router.back()" class="to-back">
          <IconArrow class="to-back__icon" />
          <span class="to-back__text">Назад</span>
        </div>
    </div>
    <div class="content__btns">
      <div class="content__btns-top">
        <GlassBtn @click="touchSendVideo('фармация')" class="animBtnBottom" name="ИИ фармация   " />
        <GlassBtn @click="touchSendVideo('управление')" class="animBtnBottom" name="ИИ управление" />
        <GlassBtn @click="touchSendVideo('диагностика')" class="animBtnBottom" name="ИИ диагностика" />
        <GlassBtn @click="touchSendVideo('телемедицина')" class="animBtnBottom" name="ИИ телемедицина" />
        <GlassBtn @click="touchSendVideo('персонализация')" class="animBtnBottom" name="ИИ персонализация" />
        <GlassBtn @click="touchSendVideo('образование')" class="animBtnBottom" name="ИИ образование" />
        <GlassBtn class="grid-col-2 animBtnBottom" @click="touchSendVideo('эпидемиология')" name="ИИ эпидемиология" />
      </div>
    </div>
  </div>
  <VideoModal v-if="widjetShow" @close="widjetShow = false" :defaultSrc="VIDEO_BG_SRC" :title="titleVideo" :description="descriptionVideo" :duration="durationVideo" :markers="markersVideo" :currentVideo="currentVideo" />
  <MenuNavigation class="footer__btn" />
  <svg style="display: none">
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.01 0.01"
        numOctaves="1"
        seed="5"
        result="turbulence"
      ></feTurbulence>
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR
          type="gamma"
          amplitude="1"
          exponent="10"
          offset="0.5"
        ></feFuncR>
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"></feFuncG>
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"></feFuncB>
      </feComponentTransfer>

      <feGaussianBlur
        in="turbulence"
        stdDeviation="3"
        result="softMap"
      ></feGaussianBlur>

      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lighting-color="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300"></fePointLight>
      </feSpecularLighting>

      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      ></feComposite>

      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="150"
        xChannelSelector="R"
        yChannelSelector="G"
      ></feDisplacementMap>
    </filter>
  </svg>
</template>
<style scoped>
.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100vh;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 150%;
  height: 100%;
  object-fit: cover;
  object-position: left bottom;
  z-index: 0;
}

.relative {
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.to-back {
  position: absolute;
  left: 0;
  top: 1.75rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.to-back__icon {
  width: 3.4375rem;
}

.to-back__text {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 3.375rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.content {
  margin-top: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content__top {
  margin-bottom: 15.625rem;
}

.content__title {
  font-family: "TT Commons";
  font-weight: 500;
  font-size: 8.75rem;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  text-align: center;
}

.content__subtitle {
  font-family: "TT Commons";
  font-weight: 400;
  font-size: 2.375rem;
  line-height: 100%;
  text-align: center;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  text-align: center;
}

.content__btns {
  display: flex;
  flex-direction: column;
  max-width: 90.375rem;
  width: 100%;
  gap: 6.25rem;
  position: relative;
}

.content__btns-title {
  position: absolute;
  top: -6.375rem;
  text-align: center;
  width: 100%;
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 2.375rem;
  line-height: 100%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  opacity: 0.5;
}

.content__btns-top {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem 1.5rem;
}

.content__btns-bottom {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.grid-col-2 {
  grid-column: span 2;
}

.footer__btn {
  margin-top: auto;
  position: fixed;
  bottom: 10rem;
  right: 31.875rem;
}
</style>
