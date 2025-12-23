<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'
import InteractivePlate from '@/components/dash/monitor/InteractivePlate.vue'
import RoundDiagram from '@/components/ui/RoundDiagram.vue'

const router = useRouter()
const intro = ref(true)

const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const showIntroVideo = ref(true)
const showLoopVideo = ref(false)

const result = ref(null)
const introVideoRef = ref(null)
const loopVideoRef = ref(null)

const VIDEO_SRC = '/video/monitors/metabol_center.webm'
const VIDEO_SRC_2 = '/video/monitors/ai.webm'

const reccomendations = ref([
  {
    title: "Отлично! Потребление соответствует норме DASH.",
    color: "#00FF11",
  },
  {
    title: "Вы молодец, но можете лучше.",
    color: "#FFAE00",
  },
  {
    title:
      "Показатель значительно отклонился - обратите на него внимание.",
    color: "#FF0004",
  },
]);
bus.on('sentResult', () => {
  intro.value = false
})
bus.on('resultObj', (data) => {
  result.value = data
  console.log('result', result.value);

})
const sortCategories = computed(() => {
  if (!result.value) return []
  return Object.entries(result.value.categories).sort(([, a], [, b]) => b.percent - a.percent)
})

onMounted(() => {
  introVideoRef.value.onended = () => {
    showIntroVideo.value = false
    showLoopVideo.value = true
  }
})
const formatColor = (percent) => {
  if (percent >= 70 && percent <= 110) {
    return "#00FF11";
  }
  if (percent <= 40) {
    return "#FF0004";
  }

  if (percent >= 40 && percent <= 70) {
    return "#FFAE00";
  }

  return "#FF0004";
};
</script>

<template>
  <div>
    <transition name="wrap-fade">
      <div v-if="intro" class="video-wrap">

        <!-- Intro video -->
        <transition name="fade">
          <video v-if="showIntroVideo" ref="introVideoRef" class="animVideo intro" :src="VIDEO_SRC" autoplay muted
            playsinline></video>
        </transition>

        <!-- Loop video -->
        <transition name="fade">
          <video v-if="showLoopVideo" ref="loopVideoRef" class="cikl intro" :src="VIDEO_SRC_2" autoplay loop muted
            playsinline></video>
        </transition>

      </div>
    </transition>

    <InteractivePlate :result="result ? true : false" />
    <transition name="wrap-fade">
      <div v-if="result" class="leftResult">
        <div class="modal__items" v-if="sortCategories">
          <div class="modal__item" v-for="([name, item], key) in sortCategories" :key="key">
            <div class="modal__item-top">
              <h5 class="modal__item-title">{{ name }}</h5>
              <p class="modal__item-percent">{{ item.percent }}%</p>
            </div>
            <div class="modal__item-bottom">
              <div class="modal__item-line">
                <span class="line" :style="{ width: `${item.percent}%` }"></span>
              </div>
              <div class="modal__item-dot">
                <span class="modal__item-color" :style="{ backgroundColor: formatColor(item.percent) }"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="wrap-fade">
      <div v-if="result" class="finishHead">
        <div class="title">
          Оценка вашего рациона <br>с точки зрения диеты DASH
        </div>
        <div class="description">
          Калькулятор предназначен для образовательных <br> целей. Не заменяет консультацию врача.
        </div>
      </div>
    </transition>
    <transition name="wrap-fade">
      <div v-if="result" class="rightResult">
        <div class="diagrams">
          <div class="diagram">
            <div class="diagram__head">
              <div class="diagram__title">
                <h4>Потребляемые каллории</h4>
              </div>
              <div class="diagram__subtitle">
                <p>Диапазон отклонение</p>
              </div>
            </div>
            <RoundDiagram :value="result.totalCalories" label="Целевой диапазон" :maxValue="result.TDEE"
              :fill-text="'#1b1c21'"
              :fill-color="result.totalCalories * 100 / result.TDEE < 70 ? '#FFAE00' : result.totalCalories * 100 / result.TDEE > 70 && result.totalCalories * 100 / result.TDEE < 100 ? '#00FF11' : '#FF0004'" />
          </div>
          <div class="diagram">

            <div class="diagram__head">
              <div class="diagram__title">
                <h4>Потребляемый натрий</h4>
              </div>
              <div class="diagram__subtitle">
                <p>Значение</p>
              </div>
            </div>
            <RoundDiagram :value="result.totalSodium" :label="'Целевой диапазон'" :maxValue="2300"
              :fill-text="'#1b1c21'"
              :fill-color="result.totalSodium * 100 / 2300 < 70 ? '#00FF11' : result.totalSodium * 100 / 2300 > 70 && result.totalSodium * 100 / 2300 < 100 ? '#FFAE00' : '#FF0004'" />
          </div>
        </div>
        <div class="modal__recom-items">
          <div class="modal__recom-item" v-for="item in reccomendations" :key="item.title">
            <div class="modal__recom-color" :style="{ backgroundColor: item.color }"></div>
            <h5 class="modal__recom-text">{{ item.title }}</h5>
          </div>
        </div>
      </div>
    </transition>
    <transition name="wrap-fade">
      <div class="badge">
        Сфотографируйте экран, чтобы сохранить результаты
      </div>
    </transition>
  </div>
