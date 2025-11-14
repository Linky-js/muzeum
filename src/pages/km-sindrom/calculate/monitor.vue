<script setup>
import Mobile from "@/components/calculate/monitor.vue/mobile.vue";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'



const qrCodeUrl = ref("");
const phoneImg = "/monitor-calc-mobile.png";
const router = useRouter();
const route = useRoute();
const isShowMobile = ref(true);

const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const ROUTE_PATH = "/monitor-calculate";

// функция для генерации рандомного QR
const generateQr = () => {
  // случайное число для "уникальности"
  const randomData = Math.random().toString(36).substring(2, 10);
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${randomData}`;
};

let intervalId;

watch(
  () => route.query.step,
  (newStep) => {
    console.log('newStep', newStep)
    if (newStep > 3) isShowMobile.value = false;
  }
);
const onScroll = (direction) => {
  const el = document.querySelector('.monitor-mobile__content');

  if (!el) return;

  if (direction === 'bottom') {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  } else {
    el.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

onMounted(() => {
  generateQr(); // первый QR сразу
  intervalId = setInterval(generateQr, 20000); // каждые 20 секунды обновляем
});

onMounted(() => {
  console.log('route.query.step', route.query.step)
  if (route.query.step > 3) isShowMobile.value = false;
});
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div class="monitor" :class="{ 'not-mobile': !isShowMobile }">
    <aside class="monitor-qr" v-if="isShowMobile">
      <div class="monitor-qr__wrapper">
        <div class="tint"></div>
        <div class="qr-code relative monitor-qr__qr-code">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
      </div>
      <div class="monitor-qr__info">
        <h2 class="monitor-qr__title">
          Калькулятор продолжительности жизни и <br />риска возникновения
          развития<br />
          метаболического синдрома
        </h2>
        <p class="monitor-qr__description">
          отсканируйте QR код, пройдите тест и получите расчет
        </p>
      </div>
    </aside>
    <div class="monitor-mobile" :class="{ 'not-mobile': !isShowMobile }">
      <img class="monitor-mobile__img" v-if="isShowMobile" :src="phoneImg" alt="" />
      <div class="monitor-mobile__content-wrapper">
        <div class="monitor-mobile__screen relative">
          <div class="monitor-mobile__content">
            <Mobile :is-not-mobile="isShowMobile" @scrollDirection="onScroll" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
  z-index: 1;
}

.monitor {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(../monitor-calc.png);
  height: 100vh;
  padding: 107px 100px;
  display: flex;
  align-items: center;
  gap: 385px;
}

.not-mobile {
  justify-content: center;
  padding: 0;
  gap: 0;
}

.monitor-qr {
  display: flex;
  align-items: center;
  gap: 60px;
}

.monitor-qr__wrapper {
  width: 334px;
  height: 334px;
  min-width: 334px;
  min-height: 334px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  padding: 41px;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 19px;
}

.monitor-qr__wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(85.26deg,
      rgba(217, 217, 217, 0.1) 3.83%,
      rgba(115, 115, 115, 0.1) 99.95%);
  border-radius: 19px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.qr-code {
  background-color: transparent;
  width: 251px;
  height: 251px;
}

.qr-code img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.monitor-qr__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 80px;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin-bottom: 28px;
}

.monitor-qr__description {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 40px;
  line-height: 120%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  opacity: 0.5;
}

.monitor-mobile {
  max-width: 810.45px;
  width: 100%;
  height: 1656.92px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 160px;
  background: linear-gradient(23.51deg,
      #000000 -4.02%,
      #030e22 117.07%,
      #000000 171.71%);
}

.monitor-mobile__img {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.monitor-mobile__screen {
  padding: 120px 0 53px;
  height: 1601px;
}

.monitor-mobile__content {
  overflow-y: auto;
  height: 100%;
  padding: 0 30px;
  width: 724px;
}
.monitor-mobile__content::-webkit-scrollbar {
  display: none;
}
.monitor-mobile.not-mobile {
  max-width: none;
  height: auto;
  background: none;
  display: block;
  border-radius: 0;
}

.monitor-mobile.not-mobile .monitor-mobile__screen {
  padding: 0;
  height: auto;
}

.monitor-mobile.not-mobile .monitor-mobile__content {
  overflow-y: initial;
  height: auto;
  padding: 0;
  width: auto;
}
</style>
