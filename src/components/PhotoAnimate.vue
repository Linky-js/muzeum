<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import img from "@/assets/img/mod.png";

const imageSrc = img;
const currentMode = ref("dust");

const modes = [
  { value: "dust", label: "Пыль (разлет)" },
  { value: "assemble", label: "Сборка картинки" },
];

const canvas = ref(null);
let ctx;

const cols = 80;
const rows = 80;
const pixels = [];
let animating = true;

// Для эффекта сборки
let particles = [];
let image = new Image();

onMounted(() => {
  const c = canvas.value;
  ctx = c.getContext("2d");
  resizeCanvas();
  createPixels();
  requestAnimationFrame(drawPixels);
  window.addEventListener("resize", () => {
    resizeCanvas();
    createPixels();
  });

  // Загружаем картинку для эффекта "сборка"
  image.src = imageSrc;
  image.onload = () => {
    initAssembleEffect();
  };
});

function resizeCanvas() {
  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
}

function createPixels() {
  pixels.length = 0;
  const w = canvas.value.width / cols;
  const h = canvas.value.height / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      pixels.push({
        baseX: x * w,
        baseY: y * h,
        x: x * w,
        y: y * h,
        w,
        h,
        dx: 0,
        dy: 0,
        opacity: 1,
        offsetX: Math.random() * 20 - 10,
        offsetY: Math.random() * 20 - 10,
        speed: 0.5 + Math.random(),
        phase: Math.random() * Math.PI * 5,
      });
    }
  }
}

function drawPixels(time) {
  if (currentMode.value === "dust") {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    pixels.forEach((p) => {
      if (p.opacity <= 0) return;

      if (animating) {
        p.dx = Math.sin(time * 0.001 * p.speed + p.phase) * 4;
        p.dy = Math.cos(time * 0.001 * p.speed + p.phase) * 4;
      }

      ctx.fillStyle = `rgba(34,34,34,${p.opacity})`;
      ctx.fillRect(p.baseX + p.dx, p.baseY + p.dy, p.w, p.h);
    });
  }

  if (currentMode.value === "assemble") {
    drawParticles();
  }

  requestAnimationFrame(drawPixels);
}

function onImageClick(e) {
  if (currentMode.value === "dust") {
    dustEffect(e.offsetX, e.offsetY);
  }
  if (currentMode.value === "assemble") {
    startAssemble();
  }
}

/* -----------------
   Режим 1: "Пыль"
   ----------------- */
function dustEffect(cx, cy) {
  animating = false;

  pixels.forEach((p) => {
    const dx = p.baseX + p.w / 2 - cx;
    const dy = p.baseY + p.h / 2 - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    gsap.to(p, {
      dx: dx * 1.5,
      dy: dy * 1.5,
      opacity: 0,
      duration: 1.5,
      delay: dist / 1200,
      ease: "power3.out",
    });
  });
}

/* -----------------
   Режим 2: "Сборка картинки"
   ----------------- */
class Particle {
  constructor(x, y, color) {
    this.originalX = x;
    this.originalY = y;
    this.x = Math.random() * canvas.value.width;
    this.y = Math.random() * canvas.value.height;
    this.color = color;
    this.speed = 0.05 + Math.random() * 0.05;
  }

  move() {
    const dx = this.originalX - this.x;
    const dy = this.originalY - this.y;
    this.x += dx * this.speed;
    this.y += dy * this.speed;
  }
}

function initAssembleEffect() {
  const offscreen = document.createElement("canvas");
  const offCtx = offscreen.getContext("2d");
  offscreen.width = image.width;
  offscreen.height = image.height;

  offCtx.drawImage(image, 0, 0, image.width, image.height);
  const imageData = offCtx.getImageData(0, 0, image.width, image.height);

  particles = [];
  for (let y = 0; y < image.height; y += 3) {
    for (let x = 0; x < image.width; x += 3) {
      const index = (y * 4) * image.width + x * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];

      if (a > 128) {
        const color = `rgba(${r},${g},${b},${a / 255})`;
        particles.push(new Particle(x, y, color));
      }
    }
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  particles.forEach((p) => {
    p.move();
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 2, 2);
  });
}

function startAssemble() {
  initAssembleEffect();
}
</script>

<template>
  <div class="wrapper">
    <img :src="imageSrc" class="main-image" :class="{ hidden: currentMode == 'assemble' }" @click="onImageClick" />
    <canvas ref="canvas" class="overlay"></canvas>

    <div class="city-buttons">
      <button
        v-for="mode in modes"
        :key="mode.value"
        @click="currentMode = mode.value"
      >
        {{ mode.label }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.main-image.hidden {
    opacity: 0;
}
.overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
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
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  font-weight: 500;
}
.city-buttons button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}
</style>