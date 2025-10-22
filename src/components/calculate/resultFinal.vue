<script setup>
import IconFinal1 from "../icons/IconFinal1.vue";
import IconFinal2 from "../icons/IconFinal2.vue";
import IconFinal3 from "../icons/IconFinal3.vue";
import IconFinal4 from "../icons/IconFinal4.vue";
import IconFinal5 from "../icons/IconFinal5.vue";
import IconFinal6 from "../icons/IconFinal6.vue";
import IconFinal7 from "../icons/IconFinal7.vue";
import IconFinal8 from "../icons/IconFinal8.vue";

const video = "/video.mp4";
</script>
<template>
  <div class="final-wrapper">
    <div class="final__body">
      <div class="final__item row-3">
        <img class="_img" src="@/assets/img/calculate-final-1.png" alt="" />
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal1 />
            <span class="final__item-step">01</span>
          </div>
          <h4 class="final__item-title">Будьте активными каждый день</h4>
        </div>
      </div>
      <div class="final__item glass">
        <div class="tint"></div>
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal2 />
            <span class="final__item-step">02</span>
          </div>
          <h4 class="final__item-title">
            Откажитесь от курения, в том числе электронных сигарет
          </h4>
        </div>
      </div>
      <div class="final__item row-3">
        <img class="_img" src="@/assets/img/calculate-final-2.png" alt="" />
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal3 />
            <span class="final__item-step">05</span>
          </div>
          <h4 class="final__item-title">
            Проводите больше времени на природе и свежем воздухе
          </h4>
        </div>
      </div>
      <div class="final__item glass">
        <div class="tint"></div>
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal4 />
            <span class="final__item-step">06</span>
          </div>
          <h4 class="final__item-title">
            Уменьшайте окружность талии и наращивайте мышечную массу.
          </h4>
        </div>
      </div>
      <div class="final__item row-3">
        <img class="_img" src="@/assets/img/calculate-final-3.png" alt="" />
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal5 />
            <span class="final__item-step">08</span>
          </div>
          <h4 class="final__item-title">
            Сделайте качественный сон своим приоритетом
          </h4>
        </div>
      </div>
      <div class="final__item glass">
        <div class="tint"></div>
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal6 />
            <span class="final__item-step">03</span>
          </div>
          <h4 class="final__item-title">
            Практикуйте ограниченное по времени питание и интервальное голодание
          </h4>
        </div>
      </div>
      <div class="final__item row-2 glass">
        <div class="tint"></div>
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal7 />
            <span class="final__item-step">07</span>
          </div>
          <h4 class="final__item-title">
            Придерживайтесь рациона, близкого к средиземноморской диете
          </h4>
        </div>
      </div>
      <div class="final__item glass white-card">
        <div class="tint"></div>
        <div class="final__item-inner">
          <div class="final__item-top">
            <IconFinal8 />
            <span class="final__item-step">04</span>
          </div>
          <h4 class="final__item-title">
            Сохраняйте позитив и избегайте негатива
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.final-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4.25rem;
  background-color: #020914;
  padding: 6.25rem;
  padding-top: 0;
  width: 100vw;
  margin-top: 281px;
}

.final__body {
  display: grid;
  gap: 24px 25px;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.final__item {
  position: relative;
  padding: 48px;
  border-radius: 38px;
  overflow: hidden;
  color: #ffffff;
}
.final__item.row-3 {
  grid-row: span 3;
}
.final__item.row-2 {
  grid-row: span 2;
}

.final__item.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(169deg, #646464 0%, #4c4c4c 86%, #ffffff 108%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.final__item.white-card {
  background: linear-gradient(86.6deg, #d9d9d9 73.25%, #d9d9d9 332.36%);
  color: #212121;
}
.final__item.white-card .tint {
  display: none;
}
.final__item.white-card.glass::before {
  background: linear-gradient(169deg, #ffffff 0%, #ffffff 86%, #ffffff 108%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
}

._img {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  object-fit: cover;
}

.final__item-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 46px;
  justify-content: space-between;
}

.final__item-top {
  display: flex;
  justify-content: space-between;
}

.final__item-step {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  opacity: 0.8;
}

.final__item-title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
}
</style>
