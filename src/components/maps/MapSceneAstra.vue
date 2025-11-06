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

watch(() => props.targetregion, (regionObject) => {
  console.log('regionObject', regionObject);
  if (regionObject && svgDoc.value) focusRegion(regionObject);
});

function focusRegion(regionObject) {
  if (!svgDoc.value) return;
  if (regionObject.type === 'lpu') return

  let elements = svgDoc.value.querySelectorAll('g.active, path.active, text.active, g.activesmall, path.activesmall, text.activesmall');
  elements.forEach(e => {
    e.classList.remove('active');
    e.classList.remove('activesmall');
  });

  if (regionObject.type === "okrug") {
    const region = svgDoc.value.getElementById(regionObject.okrug + '_ФО');
    const name = region.querySelector('.okrugName')
    name.classList.add('active')
    const oblasti = region.querySelectorAll('.oblast , .fulloblast')
    oblasti.forEach(o => o.classList.add('active'))
  }
  if (regionObject.type === "oblast") {
    if (regionObject.okrug) {
      const okrug = svgDoc.value.getElementById(regionObject.okrug + '_ФО');
      const oblasti = okrug.querySelectorAll('.oblast , .fulloblast')
      oblasti.forEach(o => o.classList.add('activesmall'))
    }
    let idName = regionObject.oblast.replaceAll(' ', '_');
    if (idName === 'Москва') idName = 'Москва_область'
    if (idName === 'Санкт-Петербург') idName = 'Санкт-Петербург_область'
    const oblast = svgDoc.value.getElementById(idName);
    if (oblast) {
      const name = oblast.querySelector('.oblastName')
      name.classList.add('active')
      oblast.classList.add('active')
    }
  }
  if (regionObject.type === "gorod") {
    if (regionObject.okrug) {
      const okrug = svgDoc.value.getElementById(regionObject.okrug + '_ФО');
      const oblasti = okrug.querySelectorAll('.oblast , .fulloblast')
      oblasti.forEach(o => o.classList.add('activesmall'))
    }
    if (regionObject.oblast) {
      let idName = regionObject.oblast.replaceAll(' ', '_');
      const oblast = svgDoc.value.getElementById(idName);
      if (oblast) {
        oblast.classList.add('active')
      }
    }
    let idName = regionObject.gorod.replaceAll(' ', '_');
    const gorod = svgDoc.value.getElementById(idName);
    if (gorod) {
      console.log('gorod', gorod);
      gorod.classList.add('active')
    }
  }


  activeRegion.value = regionObject;
  // region.setAttribute('fill', 'rgba(255,255,255,0.2)');
  // region.setAttribute('stroke', 'rgba(255,255,255)');
}

</script>

<template>
  <div class="map-wrapper">
    <object ref="mapContainer" type="image/svg+xml" data="/touch2/touch-astra.svg" class="map-svg"></object>
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
