<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'
import InteractivePlate from '@/components/dash/monitor/InteractivePlate.vue'
import RoundDiagram from '@/components/ui/RoundDiagram.vue'

const router = useRouter()

const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const intro = ref(true)
const fadingOut = ref(false)
const introVideoRef = ref(null)
const VIDEO_DURATION = 19
const EXIT_SHORT = 9
const EXIT_LONG = 18

const result = ref(null)

const VIDEO_SRC = '/video/monitors/metabol_center.webm'
const VIDEO_SRC_2 = '/video/monitors/dash2.webm'

const reccomendations = ref([
  {
    title: "Отлично! Потребление соответствует норме DASH.",
    color: "#40a147",
  },
  {
    title: "Вы молодец, но можете лучше.",
    color: "#ffe100",
  },
  {
    title:
      "Показатель значительно отклонился - обратите на него внимание.",
    color: "#d95356",
  },
]);
bus.on('sentResult', () => {
 const video = introVideoRef.value
  if (!video) {
    intro.value = false
    return
  }

  const current = video.currentTime

  // если пользователь дошёл до 10 сек — ждём до конца
  if (current >= EXIT_SHORT) {
    const delay = Math.max(EXIT_LONG - current, 0)
    finishIntro(delay)
  } else {
    // иначе ждём до 10 секунды
    const delay = EXIT_SHORT - current
    finishIntro(delay)
  }
})
bus.on('resultObj', (data) => {
  result.value = data
})

const sortCategories = computed(() => {
  if (!result.value) return []
  return Object.entries(result.value.categories).sort(([, a], [, b]) => b.percent - a.percent)
})
const finishIntro = (delay) => {
  setTimeout(() => {
    fadingOut.value = true

    // даём время на fade-out
    setTimeout(() => {
      intro.value = false
    }, 1000) // длительность CSS transition
  }, delay * 1000)
}


onMounted(() => {

})
const formatColor = (percent) => {
  if (percent >= 70 && percent <= 110) {
    return "#40a147";
  }
  if (percent <= 40) {
    return "#d95356";
  }

  if (percent >= 40 && percent <= 70) {
    return "#ffe100";
  }

  return "#d95356";
};
</script>

<template>
  <div>
    <transition name="wrap-fade">
      <div
        v-if="intro"
        class="video-wrap"
        :class="{ fading: fadingOut }"
      >
        <video
          ref="introVideoRef"
          class="animVideo intro"
          :src="VIDEO_SRC_2"
          autoplay
          muted
          loop
          playsinline
        ></video>
      </div>
    </transition>
    <div v-if="!result" class="monitor__info">
      <div class="dash__head">
        <h1>Диета DASH</h1>
        <h4>Dietary Approaches to Stop Hypertension</h4>
      </div>
      <div class="dash_description">
        <div class="text-dash bold">
          Система питания, разработанная для снижения артериального давления и поддержания здоровья сердечно-сосудистой
          системы.
        </div>
        <div class="text-dash">
          Диета основана на сбалансированном употреблении овощей, фруктов, цельнозерновых продуктов, нежирного белка и
          молочных продуктов с пониженным содержанием жира.
        </div>
        <div class="text-dash">
          В рационе ограничивается соль, сахар и насыщенные жиры. Такой подход помогает не только нормализовать
          давление, но и улучшить обмен веществ, снизить уровень холестерина и поддерживать здоровый вес.
        </div>
      </div>
    </div>
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
                <span class="line" :style="{ width: `${item.percent}%`, backgroundColor: formatColor(item.percent) }"></span>
              </div>
              <!-- <div class="modal__item-dot">
                <span class="modal__item-color" :style="{ backgroundColor: formatColor(item.percent) }"></span>
              </div> -->
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
              :fill-color="result.totalCalories * 100 / result.TDEE < 70 ? '#ffe100' : result.totalCalories * 100 / result.TDEE > 70 && result.totalCalories * 100 / result.TDEE < 100 ? '#40a147' : '#d95356'" :width="410" :height="410" :strokeWidth="43" :fontsize="'60px'" :fontsizeSmall="'32px'" />
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
              :fill-color="result.totalSodium * 100 / 2300 < 70 ? '#40a147' : result.totalSodium * 100 / 2300 > 70 && result.totalSodium * 100 / 2300 < 100 ? '#ffe100' : '#d95356'" :width="410" :height="410" :strokeWidth="43" :fontsize="'60px'" :fontsizeSmall="'32px'" />
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
      <div v-if="result" class="badge">
        Сфотографируйте экран, чтобы сохранить результаты
      </div>
    </transition>
  </div>
</template>

<style scoped>
.video-wrap {
  opacity: 1;
  transition: opacity 1s ease;
}

.video-wrap.fading {
  opacity: 0;
}

.rightResult {
  position: fixed;
  bottom: 192px;
  right: 548px;
  width: 803px;
  display: flex;
  flex-direction: column;
  gap: 40px;
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

.monitor__info {
  position: fixed;
  top: 440px;
  left: 375px;
  z-index: 8;
  display: flex;
  flex-direction: column;
  gap: 64px;
}

.text-dash {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 40px;
  line-height: 120%;
  letter-spacing: -0.03em;
  color: #34373D;
  max-width: 996px;
}

.text-dash.bold {
  font-weight: 600;
  font-size: 48px;
}



.dash__head {
  display: flex;
  flex-direction: column;
  gap: 16px;

}

.dash__head h1 {
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 170px;
  line-height: 100%;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: #34373D;
}

.dash__head h4 {
  font-family: "TT Hoves", sans-serif;
  font-weight: 600;
  font-size: 48px;
  line-height: 130%;
  letter-spacing: -0.03em;
  color: #34373d;
}

.dash_description {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.diagrams {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 32px;
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
  opacity: 0.3;
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
  transition: all 1.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}



.leftResult {
  position: fixed;
  left: 510px;
  bottom: 192px;
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
  grid-template-columns: minmax(0, 905px);
  gap: 8px;
}

.modal__item-line {
  width: 100%;
  height: 49px;
  background: rgba(59, 46, 40, 0.2);
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
}

.modal__recom-item {
  display: flex;
  align-items: center;
  
  gap: 24px;
 
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