<template>
  <div ref="container" class="map-container"></div>

  <div class="city-buttons">
    <button
      v-for="city in cities"
      :key="city.id"
      @click="focusCity(city.id)"
    >{{ city.name }}</button>
  </div>
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
  Rostov: "/mod.png",
};

let renderer, scene, camera, controls;
let mapGroup;
let cityMeshes = {};
let spriteByCity = {};
let mapBox = null;
let cameraMinDist = 20; // min distance from map plane
let animationTweens = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredMesh = null;
let hoverTween = null;
const texLoader = new THREE.TextureLoader();

// === GLOBAL CONFIG: angle + zoom behaviour ===
// tilt angle (degrees) from horizontal plane (0 = horizontal, positive = up)
const tiltAngleDeg = 25;
const tiltAngle = THREE.MathUtils.degToRad(tiltAngleDeg);

// baseDistance is computed in fitCameraToMap according to map size; currentDistance used for zoom
let baseDistance = 1000;
let currentDistance = ref(1); // multiplier relative to baseDistance (1 = baseDistance)

// wheel zoom sensitivity
const wheelZoomFactor = 1.12; // multiply/divide by this per wheel tick
const minDistanceFactor = 0.15;
const maxDistanceFactor = 3;

onMounted(async () => {
  initThree();
  await loadMap();
  await loadCityMarkers();
  fitCameraToMap();
  addPointerListeners();
  addWheelListener();
  animate();
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

/* ---------------- initThree ---------------- */
function initThree() {
  scene = new THREE.Scene();
  scene.background = null;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.sortObjects = true;
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
  // keep mapGroup.rotation.x as initial tilt for the mesh itself if you like.
  // We will keep camera tilt independent (camera position computed by tiltAngle).
  mapGroup.rotation.x = -0.9;
  scene.add(mapGroup);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;

  window.addEventListener("resize", onResize);
}

function onResize() {
  if (!container.value) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
}

/* ---------------- loadMap ---------------- */
function loadMap() {
  return new Promise((resolve, reject) => {
    const loader = new SVGLoader();
    loader.load(
      "/map4.svg",
      (data) => {
        const shapesGroup = new THREE.Group();

        data.paths.forEach((path) => {
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
        const s = new THREE.Vector3(); mapBox.getSize(s);
        cameraMinDist = Math.max(20, s.y * 0.03);

        resolve();
      },
      undefined,
      (err) => {
        console.error("SVG load error:", err);
        reject(err);
      }
    );
  });
}

/* ---------------- loadCityMarkers ---------------- */
async function loadCityMarkers() {
  const res = await fetch("/map4.svg");
  const svgText = await res.text();
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

  const groups = svgDoc.querySelectorAll("g[id]");

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

    const baseRadius = 6;
    const geo = new THREE.CircleGeometry(baseRadius, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff3b3b,
      emissive: 0x000000,
      roughness: 0.6,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.cityId = id;
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
      hoverTween = gsap.to(hoveredMesh.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.18, ease: "power1.out" });
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
    gsap.to(hoveredMesh.scale, { x: 1, y: 1, z: 1, duration: 0.18, ease: "power1.out" });
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

/* ---------------- fitCameraToMap ---------------- */
function fitCameraToMap() {
  if (!mapBox) mapBox = new THREE.Box3().setFromObject(mapGroup);
  const size = new THREE.Vector3(); mapBox.getSize(size);
  const center = new THREE.Vector3(); mapBox.getCenter(center);

  const maxDim = Math.max(size.x, size.y);

  // set baseDistance depending on map size
  baseDistance = Math.max(maxDim * 1.2, 400);
  currentDistance.value = 1;

  // initial camera position using tiltAngle and baseDistance
  const camPos = cameraPosForTarget(center, baseDistance * currentDistance.value);

  // ensure above plane
  const safePos = ensureAboveMapPlane(camPos, mapGroup, mapBox, Math.max(size.y * 0.02, 20));
  camera.position.copy(safePos);
  camera.lookAt(center);

  controls.target.copy(center);
  controls.update();

  cameraMinDist = Math.max(20, size.y * 0.03);
}

/* ---------------- helpers: camera math ---------------- */
function cameraPosForTarget(targetWorld, distance) {
  // compute offset based on tiltAngle (we assume camera is offset in +Z direction from target)
  const dy = Math.sin(tiltAngle) * distance;
  const dz = Math.cos(tiltAngle) * distance;
  // optionally add a small X offset to give diagonal view, here zero
  const dx = 0;
  return new THREE.Vector3(targetWorld.x + dx, targetWorld.y + dy, targetWorld.z + dz);
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

/* ---------------- wheel zoom ---------------- */
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
  // zoom by factor
  const factor = dir > 0 ? wheelZoomFactor : 1 / wheelZoomFactor;
  const newFactor = THREE.MathUtils.clamp(currentDistance.value * factor, minDistanceFactor, maxDistanceFactor);
  // animate to new distance keeping controls.target as center
  animateDistanceTo(newFactor, 0.28);
}

function animateDistanceTo(newFactor, duration = 0.5) {
  // compute new camera pos relative to current controls.target
  const target = controls.target.clone();
  const startFactor = currentDistance.value;
  const startPos = camera.position.clone();
  const endPos = cameraPosForTarget(target, baseDistance * newFactor);
  const safeEnd = ensureAboveMapPlane(endPos, mapGroup, mapBox, Math.max(mapBox.getSize(new THREE.Vector3()).y * 0.02, 20));

  // disable controls during animation
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
    gsap.to(sp.material, { opacity: 0, duration: 0.25, onComplete: () => { sp.visible = false; }});
  });
}

function showSpriteForCity(cityId) {
  hideAllCitySprites(cityId);
  if (spriteByCity[cityId]) {
    const sp = spriteByCity[cityId];
    sp.visible = true;
    gsap.killTweensOf(sp.material);
    sp.material.opacity = 0;
    gsap.to(sp.material, { opacity: 1, duration: 0.35 });
    return;
  }

  const url = cityImageMap[cityId];
  if (!url) return;
  texLoader.load(
    url,
    (tex) => {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);

      const baseSize = Math.max(60, (mapBox.getSize(new THREE.Vector3()).x * 0.08));
      sprite.scale.set(baseSize, baseSize * (tex.image.height / tex.image.width), 1);

      const marker = cityMeshes[cityId];
      if (!marker) return;

      sprite.position.set(0, 0, 20);
      marker.add(sprite);

      sprite.visible = true;
      spriteByCity[cityId] = sprite;
      gsap.to(sprite.material, { opacity: 1, duration: 0.35 });
    },
    undefined,
    (err) => {
      console.warn("Ошибка загрузки спрайта:", url, err);
    }
  );
}


function focusCity(cityId, distanceFactor = 0.35) {
  const marker = cityMeshes[cityId];
  if (!marker) {
    console.error("City not found:", cityId);
    return;
  }

  hideAllCitySprites(null);

  // cancel existing tweens
  animationTweens.forEach(t => t && t.kill && t.kill());
  animationTweens = [];

  const targetWorld = new THREE.Vector3();
  marker.getWorldPosition(targetWorld);

  // compute desired distance: based on baseDistance and provided factor
  // clamp factor to allowed range
  const clampedFactor = THREE.MathUtils.clamp(distanceFactor, minDistanceFactor, maxDistanceFactor);
  const desiredDist = baseDistance * clampedFactor;

  // compute camera position using polar tilt
  const desiredCamPos = cameraPosForTarget(targetWorld, desiredDist);
  const safeCamPos = ensureAboveMapPlane(desiredCamPos, mapGroup, mapBox, Math.max(mapBox.getSize(new THREE.Vector3()).y * 0.02, 20));

  // animate camera to safeCamPos while looking slightly ahead to preserve "table" feel
  // compute a lookAt target a bit lower than the marker to keep angle
  const lookTarget = targetWorld.clone();

  // disable controls during animation
  const prevControlsEnabled = controls.enabled;
  controls.enabled = false;

  const t1 = gsap.to(camera.position, {
    x: safeCamPos.x,
    y: safeCamPos.y,
    z: safeCamPos.z,
    duration: 0.9,
    ease: "power2.inOut",
    onUpdate: () => camera.lookAt(lookTarget),
    onComplete: () => {
      controls.enabled = prevControlsEnabled;
      currentDistance.value = clampedFactor;
      showSpriteForCity(cityId);
    }
  });

  const t2 = gsap.to(controls.target, {
    x: lookTarget.x,
    y: lookTarget.y,
    z: lookTarget.z,
    duration: 0.9,
    ease: "power2.inOut",
    onUpdate: () => controls.update()
  });

  animationTweens.push(t1, t2);

  // marker pulse
  const origScale = marker.scale.clone();
  const t3 = gsap.fromTo(marker.scale,
    { x: origScale.x, y: origScale.y, z: origScale.z },
    { x: origScale.x * 1.8, y: origScale.y * 1.8, z: origScale.z * 1.8, duration: 0.45, yoyo: true, repeat: 2, ease: "power1.inOut" }
  );
  animationTweens.push(t3);

  // emissive highlight
  const m = marker.material;
  if (m && m.emissive !== undefined) {
    const origEm = m.emissive.clone();
    const t4 = gsap.to(m.emissive, {
      r: 0.9, g: 0.6, b: 0.1,
      duration: 0.22,
      yoyo: true,
      repeat: 3,
      ease: "sine.inOut",
      onComplete: () => m.emissive.copy(origEm)
    });
    animationTweens.push(t4);
  }
}

/* ---------------- animate loop ---------------- */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
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
.city-buttons button{
  background: #1976d2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
  transition: transform .12s ease, box-shadow .12s ease;
  font-weight: 500;
}
.city-buttons button:hover{
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.16);
}
</style>
