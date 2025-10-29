<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const baseImgSrc = '/dash/stol/fon.png';

const currentDay = ref(1);
const currentMeal = ref('breakfast');
const openCategory = ref(null);
const canvasRef = ref(null);
const plateArea = ref(null);
const selectedSubcat = ref(null);
const showWeightModal = ref(false);
const activeInfoBtn = ref(null);
const weight = ref('');
const useNumpad = ref(false);

const days = [
  { id: 1, smallName: 'Пн' },
  { id: 2, smallName: 'Вт' },
  { id: 3, smallName: 'Ср' },
  { id: 4, smallName: 'Чт' },
  { id: 5, smallName: 'Пт' },
  { id: 6, smallName: 'Сб' },
  { id: 7, smallName: 'Вс' }
];

const categories = computed(() => store.state.diet.categories || []);
const currentMealState = computed(() =>
  store.getters['diet/getMeal'](currentDay.value, currentMeal.value)
);

const quickWeights = [50, 100, 150, 200, 250];

const getStoredDay = (dayId) => store.state.diet.week.days?.[dayId] || null;

const isMealFilledUI = (dayId, mealId) => {
  const day = getStoredDay(dayId);

  if (!day) return false;
  const meal = day.meals?.[mealId];
  if (!meal) return false;
  return Object.values(meal.plate || {}).some(slot => slot !== null);
};

const isDayFullyFilled = (dayId) => {
  const day = getStoredDay(dayId);
  if (!day) return false;
  const meals = day.meals || {};
  const req = ['breakfast', 'lunch', 'dinner', 'snack'];
  return req.every(m => Object.values(meals[m].plate || {}).some(s => s !== null));
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
  if (!visibleDays.value.some(d => d.id === dayId)) return;
  currentDay.value = dayId;
  currentMeal.value = mealId;
}

watch(() => isDayFullyFilled(currentDay.value), (val) => {
  if (val) {
    const next = currentDay.value + 1;
    if (next <= 7 && visibleDays.value.some(d => d.id === next)) {
      currentDay.value = next;
      currentMeal.value = 'breakfast';
    }
  }
});

/* --- Вес --- */
function applyQuickWeight(val) { weight.value = String(val); }
function numpadPress(char) {
  if (char === 'C') weight.value = '';
  else if (char === '<') weight.value = weight.value.slice(0, -1);
  else weight.value += char;
}
function toggleCategory(catId) {
  openCategory.value = openCategory.value === catId ? null : catId;
}
function onSelectSubcategory(subcatId) {
  selectedSubcat.value = subcatId;
  weight.value = '';
  useNumpad.value = false;
  showWeightModal.value = true;
}

async function confirmWeight() {
  if (!weight.value || Number(weight.value) <= 0) {
    alert("Введите количество грамм!");
    return;
  }
  const res = await store.dispatch('diet/addProduct', {
    dayId: currentDay.value,
    mealId: currentMeal.value,
    subcatId: selectedSubcat.value,
    weight: Number(weight.value)
  });

  if (!res.ok) alert("Нет свободного места для продукта!");
  showWeightModal.value = false;
}

/* --- Slots --- */
function onSlotClick(slotId) {
  if (!currentMealState.value) return;
  activeInfoBtn.value = false;
  if (currentMealState.value.plate[slotId]) {
    store.dispatch('diet/removeProduct', {
      dayId: currentDay.value,
      mealId: currentMeal.value,
      slotId
    });
  }
}

const slotPositions = {
  1: { top: 40, left: 44.4 },
  2: { top: 39.3, left: 55 },
  3: { top: 60.4, left: 55.4 },
  4: { top: 60.4, left: 44.5 },

  5: { top: 40, left: 44.4 },
  6: { top: 39.3, left: 55 },
  7: { top: 60.4, left: 55.4 },
  8: { top: 60.4, left: 44.5 },

  9: { top: 40, left: 44.4 },
  10: { top: 39.3, left: 55 },
  11: { top: 60.4, left: 55.4 },
  12: { top: 60.4, left: 44.5 },

  13: { top: 40, left: 44.4 },
  14: { top: 39.3, left: 55 },
  15: { top: 60.4, left: 55.4 },
  16: { top: 60.4, left: 44.5 },

  17: { top: 40, left: 44.4 },
  18: { top: 39.3, left: 55 },
  19: { top: 60.4, left: 44.5 },
};

