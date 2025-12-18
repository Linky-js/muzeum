<script setup>
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import GlassBtn from "@/components/touchScreenComponents/GlassBtn.vue";
import HeartCardio from "@/components/icons/HeartCardio.vue";
import { ref } from "vue";
import IconCursor from "@/components/icons/IconCursor.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({
  role: 'touch',
  pairId: '2',
  debug: false,
})
initMasterSync(router, bus, '2')
const breadcrumbsList = ref([
  {
    id: 0,
    title: "Главная",
    link: "/",
  },
]);
</script>
<template>

  <div class="header">
    <Breadcrums :list="breadcrumbsList" />
    <div class="header__logo">

    </div>
  </div>
  <div class="content relative">
    <div class="content__top">
      <h1 class="content__title animBtn">Атлас метаболического синдрома</h1>
    </div>
    <div class="content__btns">
      <div class="content__btns-top ">
        <GlassBtn link="touch2-screen-regions" supname="Интерактив" name="Региональные практики" type-btn="toInfo"
          :icon="IconCursor" icon-wrapper-color="pink" class="animBtnBottom" />
        <GlassBtn link="touch2-astrazeneca" supname="Интерактив" name="Приоритет - Эпидемиология" type-btn="toInfo"
          :icon="IconCursor" icon-wrapper-color="pink" class="animBtnBottom" />
        <!-- <GlassBtn link="kms" supname="Интерактив" name="Карта факторов риска" type-btn="toInfo" :icon="IconCursor"
          icon-wrapper-color="pink" class="animBtnBottom" /> -->
      </div>

    </div>
  </div>

  <svg style="display: none">
    <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence">
      </feTurbulence>
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"></feFuncR>
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"></feFuncG>
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"></feFuncB>
      </feComponentTransfer>

      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"></feGaussianBlur>

      <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100"
        lighting-color="white" result="specLight">
        <fePointLight x="-200" y="-200" z="300"></fePointLight>
      </feSpecularLighting>

      <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage"></feComposite>

      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G">
      </feDisplacementMap>
    </filter>
  </svg>
</template>
<style scoped>
.relative {
  position: relative;
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
  max-width: 57.625rem;
  width: 100%;
  gap: 6.25rem;
}

.content__btns-top {
  display: flex;
  flex-direction: column;
  gap: 2.125rem;
}

.footer {
  margin-top: auto;
}

.footer__btn {
  margin-left: auto;
}
</style>
