<script setup>
import CirclePercent from "@/components/ui/CirclePercent.vue";
import { ref } from "vue";
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')
const resultPayload = ref({})
bus.on('resultstep5', (payload) => {
  console.log(payload);
  resultPayload.value = payload
  console.log('resultPayload', resultPayload.value);

})
</script>
<template>
  <div class="wrapStep5">
    <div class="result__wrapper">
      <div class="stats">
        <div class="stat">
          <div class="head">
            Отношение к ИИ в медицине
          </div>
          <div class="percents">
            <div class="current__percent percent-block">
              <div class="label">Ваш выбор</div>
              <div class="percent__block">
                <div class="percent">{{ resultPayload?.val?.attitude.percent }}%</div>
                <div class="track">
                  <div class="current_track"
                    :style="{ width: `${resultPayload?.val?.attitude.percent}%`, background: resultPayload?.val?.attitude.name == 'Положительное' ? 'linear-gradient(180deg, #3DB967 0%, #71E397 100%)' : resultPayload?.val?.attitude.name == 'Нейтральное' ? 'linear-gradient(180deg, #0A92F3 0%, #66B3EA 100%)' : resultPayload?.val?.attitude.name == 'Отрицательное' ? 'linear-gradient(180deg, #AD3473 0%, #CC78A3 100%)' : resultPayload?.val?.attitude.name == 'Затрудняюсь' ? 'linear-gradient(180deg, #CDCDCD 0%, #FBFBFB 100%)' : '' }">
                  </div>
                </div>
                <div class="percent__text">
                  {{ resultPayload?.val?.attitude.name }}
                </div>
              </div>
            </div>
            <div class="percent-block">
              <div class="label">Выбор других пользователей</div>
              <div v-for="attitude in resultPayload?.val?.attitude.others" class="percent__block">
                <div class="percent">{{ attitude.value }}%</div>
                <div class="track">
                  <div class="current_track"
                    :style="{ width: `${attitude.value}%`, background: attitude.name === 'Положительное' ? 'linear-gradient(180deg, #3DB967 0%, #71E397 100%)' : attitude.name === 'Нейтральное' ? 'linear-gradient(180deg, #0A92F3 0%, #66B3EA 100%)' : attitude.name === 'Отрицательное' ? 'linear-gradient(180deg, #AD3473 0%, #CC78A3 100%)' : attitude.name === 'Затрудняюсь' ? 'linear-gradient(180deg, #CDCDCD 0%, #FBFBFB 100%)' : '' }">
                  </div>
                </div>
                <div class="percent__text">
                  {{ attitude.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="stat">
          <div class="head">
            Сферы применения ИИ
          </div>
          <div class="graphs">
            <div class="currentGraph">
              <div class="label">Ваш выбор</div>
              <CirclePercent :label="resultPayload.val?.sphere.name" :percent="resultPayload?.val?.sphere.percent" />
            </div>
            <div class="otherGraphs">
              <div class="label">Выбор других пользователей</div>
              <div class="graphsList">
                <CirclePercent v-for="sphere in resultPayload.val?.sphere.others" :key="sphere.name"
                  :label="sphere.name" :percent="sphere.value" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="stat">
        <div class="head">
          Какой вы тип ИИ
        </div>
        <div class="heroes">
          <div class="currentHero">
            <div class="label">Ваш выбор</div>
            <div class="head">{{ resultPayload?.val?.hero.percent }}%</div>
            <video :src="resultPayload?.val?.hero.video" autoplay muted loop playsinline></video>
          </div>
          <div class="othersHero">
            <div v-for="hero in resultPayload?.val?.hero.others" class="otherHero">
              <div class="heroImg"><img :src="hero.avatar" alt="" /></div>
              <div class="percentHero">{{ hero.percent }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.wrapStep5 {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
}

.result__wrapper {
  width: max-content;
  display: flex;
  gap: 194px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 94px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.head {
  font-weight: 600;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #fff;
}

.percents {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.percent-block {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.label {
  font-weight: 500;
  font-size: 20px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #d8d8d8;
  opacity: 0.5;
}

.percent__block {
  display: flex;
  gap: 33px;
  align-items: center;
}


.percent__block .percent {
  font-weight: 600;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #fff;
  width: 125px;
  flex-shrink: 0;
}

.current__percent .percent__block {
  border-radius: 60px;
  /* width: 1300px; */
  height: 81px;
  background: rgba(177, 177, 177, 0.1);
  padding: 18px 67px;
  transform: translateX(-67px);
}

.track {
  width: 747px;
  height: 25px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 60px;
  position: relative;
  flex-shrink: 0;
}

.current_track {
  height: 100%;
  border-radius: 60px;
  transform: translateX(-25px);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.graphs {
  display: flex;
}

.currentGraph {
  display: flex;
  flex-direction: column;
  gap: 43px;
  border-radius: 60px;
  width: 351px;
  height: 388px;
  background: rgba(177, 177, 177, 0.1);
  padding: 34px 56px;
  transform: translateX(-56px);
}

.otherGraphs {
  display: flex;
  flex-direction: column;
  gap: 43px;
  padding-top: 34px;
}

.graphsList {
  display: flex;
  gap: 56px;
}

video {
  border-radius: 28px;
  width: 1051px;
  height: auto;
  transform: translate(-27%, -8%);
}

.heroes {
  display: flex;
  gap: 20px;

}

.othersHero {
  display: flex;
  flex-direction: column;
  gap: 54px;

}

.heroImg {
  border-radius: 100px;
  width: 130px;
  height: 133px;
  overflow: hidden;
}

.heroImg img {
  width: max-content;
  max-width: none;
  object-position: top center;
}

.otherHero {
  display: flex;
  align-items: center;
  gap: 37px;
}

.percentHero {
  font-weight: 300;
  font-size: 30px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #fff;
}

.currentHero {
  max-width: 710px;
}
</style>