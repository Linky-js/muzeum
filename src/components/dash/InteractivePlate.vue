<script setup>
import { ref, reactive } from "vue";

const plateArea = ref(null);
const canvasRef = ref(null);

const slots = reactive([
  { id: 1, top: "72%", left: "64%", z: 2, width: 387, height: 367, product: null },
]);

const products = {
  salad: { name: "Паста", image: "/products/pasta.jpg" },
};

// Добавление продукта в слот
function addProduct(slotId, product) {
  const slot = slots.find((s) => s.id === slotId);
  if (slot) slot.product = product;
}

// Загрузка изображения как объекта
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = src;
  });
}

// Сохранение через canvas (учитывая маску)
async function saveAsImage() {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  const base = await loadImage("/products/tarelka.jpg");
  const mask = await loadImage("/products/mask.png");

  canvas.width = base.width;
  canvas.height = base.height;

  ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext("2d");
  maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);

  const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
  const maskPixels = maskData.data;

  for (const slot of slots) {
    if (!slot.product) continue;

    const productImg = await loadImage(slot.product.image);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext("2d");

    const x = (parseFloat(slot.left) / 100) * canvas.width - slot.width / 2;
    const y = (parseFloat(slot.top) / 100) * canvas.height - slot.height / 2;

    tctx.drawImage(productImg, x, y, slot.width, slot.height);

    const prodData = tctx.getImageData(0, 0, canvas.width, canvas.height);
    const prodPixels = prodData.data;

    for (let i = 0; i < prodPixels.length; i += 4) {
      const alpha = maskPixels[i] / 255;
      prodPixels[i + 3] = prodPixels[i + 3] * alpha;
    }

    tctx.putImageData(prodData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  const link = document.createElement("a");
  link.download = "plate.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
</script>
<template>
  <div class="plate-wrapper" ref="plateArea">
    <img src="/products/tarelka.jpg" class="layer plate-base" />

    <div class="mask-layer">
      <div
        v-for="slot in slots"
        :key="slot.id"
        class="slot"
        :style="{ top: slot.top, left: slot.left, zIndex: slot.z }"
      >
        <img
          v-if="slot.product"
          :src="slot.product.image"
          class="product"
        />
      </div>
    </div>

    <!-- Панель управления -->
    <div class="controls">
      <button class="btn" @click="addProduct(1, products.salad)">Паста в слот 1</button>
      <button class="btn" @click="saveAsImage">💾 Сохранить</button>
    </div>

    <!-- Canvas для сохранения -->
    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>



<style>
.plate-wrapper {
  position: relative;
  width: 1280px;
  height: 720px;
  margin: 40px auto;
}

/* Общие слои */
.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

/* Фон */
.plate-base {
  z-index: 1;
}

/* Маска, применяем только к продуктам */
.mask-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  mask-image: url("/products/mask.png");
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  mask-position: center;
}

/* Слоты */
.slot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 387px;
  height: 367px;
}

/* Продукты */
.product {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* Панель управления */
.controls {
  position: absolute;
  bottom: -60px;
  left: 0;
  display: flex;
  gap: 10px;
}

/* Скрытый Canvas */
.hidden {
  display: none;
}
</style>
