<script setup>
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import { ref, onMounted } from "vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import { useRouter } from "vue-router";
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'

const router = useRouter();

const bus = useBroadcastBus({ role: 'touch', pairId: '1', debug: false })
initMasterSync(router, bus, '1')
bus.on("defaultScreen", (payload) => {
  router.push('/touch1/screen-1')
})
const breadcrumbsList = ref([
  {
    id: 0,
    title: "Главная",
    link: "/touch1/screen-1",
  },
]);

const goNext = () => {
  router.push({ name: 'touch-calc' })
}
const qrCodeUrl = ref("");
// функция для генерации рандомного QR
const generateQr = () => {
  // случайное число для "уникальности"
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://muz.dmgug.ru/touch-calculate/touch-calc-mobile`;
};
let intervalId;
onMounted(() => {
  generateQr(); // первый QR сразу
  intervalId = setInterval(generateQr, 2000); // каждые 2 секунды обновляем
});
</script>
<template>
  <div class="header">
    <Breadcrums :list="breadcrumbsList" :first-link="true" />
  </div>
  <div class="content relative">
    <div class="content__top">
      <h1 class="content__title animBtn">Отсканируйте QR КОД</h1>
      <p class="content__subtitle animBtn">
        Узнайте прогноз вашей продолжительности жизни и рисков<br />
        развития метаболического синдрома
      </p>
    </div>
    <div class="content__inner">
      <div class="content__qr animBtnBottom">
        <div class="tint"></div>
        <div class="qr-code relative">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
      </div>
      <button @click="goNext" class="content__btn animBtnBottom">Дальше</button>
    </div>
  </div>

  <MenuNavigation class="footer__btn" />
  
</template>
<style scoped>
.relative {
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.content {
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.content__top {
  margin-bottom: 19.5rem;
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
  color: #808389;
  text-align: center;
}

.content__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 86.625rem;
  width: 100%;
  gap: 26.5rem;
  height: 100%;
}

.content__qr {
  width: 41.5rem;
  height: 41.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  padding: 5.125rem;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 2.375rem;
}

.content__qr::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(169deg, #2d3f6e 0%, #a4b3ff 86%, #6575ff 100%);
  border-radius: 2.375rem;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.qr-code {
  border-radius: 1.25rem;
  background: #000;
  width: 31.25rem;
  height: 31.25rem;
  overflow: hidden;
}

.qr-code img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.25rem;
}

.content__btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 2rem;
  width: 86.625rem;
  height: 8.375rem;
  border-radius: 1.5rem;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 2.5rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  background-color: #ffffff;
  color: #00040b;
  position: absolute;
  bottom: 0;
}

.footer__btn {
  margin-top: auto;
  position: fixed;
  bottom: 10rem;
  right: 31.875rem;
  z-index: 5;
}

.effect {
  position: absolute;
  z-index: 0;
  inset: 0;
  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
  overflow: hidden;
  isolation: isolate;
  border-radius: 3rem;
}

.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: linear-gradient(85.26deg,
      rgba(217, 217, 217, 0.1) 3.83%,
      rgba(115, 115, 115, 0.1) 99.95%);
}

.shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.1),
    inset -1px -1px 1px 1px rgba(255, 255, 255, 0.1);
  border-radius: 3rem;
}
</style>