function slotStyle(slotId) {
  
  const p = slotPositions[slotId];
  return {
    top: p.top + '%',
    left: p.left + '%',
  };
}

/* --- Save Image --- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function saveAsImage() {
  try {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');

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

    const link = document.createElement('a');
    link.download = `plate_day${currentDay.value}_meal_${currentMeal.value}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error(err);
    alert('Ошибка сохранения');
  }
}

function goActiveInfoBtn(posId, el) {
  activeInfoBtn.value = posId;
  el?.activateClickOutside?.();
}
function getNameCategory(id) {
  const categoryArray = store.state.diet.categories;
  for (const c of categoryArray) {
    const found = c.subcategories.find(s => s.id === id);
    if (found) return found.name;
  }
  return null;
}
const closeActiveInfo = () => {
  if (!activeInfoBtn.value) return;
  console.log('sdsdf');
  
  activeInfoBtn.value = null;
};
onMounted(() => store.commit('diet/INIT_DAY', 1));
</script>

<template>
  <div class="plate-wrapper" ref="plateArea">
    <div class="image">
      <img :src="baseImgSrc" class="layer plate-base" ref="baseImg" />
      <div class="mask-layer">
        <div v-for="slotId in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]" :key="slotId"
          class="slot" :style="slotStyle(slotId)" >
          <div v-if="currentMealState?.plate[slotId]" class="info" :class="{active: activeInfoBtn === (currentMealState?.plate[slotId].subcatId + '-' + currentMealState?.plate[slotId].slot)}" v-click-outside="closeActiveInfo">
            
            <span class="text" :class="{active: activeInfoBtn === (currentMealState?.plate[slotId].subcatId + '-' + currentMealState?.plate[slotId].slot)}">{{ getNameCategory(currentMealState?.plate[slotId].subcatId) }} {{ currentMealState?.plate[slotId].weight }}г</span>
            
            <div class="btnInfo" >
             <svg v-if="activeInfoBtn === (currentMealState?.plate[slotId].subcatId + '-' + currentMealState?.plate[slotId].slot)" @click="onSlotClick(slotId)" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 2V0H15V2H20V4H18V19C18 19.5523 17.5523 20 17 20H3C2.44772 20 2 19.5523 2 19V4H0V2H5ZM4 4V18H16V4H4ZM7 7H9V15H7V7ZM11 7H13V15H11V7Z"
                  fill="black" />
              </svg>
             <svg v-else @click="goActiveInfoBtn(currentMealState?.plate[slotId].subcatId + '-' + currentMealState?.plate[slotId].slot, $el)" xmlns="http://www.w3.org/2000/svg" width="6" height="17" viewBox="0 0 6 17" fill="none">
                <path
                  d="M3 3C3.8284 3 4.5 2.32843 4.5 1.5C4.5 0.67157 3.8284 0 3 0C2.1716 0 1.5 0.67157 1.5 1.5C1.5 2.32843 2.1716 3 3 3ZM0 7H2V15H0V17H6V15H4V5H0V7Z"
                  fill="black" />
              </svg>
            </div>
          </div>
          <img v-if="currentMealState?.plate[slotId]" :src="currentMealState.plate[slotId].image" class="product"
            draggable="false" />
        </div>
      </div>
    </div>

    <!-- ✅ Updated days UI -->
    <div class="controls days-controls">
      <div class="days">
        <div v-for="d in visibleDays" :key="d.id" class="day" :class="{ active: currentDay === d.id }">
          {{ d.smallName }}

          <div class="meals">
            <div @click="selectMeal(d.id, 'breakfast')"
              :class="{ active: currentMeal === 'breakfast' && currentDay === d.id }">
              <img :src="isMealFilledUI(d.id, 'breakfast')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'" />
              Завтрак
            </div>

            <div @click="selectMeal(d.id, 'lunch')" :class="{ active: currentMeal === 'lunch' && currentDay === d.id }">
              <img :src="isMealFilledUI(d.id, 'lunch')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'" />
              Обед
            </div>

            <div @click="selectMeal(d.id, 'dinner')"
              :class="{ active: currentMeal === 'dinner' && currentDay === d.id }">
              <img :src="isMealFilledUI(d.id, 'dinner')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'" />
              Ужин
            </div>

            <div @click="selectMeal(d.id, 'snack')" :class="{ active: currentMeal === 'snack' && currentDay === d.id }">
              <img :src="isMealFilledUI(d.id, 'snack')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'" />
              Перекус
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subcategories -->
    <div class="controls category-list">
      <div class="categories">
        <div v-for="cat in categories" :key="cat.id" class="category">
          <button class="cat-btn" @click="toggleCategory(cat.id)">{{ cat.name }}</button>
          <div v-if="openCategory === cat.id" class="subcats">
            <button v-for="sub in cat.subcategories" :key="sub.id" class="sub-btn" @click="onSelectSubcategory(sub.id)">
              {{ sub.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Weight Modal -->
    <div v-if="showWeightModal" class="modal-backdrop">
      <div class="modal">
        <h3>Граммовка</h3>
        <input class="weight-input" v-model="weight" @focus="useNumpad = true" placeholder="г" />

        <div v-if="!useNumpad" class="quick-btns">
          <button v-for="w in quickWeights" :key="w" @click="applyQuickWeight(w)">
            {{ w }} г
          </button>
        </div>

        <div v-else class="numpad">
          <button v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']" :key="n" @click="numpadPress(n)">
            {{ n }}
          </button>

          <button @click="numpadPress('<')">⌫</button>
          <button @click="numpadPress('C')">С</button>
        </div>

        <div class="modal-actions">
          <button class="ok-btn" @click="confirmWeight">OK ✅</button>
          <button class="cancel-btn" @click="showWeightModal = false">Отмена</button>
        </div>
      </div>
    </div>

    <div class="controls save-control">
      <button class="btn-save" @click="saveAsImage">💾 Сохранить PNG</button>
    </div>

    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>



<style scoped>
.plate-wrapper {
  position: relative;
  width: 3840px;
  /* уменьшенная для dev */
  height: 1872px;
  background: #C4BDAD;
  overflow: hidden;

}

