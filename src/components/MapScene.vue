<template>
  <div ref="container" class="map-container" style="width:100%; height:100%; position:relative;"></div>

  <!-- <div class="city-buttons" style="position:absolute; left:12px; top:12px; z-index:10;">
    <button v-for="city in cities" :key="city.id" @click="focusCity(city.id)"
      style="display:block; margin-bottom:6px;">{{ city.name }}</button>
  </div> -->
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

const container = ref(null);

const cities = [
  { id: "Nij_novgorod", name: "Нижний Новгород" },
  { id: "Snt_Peterburg", name: "Санкт-Петербург" },
  { id: "Rostov", name: "Ростов" },
];

const cityImageMap = {
  Nij_novgorod: "/mod.png",
  Snt_Peterburg: "/mod.png",
  Rostov: "../src/assets/img/Union.png",
};
const cityConfigs = {
  Nij_novgorod: {
    url: "/sprites/nij.png",
    // scale: можно указать как число (world units) или строку 'rel:0.08' (8% от ширины карты)
    scale: "rel:0.085",
    offset: { x: 0, y: 0, z: 18 }, // положение относительно маркера (local)
    rotationDeg: 0,
    anchor: { x: 0.5, y: 0.5 }, // центр спрайта
  },
  Snt_Peterburg: {
    url: "../src/assets/img/Piter.png",
    scale: 20, // в world units
    offset: { x: -1, y: -1, z: 1 }, // небольшой сдвиг
    rotationDeg: 6,
    anchor: { x: 0.5, y: 0.5 },
  },
  Rostov: {
    url: "../src/assets/img/Union2.png",
    scale: 5,
    offset: { x: 0, y: 12, z: 20 },
    rotationDeg: -10,
    anchor: { x: 0.5, y: 0.5 },
  }
};

let renderer, scene, camera, controls;
let mapGroup;
let cityMeshes = {};
let spriteByCity = {};
let mapBox = null;
let animationTweens = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredMesh = null;
let hoverTween = null;
const texLoader = new THREE.TextureLoader();

// === GLOBAL CONFIG (mutable tilt) ===
// угол наклона камеры (в градусах) — теперь изменяемая переменная, чтобы её можно было анимировать
let tiltAngleDeg = 25; // можно менять
function getTiltRad() { return THREE.MathUtils.degToRad(tiltAngleDeg); }

// азимут (в градусах) — поворот вокруг вертикали (можно менять если нужно)
const azimuthDeg = 0;
const azimuth = THREE.MathUtils.degToRad(azimuthDeg);

// расстояние базовое (будет вычислено при fitCameraToMap)
let baseDistance = 1000;
let currentDistance = ref(1); // множитель относительно baseDistance

// зум настройки
const wheelZoomFactor = 1.12; // множитель за тик
const minDistanceFactor = 0.02;
const maxDistanceFactor = 3;

let parsedSvgText = null; // хранит текст SVG (чтобы не загружать второй раз)



/* ---------------- initThree ---------------- */
function initThree() {
  scene = new THREE.Scene();
  scene.background = null;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.value.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    45,
    container.value.clientWidth / container.value.clientHeight,
    1,
    10000
  );

  const ambient = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.5);
  dir.position.set(0, 1000, 1000);
  scene.add(dir);

  mapGroup = new THREE.Group();
  // небольшой фиксированный поворот группы — можно оставить или убрать
  mapGroup.rotation.x = -0.9;
  scene.add(mapGroup);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.enableRotate = false;
  controls.enablePan = false;
  // отключаем встроенный зум — управляем зумом сами
  controls.enableZoom = false;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;

  window.addEventListener("resize", onResize);
}

/* ---------------- resize ---------------- */
function onResize() {
  if (!container.value || !renderer) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
}

