<script setup>
import { onMounted, ref, watch, reactive, onBeforeUnmount, computed } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  targetregion: String,
  dontscale: { type: Boolean, default: false },
  bg: {
    type: Boolean,
    default: false
  },
  unFocus: {
    type: Boolean,
    default: false
  }
});

watch(() => props.unFocus, (unFocus) => {
  if (unFocus && svgDoc.value) {
    activeRegion.value.setAttribute('fill', 'rgba(255,255,255,0.1)');
    activeRegion.value.setAttribute('stroke', '#7D7D7D');
  }
})

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

  if (activeRegion.value) {
    activeRegion.value.setAttribute('fill', '#1B1C21');
    activeRegion.value.setAttribute('stroke', '#7D7D7D');

  }

  const region = svgDoc.value.getElementById(regionName);
  if (!region) return;

  activeRegion.value = region;
  region.setAttribute('fill', 'rgba(255,255,255,0.2)');
  region.setAttribute('stroke', 'rgba(255,255,255)');
}

</script>

<template>
  <div class="map-wrapper">
    <object ref="mapContainer" type="image/svg+xml" data="/touch2/curregiontouch.svg" class="map-svg"></object>
  </div>
</template>
<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  perspective: 1200px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-svg {
  width: 100%;
  height: 100%;
  transform: rotateX(0deg);
  transform-origin: center center;
  position: relative;
  z-index: 2;
  color: #36363675;
}
</style>
