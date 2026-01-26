<script setup>
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import GlassBtn from "@/components/touchScreenComponents/GlassBtn.vue";
import { ref } from "vue";
import IconPlay from "@/components/icons/IconPlay.vue";
import IconCursor from "@/components/icons/IconCursor.vue";
import IconArrow from "@/components/icons/IconArrow.vue";
import IconTablet from "@/components/icons/IconTablet.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import VideoModal from "@/components/video/VideoModal.vue";
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const widjetShow = ref(false)

const currentVideo = ref(VIDEO_BG_SRC)
const titleVideo = ref('')
const descriptionVideo = ref('')
const durationVideo = ref(0)
const markersVideo = ref([])

const VIDEO_BG_SRC = '/video/monitors/metabol_sindrom.webm'
const OZHIRENIE = '/video/ms/ozhirenie.webm'
const ARTERIA = '/video/ms/arterya.webm'
const DISLIPIDEMIA = '/video/ms/dislipidemia.webm'
const SERDCE = '/video/ms/Heart.webm'
const POCHKA = '/video/ms/pochka.webm'
const DIABET = '/video/ms/diabet.webm'
const MC = '/video/ms/km_film.webm'

const router = useRouter()
const bus = useBroadcastBus({
  role: 'touch',
  pairId: '1',
  debug: false,
})
initMasterSync(router, bus, '1')
bus.on("defaultScreen", (payload) => {
  router.push('/touch1/screen-1')

})
const breadcrumbsList = ref([
  {
    id: 0,
    title: "Главная",
    link: "screen-1",
  },
  {
    id: 1,
    title: "Метаболический синдром",
    link: "screen-3",
  },
]);
function touchSendVideo(chapter) {
  currentVideo.value = getVideoByChapter(chapter)
  titleVideo.value = getTitleByChapter(chapter)
  descriptionVideo.value = getDescriptionByChapter(chapter)
  durationVideo.value = getDurationByChapter(chapter)
  markersVideo.value = getMarkersByChapter(chapter)
  widjetShow.value = true
}
function getVideoByChapter(chapter) {
  switch (chapter) {
    case 'OZHIRENIE': return OZHIRENIE
    case 'ARTERIA': return ARTERIA
    case 'DISLIPIDEMIA': return DISLIPIDEMIA
    case 'SERDCE': return SERDCE
    case 'POCHKA': return POCHKA
    case 'DIABET': return DIABET
    case 'MC': return MC
  }
}
function getTitleByChapter(chapter) {
  switch (chapter) {
    case 'OZHIRENIE': return 'Ожирение'
    case 'ARTERIA': return 'Артерия'
    case 'DIABET': return 'Сахарный диабет II типа'
    case 'DISLIPIDEMIA': return 'Дислипидемия'
    case 'SERDCE': return 'Сердце'
    case 'POCHKA': return 'Почка'
    case 'MC': return 'Метаболический синдром'
  }
}
function getDescriptionByChapter(chapter) {
  switch (chapter) {
    case 'OZHIRENIE': return 'Метаболический синдром'
    case 'ARTERIA': return 'Метаболический синдром'
    case 'DIABET': return 'Метаболический синдром'
    case 'DISLIPIDEMIA': return 'Метаболический синдром'
    case 'SERDCE': return 'Метаболический синдром'
    case 'POCHKA': return 'Метаболический синдром'
    case 'MC': return 'Метаболический синдром'
  }
}
function getDurationByChapter(chapter) {
  switch (chapter) {
    case 'OZHIRENIE': return 65
    case 'ARTERIA': return 63
    case 'DISLIPIDEMIA': return 117
    case 'DIABET': return 60
    case 'SERDCE': return 129
    case 'POCHKA': return 160
    case 'MC': return 153
  }
}
function getMarkersByChapter(chapter) {
  switch (chapter) {
    case 'MC': return [50, 100]
  }
}
</script>
<template>

  <div class="header">
    <Breadcrums :list="breadcrumbsList" />
  </div>
  <div class="content relative">
    <div class="content__top">
      <h1 class="content__title animBtn">Метаболический синдром </h1>
      <div @click="$router.back()" class="to-back">
        <IconArrow class="to-back__icon" />
        <span class="to-back__text">Назад</span>
      </div>
    </div>
    <div class="content__btns">
      <h3 class="content__btns-title animBtn">Компоненты Метаболического Синдрома</h3>
      <div class="content__btns-top ">
        <GlassBtn @click="touchSendVideo('OZHIRENIE')" class="animBtnBottom" name="Ожирение" />
        <GlassBtn @click="touchSendVideo('DISLIPIDEMIA')" class="animBtnBottom" name="Дислипидемия" />
        <GlassBtn @click="touchSendVideo('SERDCE')" class="animBtnBottom" name="Сердечная недостаточность" />
        <GlassBtn @click="touchSendVideo('DIABET')" class="animBtnBottom" name="Сахарный диабет II типа" />
        <GlassBtn @click="touchSendVideo('POCHKA')" class="animBtnBottom" name="Хроническая болезнь почек" />
        <GlassBtn @click="touchSendVideo('ARTERIA')" class="animBtnBottom" name="Артериальная гипертензия" />
      </div>
      <div class="content__btns-bottom">
        <GlassBtn link="dashPageTouch" supname="Интерактив" name="Диета DASH" type-btn="toInfo" :icon="IconCursor"
          icon-wrapper-color="pink" class="animBtnBottom" />
        <GlassBtn link="touch1-pharmacotherapy" supname="Информация" name="Фармакотерапия" type-btn="toInfo"
          :icon="IconTablet" icon-wrapper-color="transparent" class="animBtnBottom" />
        <GlassBtn link="touch-qr" supname="Интерактив" name="Калькулятор рисков" type-btn="toInfo" :icon="IconCursor"
          icon-wrapper-color="pink" class="animBtnBottom" />
        <GlassBtn @click="touchSendVideo('MC')" supname="Видео" name="Метаболический синдром" type-btn="toInfo"
          :icon="IconPlay" icon-wrapper-color="transparent" class="animBtnBottom" />
      </div>
    </div>
  </div>
  <MenuNavigation class="footer__btn" />
  <VideoModal v-if="widjetShow" @close="widjetShow = false" :defaultSrc="VIDEO_BG_SRC" :title="titleVideo" :description="descriptionVideo"
    :duration="durationVideo" :markers="markersVideo" :currentVideo="currentVideo" />

</template>
<style scoped>
.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
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
  margin-top: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content__top {
  margin-bottom: 300px;
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

.footer__btn {
  margin-top: auto;
  position: fixed;
  bottom: 10rem;
  right: 31.875rem;
}
</style>
