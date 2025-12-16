<script setup>
import CirclePercent from "@/components/ui/CirclePercent.vue";
import { computed, defineProps, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'

const bus = useBroadcastBus({
  role: 'touch',
  pairId: '1',
  debug: false,
})
initMasterSync(router, bus, '1')

const props = defineProps({
  person: Object,
  step: Number,
});

const typesAi = ref([
  {
    id: 1,
    name: "Золушка",
    responsibilities:
      "ИИ берет на себя рутинную работу<br> и освобождает ваше время",
    img: "./ai/Cinderella.png",
    avatar: "./ai/Cinderella-ava.png",
    video: '/video/heroes/zolushka_loop.webm'
  },
  {
    id: 2,
    name: "Стажер",
    responsibilities: "ИИ требует надзора, но со<br> временем учится",
    img: "./ai/Intern.png",
    avatar: "./ai/Intern-ava.png",
    video: '/video/heroes/stasher_loop.webm'
  },
  {
    id: 3,
    name: "Супермен",
    responsibilities: "ИИ делает человеческие задачи<br> быстрее и эффективнее",
    img: "./ai/Superman.png",
    avatar: "./ai/Superman-ava.png",
    video: '/video/heroes/super_loop.webm'
  },
  {
    id: 4,
    name: "Шерлок Холмс",
    responsibilities: "ИИ находит скрытые связи и<br> объясняет непонятное",
    img: "./ai/Sherlock.png",
    avatar: "./ai/Sherlock-ava.png",
    video: '/video/heroes/sherlok_loop.webm'
  },
  {
    id: 5,
    name: "Хрустальный шар",
    responsibilities:
      "ИИ мыслит иначе, чем человек,<br> и дает неожиданные прогнозы",
    img: "./ai/Crystal.png",
    avatar: "./ai/Crystal-ava.png",
    video: '/video/heroes/mag_loop.webm'
  },
]);

const resultPayload = computed(() => ({
  person: props.person,



  attitude: {
    name: currentAttitudeName,
    percent: currentAttitudeValue.value,
    others: otherAttitudes.value
  },

  sphere: {
    name: currentSphereName,
    percent: currentSphereValue.value,
    others: otherSpheres.value
  },

  hero: {
    name: currentHeroName,
    video: currentSrcVideo.value,
    percent: currentHeroValue.value,
    others: otherHeroes.value
  }
}))


const attitudes = ref([])
const spheres = ref([])
const heroes = ref([])
const currentAttitudeName = props.person.attitude.name
const currentSphereName = props.person.sphere
const currentHeroName = props.person.ai.name

// Текущее значение
const currentAttitudeValue = computed(() => attitudes.value[currentAttitudeName] ?? null)
const currentSphereValue = computed(() => spheres.value[currentSphereName] ?? null)
const currentHeroValue = computed(() => heroes.value[currentHeroName] ?? null)
const currentSrcVideo = computed(() => typesAi.value.find(item => item.name === currentHeroName).video)

// Массив остальных
const otherAttitudes = computed(() => {
  return Object.entries(attitudes.value)
    .filter(([name]) => name !== currentAttitudeName)
    .map(([name, value]) => ({ name, value }))
})

const otherSpheres = computed(() => {
  return Object.entries(spheres.value)
    .filter(([name]) => name !== currentSphereName)
    .map(([name, value]) => ({ name, value }))
})
const otherHeroes = computed(() => {
  return typesAi.value
    // убираем текущего героя
    .filter(hero => hero.name !== currentHeroName)
    // добавляем процент
    .map(hero => ({
      ...hero,
      percent: heroes.value?.[hero.name] ?? 0
    }))
})


const getStatistickAtitudes = async () => {
  try {
    const res = await fetch(
      'http://127.0.0.1:3001/api/statistics/attitude', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    )
    attitudes.value = await res.json()
    console.log('attitudes.value', attitudes.value);

  } catch (error) {
    console.log(error);
  }
};
const getStatistickSpheres = async () => {
  try {
    const res = await fetch(
      'http://127.0.0.1:3001/api/statistics/sphere', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    )
    spheres.value = await res.json()
  } catch (error) {
    console.log(error);
  }
}
const getStatistickHeroes = async () => {
  try {
    const res = await fetch(
      'http://127.0.0.1:3001/api/statistics/hero', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    )
    heroes.value = await res.json()
    console.log('heroes', heroes.value);

  } catch (error) {
    console.log(error);
  }
}

watch(resultPayload, (val) => {
  console.log('VAL', val);

  bus.send('resultstep5', { val: JSON.parse(JSON.stringify(val)) })
}, { deep: true })
onMounted(() => {
  console.log(props.person);

  getStatistickAtitudes();
  getStatistickSpheres();
  getStatistickHeroes();
});
</script>
<template>
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
              <div class="percent">{{ currentAttitudeValue }}%</div>
              <div class="track">
                <div class="current_track"
                  :style="{ width: `${currentAttitudeValue}%`, background: person.attitude.name === 'Положительное' ? 'linear-gradient(180deg, #3DB967 0%, #71E397 100%)' : person.attitude.name === 'Нейтральное' ? 'linear-gradient(180deg, #0A92F3 0%, #66B3EA 100%)' : person.attitude.name === 'Отрицательное' ? 'linear-gradient(180deg, #AD3473 0%, #CC78A3 100%)' : person.attitude.name === 'Затрудняюсь' ? 'linear-gradient(180deg, #CDCDCD 0%, #FBFBFB 100%)' : '' }">
                </div>
              </div>
              <div class="percent__text">
                {{ person.attitude.name }}
              </div>
            </div>
          </div>
          <div class="percent-block">
            <div class="label">Выбор других пользователей</div>
            <div v-for="attitude in otherAttitudes" class="percent__block">
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
            <CirclePercent :label="currentSphereName" :percent="currentSphereValue" />
          </div>
          <div class="otherGraphs">
            <div class="label">Выбор других пользователей</div>
            <div class="graphsList">
              <CirclePercent v-for="sphere in otherSpheres" :key="sphere.name" :label="sphere.name"
                :percent="sphere.value" />
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
          <div class="head">{{ currentHeroValue }}%</div>
          <video :src="currentSrcVideo" autoplay muted loop playsinline></video>
        </div>
        <div class="othersHero">
          <div v-for="hero in otherHeroes" class="otherHero">
            <div class="heroImg"><img :src="hero.avatar" alt="" /></div>
            <div class="percentHero">{{ hero.percent }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.result__wrapper {
  margin-top: 215px;
  width: 100%;
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
  width: 1300px;
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