</template>

<style scoped>
.rightResult {
  position: fixed;
  bottom: 60px;
  right: 510px;
  width: 715px;
}

.badge {
  backdrop-filter: blur(24px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(244, 244, 244, 0.7) 100%);
  transform: rotate(10deg);
  border-radius: 1000px;
  padding: 19px 100px;
  width: 856px;
  height: 304px;
  font-weight: 500;
  font-size: 50px;
  line-height: 120%;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  text-align: center;
  color: #000;
  position: fixed;
  top: 232.181px;
  right: 1270px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.diagrams {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 32px;
  backdrop-filter: blur(44px);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  padding: 32px;
}

.diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 40px;
}

.diagram__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.diagram__title h4 {
  font-weight: 500;
  font-size: 50px;
  line-height: 110%;
  letter-spacing: -0.02em;
  text-align: center;
  color: #1b1c21;
}

.diagram__subtitle p {
  font-weight: 400;
  font-size: 32px;
  line-height: 110%;
  letter-spacing: -0.02em;
  text-align: center;
  color: #1b1c21;
  opacity: 0.5;
}

.video-wrap {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 7;
  background-color: black;
}

.intro {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

/* Плавное исчезновение всей обёртки */
.wrap-fade-enter-active,
.wrap-fade-leave-active {
  transition: opacity 0.8s ease;
}

.wrap-fade-enter-from,
.wrap-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* Плавное переключение видео */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}



.leftResult {
  position: fixed;
  left: 510px;
  bottom: 60px;
  padding: 64px 48px;
  backdrop-filter: blur(44px);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 64px;
  width: 862px;
  z-index: 5;
}

.modal__items {
  display: grid;
  gap: 32px;
}

.modal__item-top {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 16px;
}

.modal__item-title {
  font-weight: 500;
  font-size: 32px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #1b1c21;
  /* opacity: 0.5; */
}

.modal__item-percent {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 48px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #1b1c21;
}

.modal__item-bottom {
  display: grid;
  grid-template-columns: minmax(0, 833px) minmax(0, 64px);
  gap: 8px;
}

.modal__item-line {
  width: 100%;
  height: 49px;
  background: rgba(27, 28, 33, 0.16);
  border-radius: 46.3102px;
  overflow: hidden;
  position: relative;
}

.line {
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 46.3102px;
  background-color: #fff;
}

.modal__item-dot {
  width: 50px;
  height: 50px;
  background: rgba(27, 28, 33, 0.16);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__item-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.modal__recom-items {
  display: grid;
  gap: 8px;
  backdrop-filter: blur(44px);
  background: rgba(255, 255, 255, 0.15);
  padding: 32px;
  border-radius: 48px;
}

.modal__recom-item {
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 24px;
}

.modal__recom-color {
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border-radius: 50%;
}

.modal__recom-text {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 140%;
  letter-spacing: -0.02em;
  color: #1b1c21;
}

.finishHead {
  position: fixed;
  left: 510px;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  font-weight: 500;
  font-size: 90px;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #1b1c21;
  text-align: start;
}

.description {
  font-weight: 400;
  font-size: 38px;
  line-height: 120%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #1b1c21;
  text-align: start;
  opacity: 0.5;
}
</style>