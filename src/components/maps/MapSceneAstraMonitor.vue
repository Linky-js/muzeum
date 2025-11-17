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
  console.log(regionObject);
  if (regionObject.type !== 'okrug') {


  }

  // Для округов — увеличить масштаб
  if (regionObject.type === 'okrug') {

    switch (regionObject.okrug) {
      case 'Южный':
        viewBoxParams = `${centerX - bbox.width / 2 - 1950} ${centerY - bbox.height / 2 - 2700} ${bbox.width + 5700} ${bbox.height + 5500}`;
        break;
      case 'Центральный':
        viewBoxParams = `${centerX - bbox.width / 2 - 2600} ${centerY - bbox.height / 2 - 2100} ${bbox.width + 7500} ${bbox.height + 3500}`;
        break;
      case 'Северо-Западный':
        viewBoxParams = `${centerX - bbox.width / 2 - 5200} ${centerY - bbox.height / 2 - 2100} ${bbox.width + 15000} ${bbox.height + 5000}`;
        break;
      case 'Северо-Кавказский':
        viewBoxParams = `${centerX - bbox.width / 2 - 1200} ${centerY - bbox.height / 2 - 1800} ${bbox.width + 3500} ${bbox.height + 3500}`;
        break;
      case 'Приволжский':
        viewBoxParams = `${centerX - bbox.width / 2 - 3100} ${centerY - bbox.height / 2 - 1700} ${bbox.width + 9000} ${bbox.height + 3000}`;
        break;
      case 'Уральский':
        viewBoxParams = `${centerX - bbox.width / 2 - 3800} ${centerY - bbox.height / 2 - 5000} ${bbox.width + 11000} ${bbox.height + 10000}`;
        break;
      case 'Сибирский':
        viewBoxParams = `${centerX - bbox.width / 2 - 5900} ${centerY - bbox.height / 2 - 3200} ${bbox.width + 17000} ${bbox.height + 6000}`;
        break;
      case 'Дальневосточный':
        viewBoxParams = `${centerX - bbox.width / 2 - 5900} ${centerY - bbox.height / 2 - 6000} ${bbox.width + 18000} ${bbox.height + 11000}`;
        break;
      default:
        console.log('дефолт');
        viewBoxParams = `${centerX - bbox.width / 2 - 2100} ${centerY - bbox.height / 2 - 2100} ${bbox.width + 5500} ${bbox.height + 5500}`;
        break;
    }
  }
  if (regionObject.type === 'oblast') {
    switch (regionObject.oblast) {
      case 'Тверская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1000} ${centerY - bbox.height / 2 - 150} ${bbox.width + 2900} ${bbox.height + 300}`;
        break;
      case 'Ярославская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 700} ${centerY - bbox.height / 2 - 150} ${bbox.width + 2000} ${bbox.height + 300}`;
        break;
      case 'Московская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 900} ${centerY - bbox.height / 2 - 300} ${bbox.width + 2500} ${bbox.height + 500}`;
        break;
      case 'Брянская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 750} ${centerY - bbox.height / 2 - 150} ${bbox.width + 2100} ${bbox.height + 300}`;
        break;
      case 'Калужская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 750} ${centerY - bbox.height / 2 - 150} ${bbox.width + 2100} ${bbox.height + 300}`;
        break;
      case 'Орловская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 750} ${centerY - bbox.height / 2 - 150} ${bbox.width + 2100} ${bbox.height + 300}`;
        break;
      case 'Тульская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 750} ${centerY - bbox.height / 2 - 100} ${bbox.width + 2100} ${bbox.height + 200}`;
        break;
      case 'Архангельская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1650} ${centerY - bbox.height / 2 - 800} ${bbox.width + 4800} ${bbox.height + 1500}`;
        break;
      case 'Республика Карелия':
        viewBoxParams = `${centerX - bbox.width / 2 - 1400} ${centerY - bbox.height / 2 - 250} ${bbox.width + 4000} ${bbox.height + 500}`;
        break;
      case 'Республика Коми':
        viewBoxParams = `${centerX - bbox.width / 2 - 2500} ${centerY - bbox.height / 2 - 700} ${bbox.width + 7200} ${bbox.height + 1000}`;
        break;
      case 'Калининградская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 375} ${centerY - bbox.height / 2 - 75} ${bbox.width + 1050} ${bbox.height + 150}`;
        break;
      case 'Волгоградская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1050} ${centerY - bbox.height / 2 - 400} ${bbox.width + 3000} ${bbox.height + 800}`;
        break;
      case 'Ростовская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1050} ${centerY - bbox.height / 2 - 500} ${bbox.width + 3000} ${bbox.height + 800}`;
        break;
      case 'Республика Северная Осетия-Алания':
        viewBoxParams = `${centerX - bbox.width / 2 - 250} ${centerY - bbox.height / 2 - 75} ${bbox.width + 1050} ${bbox.height + 150}`;
        break;
      case 'Нижегородская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1050} ${centerY - bbox.height / 2 - 400} ${bbox.width + 3000} ${bbox.height + 800}`;
        break;
      case 'Кировская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1030} ${centerY - bbox.height / 2 - 420} ${bbox.width + 3000} ${bbox.height + 800}`;
        break;
      case 'Оренбургская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1150} ${centerY - bbox.height / 2 - 550} ${bbox.width + 3300} ${bbox.height + 1000}`;
        break;
      case 'Пермский край':
        viewBoxParams = `${centerX - bbox.width / 2 - 1150} ${centerY - bbox.height / 2 - 550} ${bbox.width + 3300} ${bbox.height + 1000}`;
        break;
      case 'Республика Мордовия':
        viewBoxParams = `${centerX - bbox.width / 2 - 450} ${centerY - bbox.height / 2 - 200} ${bbox.width + 1500} ${bbox.height + 400}`;
        break;
      case 'Республика Башкортостан':
        viewBoxParams = `${centerX - bbox.width / 2 - 800} ${centerY - bbox.height / 2 - 550} ${bbox.width + 2500} ${bbox.height + 1000}`;
        break;
      case 'Чувашская Республика':
        viewBoxParams = `${centerX - bbox.width / 2 - 350} ${centerY - bbox.height / 2 - 75} ${bbox.width + 1050} ${bbox.height + 150}`;
        break;
      case 'Свердловская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1150} ${centerY - bbox.height / 2 - 700} ${bbox.width + 3350} ${bbox.height + 1200}`;
        break;
      case 'Ханты-Мансийский АО - Югра':
        viewBoxParams = `${centerX - bbox.width / 2 - 2450} ${centerY - bbox.height / 2 - 650} ${bbox.width + 7200} ${bbox.height + 1000}`;
        break;
      case 'Тюменская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1300} ${centerY - bbox.height / 2 - 500} ${bbox.width + 3800} ${bbox.height + 1000}`;
        break;
      case 'Алтайский край':
        viewBoxParams = `${centerX - bbox.width / 2 - 1300} ${centerY - bbox.height / 2 - 500} ${bbox.width + 3800} ${bbox.height + 1000}`;
        break;
      case 'Новосибирская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 1300} ${centerY - bbox.height / 2 - 500} ${bbox.width + 3800} ${bbox.height + 1000}`;
        break;
      case 'Иркутская область':
        viewBoxParams = `${centerX - bbox.width / 2 - 2750} ${centerY - bbox.height / 2 - 950} ${bbox.width + 8000} ${bbox.height + 2000}`;
        break;
      case 'Красноярский край':
        viewBoxParams = `${centerX - bbox.width / 2 - 4500} ${centerY - bbox.height / 2 - 9300} ${bbox.width + 13000} ${bbox.height + 18000}`;
        break;
      case 'Приморский край':
        viewBoxParams = `${centerX - bbox.width / 2 - 1200} ${centerY - bbox.height / 2 - 1600} ${bbox.width + 3500} ${bbox.height + 3000}`;
        break;
      case 'Хабаровский край':
        viewBoxParams = `${centerX - bbox.width / 2 - 2900} ${centerY - bbox.height / 2 - 5100} ${bbox.width + 8000} ${bbox.height + 10000}`;
        break;
      case 'Республика Бурятия':
        viewBoxParams = `${centerX - bbox.width / 2 - 2430} ${centerY - bbox.height / 2 - 1000} ${bbox.width + 7000} ${bbox.height + 2000}`;
        break;
      default:
        viewBoxParams = `${centerX - bbox.width / 2 - 900} ${centerY - bbox.height / 2 - 500} ${bbox.width + 2500} ${bbox.height + 1000}`;
        break;
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