/* ---------------- loadMap (один fetch, парсинг) ---------------- */
async function loadMap() {
  try {
    const res = await fetch("/map4.svg");
    const svgText = await res.text();
    parsedSvgText = svgText;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

    // Соберём set id всех групп <g id="...">, чтобы потом НЕ рендерить их геометрию
    const groupsWithId = svgDoc.querySelectorAll("g[id]");
    const hiddenGroupIds = new Set();
    groupsWithId.forEach(g => {
      if (g.id) hiddenGroupIds.add(g.id);
    });

    const loader = new SVGLoader();
    const data = loader.parse(svgText);

    const shapesGroup = new THREE.Group();

    data.paths.forEach((path) => {
      // Если путь связан с DOM-узлом внутри <g id="..."> — пропускаем (скрываем ориентиры)
      let skip = false;
      const node = path.userData && path.userData.node;
      if (node) {
        let cur = node;
        while (cur && cur.nodeName && cur.nodeName.toLowerCase() !== 'svg') {
          if (cur.id && hiddenGroupIds.has(cur.id)) {
            skip = true;
            break;
          }
          cur = cur.parentElement;
        }
      }
      if (skip) return;

      let fillColor = path.userData.style?.fill;
      if (!fillColor || fillColor === "none") fillColor = "#363636";

      const fillMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(fillColor),
        side: THREE.DoubleSide,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2,
      });

      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geom = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geom, fillMat);
        mesh.renderOrder = 0;
        shapesGroup.add(mesh);
      });

      let strokeColor = path.userData.style?.stroke;
      if (strokeColor && strokeColor !== "none") {
        const strokeMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(strokeColor),
          linewidth: path.userData.style?.strokeWidth
            ? parseFloat(path.userData.style.strokeWidth)
            : 1,
        });

        const subPath = path.subPaths;
        subPath.forEach((sub) => {
          const geom = SVGLoader.pointsToStroke(sub.getPoints(), path.userData.style);
          if (geom) {
            const line = new THREE.Line(geom, strokeMat);
            line.renderOrder = 1;
            shapesGroup.add(line);
          }
        });
      }
    });

    mapGroup.add(shapesGroup);

    // center & scale
    const boxOrig = new THREE.Box3().setFromObject(mapGroup);
    const sizeOrig = new THREE.Vector3();
    boxOrig.getSize(sizeOrig);
    const maxDim = Math.max(sizeOrig.x, sizeOrig.y);

    const targetSize = 700;
    const scaleValue = maxDim > 0 ? targetSize / maxDim : 1;

    mapGroup.scale.set(scaleValue, -scaleValue, scaleValue);

    const box = new THREE.Box3().setFromObject(mapGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);
    mapGroup.position.sub(center);

    mapBox = new THREE.Box3().setFromObject(mapGroup);
  } catch (err) {
    console.error("Ошибка загрузки карты:", err);
    throw err;
  }
}

/* ---------------- loadCityMarkers (парсим SVG один раз через parsedSvgText) ---------------- */
async function loadCityMarkers() {
  if (!parsedSvgText) return;

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(parsedSvgText, "image/svg+xml");

  const groups = svgDoc.querySelectorAll("g[id]");

  // временный SVG для getBBox
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSvg.style.position = "absolute";
  tempSvg.style.left = "-9999px";
  tempSvg.style.width = "1px";
  tempSvg.style.height = "1px";
  tempSvg.style.overflow = "hidden";
  document.body.appendChild(tempSvg);

  groups.forEach(g => {
    const id = g.getAttribute("id");
    if (!id) return;

    let x = 0, y = 0;
    let found = false;

    const clone = g.cloneNode(true);
    while (tempSvg.firstChild) tempSvg.removeChild(tempSvg.firstChild);
    tempSvg.appendChild(clone);

    try {
      const bbox = clone.getBBox();
      x = bbox.x + bbox.width / 2;
      y = bbox.y + bbox.height / 2;
      found = true;
    } catch (e) {
      const firstPath = clone.querySelector("path");
      if (firstPath) {
        try {
          const pb = firstPath.getBBox();
          x = pb.x + pb.width / 2;
          y = pb.y + pb.height / 2;
          found = true;
        } catch (err2) {
          console.warn("Cannot compute bbox for city", id, err2);
          found = false;
        }
      } else {
        found = false;
      }
    }

    if (!found) {
      console.warn("Не удалось определить координаты для города:", id);
      return;
    }

    const baseRadius = 1;
    const geo = new THREE.CircleGeometry(baseRadius, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff3b3b04,
      emissive: 0xff3b3b04,
      roughness: 0.6,
      metalness: 0.1,
      transparent: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.cityId = id;

    // порог видимости (потом можно сделать индивидуальным)
    mesh.userData.visibilityDistance = baseDistance * 0.6 || 800;

    mesh.position.set(x, y, 6);
    mesh.renderOrder = 200;
    mesh.material.depthTest = true;

    mapGroup.add(mesh);
    cityMeshes[id] = mesh;
  });

  document.body.removeChild(tempSvg);
}

/* ---------------- pointer listeners ---------------- */
function addPointerListeners() {
  if (!renderer || !renderer.domElement) return;
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
}

function removePointerListeners() {
  if (!renderer || !renderer.domElement) return;
  renderer.domElement.removeEventListener("pointermove", onPointerMove);
  renderer.domElement.removeEventListener("pointerdown", onPointerDown);
}

function getPointerNDC(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  return { x, y };
}

function onPointerMove(event) {
  const ndc = getPointerNDC(event);
  pointer.set(ndc.x, ndc.y);
  raycaster.setFromCamera(pointer, camera);

  const markerList = Object.values(cityMeshes);
  const intersects = raycaster.intersectObjects(markerList, true);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    if (hoveredMesh !== hit) {
      restoreHovered();
      hoveredMesh = hit;
      if (hoverTween) hoverTween.kill();
      // hoverTween = gsap.to(hoveredMesh.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.18, ease: "power1.out" });
      renderer.domElement.style.cursor = "pointer";
    }
  } else {
    restoreHovered();
    renderer.domElement.style.cursor = "default";
  }
}

