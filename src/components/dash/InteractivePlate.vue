<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import IconInfo from "../icons/IconInfo.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";

const store = useStore();

const baseImgSrc = "/dash/stol/fon.png";

const currentDay = ref(1);
const currentMeal = ref("breakfast");
const openCategory = ref(null);
const canvasRef = ref(null);
const plateArea = ref(null);
const selectedSubcat = ref(null);
const showWeightModal = ref(false);
const activeInfoBtn = ref(null);
const weight = ref("");
const useNumpad = ref(false);
const moreDaysFlag = ref(false)

const days = [
  { id: 1, smallName: "Понедельник" },
  { id: 2, smallName: "Вторник" },
  { id: 3, smallName: "Среда" },
  { id: 4, smallName: "Четверг" },
  { id: 5, smallName: "Пятница" },
  { id: 6, smallName: "Суббота" },
  { id: 7, smallName: "Воскресенье" },
];

const categories = computed(() => store.state.diet.categories || []);
const currentMealState = computed(() =>
  store.getters["diet/getMeal"](currentDay.value, currentMeal.value)
);

const quickWeights = [50, 100, 150, 200, 250];

const getStoredDay = (dayId) => store.state.diet.week.days?.[dayId] || null;

const isMealFilledUI = (dayId, mealId) => {
  const day = getStoredDay(dayId);

  if (!day) return false;
  const meal = day.meals?.[mealId];
  if (!meal) return false;
  return Object.values(meal.plate || {}).some((slot) => slot !== null);
};

const isDayFullyFilled = (dayId) => {
  const day = getStoredDay(dayId);
  if (!day) return false;
  const meals = day.meals || {};
  const req = ["breakfast", "lunch", "dinner", "snack"];
  return req.every((m) =>
    Object.values(meals[m].plate || {}).some((s) => s !== null)
  );
};

const visibleDays = computed(() => {
  const out = [];
  out.push(days[0]);
  for (let i = 2; i <= 7; i++) {
    const prev = i - 1;
    if (isDayFullyFilled(prev)) out.push(days[i - 1]);
    else break;
  }
  return out;
});

function selectMeal(dayId, mealId) {
  if (!visibleDays.value.some((d) => d.id === dayId)) return;
  currentDay.value = dayId;
  currentMeal.value = mealId;
}

watch(
  () => isDayFullyFilled(currentDay.value),
  (val) => {
    if (val) {
      const next = currentDay.value + 1;
      if (next <= 7 && visibleDays.value.some((d) => d.id === next)) {
        currentDay.value = next;
        currentMeal.value = "breakfast";
      }
    }
  }
);

/* --- Вес --- */
function applyQuickWeight(val) {
  weight.value = String(val);
  useNumpad.value = true;
}
function numpadPress(char) {
  if (char === "C") weight.value = "";
  else if (char === "<") weight.value = weight.value.slice(0, -1);
  else weight.value += char;
}
function toggleCategory(catId) {
  openCategory.value = openCategory.value === catId ? null : catId;
}
function onSelectSubcategory(subcatId) {
  console.log("subcatId", subcatId);
  selectedSubcat.value = subcatId;
  weight.value = "";
  useNumpad.value = false;
}

async function confirmWeight() {
  if (!weight.value || Number(weight.value) <= 0) {
    alert("Введите количество грамм!");
    return;
  }
  const res = await store.dispatch("diet/addProduct", {
    dayId: currentDay.value,
    mealId: currentMeal.value,
    subcatId: selectedSubcat.value,
    weight: Number(weight.value),
  });

  if (!res.ok) alert("Нет свободного места для продукта!");
  showWeightModal.value = false;
}

/* --- Slots --- */
function onSlotClick(slotId) {
  if (!currentMealState.value) return;
  activeInfoBtn.value = false;
  if (currentMealState.value.plate[slotId]) {
    store.dispatch("diet/removeProduct", {
      dayId: currentDay.value,
      mealId: currentMeal.value,
      slotId,
    });
  }
}

const slotPositions = {
  1: { top: 40, left: 45.4, width: 350 },
  2: { top: 40, left: 54.2, width: 350 },
  3: { top: 60.4, left: 54.1, width: 335 },
  4: { top: 60.4, left: 45.5, width: 350 },
  5: { top: 65, left: 60.4, width: 344 },
  6: { top: 51.3, left: 39.4, width: 220 },
  8: { top: 55.4, left: 61,width: 280 },
  10: { top: 37.5, left: 40.2, width: 352 },
  11: { top: 65.4, left: 71.4, width: 520 },
  12: { top: 66, left: 32.5, width: 370 },

  16: { top: 48.4, left: 34.5, width: 235 },
  17: { top: 47.5, left: 29, width: 270 },
  18: { top: 46.4, left: 24, width: 236 },
  19: { top: 66.4, left: 25.5, width: 300 },
  


  7: { top: 60.4, left: 55.4 },
  9: { top: 40, left: 44.4 },

  13: { top: 40, left: 44.4 },
  14: { top: 39.3, left: 55 },
  15: { top: 60.4, left: 55.4 },

};

