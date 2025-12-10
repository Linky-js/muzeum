<script setup>
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import MapScene from '@/components/maps/MapScene.vue';
import { ref, computed, onMounted, nextTick } from 'vue';
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'
import BackBtn from "@/components/touchScreenComponents/BackBtn.vue";

const breadcrumbsList = ref([
  {
    id: 0,
    title: "Главная",
    link: "/touch2",
  },
  {
    id: 1,
    title: "Сотрудничество Центра Алмазова с регионами",
    link: "/touch-screen-3",
  },
]);

const router = useRouter()
const bus = useBroadcastBus({
  role: 'touch',
  pairId: '2',
  debug: true,
})
initMasterSync(router, bus, '2')
const regionUp = ref(false);
const regions = ref([]);
const targetRegionId = ref('');
const targetregion = ref({
  id: '',
  name: '',
});
const links = ref([
  
      {
        id: 0,
        name: "Курируемые регионы",
        link: "/touch-screen-regions",

      },
      {
        id: 1,
        name: "Карта AstraZeneca",
        link: "/touch-screen-astrazeneca",

      },
      {
        id: 2,
        name: "Тепловая карта факторы риска",
        link: "/touchmaptwo",

      },
    
]);
const unFocus = ref(false)

const getCurrentRegion = async (region) => {
  console.log('getCurrentRegion', region)

  // Сохраняем выбранный регион
  targetregion.value = { id: region.id, name: '' } // очищаем поле, но сохраняем id
  targetRegionId.value = region.id

  // Отправляем данные на монитор
  bus.send('navigate', { region: { ...region } }, { role: 'monitor', pairId: '2' })

  await nextTick()

  const activeEl = document.querySelector(`.region.active`)
  if (activeEl) {
    const wrapper = document.querySelector('.custom_list')
    const offsetTop = activeEl.offsetTop - 500
    wrapper?.scrollTo({
      top: offsetTop > 0 ? offsetTop : 0,
      behavior: 'smooth',
    })
  }
}

const clearRegion = () => {
  targetregion.value = { id: '', name: '' }
  unFocus.value = true
  setTimeout(() => {
    unFocus.value = false
  }, 100);
}


const regionsHints = computed(() => {
  if (!targetregion.value.name) return regions.value
  return regions.value.filter((r) =>
    r.name.toLowerCase().includes(targetregion.value.name.toLowerCase())
  )
})

const getRegions = async () => {
  const res = await fetch('/datas/spisok.json')

  const data = await res.json()
  regions.value = data.map((r, index) => ({
    id: r['Субъекты'],
    name: r['Субъекты'],
    fact: r['Факт от Алмазова '],
    keywords: r['Ключевые слова'],
    fun: r['Занимательный факт '],
    regioncode: r['region code'],
    index: index + 1,
  }))
  console.log('regions', regions.value)
}

onMounted(() => {
  getRegions()
})
</script>

