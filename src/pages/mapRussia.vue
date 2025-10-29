<script setup>
import { ref, onMounted } from "vue";
import svgPanZoom from "svg-pan-zoom";

const mapWrapper = ref(null);
const mapSvg = ref(null);

const currentRegion = ref(null);
const zoomLevel = ref(1);

const patientsData = ref([]);

// грузим JSON с пациентами
async function loadPatients() {
  const res = await fetch("/datas/12.json");
  patientsData.value = await res.json();
}

onMounted(async () => {
  await loadPatients();

  // загружаем SVG карту
  const res = await fetch("/map2.svg");
  const svgText = await res.text();
  mapWrapper.value.innerHTML = svgText;

  // достаём сам <svg>
  mapSvg.value = mapWrapper.value.querySelector("svg");

  const groups = mapSvg.value.querySelectorAll("g[data-okrug]");

  // создаём круги + текст для всех округов
  groups.forEach((g) => {
    const regionName = g.getAttribute("data-okrug");

    const totalPatients = patientsData.value
      .filter((p) => p["Федеральный округ"] === regionName)
      .reduce((sum, p) => sum + p["Набор пациентов"], 0);

    const bbox = g.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", 25);
    circle.setAttribute("fill", "rgba(255,0,0,0.6)");
    circle.classList.add("patient-count"); // скрыт по умолчанию
    g.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx);
    text.setAttribute("y", cy + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-size", "16");
    text.classList.add("patient-count"); // скрыт по умолчанию
    text.textContent = totalPatients;
    g.appendChild(text);
  });

  // инициализируем pan/zoom
  const panZoom = svgPanZoom(mapSvg.value, {
    zoomEnabled: true,
    controlIconsEnabled: false,
    fit: true,
    center: true,
    minZoom: 1,
    maxZoom: 10,
    panEnabled: true,
    onZoom: updateRegion,
    onPan: updateRegion,
  });

  function updateRegion() {
    zoomLevel.value = panZoom.getZoom();

    const wrapperRect = mapWrapper.value.getBoundingClientRect();
    const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
    const wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;

    let closestRegion = null;
    let minDistance = Infinity;

    groups.forEach((g) => {
      const rect = g.getBoundingClientRect();
      const gCenterX = rect.left + rect.width / 2;
      const gCenterY = rect.top + rect.height / 2;

      const dx = gCenterX - wrapperCenterX;
      const dy = gCenterY - wrapperCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = g.getAttribute("data-okrug");
      }

      // скрываем все кружки
      g.querySelectorAll(".patient-count").forEach((el) => el.classList.remove("active"));
    });

    if (zoomLevel.value >= 1.75 && zoomLevel.value <= 5) {
      currentRegion.value = closestRegion;

      const activeG = mapSvg.value.querySelector(`g[data-okrug="${currentRegion.value}"]`);
      if (activeG) {
        activeG.querySelectorAll(".patient-count").forEach((el) => el.classList.add("active"));
      }
    } else {
      currentRegion.value = null;
    }
  }

  updateRegion();

  // отключаем скролл страницы при зуме колесом
  mapSvg.value.addEventListener("wheel", (e) => e.preventDefault(), {
    passive: false,
  });
});
</script>

<template>
  <div class="home_map">
    <h1>Карта России</h1>
    <div ref="mapWrapper" class="map-container">
		
    </div>
    <div class="info-panel">
      <p v-if="currentRegion">📍 Сейчас в фокусе: {{ currentRegion }}</p>
      <p v-else>Нет выбранного округа</p>
    </div>
  </div>
</template>
<style scoped>
.home_map {
  height: 100%;
}
.home_map *:not(.svg-pan-zoom_viewport) {
  transition: none;
}

.home_map svg {
  height: 100%;
  width: 100%;
}
.map-container {
  width: 100%;
  height: 100%;
}
.info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 10px;
  border-radius: 6px;
  
}
.info-panel p {
 color: black;
}
circle {
    opacity: 0;
}

</style>