function slotStyle(slotId) {
  const p = slotPositions[slotId];
  return {
    top: p.top + "%",
    left: p.left + "%",
    width: p.width ? p.width + "px" : "auto",
  };
}

/* --- Save Image --- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function saveAsImage() {
  try {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d");

    const base = await loadImage(baseImgSrc);
    canvas.width = base.width;
    canvas.height = base.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

    for (const slotId of [1, 2, 3, 4]) {
      const product = currentMealState.value?.plate?.[slotId];
      if (!product?.image) continue;
      const img = await loadImage(product.image);
      const p = slotPositions[slotId];
      const x = Math.round((p.left / 100) * canvas.width - w / 2);
      const y = Math.round((p.top / 100) * canvas.height - h / 2);
      ctx.drawImage(img, x, y, w, h);
    }

    const link = document.createElement("a");
    link.download = `plate_day${currentDay.value}_meal_${currentMeal.value}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error(err);
    alert("Ошибка сохранения");
  }
}

function goActiveInfoBtn(posId, el) {
  activeInfoBtn.value = posId;
  el?.activateClickOutside?.();
}
function getNameCategory(id) {
  const categoryArray = store.state.diet.categories;
  for (const c of categoryArray) {
    const found = c.subcategories.find((s) => s.id === id);
    if (found) return found.name;
  }
  return null;
}

const modules = [Autoplay, Pagination, Navigation];

const onSwiper = (swiper) => {
  console.log(swiper);
};

const onSlideChange = (swiper) => {
  console.log("slide change", swiper.activeIndex);
};

const closeActiveInfo = () => {
  if (!activeInfoBtn.value) return;
  console.log("sdsdf");

  activeInfoBtn.value = null;
};
onMounted(() => store.commit("diet/INIT_DAY", 1));
</script>

<template>
  <div class="plate-wrapper" ref="plateArea">
    <div class="image">
      <img :src="baseImgSrc" class="layer plate-base" ref="baseImg" />
      <div class="mask-layer">
        <div
          v-for="slotId in [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          ]"
          :key="slotId"
          class="slot"
          :style="slotStyle(slotId)"
        >
          <div
            v-if="currentMealState?.plate[slotId]"
            class="info"
            :class="{
              active:
                activeInfoBtn ===
                currentMealState?.plate[slotId].subcatId +
                  '-' +
                  currentMealState?.plate[slotId].slot,
            }"
            v-click-outside="closeActiveInfo"
          >
            <span
              class="text"
              :class="{
                active:
                  activeInfoBtn ===
                  currentMealState?.plate[slotId].subcatId +
                    '-' +
                    currentMealState?.plate[slotId].slot,
              }"
              >{{ getNameCategory(currentMealState?.plate[slotId].subcatId) }}
              {{ currentMealState?.plate[slotId].weight }}г</span
            >

            <div class="btnInfo">
              <svg
                v-if="
                  activeInfoBtn ===
                  currentMealState?.plate[slotId].subcatId +
                    '-' +
                    currentMealState?.plate[slotId].slot
                "
                @click="onSlotClick(slotId)"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 2V0H15V2H20V4H18V19C18 19.5523 17.5523 20 17 20H3C2.44772 20 2 19.5523 2 19V4H0V2H5ZM4 4V18H16V4H4ZM7 7H9V15H7V7ZM11 7H13V15H11V7Z"
                  fill="black"
                />
              </svg>
              <svg
                v-else
                @click="
                  goActiveInfoBtn(
                    currentMealState?.plate[slotId].subcatId +
                      '-' +
                      currentMealState?.plate[slotId].slot,
                    $el
                  )
                "
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="17"
                viewBox="0 0 6 17"
                fill="none"
              >
                <path
                  d="M3 3C3.8284 3 4.5 2.32843 4.5 1.5C4.5 0.67157 3.8284 0 3 0C2.1716 0 1.5 0.67157 1.5 1.5C1.5 2.32843 2.1716 3 3 3ZM0 7H2V15H0V17H6V15H4V5H0V7Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
          <img
            v-if="currentMealState?.plate[slotId]"
            :src="currentMealState.plate[slotId].image"
            class="product"
            draggable="false"
          />
        </div>
      </div>
    </div>

    <!-- ✅ Updated days UI -->
    <div
      class="controls days-controls"
      :class="{ many_days: visibleDays.length > 1 }"
    >
      <div class="days">
        <h2 class="days__title" v-if="visibleDays.length > 1">Дни недели</h2>
        <div
          v-for="d in visibleDays"
          :key="d.id"
          class="day"
          :class="{ active: currentDay === d.id }"
        >
          <h4 class="day__title">
            {{ d.smallName }}
          </h4>
          <div class="meals">
            <div
              class="meal"
              @click="selectMeal(d.id, 'breakfast')"
              :class="{
                active: currentMeal === 'breakfast' && currentDay === d.id,
              }"
            >
              <img
                :src="
                  isMealFilledUI(d.id, 'breakfast')
                    ? '/dash/days/full.png'
                    : '/dash/days/empty.png'
                "
              />
              <h6 class="meal__title">Завтрак</h6>
            </div>

            <div
              class="meal"
              @click="selectMeal(d.id, 'lunch')"
              :class="{
                active: currentMeal === 'lunch' && currentDay === d.id,
              }"
            >
              <img
                :src="
                  isMealFilledUI(d.id, 'lunch')
                    ? '/dash/days/full.png'
                    : '/dash/days/empty.png'
                "
              />
              <h6 class="meal__title">Обед</h6>
            </div>

            <div
              class="meal"
              @click="selectMeal(d.id, 'dinner')"
              :class="{
                active: currentMeal === 'dinner' && currentDay === d.id,
              }"
            >
              <img
                :src="
                  isMealFilledUI(d.id, 'dinner')
                    ? '/dash/days/full.png'
                    : '/dash/days/empty.png'
                "
              />
              <h6 class="meal__title">Ужин</h6>
            </div>

            <div
              class="meal"
              @click="selectMeal(d.id, 'snack')"
              :class="{
                active: currentMeal === 'snack' && currentDay === d.id,
              }"
            >
              <img
                :src="
                  isMealFilledUI(d.id, 'snack')
                    ? '/dash/days/full.png'
                    : '/dash/days/empty.png'
                "
              />
              <h6 class="meal__title">Перекус</h6>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subcategories -->
    <div class="bottom-info">
      <div class="bottom-prompt">
        <div class="bottom-prompt__top">
          <h4 class="bottom-prompt__title">Подсказка</h4>
          <IconInfo class="bottom-prompt__icon" />
        </div>
        <p class="bottom-prompt__text">
          В данном окне мы покажем перечень продуктов входящих в подкатегорию
        </p>
      </div>
      <div class="controls categories-list">
        <h4 class="categories-list__title">
          Выберите категорию и подкатегорию продуктов
        </h4>
        <div class="categories-list__cats-wrapper">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="categories-list__cats"
          >
            <div
              class="categories-list__cat"
              @click="toggleCategory(cat.id)"
              :class="{ active: openCategory === cat.id }"
            >
              <img
                class="categories-list__cat-img"
                :src="cat.img"
                :alt="cat.id"
              />
              <h6 class="categories-list__cat-title">
                {{ cat.name }}
              </h6>
            </div>
            <div
              class="categories-list__subcat-wrapper"
              v-if="openCategory === cat.id"
            >
                <!-- :autoplay="{
                  delay: 3000,
                  disableOnInteraction: false,
                }" -->
              <swiper
                :loop="true"
                slides-per-view="auto"
                :space-between="17"
                :pagination="{
                  el: '.custom-pagination',
                  clickable: true,
                }"
                :navigation="{
                  nextEl: '.custom-next',
                  prevEl: '.custom-prev',
                }"
                :modules="modules"
                @swiper="onSwiper"
                @slideChange="onSlideChange"
                class="categories-list__subcat-swiper"
              >
                <swiper-slide
                  v-for="sub in cat.subcategories"
                  :key="sub.id"
                  class="categories-list__subcat-slide"
                >
                  <div
                    class="categories-list__subcat"
                    @click="onSelectSubcategory(sub.id)"
                  >
                    <img
                      class="categories-list__subcat-img"
                      :src="sub.preview"
                      :alt="sub.name"
                    />
                    <h6 class="categories-list__subcat-title">
                      {{ sub.name }}
                    </h6>
                  </div>
                </swiper-slide>
                <div class="custom-prev"></div>
                <div class="custom-next"></div>
                <div class="custom-pagination"></div>
              </swiper>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-inputs">
        <input
          class="weight-input bottom-inputs__inp"
          v-model="weight"
          @focus="useNumpad = true"
          placeholder="г"
        />

        <div v-if="!useNumpad" class="quick-btns bottom-inputs__quick">
          <button
            v-for="w in quickWeights"
            :key="w"
            @click="applyQuickWeight(w)"
            class="bottom-inputs__quick-btn"
          >
            {{ w }} г
          </button>
        </div>

        <div v-else class="numpad bottom-inputs__numpad">
          <button
            v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']"
            :key="n"
            @click="numpadPress(n)"
            class="bottom-inputs__numpad-btn"
          >
            {{ n }}
          </button>

          <button @click="numpadPress('<')" class="bottom-inputs__numpad-btn">
            <
          </button>
          <button @click="numpadPress('C')" class="bottom-inputs__numpad-btn">
            С
          </button>
        </div>

        <button
          v-if="!useNumpad"
          class="bottom-inputs__btn"
          @click="confirmWeight"
        >
          Рассчитать
        </button>
        <button
          v-if="useNumpad"
          class="bottom-inputs__btn-numpad"
          @click="confirmWeight"
        >
          ок
        </button>
      </div>
    </div>

    <!-- Weight Modal -->
    <div v-if="showWeightModal" class="modal-backdrop">
      <div class="modal">
        <h3>Граммовка</h3>
        <!-- <input
          class="weight-input"
          v-model="weight"
          @focus="useNumpad = true"
          placeholder="г"
        /> -->

        <div v-if="!useNumpad" class="quick-btns">
          <button
            v-for="w in quickWeights"
            :key="w"
            @click="applyQuickWeight(w)"
          >
            {{ w }} г
          </button>
        </div>

        <div v-else class="numpad">
          <button
            v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']"
            :key="n"
            @click="numpadPress(n)"
          >
            {{ n }}
          </button>

          <button @click="numpadPress('<')">⌫</button>
          <button @click="numpadPress('C')">С</button>
        </div>

        <div class="modal-actions">
          <button class="ok-btn" @click="confirmWeight">OK ✅</button>
          <button class="cancel-btn" @click="showWeightModal = false">
            Отмена
          </button>
        </div>
      </div>
    </div>
    <!-- 
    <div class="controls save-control">
      <button class="btn-save" @click="saveAsImage">💾 Сохранить PNG</button>
    </div> -->

    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>

<style scoped>
.plate-wrapper {
  position: relative;
  width: 3840px;
  /* уменьшенная для dev */
  height: 2160px;
  overflow: hidden;
  background-color: #c4bdad;
  background-image: url(./dash/bg.png);
}