function restoreHovered() {
  if (hoveredMesh) {
    if (hoverTween) hoverTween.kill();
    // gsap.to(hoveredMesh.scale, { x: 1, y: 1, z: 1, duration: 0.18, ease: "power1.out" });
    hoveredMesh = null;
    hoverTween = null;
  }
}

function onPointerDown(event) {
  const ndc = getPointerNDC(event);
  pointer.set(ndc.x, ndc.y);
  raycaster.setFromCamera(pointer, camera);

  const markerList = Object.values(cityMeshes);
  const intersects = raycaster.intersectObjects(markerList, true);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const id = hit.userData.cityId;
    if (id) {
      focusCity(id);
    }
  }
}

/* ---------------- camera helpers: фиксированное направление (учитывает текущий tiltAngleDeg) ---------------- */
// возвращает нормализованный вектор направления камеры в мировых координатах
function worldCameraDirection() {
  const tiltRad = getTiltRad();
  const localDir = new THREE.Vector3(
    Math.sin(azimuth) * Math.cos(tiltRad),
    Math.sin(tiltRad),
    Math.cos(azimuth) * Math.cos(tiltRad)
  ).normalize();

  const q = mapGroup.getWorldQuaternion(new THREE.Quaternion());
  return localDir.applyQuaternion(q).normalize();
}

// позиция камеры = target + dir * distance (dir — вычисляется из текущего tiltAngleDeg)
function cameraPosForTarget(targetWorld, distance) {
  const dir = worldCameraDirection();
  return new THREE.Vector3().copy(targetWorld).add(dir.clone().multiplyScalar(distance));
}

