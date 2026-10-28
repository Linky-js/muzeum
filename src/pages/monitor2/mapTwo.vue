<script setup>
import { ref, watch } from 'vue';
import MapScene2 from '@/components/maps/MapScene2.vue';
import RegionModal from '@/components/maps/RegionModal.vue';
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '2', debug: false })
initMonitorSync(router, bus, '2')
const targetregion = ref(null);
const curRegion = ref(null);
const isModalOpen = ref(false)
const defaultScreen = ref(true)

bus.on('navigate', (region) => {
  console.log('navigate', region);
  defaultScreen.value = false
  isModalOpen.value = false
  targetregion.value = region.region.id
  curRegion.value = region
})
const items = [
  'Территориальное планирование',
  'Телемедицина и консилиумы',
  'Выезды специалистов',
  'Стратегические документы',
  'Кадровое развитие',
  'Профильные комиссии',
  'Учет регионального контекста'

]
</script>

<template>
  {{ region }}
  <div class="map__wrapper animVideo">
    <transition name="fade">
      <div v-if="defaultScreen" class="default_screen">
        <div class="head">
          <div class="title">
            Регионы и Центр Алмазова 
          </div>
          <img src="../../assets/img/ic.png" alt="">
        </div>
        <div class="default__info">
          <div class="default__info-title">
            Курируемые регионы получают доступ к передовым <br>
            решениям и федеральной экспертизе.
          </div>
          <div class="default__info-subtitle">
            Основные формы взаимодействия:
          </div>
          <div class="default__info-list">
            <div v-for="item in items" class="default__info-item">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </transition>
    <MapScene2 :targetregion="targetregion" :bg="true" @showmodal="isModalOpen = true" />
  </div>
  <RegionModal v-if="curRegion" :show="isModalOpen" :region="curRegion?.region" />
</template>
<style scoped>
.map__wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.default_screen {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 573px;
}

.title {
  font-weight: 500;
  font-size: 130px;
  line-height: 100%;
  letter-spacing: 0.02em;
  color: #fff;
}

.head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 70px;
  width: max-content;

}

.head img {
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.default__info {
  display: flex;
  flex-direction: column;
  gap: 96px;
  font-weight: 500;
  font-size: 96px;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #fff;
}

.default__info-title {
  color: #189bff;
}
.default__info-list {
  font-size: 70px;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

/* начальное и конечное состояние */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