.plate-wrapper * {
  font-size: 35px;
}

.image {
  height: 1522px;
  width: 100%;
  position: relative;
}

.image img.plate-base {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.mask-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  /* слоты перехватывают клики сами */
}

.slot {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.slot .product {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.controls {
  position: fixed;
  z-index: 50;
}

.days-controls {
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
  width: 523.98px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 38px;
  padding: 40px;
}

.days-controls.many_days {
  padding: 24px;
  width: 392px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 38px;
}
.days {
  display: grid;
  gap: 16px;
}
.days__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.day {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--Dark-grey, #1b1c21);
  font-family: "TT Hoves";
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  letter-spacing: -0.869px;
}

.days-controls.many_days .day {
  padding: 24px;
  gap: 16px;
  width: 344px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}

.day__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 32px;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
}

.days-controls.many_days .day__title {
  font-size: 20px;
}

.meals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.days-controls.many_days .meals {
  gap: 13.4px;
}

.meal {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.days-controls.many_days .meal {
  gap: 4px;
}

.meal img {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
}
.meal.active img {
  outline: 2px solid #ffffff;
}

.days-controls.many_days .meal img {
  width: 63.12px;
  height: 61.86px;
  border-radius: 10.2017px;
}
.days-controls.many_days .meal.active img {
  outline: 1.27521px solid #ffffff;
}

.meal__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 16px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.days button {
  padding: 15px 25px;
  border-radius: 15px;
  border: 2px solid #333;
  background: white;
}

.days button.active {
  background: #2b8aef;
  color: white;
}

.bottom-info {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 60px;
  display: grid;
  grid-template-columns: minmax(0, 453px) minmax(0, 1796px) minmax(0, 451px);
  gap: 8px;
  max-width: 2716px;
  width: 100%;
}

.bottom-prompt {
  min-height: 602px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 58px;
}

.bottom-prompt__top {
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.bottom-prompt__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.bottom-prompt__text {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.categories-list {
  position: static;
  padding: 40px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 58px;
  display: flex;
  flex-direction: column;
}

.categories-list__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 40px;
}

.categories-list__cats-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
  height: 100%;
}

.categories-list__cat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 8px 16px;
  gap: 8px;
  max-height: 172px;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}

.categories-list__cat.active {
  background: rgba(255, 255, 255, 0.34);
}

.categories-list__cat-img {
  width: 168px;
  height: 108.67px;
  border-radius: 13.9821px;
}

.categories-list__cat-title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 14px;
  line-height: 110%;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.categories-list__subcat-swiper {
  height: 213px;
}
.categories-list__subcat-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.34);
  border-radius: 38px;
  min-height: 250px;
  height: 250px;
}