// move pos along map normal to ensure it's at least minDist above
function ensureAboveMapPlane(pos, mapGrp, bbox, minDist) {
  const mapNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(mapGrp.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const center = new THREE.Vector3(); bbox.getCenter(center);
  const vecFromCenter = new THREE.Vector3().subVectors(pos, center);
  const signedDist = vecFromCenter.dot(mapNormal);
  if (signedDist < minDist) {
    const delta = minDist - signedDist;
    return pos.clone().add(mapNormal.clone().multiplyScalar(delta));
  }
  return pos;
}

/* ---------------- fitCameraToMap ---------------- */
function fitCameraToMap() {
  if (!mapBox) mapBox = new THREE.Box3().setFromObject(mapGroup);
  const size = new THREE.Vector3(); mapBox.getSize(size);
  const center = new THREE.Vector3(); mapBox.getCenter(center);

  const maxDim = Math.max(size.x, size.y);

  baseDistance = Math.max(maxDim * 1.2, 1400);
  currentDistance.value = 1;

  const camPos = cameraPosForTarget(center, baseDistance * currentDistance.value);
  const safePos = ensureAboveMapPlane(camPos, mapGroup, mapBox, Math.max(size.y * 0.02, 20));
  camera.position.copy(safePos);
  camera.lookAt(center);

  controls.target.copy(center);
  controls.update();
}

/* ---------------- wheel zoom (вдоль фиксированного направления) ---------------- */
function addWheelListener() {
  if (!renderer || !renderer.domElement) return;
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
}
function removeWheelListener() {
  if (!renderer || !renderer.domElement) return;
  renderer.domElement.removeEventListener("wheel", onWheel);
}
function onWheel(e) {
  e.preventDefault();
  const dir = e.deltaY > 0 ? 1 : -1;
  const factor = dir > 0 ? wheelZoomFactor : 1 / wheelZoomFactor;
  const newFactor = THREE.MathUtils.clamp(currentDistance.value * factor, minDistanceFactor, maxDistanceFactor);
  animateDistanceTo(newFactor, 0.45);
}

function animateDistanceTo(newFactor, duration = 0.45) {
  const target = controls.target.clone();
  const startPos = camera.position.clone();
  const endPos = cameraPosForTarget(target, baseDistance * newFactor);
  const safeEnd = ensureAboveMapPlane(endPos, mapGroup, mapBox, Math.max(mapBox.getSize(new THREE.Vector3()).y * 0.02, 20));

  const wasEnabled = controls.enabled;
  controls.enabled = false;

  const t = gsap.to({ t: 0 }, {
    t: 1,
    duration,
    ease: "power2.inOut",
    onUpdate(obj) {
      const alpha = obj.t;
      camera.position.lerpVectors(startPos, safeEnd, alpha);
      camera.lookAt(target);
      controls.update();
    },
    onComplete() {
      currentDistance.value = newFactor;
      controls.enabled = wasEnabled;
    }
  });
  animationTweens.push(t);
}

/* ---------------- show/hide sprites ---------------- */
function hideAllCitySprites(exceptId = null) {
  Object.keys(spriteByCity).forEach(id => {
    if (id === exceptId) return;
    const sp = spriteByCity[id];
    if (!sp) return;
    gsap.to(sp.material, { opacity: 0, duration: 0.25, onComplete: () => { sp.visible = false; } });
  });
}

function computeSpriteScale(cfg) {
  if (!mapBox) return 80; // запасное значение
  const mapSize = mapBox.getSize(new THREE.Vector3());
  const mapWidth = mapSize.x;
  if (typeof cfg.scale === "string" && cfg.scale.startsWith("rel:")) {
    const frac = parseFloat(cfg.scale.split(":")[1]);
    return Math.max(5, mapWidth * frac); // минимум 20 world units
  }
  if (typeof cfg.scale === "number") return cfg.scale;
  // дефолт: 8% ширины карты
  return Math.max(20, mapWidth * 0.08);
}

function showSpriteForCity(cityId) {
  hideAllCitySprites(cityId);

  const cfg = cityConfigs[cityId]; // использует конфиг
  if (!cfg || !cfg.url) return;

  // если уже загружен — просто показываем и применяем позицию/величину
  if (spriteByCity[cityId]) {
    const sp = spriteByCity[cityId];
    sp.visible = true;
    // обновляем параметры на всякий случай
    const size = computeSpriteScale(cfg);
    // учитываем соотношение сторон текстуры, если оно доступно
    if (sp.material.map && sp.material.map.image) {
      const im = sp.material.map.image;
      sp.scale.set(size, size * (im.height / im.width), 1);
    } else {
      sp.scale.set(size, size, 1);
    }
    sp.position.set(
      (cfg.offset?.x || 0),
      (cfg.offset?.y || 0),
      (cfg.offset?.z ?? 18)
    );
    // anchor
    if (cfg.anchor) sp.center.set(cfg.anchor.x ?? 0.5, cfg.anchor.y ?? 0.5);
    // rotation (SpriteMaterial rotation in radians)
    sp.material.rotation = THREE.MathUtils.degToRad(cfg.rotationDeg || 0);

    gsap.killTweensOf(sp.material);
    sp.material.opacity = 0;
    gsap.to(sp.material, { opacity: 1, duration: 0.35 });
    return;
  }

  // иначе загружаем текстуру и создаём спрайт
  texLoader.load(
    cfg.url,
    (tex) => {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);

      const size = computeSpriteScale(cfg);
      const im = tex.image;
      if (im && im.width && im.height) {
        sprite.scale.set(size, size * (im.height / im.width), 1);
      } else {
        sprite.scale.set(size, size, 1);
      }

      // позиция относительно маркера
      const marker = cityMeshes[cityId];
      if (!marker) return;
      const off = cfg.offset || { x: 0, y: 0, z: 18 };
      sprite.position.set(off.x || 0, off.y || 0, off.z ?? 18);

      // anchor (центр)
      if (cfg.anchor) sprite.center.set(cfg.anchor.x ?? 0.5, cfg.anchor.y ?? 0.5);

      // rotation (в градусах -> радианы)
      sprite.material.rotation = THREE.MathUtils.degToRad(cfg.rotationDeg || 0);

      marker.add(sprite);
      sprite.visible = true;
      spriteByCity[cityId] = sprite;

      gsap.to(sprite.material, { opacity: 1, duration: 0.35 });
    },
    undefined,
    (err) => {
      console.warn("Ошибка загрузки спрайта:", cfg.url, err);
    }
  );
}

