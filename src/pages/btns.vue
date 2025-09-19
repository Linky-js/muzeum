<script setup>
import { useRouter } from "vue-router";
import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMasterSync } from "@/composables/syncRouterSimple.js";
import HeartCardio from "@/components/icons/HeartCardio.vue";
const video = '/bg.mp4'

const router = useRouter();

const bus = useBroadcastBus({
  role: "touch",
  pairId: "1",
  debug: true,
});
initMasterSync(router, bus, "1");

function goToVideo() {
  router.push({ name: "touch-video" }).catch(() => { });
}
function goToKms() {
  router.push({ name: "kms" }).catch(() => { });
}
import { onMounted } from "vue";
onMounted(async () => {

  const container = document.getElementById('demo-layout');
  const btn1 = new window.Button({ text: "Видео", size: 48, type: 'rounded', });
  const btn2 = new window.Button({ text: "Карта", size: 48, type: 'rounded', });
  const btn3 = new window.Button({ text: "Синдром", size: 48, type: "pill" });

  container.appendChild(btn1.element);
  container.appendChild(btn2.element);
  container.appendChild(btn3.element);

  window.initializeControls()
});


</script>

<template>
  <div class="home">
    <!-- <video class="bg" :src="video" autoplay muted loop playsinline></video> -->
     <img src="@/assets/img/bg.jpg" alt="" class="bg">
     <img src="@/assets/img/bg2.png" alt="" class="bg2">

    <div class="header">
      <div class="header__left">
        <div class="header__icon">

          <div class="line__left"></div>
        </div>
        <div class="header__text">
          Главная
        </div>
      </div>
      <div class="header__right">

      </div>
    </div>
    <div class="liquidGlass">
      <div id="demo-layout" class="buttons-wrapper"></div>

      <!-- Панель контролов -->
      <div id="glass-controls-container" class="glass-controls">
        <div id="controls-content" class="controls-content">
        <h3>Controls</h3>

        <div class="control-group">
          <label>Edge Intensity <span class="control-value" id="edgeValue">0.01</span></label>
          <input type="range" id="edgeIntensity" min="0" max="0.1" step="0.001" value="0.01">
        </div>

        <div class="control-group">
          <label>Rim Intensity <span class="control-value" id="rimValue">0.05</span></label>
          <input type="range" id="rimIntensity" min="0" max="0.2" step="0.001" value="0.05">
        </div>

        <div class="control-group">
          <label>Base Intensity <span class="control-value" id="baseValue">0.01</span></label>
          <input type="range" id="baseIntensity" min="0" max="0.05" step="0.001" value="0.01">
        </div>

        <div class="control-group">
          <label>Edge Distance <span class="control-value" id="edgeDistValue">0.15</span></label>
          <input type="range" id="edgeDistance" min="0.05" max="0.5" step="0.01" value="0.15">
        </div>

        <div class="control-group">
          <label>Rim Distance <span class="control-value" id="rimDistValue">0.8</span></label>
          <input type="range" id="rimDistance" min="0.1" max="2.0" step="0.05" value="0.8">
        </div>

        <div class="control-group">
          <label>Base Distance <span class="control-value" id="baseDistValue">0.1</span></label>
          <input type="range" id="baseDistance" min="0.05" max="0.3" step="0.01" value="0.1">
        </div>

        <div class="control-group">
          <label>Corner Boost <span class="control-value" id="cornerValue">0.02</span></label>
          <input type="range" id="cornerBoost" min="0" max="0.1" step="0.001" value="0.02">
        </div>

        <div class="control-group">
          <label>Ripple Effect <span class="control-value" id="rippleValue">0.1</span></label>
          <input type="range" id="rippleEffect" min="0" max="0.5" step="0.01" value="0.1">
        </div>

        <div class="control-group">
          <label>Blur Radius <span class="control-value" id="blurValue">5.0</span></label>
          <input type="range" id="blurRadius" min="1" max="15" step="0.5" value="5.0">
        </div>

        <div class="control-group">
          <label>Tint Opacity <span class="control-value" id="tintValue">0.2</span></label>
          <input type="range" id="tintOpacity" min="0" max="1.0" step="0.01" value="0.2">
        </div>

        <div class="control-group">
          <label> <input type="checkbox" id="warpToggle"> Enable Center Warp </label>
        </div>
<!-- 
        <div class="control-group control-group-button">
          <button id="randomizeButton" class="randomize-button">🎲 Randomize Glass Effects</button>
        </div> -->
      </div>
      </div>
    </div>
  </div>