.categories-list__subcat-slide {
  width: fit-content;
}
.categories-list__subcat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categories-list__subcat-img {
  width: 275px;
  height: 162px;
  min-width: 275px;
  min-height: 162px;
  max-width: 210px;
  max-height: 147px;
  border-radius: 24px;
}

.categories-list__subcat-title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 14px;
  line-height: 110%;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
}

/* Стили для пагинации */
.custom-pagination {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.custom-pagination span.swiper-pagination-bullet {
  width: 8px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
  background: #ffffff;
  opacity: 0.2;
  display: block;
}

.swiper-pagination-bullet-active {
  opacity: 1;
}

/* Стили для навигации */
.custom-prev,
.custom-next {
  color: #007bff;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.custom-prev:after,
.custom-next:after {
  font-size: 16px;
}

/* здесь стили подкатегорий нужно дописать */

.bottom-inputs {
  display: flex;
  flex-direction: column;
  padding: 40px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 58px;
}

.bottom-inputs__inp {
  padding: 24px;
  width: 371px;
  height: 90px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: none;
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.bottom-inputs__quick {
  display: grid;
  margin-top: 16px;
  gap: 16px 8px;
  grid-template-columns: repeat(6, 1fr);
}

.bottom-inputs__quick-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 67px;
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
  border-radius: 16px;
  font-family: "Manrope";
  font-weight: 600;
  font-size: 24.9214px;
  line-height: 37px;
  text-align: center;
  color: #ffffff;
  grid-column: span 2;
}
.bottom-inputs__quick-btn:nth-child(4),
.bottom-inputs__quick-btn:last-child {
  grid-column: span 3;
}
.bottom-inputs__btn-numpad,
.bottom-inputs__btn {
  margin-top: auto;
  width: 361.81px;
  background-color: #ffffff;
  border-radius: 24px;
  height: 72px;
  opacity: 0.2;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 20px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #1b1c21;
}

.bottom-inputs__btn-numpad {
  opacity: 1;
  text-transform: uppercase;
}

.bottom-inputs__numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 16px;
  gap: 16px 8px;
}

.bottom-inputs__numpad-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 67px;
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
  border-radius: 66px;
  font-family: "Manrope";
  font-weight: 600;
  font-size: 24.9214px;
  line-height: 37px;
  text-align: center;
  color: #ffffff;
}

