<script setup>
import MapScene2 from '@/components/MapScene2.vue';
import { ref, computed, onMounted } from 'vue';
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const regionUp = ref(false);
const regions = ref([]);
const targetRegionId = ref('');
const bus = useBroadcastBus({
    role: 'touch',
    pairId: '1',
    debug: true,
})
initMasterSync(router, bus, '1')

const targetregion = ref({
    id: '',
    name: '',
});

const getCurrentRegion = (region) => {
  console.log('getCurrentRegion', region)

  targetregion.value = { ...region } // создаём новый объект
  targetRegionId.value = region.id

  bus.send('navigate', { region: { ...region } }, { role: 'monitor', pairId: '1' })
}
const clearRegion = () => {
  targetregion.value = { id: '', name: '' }
}


const regionsHints = computed(() => {
    if (!targetregion.value.name) return regions.value
    return regions.value.filter((r) =>
        r.name.toLowerCase().includes(targetregion.value.name.toLowerCase())
    )
})

const getRegions = async () => {
    const res = await fetch('/spisok.json')

    const data = await res.json()
    regions.value = data.map(r => ({
        id: r['Субъекты'],
        name: r['Субъекты'],
        fact: r['Факт от Алмазова'],
        keywords: r['Ключевые слова'],
        fun: r['Занимательный факт'],
    }))
    console.log('regions', regions.value)
}

onMounted(() => {
    getRegions()
})
</script>

<template>
    <div class="map__head">
        <div @click="$router.back()" class="btn__back">
            <svg width="45" height="74" viewBox="0 0 45 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.3635 37.0002L45 8.22223L36.8182 0L0 37.0002L36.8182 74L45 65.7778L16.3635 37.0002Z"
                    fill="white" />
            </svg>
            Назад
        </div>
        <div class="head">
            Сотрудничество Центра Алмазова с регионами
        </div>
    </div>

    <div class="touchMap">
        <MapScene2 :targetregion="targetRegionId" :dontscale="true" />
        <div class="regions__btns">
            <div class="question">
                <div class="input_wrap">
                    <div @click="clearRegion" class="btnSearch">
                        <svg v-if="targetregion.name === '' || !targetregion.name" xmlns="http://www.w3.org/2000/svg"
                            width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <path
                                d="M48.0814 44.3121L59.5019 55.7326L55.7307 59.5038L44.3102 48.0833C40.2038 51.3686 34.996 53.334 29.332 53.334C16.084 53.334 5.33203 42.582 5.33203 29.334C5.33203 16.086 16.084 5.33398 29.332 5.33398C42.58 5.33398 53.332 16.086 53.332 29.334C53.332 34.998 51.3667 40.2057 48.0814 44.3121ZM42.7312 42.3334C45.992 38.9729 47.9987 34.3889 47.9987 29.334C47.9987 19.0206 39.6454 10.6673 29.332 10.6673C19.0187 10.6673 10.6654 19.0206 10.6654 29.334C10.6654 39.6473 19.0187 48.0006 29.332 48.0006C34.387 48.0006 38.971 45.994 42.3315 42.7332L42.7312 42.3334Z"
                                fill="white" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white"
                            class="bi bi-x-lg" viewBox="0 0 16 16">
                            <path
                                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </div>
                    <input @focus="regionUp = true" type="text" class="input_quiz" v-model="targetregion.name"
                        placeholder="Выберите регион" />
                    <div v-show="regionUp && regionsHints.length" class="custom_list">
                        <div v-for="value in regionsHints" :key="value.id" @click="getCurrentRegion(value)"
                            class="region" :class="value.id === targetregion.id ? 'active' : ''">
                            {{ value.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.btns {
    display: flex;
    gap: 8px;

}

.touchMap {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    height: calc(100vh - 100px);
}

.map__head {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 0 20px;
    margin-top: 20px;
}

.head {
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    color: var(--White, #FFF);
    text-align: center;
    font-family: "TT Hoves";
    font-size: 35px;
    font-style: normal;
    font-weight: 500;
    line-height: 100%;
}

.btn__back {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--White, #FFF);
    font-family: "TT Hoves";
    font-size: 24px;
    font-style: normal;
    font-weight: 500;
    line-height: 110%;
    /* 59.4px */
    letter-spacing: -1.08px;
}

.btn__back svg {
    width: 30px;
}

.question {
    border-radius: 15px;
    border: 1px solid #ffffff73;
    background: linear-gradient(85deg, rgba(217, 217, 217, 0.10) 3.83%, rgba(115, 115, 115, 0.10) 99.95%);
    display: flex;
    width: 350px;
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
}

.input_wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    position: relative;

}

.btnSearch {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 20px;
    height: 20px;
}

.btnSearch svg {
    width: 100%;
    height: 100%;
}

.input_wrap input {
    border-radius: 10px;
    border: 1px solid #ffffff73;
    background: linear-gradient(85deg, rgba(217, 217, 217, 0.10) 3.83%, rgba(115, 115, 115, 0.10) 99.95%);
    padding: 10px 15px;
    color: var(--White, #FFF);
    font-family: "TT Hoves";
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 110%;
    /* 35.2px */
    letter-spacing: -0.64px;
}

.custom_list {

    border-radius: var(--dropdownmenu-m-border-radius, 0.375rem);
    border: 0.001px solid var(--dropdownmenu-primary-border-color, rgba(255, 255, 255, 0.00));
    width: 100%;
    height: 13rem;
    overflow-y: scroll;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.custom_list::-webkit-scrollbar {
    width: 2px;
}

.region {
    padding: 5px;
    color: #ffffff;
    font-family: "TT Hoves";
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 1.25rem;
    /* 142.857% */
    cursor: pointer;
}

.region.active {
    background: var(--dropdownmenu-primary-itemvalue-bg-color-default, rgba(68, 83, 113, 0.05));
    border-radius: var(--dropdownmenu-m-border-radius, 0.375rem);
}
</style>