/* ---------------- focusCity (с предварительным отдалением + увеличением угла, затем подлёт) ---------------- */
function focusCity(cityId, distanceFactor = 0.02) { // дефолт уменьшен — подъезжаем ближе
  const marker = cityMeshes[cityId];
  if (!marker) {
    console.error("City not found:", cityId);
    return;
  }

  hideAllCitySprites(null);

  // отменяем предыдущие твины
  animationTweens.forEach(t => t && t.kill && t.kill());
  animationTweens = [];

  const targetWorld = new THREE.Vector3();
  marker.getWorldPosition(targetWorld);

  const clampedFactor = THREE.MathUtils.clamp(distanceFactor, minDistanceFactor, maxDistanceFactor);

  // параметры анимации: сначала небольшой "отдал" (zoomOutFactor), и увеличение наклона,
  // затем плавный въезд к целевой дистанции и возврат наклона.
  const zoomOutMultiplier = 1.55;
  const tiltDeltaDeg = 2; // насколько делаем угол "резче" на время перелёта
  const origTilt = tiltAngleDeg;

  const prevControlsEnabled = controls.enabled;
  controls.enabled = false;

  const lookTarget = targetWorld.clone();

  // объекты для анимации значений
  const zoomObj = { zf: currentDistance.value || 1 };
  const tiltObj = { tilt: origTilt };

  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onComplete: () => {
      // по завершении — фиксируем значения и включаем controls
      currentDistance.value = clampedFactor;
      tiltAngleDeg = origTilt;
      controls.enabled = prevControlsEnabled;
      showSpriteForCity(cityId);
    }
  });

  // Первая фаза: отдаляемся и увеличиваем наклон (одновременно)
  timeline.to(zoomObj, {
    zf: Math.max(clampedFactor * zoomOutMultiplier, currentDistance.value * zoomOutMultiplier),
    duration: 0.55,
    onUpdate: () => {
      const pos = cameraPosForTarget(targetWorld, baseDistance * zoomObj.zf);
      const safe = ensureAboveMapPlane(pos, mapGroup, mapBox, Math.max(mapBox.getSize(new THREE.Vector3()).y * 0.02, 20));
      camera.position.copy(safe);
      camera.lookAt(lookTarget);
      controls.target.lerp(lookTarget, 0.06);
      controls.update();
    }
  }, 0);

  timeline.to(tiltObj, {
    tilt: origTilt + tiltDeltaDeg,
    duration: 0.55,
    onUpdate: () => {
      tiltAngleDeg = tiltObj.tilt;
    }
  }, 0);

  // Вторая фаза: плавный подлёт ближе и возврат наклона — чуть дольше для кинематографичности
  timeline.to(zoomObj, {
    zf: clampedFactor,
    duration: 0.9,
    onUpdate: () => {
      const pos = cameraPosForTarget(targetWorld, baseDistance * zoomObj.zf);
      const safe = ensureAboveMapPlane(pos, mapGroup, mapBox, Math.max(mapBox.getSize(new THREE.Vector3()).y * 0.02, 20));
      camera.position.copy(safe);
      camera.lookAt(lookTarget);
      controls.target.lerp(lookTarget, 0.12);
      controls.update();
    }
  }, "+=0.02");

  timeline.to(tiltObj, {
    tilt: origTilt,
    duration: 0.9,
    onUpdate: () => {
      tiltAngleDeg = tiltObj.tilt;
    }
  }, "<"); // параллельно с подлётом

  animationTweens.push(timeline);

  // немного эффекта на маркер (пульс)
  const origScale = marker.scale.clone();
  const tPulse = gsap.fromTo(marker.scale,
    { x: origScale.x, y: origScale.y, z: origScale.z },
    { x: origScale.x * 2.0, y: origScale.y * 2.0, z: origScale.z * 2.0, duration: 0.45, yoyo: true, repeat: 1, ease: "power1.inOut" }
  );
  animationTweens.push(tPulse);

  // подсветка материала если есть emissive
  const m = marker.material;
  if (m && m.emissive !== undefined) {
    const origEm = m.emissive.clone();
    const tEm = gsap.to(m.emissive, {
      r: 0.9, g: 0.6, b: 0.1,
      duration: 0.22,
      yoyo: true,
      repeat: 2,
      ease: "sine.inOut",
      onComplete: () => m.emissive.copy(origEm)
    });
    animationTweens.push(tEm);
  }
}

