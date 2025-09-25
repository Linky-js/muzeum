<script setup>
import { onMounted, ref, watch, reactive, onBeforeUnmount, computed } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  targetregion: String,
  dontscale: { type: Boolean, default: false },
  bg: {
    type: Boolean,
    default: false
  }
});

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

  if (activeRegion.value) activeRegion.value.setAttribute('fill', '#363636');

  const region = svgDoc.value.getElementById(regionName);
  if (!region) return;

  activeRegion.value = region;
  region.setAttribute('fill', '#ff5555');
  if (props.dontscale) return;

  const bbox = region.getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;

  gsap.to(svgDoc.value.documentElement, {
    duration: 1.5,
    attr: {
      viewBox: `${centerX - 200} ${centerY - 200} 400 400`,
    },
    ease: 'power2.inOut'
  });
}

</script>

<template>
  <div class="map-wrapper">
    <object ref="mapContainer" type="image/svg+xml" data="/map0_4.svg" class="map-svg"></object>
  </div>
</template>
<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  perspective: 1200px;
  position: relative;
  overflow: hidden;
}
.map-svg {
  width: 100%;
  height: 100%;
  transform: rotateX(35deg);
  transform-origin: center center;
  position: relative;
  z-index: 2;
}
</style>