<template>
  <div class="wrapper-content">
    <div class="header">
      <Breadcrums :list="breadcrumbsList" />
      <div class="header__logo">
        
      </div>
    </div>
    <div class="content relative">
      <div class="content__top">
        <h1 class="content__title animBtn">Сотрудничество Центра Алмазова с регионами</h1>
      </div>
    </div>
    <MapScene class="map" :targetregion="targetRegionId" :dontscale="true" :un-focus="unFocus" />
    <div class="regions__btns">
      <div class="question">
        <div class="input_wrap">
          <div @click="clearRegion" class="btnSearch">
            <svg v-if="targetregion.name === '' || !targetregion.name" xmlns="http://www.w3.org/2000/svg" width="64"
              height="64" viewBox="0 0 64 64" fill="none" opacity="0.2">
              <path
                d="M48.0814 44.3121L59.5019 55.7326L55.7307 59.5038L44.3102 48.0833C40.2038 51.3686 34.996 53.334 29.332 53.334C16.084 53.334 5.33203 42.582 5.33203 29.334C5.33203 16.086 16.084 5.33398 29.332 5.33398C42.58 5.33398 53.332 16.086 53.332 29.334C53.332 34.998 51.3667 40.2057 48.0814 44.3121ZM42.7312 42.3334C45.992 38.9729 47.9987 34.3889 47.9987 29.334C47.9987 19.0206 39.6454 10.6673 29.332 10.6673C19.0187 10.6673 10.6654 19.0206 10.6654 29.334C10.6654 39.6473 19.0187 48.0006 29.332 48.0006C34.387 48.0006 38.971 45.994 42.3315 42.7332L42.7312 42.3334Z"
                fill="white" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" opacity="0.2" fill="white"
              class="bi bi-x-lg" viewBox="0 0 16 16">
              <path
                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </div>
          <input @focus="regionUp = true" type="text" class="input_quiz" v-model="targetregion.name"
            placeholder="Поиск по округу, региону, городу" />
          <div class="custom_list-wrapper">
            <div class="custom_list">
              <div v-for="value in regionsHints" :key="value.id" @click="getCurrentRegion(value)" class="region"
                :class="value.id === targetregion.id ? 'active' : ''">
                {{ value.name }}
              </div>
            </div>
          </div>
          <div class="footer relative">
            <BackBtn class="footer__btn" />
            <MenuNavigation class="footer__btn" :links="links" />
          </div>
        </div>
      </div>
    </div>

  </div>


</template>

<style scoped>
.wrapper-content .map {
  position: absolute;
  bottom: 1.11rem;
  right: -6.45rem;
  width: 199.19356rem;
  height: 102.82969rem;
  flex-shrink: 0;
}

.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(25deg, #000 -3.55%, #030E22 122.6%, #000 179.53%);
}

.content {
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content__top {
  margin-bottom: 5.625rem;
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

.regions__btns {
  width: 52.3125rem;
  margin-left: auto;
  position: relative;
  z-index: 3;
}

.input_quiz {
  border-radius: 2.375rem;
  border: 3px solid #ffffff44;
  background: linear-gradient(85deg, rgba(217, 217, 217, 0.10) 3.83%, rgba(115, 115, 115, 0.10) 99.95%);
  color: var(--White, #FFF);
  font-family: "TT Hoves";
  font-size: 2rem;
  font-style: normal;
  font-weight: 500;
  line-height: 110%;
  letter-spacing: -0.04rem;
  padding: 2.59rem 3.37rem;
  width: 100%;
}

.input_wrap {
  height: 7.375rem;
}

.btnSearch {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  display: flex;
  width: 4rem;
  height: 4rem;
}

.btnSearch svg {
  width: 100%;
  height: 100%;
}

.custom_list-wrapper {
  border-radius: 2.375rem;
  border: 3px solid #ffffff44;
  background: linear-gradient(85deg, rgba(217, 217, 217, 0.10) 3.83%, rgba(115, 115, 115, 0.10) 99.95%);
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.custom_list {

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 52.5625rem;
  overflow-y: scroll;
}

.custom_list::-webkit-scrollbar {
  width: 0.375rem;
}

.custom_list::-webkit-scrollbar-track {
  border-radius: 0.0625rem;
  background: rgba(68, 83, 113, 0.10);
}

.custom_list::-webkit-scrollbar-thumb {
  border-radius: 0.25rem;
  background: var(--scroll-knob-bg-color-default, #A1A9B8);
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.00) inset;
}


.region {
  color: var(--White, #FFF);
  font-family: "TT Hoves";
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 500;
  line-height: 110%;
  letter-spacing: -0.05rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem 2rem;
}

.active {
  background: rgba(124, 123, 123, 0.158);
}
.footer{
  margin-top: 10.56rem;
  display: flex;
  width: 100%;
  justify-content: space-between;
}
</style>