/* ---------------- visibility logic: показываем/скрываем маркеры по дистанции ---------------- */
function updateMarkerVisibility() {
  const camPos = camera.position;
  Object.entries(cityMeshes).forEach(([id, mesh]) => {
    if (!mesh) return;
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    const dist = camPos.distanceTo(worldPos);

    const visDist = mesh.userData.visibilityDistance || (baseDistance * 0.6);
    mesh.visible = dist < visDist;

    const spriteShowDist = visDist * 0.45;
    const sp = spriteByCity[id];
    if (sp) sp.visible = dist < spriteShowDist;
  });
}

/* ---------------- animate loop ---------------- */
function animate() {
  requestAnimationFrame(animate);
  updateMarkerVisibility();
  controls.update();
  renderer.render(scene, camera);
}

function createMapBackground(textureUrl, {
  scaleFactor = 1.1,
  offset = { x: 10, y: 80, z: -0.5 },
  extraRotation = { x: 0, y: 0, z: 0 }
} = {}) {
  const loader = new THREE.TextureLoader();

  loader.load(textureUrl, (texture) => {
    texture.flipY = false; // исправляем "вверх ногами"

    if (!mapBox) mapBox = new THREE.Box3().setFromObject(mapGroup);
    const size = new THREE.Vector3();
    mapBox.getSize(size);
    const center = new THREE.Vector3();
    mapBox.getCenter(center);

    const geometry = new THREE.PlaneGeometry(size.x * scaleFactor, size.y * scaleFactor);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const bgPlane = new THREE.Mesh(geometry, material);

    // позиция = центр карты + смещение
    bgPlane.position.copy(center);
    bgPlane.position.x += offset.x;
    bgPlane.position.y += offset.y;
    bgPlane.position.z += offset.z;

    // копируем вращение карты
    bgPlane.rotation.copy(mapGroup.rotation);

    // добавляем ручные «крутилки»
    bgPlane.rotation.x += extraRotation.x;
    bgPlane.rotation.y += extraRotation.y;
    bgPlane.rotation.z += extraRotation.z;

    mapGroup.add(bgPlane);

    console.log("Фон добавлен:", bgPlane);
  });
}



onMounted(async () => {
  initThree();
  await loadMap();           // загрузим и распарсим SVG один раз
  await loadCityMarkers();   // вытащим группы и создадим маркеры
  fitCameraToMap();
  addPointerListeners();
  // addWheelListener();
  animate();
  createMapBackground("../src/assets/img/EarthNight.jpg", {
    scaleFactor: 18,
    offset: { x: -1200, y: 5205, z: -5 },
    extraRotation: { x: 0.9, y: 0, z: 0 } // повернуть чуть вокруг Z
  });
});

onBeforeUnmount(() => {
  removePointerListeners();
  removeWheelListener();
  window.removeEventListener("resize", onResize);
  if (controls) controls.dispose();
  if (renderer) {
    renderer.forceContextLoss();
    renderer.domElement = null;
    renderer = null;
  }
  animationTweens.forEach(t => t.kill && t.kill());
  if (hoverTween) hoverTween.kill && hoverTween.kill();
});
</script>



<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  background: transparent;
  position: relative;
  overflow: hidden;
}

.city-buttons {
  position: absolute;
  right: 18px;
  top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 30;
}

.city-buttons button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  transition: transform .12s ease, box-shadow .12s ease;
  font-weight: 500;
}

.city-buttons button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}
</style>
