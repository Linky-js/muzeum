<script setup>
import { onMounted, ref, watch, defineEmits, onBeforeUnmount, computed } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  targetregion: String,
  dontscale: { type: Boolean, default: false },
  bg: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['showmodal'])

const mapContainer = ref(null);
const svgDoc = ref(null);
const activeRegion = ref(null);

onMounted(() => {
  const svgObject = mapContainer.value;
  svgObject.addEventListener('load', () => {
    svgDoc.value = svgObject.contentDocument;
  });
});

watch(() => props.targetregion, (regionName) => {
  if (regionName && svgDoc.value) focusRegion(regionName);
});

function focusRegion(regionName) {
  if (!svgDoc.value) return;

  const regions = svgDoc.value.querySelectorAll('g.active');
  regions.forEach(r => r.classList.remove('active'));

  // --- Сброс к исходному виду ---
  if (regionName === 'default') {
    activeRegion.value = null;

    gsap.to(svgDoc.value.documentElement, {
      duration: 1.5,
      attr: { viewBox: `0 0 6144 3609` },
      ease: 'power2.inOut'
    });

    svgDoc.value.documentElement.classList.remove('active');
    return;
  }

  const region = svgDoc.value.getElementById(regionName);
  if (!region) return;

  // --- ВАЖНО: разрешаем повторное нажатие на тот же регион ---
  if (activeRegion.value === region) {
    activeRegion.value = null; // сброс
  }

  activeRegion.value = region;
  region.classList.add('active');
  svgDoc.value.documentElement.classList.add('active');

  if (props.dontscale) return;

  const bbox = region.getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  let defaultParams = `${centerX - 600} ${centerY - 800} 1600 1600`
  console.log(regionName);
  if (regionName === 'Республика Карелия' || regionName === 'Архангельская область') defaultParams = `${centerX - 900} ${centerY - 1200} 2400 2400`
  
  gsap.to(svgDoc.value.documentElement, {
    duration: 2.5,
    attr: {
      viewBox: defaultParams,
    },
    force3D: true,
    ease: 'power2.inOut',
    onComplete: () => {
      emit('showmodal')
    }
  });
}


</script>

<template>
  <div class="map-wrapper">
    <!-- <div @click="focusRegion('default')" class="btn">default</div> -->
    <object ref="mapContainer" type="image/svg+xml" data="/map011.svg" class="map-svg"></object>
  </div>
</template>
<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  perspective: 1900px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-svg {
  width: 150%;
  height: 150%;

  transform-origin: center center;
  position: relative;
  z-index: 2;
  color: #36363675;
}
.btn{
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 2000;
  cursor: pointer;
}
</style>
