<script setup>
import { ref, watch } from 'vue';

import MapScene from '@/components/MapScene.vue';
import MapScene2 from '@/components/MapScene2.vue';
import PhotoAnimate from '@/components/PhotoAnimate.vue';
import RegionModal from '@/components/ui/RegionModal.vue';
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: true })
initMonitorSync(router, bus, '1')
const targetregion = ref(null);
const curRegion = ref(null);
const isModalOpen = ref(false)
let offListener = null

bus.on('navigate', (region) => {
    console.log('navigate', region);

    targetregion.value = region.region.id
    curRegion.value = region
    if (curRegion.value.region.fact) {
        isModalOpen.value = true
    }
})
</script>

<template>
    {{ region }}
    <div class="map__wrapper">
        <MapScene2 :targetregion="targetregion" :bg="true" />
    </div>
    <!-- <photo-animate></photo-animate> -->
    <RegionModal v-if="curRegion" :show="isModalOpen" :region="curRegion" />
</template>
<style scoped>
.map__wrapper {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