</template>
<style scoped>
.home {
  padding: 3rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
  max-width: 176.25rem;
  position: relative;
  width: 100%;
  height: 200vh;
}

.liquidGlass {
  margin-top: 5.44rem;
  display: flex;
  gap: 2.31rem;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: calc(100% - 5.44rem);
  position: relative;
  z-index: 2;
  position: fixed;
  right: 150px;
}
.buttons-wrapper{
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.header__left {
  display: flex;
  flex-direction: column;
  gap: 2.31rem;
}

.header__icon {
  position: relative;
}

.header__left svg {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-40%, -48%);
}

.header__text {
  color: #EEE;
  font-family: "TT Commons";
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  /* 2.5rem */
  letter-spacing: -0.075rem;
  text-transform: capitalize;
}

.line__left {
  width: 20.25rem;
  height: 0.1875rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.43) 7.09%, rgba(255, 255, 255, 0.00) 100%);

}

.liquidGlass-wrapper {
  position: relative;
  display: flex;
  font-weight: 600;
  overflow: hidden;
  color: black;
  cursor: pointer;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  width: 57.625rem;
  padding: 2.3rem 3.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 6.75rem;
  border-radius: 3rem;
  white-space: nowrap;
}

.glass-button {
  position: relative;
  display: flex;
  font-weight: 600;
  overflow: hidden;
  color: black;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  /* прозрачный белый слой */
  backdrop-filter: blur(12px) saturate(180%) contrast(120%);
  -webkit-backdrop-filter: blur(12px) saturate(180%) contrast(120%);

  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  width: 57.625rem;
  padding: 2.3rem 3.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 6.75rem;
  border-radius: 3rem;
  white-space: nowrap;
}

.blur {
  backdrop-filter: blur(px);
}

.liquidGlass-wrapper div,
.glass-button div {
  z-index: 3;
}

/* .liquidGlass-wrapper:hover {
  padding: 2.8rem 4.5rem;
} */

.liquidGlass-effect {
  position: absolute;
  z-index: 0;
  inset: 0;
  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
  overflow: hidden;
  isolation: isolate;
}

.liquidGlass-tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.liquidGlass-tint2 {
  z-index: 1;
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
}

.liquidGlass-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.1), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.1);
  border-radius: 3rem;
}

.liquidGlass-Small {
  position: relative;
  display: flex;
  padding: 1.3rem 1.3rem 1.3rem 3.5rem;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  width: 57.625rem;
  gap: 6.75rem;
  white-space: nowrap;
  margin-top: auto;

  border-radius: 6.875rem;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
}

/* 👉 псевдоэлемент для градиентного бордера */
.liquidGlass-Small::before {
  content: "";
  position: absolute;
  inset: 0;
  /* заполняем всю область */
  border-radius: inherit;
  padding: 3px;
  /* толщина бордера */
  background: linear-gradient(169deg, #2D3F6E 0%, #A4B3FF 86%, #6575FF 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  /* чтобы бордер не мешал кликам */
}


.liquidGlass-Small div {
  z-index: 3;
}

.liquidGlass-Small .liquidGlass-effect,
.liquidGlass-Small .liquidGlass-shine {
  border-radius: 6.875rem;
}

.iconVideo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 7.21019rem;
  height: 7.21019rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: #0486ff4b;
}

.iconVideo svg {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.liq__small--text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label {
  color: #FFF;
  -webkit-text-stroke-width: 0.79px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.15);
  font-family: "TT Commons";
  font-size: 2rem;
  font-style: normal;
  font-weight: 400;
  line-height: 110%;
  /* 2.2rem */
  letter-spacing: -0.04rem;
  opacity: 0.3;
}

.liq__small--title {
  color: #FFF;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.15);
  font-family: "TT Commons";
  font-size: 3.125rem;
  font-style: normal;
  font-weight: 400;
  line-height: 110%;
  letter-spacing: -0.0625rem;
}

.dock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  border-radius: 2rem;
  color: #FFF;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.15);
  font-family: "TT Commons";
  font-size: 3.125rem;
  font-style: normal;
  font-weight: 400;
  line-height: 110%;
  /* 3.4375rem */
  letter-spacing: -0.0625rem;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 150%;
  height: 100vh;
  object-fit: cover;
  object-position: left bottom;
  z-index: 0;
}
.bg2 {
  position: absolute;
  top: 100vh;
  left: 0;
  width: 150%;
  height: 100vh;
  object-fit: cover;
  object-position: left bottom;
  z-index: 0;
}
</style>