.plate-wrapper * {
  font-size: 35px;
}

.image {
  height: 100%;
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
  left: 20px;
  bottom: 80px;
}

.days {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 80px;
}

.day {
  display: flex;
  flex-direction: column;
  gap: 21px;
  color: var(--Dark-grey, #1B1C21);
  font-family: "TT Hoves";
  font-size: 28.963px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  letter-spacing: -0.869px;
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

.meals {
  display: flex;
  gap: 21px;
}

.meals div {
  padding: 15px 25px;
  border-radius: 15px;
  border: 2px solid #333;
  background: white;
  cursor: pointer;
}

.category-list {
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
  display: flex;
}

.categories {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px 30px;
  border-radius: 15px;
}

.category .cat-btn {
  display: block;
  padding: 20px 25px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.subcats {
  margin-top: 15px;
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
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
  background: rgba(0, 0, 0, .5);
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

.weight-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 35px;
  margin-bottom: 12px;
  text-align: center;
}

.quick-btns button,
.numpad button {
  margin: 4px;
  padding: 10px;
  font-size: 35px;
  border-radius: 10px;
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
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(7px);
  padding: 4px;
  width: max-content;
  height: 64px;
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
  align-items: center;
  color:#000;
  gap: 0px;
  max-width: 64px;
  transition: all .3s ease-in-out;
  transition-delay: .3s;
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
.info.active{
  padding-left: 24px;
  width: max-content;
  max-width: 600px;
  transition-delay: 0s;
  gap: 64px;
}
.text{
  opacity: 0;
  visibility: hidden;
  width: 0;
}
.text.active{
  opacity: 1;
  visibility: visible;
  width: 200px;
}
</style>