.bottom-inputs__numpad-btn:nth-child(10) {
  grid-area: 4/2;
}

.category .cat-btn {
  display: block;
  padding: 20px 25px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.sub-btn {
  padding: 20px 25px;
  border-radius: 20px;
  border: 1px solid #777;
  background: white;
  cursor: pointer;
}

.save-control {
  right: 20px;
  bottom: 20px;
}

.btn-save {
  padding: 25px 30px;
  border-radius: 25px;
  background: #2b8aef;
  border: none;
  color: white;
}

.hidden {
  display: none;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  width: 1000px;
  text-align: center;
}

.modal-actions button {
  margin: 25px;
  padding: 30px;
  font-size: 25px;
}

.info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 70px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(7px);
  padding: 4px;
  width: max-content;
  height: 64px;
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
  align-items: center;
  color: #000;
  gap: 0px;
  max-width: 64px;
  transition: all 0.3s ease-in-out;
  transition-delay: 0.3s;
}

.btnInfo {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgb(249, 243, 228);
  backdrop-filter: blur(7px);
}

.btnInfo svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.info.active {
  padding-left: 24px;
  width: max-content;
  max-width: 600px;
  transition-delay: 0s;
  gap: 64px;
}
.text {
  opacity: 0;
  visibility: hidden;
  width: 0;
}
.text.active {
  opacity: 1;
  visibility: visible;
  width: 200px;
}
</style>
