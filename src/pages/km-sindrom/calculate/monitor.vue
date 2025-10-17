<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const step = ref(0);
const qrCodeUrl = ref("");

// функция для генерации рандомного QR
const generateQr = () => {
  // случайное число для "уникальности"
  const randomData = Math.random().toString(36).substring(2, 10);
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${randomData}`;
};

let intervalId;

onMounted(() => {
  generateQr(); // первый QR сразу
  intervalId = setInterval(generateQr, 2000); // каждые 2 секунды обновляем
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div class="wrapper">
    <aside class="left">
      <h3>Калькулятор рисков Монитор</h3>
      <div class="etap"> Шаг {{ step }}</div>
    </aside>
    <div class="container">
      <div class="step1">
        <h1>Отсканируйте QR КОД</h1>
        <div class="description">
          Узнайте прогноз вашей продолжительности жизни и рисков развития метаболического синдрома
        </div>
        <div class="qr-code">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  background: #fff;
}
.wrapper * {
  color: #000;
}
.container {
  width: max-content;
  max-width: 112.24rem;
  margin: 0 auto;
  padding: 0 2rem;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.left {
  position: absolute;
  top: 1.75rem;
  left: 1.75rem;
  z-index: 2;
}
.left h3 {
  color: #0E1117;
  font-family: "TT Hoves";
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.04rem;
}
.left .etap {
  font-size: 1.25rem;
  font-weight: 500;
}
.step1 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  align-items: center;
}
.step1 h1 {
  color: #0E1117;
  font-size: 5.5425rem;
  font-weight: 700;
  letter-spacing: -0.11088rem;
}
.description {
  color: #000;
  font-size: 1.5rem;
  font-weight: 700;
  opacity: 0.5;
  max-width: 39.9875rem;
}
.qr-code {
  margin-top: 1rem;
  border-radius: 1.25rem;
  background: #000;
  width: 17.6875rem;
  height: 17.6875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.qr-code img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 1.25rem;
}
</style>
