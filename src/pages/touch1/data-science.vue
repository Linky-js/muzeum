<script setup>
import Breadcrums from '@/components/touchScreenComponents/Breadcrums.vue'
import GlassBtn from '@/components/touchScreenComponents/GlassBtn.vue'
import HeartCardio from '@/components/icons/HeartCardio.vue'
import { ref } from 'vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import IconCursor from '@/components/icons/IconCursor.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import MenuNavigation from '@/components/touchScreenComponents/MenuNavigation.vue'
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

const breadcrumbsList = ref([
  {
    id: 0,
    title: 'Главная',
    link: 'screen-1',
  },
  {
    id: 1,
    title: 'Data Science',
    link: 'screen-2',
  },
])
const routing = () => {
  bus.send('navigate', { path: 'https://pubmed.ostrov-vezeniya.ru/v5/display.html' })
  window.location.href = 'https://pubmed.ostrov-vezeniya.ru/v5/?profile=dual&back=1'
}
</script>
<template>
  <div class="header">
    <Breadcrums :list="breadcrumbsList" />
  </div>
  <div class="content relative">
    <div class="content__top">
      <h1 class="content__title animBtn">Data Science</h1>
      <RouterLink to="screen-1" class="to-back">
        <IconArrow class="to-back__icon" />
        <span class="to-back__text">Назад</span>
      </RouterLink>
    </div>
    <div class="content__btns">
      <div class="content__btns-top">
        <GlassBtn
          class="animBtnBottom"
          link="applications-of-ai"
          name="Области применения ИИ"
          :icon="HeartCardio"
        />
      </div>
      <div class="content__btns-bottom">
        <GlassBtn
          class="animBtnBottom"
          link="touch-ai"
          supname="Интерактив"
          name="Что для вас ИИ?"
          type-btn="toInfo"
          :icon="IconCursor"
          icon-wrapper-color="pink"
        />
        <!-- <GlassBtn
          class="animBtnBottom"
          link="kms"
          supname="Видео"
          name="Регистровые исследования"
          type-btn="toInfo"
          :icon="IconPlay"
          icon-wrapper-color="transparent"
        />
        <GlassBtn
          class="animBtnBottom"
          link="kms"
          supname="Видео"
          name="Искусственный интеллект"
          type-btn="toInfo"
          :icon="IconPlay"
          icon-wrapper-color="transparent"
        /> -->
      </div>
      <GlassBtn class="animBtnBottom" @click="routing()" name="Pubmed" :icon="HeartCardio" />
    </div>
  </div>
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
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"></feFuncR>
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"></feFuncG>
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"></feFuncB>
      </feComponentTransfer>

      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"></feGaussianBlur>

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
  font-family: 'TT Hoves';
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
  font-family: 'TT Commons';
  font-weight: 500;
  font-size: 8.75rem;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  text-align: center;
}
.content__subtitle {
  font-family: 'TT Commons';
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
  max-width: 57.625rem;
  width: 100%;
  gap: 6.25rem;
}

.content__btns-top {
  display: flex;
  flex-direction: column;
  gap: 2.125rem;
}

.content__btns-bottom {
  display: grid;
  gap: 2rem;
}
.footer__btn {
  margin-top: auto;
  position: fixed;
  bottom: 10rem;
  right: 31.875rem;
}
</style>
