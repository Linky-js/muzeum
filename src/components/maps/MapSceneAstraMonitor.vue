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

watch(() => props.targetregion, (region) => {
  if (region && svgDoc.value) {

    focusRegion(region)

  }
});

function focusRegion(regionObject) {
  console.log('regionObject', regionObject);

  if (!svgDoc.value) return;
  if (regionObject?.type === 'lpu') return;

  // --- Очистка всех активных элементов ---
  const elements = svgDoc.value.querySelectorAll('g.active, path.active, text.active, g.activesmall, path.activesmall, text.activesmall');
  elements.forEach(e => {
    e.classList.remove('active', 'activesmall');
  });

  // --- Сброс к исходному виду ---
  if (regionObject === 'default') {
    activeRegion.value = null;

    gsap.to(svgDoc.value.documentElement, {
      duration: 1.5,
      attr: { viewBox: `0 0 6144 3609` },
      ease: 'power2.inOut'
    });

    svgDoc.value.documentElement.classList.remove('active');
    return;
  }

  let targetEl = null;

  // --- Если тип округ ---
  if (regionObject.type === 'okrug') {
    const region = svgDoc.value.getElementById(regionObject.okrug + '_ФО');
    if (region) {
      targetEl = region;
      const name = region.querySelector('.okrugName');
      if (name) name.classList.add('active');
      const oblasti = region.querySelectorAll('.oblast');
      oblasti.forEach(o => o.classList.add('active'));
    }
  }

  // --- Если тип область ---
  if (regionObject.type === 'oblast') {
    if (regionObject.okrug) {
      const okrug = svgDoc.value.getElementById(regionObject.okrug + '_ФО');
      if (okrug) {
        const oblasti = okrug.querySelectorAll('.oblast');
        oblasti.forEach(o => o.classList.add('activesmall'));
      }
    }
    let idName = regionObject.oblast.replaceAll(' ', '_');
    if (idName === 'Москва') idName = 'Москва_область';
    if (idName === 'Санкт-Петербург') idName = 'Санкт-Петербург_область';

    const oblast = svgDoc.value.getElementById(idName);
    if (oblast) {
      targetEl = oblast;
      const name = oblast.querySelector('.oblastName');
      if (name) name.classList.add('active');
      oblast.classList.add('active');
    }
  }

  // --- Если тип город ---
  if (regionObject.type === 'gorod') {
    if (regionObject.okrug) {
      const okrug = svgDoc.value.getElementById(regionObject.okrug + '_ФО');
      if (okrug) {
        const oblasti = okrug.querySelectorAll('.oblast');
        oblasti.forEach(o => o.classList.add('activesmall'));
      }
    }
    if (regionObject.oblast) {
      let idName = regionObject.oblast.replaceAll(' ', '_');
      const oblast = svgDoc.value.getElementById(idName);
      if (oblast) oblast.classList.add('active');
      targetEl = oblast;
    }

    let idName = regionObject.gorod.replaceAll(' ', '_');
    const gorod = svgDoc.value.getElementById(idName);
    if (gorod) {
      gorod.classList.add('active');
      targetEl = gorod; // приоритет города
    }
  }

  activeRegion.value = regionObject;
  svgDoc.value.documentElement.classList.add('active');

  // --- Если нечего масштабировать ---
  if (props.dontscale || !targetEl) return;

  // --- Универсальный GSAP-фокус ---
  const bbox = targetEl.getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;

  let viewBoxParams = `${centerX - 3100} ${centerY - 4000} 8000 8000`;

  if (regionObject.type !== 'okrug') {
    console.log(regionObject.oblast);

  }

  // Для округов — увеличить масштаб
  if (regionObject.type === 'okrug') {
    if (regionObject.okrug === 'Южный') {
      viewBoxParams = `${centerX - bbox.width / 2 - 1100} ${centerY - bbox.height / 2 - 1100} ${bbox.width + 3500} ${bbox.height + 3500}`;
    } else {
      viewBoxParams = `${centerX - bbox.width / 2 - 2100} ${centerY - bbox.height / 2 - 2100} ${bbox.width + 5500} ${bbox.height + 5500}`;
    }
  }
  gsap.to(svgDoc.value.documentElement, {
    duration: 2,
    attr: { viewBox: viewBoxParams },
    force3D: true,
    ease: 'power2.inOut',
    onComplete: () => emit('showmodal')
  });
}

</script>

<template>
  <div class="map-wrapper">
    <!-- <video
      class="overlay-video"
      src="/video/alpha.webm"
      autoplay
      muted
      loop
      playsinline
    ></video> -->
    <object ref="mapContainer" type="image/svg+xml" data="touch2/monitor-astra2.svg" class="map-svg"></object>
  </div>
</template>
<style scoped>
.overlay-video {
  position: absolute;
  inset: 0;
  left: 0;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  /* важно! чтобы не мешало кликам по карте */
  z-index: 5;
}

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


  transform-origin: center center;
  position: relative;
  z-index: 2;
  color: #36363675;
  background: #141820;
}

.btn {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 2000;
  cursor: pointer;
}
</style>
