<script setup>
import { ref, computed, onMounted, watch, nextTick, defineEmits } from "vue";
import { useStore } from "vuex";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import IconInfo from "@/components/icons/IconInfo.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, Navigation, FreeMode } from "swiper/modules";
import products from "@/../public/datas/dash.json";

import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMasterSync } from "@/composables/syncRouterSimple.js";
import { useRouter } from "vue-router";

const router = useRouter();
const bus = useBroadcastBus({
  role: "touch",
  pairId: "1",
  debug: true,
});
initMasterSync(router, bus, "1");

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";

const emit = defineEmits(["goResult"]);
const store = useStore();

const baseImgSrc = "/dash/stol/fon2.png";

const currentDay = ref(1);
const currentMeal = ref("breakfast");
const openCategory = ref(null);
const canvasRef = ref(null);
const plateArea = ref(null);
const selectedSubcat = ref(null);
const currentProducts = ref([]);
const isOpenModal = ref(false);
const activeInfoBtn = ref(null);
const weight = ref("");
const useNumpad = ref(false);
const weightInputRef = ref(null);

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
  const req = ["breakfast", "lunch", "dinner"]; //, "snack"];
  return req.every((m) =>
    Object.values(meals[m].plate || {}).some((s) => s !== null)
  );
};

const visibleDays = computed(() => {
  const out = [];
  out.push(days[0]);
  // for (let i = 2; i <= 7; i++) {
  //   const prev = i - 1;
  //   if (isDayFullyFilled(prev)) out.push(days[i - 1]);
  //   else break;
  // }
  return out;
});

function selectMeal(dayId, mealId) {
  if (!visibleDays.value.some((d) => d.id === dayId)) return;
  currentDay.value = dayId;
  currentMeal.value = mealId;
}
const isInPlate = (id) => {
  // Проверяем, есть ли объект с таким subcatId внутри plate
  return Object.values(currentMealState.value.plate).some(
    (item) => item && item.subcatId === id
  );
};

watch(
  () => isDayFullyFilled(currentDay.value),
  (val) => {
    if (val) {
      // const next = currentDay.value + 1;
      // if (next <= 7 && visibleDays.value.some((d) => d.id === next)) {
      //   currentMeal.value = "breakfast";
      // }
    }
  }
);
watch(
  () => currentMealState.value,
  (val) => {
    if (val) {
      console.log('bus.send', currentMealState.value);

      bus.send('plate', JSON.parse(JSON.stringify(val)), { role: 'monitor', pairId: '1' })
      bus.send('activeMealProducts', JSON.parse(JSON.stringify(activeMealProducts.value)), { role: 'monitor', pairId: '1' })
    }
  },
  { deep: true }
)

/* --- Вес --- */
function applyQuickWeight(val) {
  weight.value = String(val);
  useNumpad.value = true;
  // Фокусируемся на инпуте после установки быстрого веса
  nextTick(() => {
    weightInputRef.value?.focus();
  });
}
function numpadPress(char) {
  if (char === "C") weight.value = "";
  else if (char === "<") weight.value = weight.value.slice(0, -1);
  else weight.value += char;
}
function toggleCategory(catId) {
  openCategory.value = openCategory.value === catId ? null : catId;
}
function onSelectSubcategory(subcatId, sub) {
  console.log("sub", sub);
  if (sub.alteration && sub.oldname) {
    getProducts(sub.oldname);
  } else {
    getProducts(sub.name);
  }
  selectedSubcat.value = subcatId;
  weight.value = "";
  useNumpad.value = false;
}
const getProducts = async (name) => {

  currentProducts.value = products.filter((p) => p.subcategory === name);
  console.log('products', name);
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
  useNumpad.value = false;
  weight.value = "";
  selectedSubcat.value = null;
  currentProducts.value = [];
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
  1: { top: 29.5, left: 45.1, width: "380px" },
  2: { top: 29.5, left: 54.5, width: "375px" },
  3: { top: 44.9, left: 54.5, width: "360px" },
  4: { top: 45.2, left: 45.4, width: "380px" },
  5: { top: 49, left: 60.4, width: "344px" },
  6: { top: 39.3, left: 38.6, width: "222px", zIndex: 2 },
  7: { top: 12.4, left: 35.4, width: "390px", zIndex: 3 },
  8: { top: 39.4, left: 62, width: "282px" },
  9: { top: 30, left: 64.1, width: "13%", zIndex: 5 },
  10: { top: 28, left: 39.6, width: "379px" },
  11: { top: 49.4, left: 72.5, width: "575px", zIndex: 2 },
  12: { top: 50.5, left: 30.5, width: "340px", zIndex: 4 },
  13: { top: 28.5, left: 73.4, width: "16%" },
  14: {
    top: 37,
    left: 50,
    width: "68.7%",
    zIndex: "initial",
    info: { top: 22, left: 25 },
  },
  15: { top: 14.2, left: 52.8, width: "27%" },
  16: { top: 40.4, left: 32.5, width: "260px", zIndex: 3 },
  17: { top: 39.5, left: 26, width: "295px", zIndex: 5 },
  18: { top: 39, left: 20, width: "251px" },
  19: { top: 50.4, left: 23.5, width: "285px", zIndex: 5 },
};

function slotStyle(slotId) {
  const p = slotPositions[slotId];
  return {
    top: p.top + "%",
    left: p.left + "%",
    width: p.width ? p.width : "auto",
    "z-index": p.zIndex ? p.zIndex : 1,
  };
}
function slotForInfoStyle(slotId) {
  const p = slotPositions[slotId];
  return {
    top: p.info?.top + "%",
    left: p.info?.left + "%",
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

const activeMealProducts = computed(() =>
  store.getters["diet/getActiveMealSimpleProducts"](
    currentDay.value,
    currentMeal.value
  )
);

const modules = [Autoplay, Pagination, Navigation, FreeMode];

const closeActiveInfo = () => {
  if (!activeInfoBtn.value) return;
  activeInfoBtn.value = null;
};

const goResult = () => {
  isOpenModal.value = false;
  emit("goResult");
};

const arrowPrev = ref(null);
const arrowNext = ref(null);
const pagination = ref(null);
const swiperInstance = ref(null);

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

const toggleModal = () => (isOpenModal.value = !isOpenModal.value);
onMounted(() => store.commit("diet/INIT_DAY", 1));
</script>

<template>
  <div class="plate-wrapper" ref="plateArea">
    <div class="top-info" v-if="activeMealProducts.length !== 0">
      <div class="top-info__inner">
        <div class="top-info__top">
          <p class="top-info__top-left">Продукт</p>
          <p class="top-info__top-rigth">Граммы</p>
        </div>
        <div class="top-info__content">
          <div class="top-info__product" v-for="product in activeMealProducts" :key="product.slotId">
            <p class="top-info__content-title">
              {{ getNameCategory(product.subcatId) }}
            </p>
            <p class="top-info__content-weight">
              <span>{{ product.weight }} г</span>
              <svg @click="onSlotClick(product.slotId)" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" fill="white" fill-opacity="0.15" />
                <path
                  d="M16 13.6V12H24V13.6H28V15.2H26.4V27.2C26.4 27.6418 26.0418 28 25.6 28H14.4C13.9582 28 13.6 27.6418 13.6 27.2V15.2H12V13.6H16ZM15.2 15.2V26.4H24.8V15.2H15.2ZM17.6 17.6H19.2V24H17.6V17.6ZM20.8 17.6H22.4V24H20.8V17.6Z"
                  fill="white" />
              </svg>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="image">
      <img :src="baseImgSrc" class="layer plate-base" ref="baseImg" />
      <div class="mask-layer">
        <div v-for="slotId in [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        ]" :key="slotId" class="slot" :style="slotStyle(slotId)">
          <div v-if="currentMealState?.plate[slotId]" class="info" :style="slotForInfoStyle(slotId)" :class="{
            active:
              activeInfoBtn ===
              currentMealState?.plate[slotId].subcatId +
              '-' +
              currentMealState?.plate[slotId].slot,
          }" v-click-outside="closeActiveInfo">

            <div @click="onSlotClick(slotId)" class="btnInfo">
              <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                <foreignObject x="-14" y="-14" width="96" height="96">
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    style="backdrop-filter:blur(7px);clip-path:url(#bgblur_0_4030_2431_clip_path);height:100%;width:100%">
                  </div>
                </foreignObject>
                <g data-figma-bg-blur-radius="14">
                  <circle opacity="0.5" cx="34" cy="34" r="30" fill="white" fill-opacity="0.4" />
                  <path
                    d="M28 24.4V22H40V24.4H46V26.8H43.6V44.8C43.6 45.4628 43.0628 46 42.4 46H25.6C24.9373 46 24.4 45.4628 24.4 44.8V26.8H22V24.4H28ZM26.8 26.8V43.6H41.2V26.8H26.8ZM30.4 30.4H32.8V40H30.4V30.4ZM35.2 30.4H37.6V40H35.2V30.4Z"
                    fill="white" />
                </g>
                <defs>
                  <clipPath id="bgblur_0_4030_2431_clip_path" transform="translate(14 14)">
                    <rect width="68" height="68" rx="34" />
                  </clipPath>
                </defs>
              </svg>

            </div>
          </div>
          <img v-if="currentMealState?.plate[slotId]" :src="currentMealState.plate[slotId].image" class="product"
            draggable="false" />
        </div>
      </div>
    </div>

    <!-- ✅ Updated days UI -->
    <div class="controls days-controls" :class="{ many_days: visibleDays.length > 1 }">
      <div class="days">
        <!-- <h2 class="days__title" v-if="visibleDays.length > 1">Дни недели</h2> -->
        <div v-for="d in visibleDays" :key="d.id" class="day" :class="{ active: currentDay === d.id }">
          <!-- <h4 class="day__title">
            {{ d.smallName }}
          </h4>  -->
          <div class="meals">
            <div class="meal" @click="selectMeal(d.id, 'breakfast')" :class="{
              active: currentMeal === 'breakfast' && currentDay === d.id,
            }">
              <img :src="isMealFilledUI(d.id, 'breakfast')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'
                " />
              <h6 class="meal__title">Завтрак</h6>
            </div>

            <div class="meal" @click="selectMeal(d.id, 'lunch')" :class="{
              active: currentMeal === 'lunch' && currentDay === d.id,
            }">
              <img :src="isMealFilledUI(d.id, 'lunch')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'
                " />
              <h6 class="meal__title">Обед</h6>
            </div>

            <div class="meal" @click="selectMeal(d.id, 'dinner')" :class="{
              active: currentMeal === 'dinner' && currentDay === d.id,
            }">
              <img :src="isMealFilledUI(d.id, 'dinner')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'
                " />
              <h6 class="meal__title">Ужин</h6>
            </div>

            <!-- <div class="meal" @click="selectMeal(d.id, 'snack')" :class="{
              active: currentMeal === 'snack' && currentDay === d.id,
            }">
              <img :src="isMealFilledUI(d.id, 'snack')
                ? '/dash/days/full.png'
                : '/dash/days/empty.png'
                " />
              <h6 class="meal__title">Перекус</h6>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Subcategories -->
    <div class="bottom-info">
      <div class="bottom-prompt" :class="{ active: currentProducts.length > 1 }">
        <div class="bottom-prompt__top">
          <h4 class="bottom-prompt__title">Подсказка </h4>
          <IconInfo :color="{ '#1b1c21': currentProducts.length > 1 }" :opacity="{ '1': currentProducts.length > 1 }"
            class="bottom-prompt__icon" />
        </div>
        <div class="bottom-info__products">
          <div class="product" v-for="(p, index) of currentProducts" :key="p.id">
            {{ p.product }}{{ currentProducts.length > 1 && currentProducts.length - 1 !== index ? ', ' : '' }}
          </div>
        </div>
        <p v-if="!currentProducts.length" class="bottom-prompt__text">
          В данном окне мы покажем перечень продуктов входящих в подкатегорию
        </p>
      </div>
      <div class="controls categories-list">
        <h4 class="categories-list__title">
          Выберите категорию и подкатегорию продуктов
        </h4>
        <div class="categories-list__cats-wrapper">
          <div v-for="cat in categories" :key="cat.id" class="categories-list__cats">
            <div class="categories-list__cat" @click="toggleCategory(cat.id)"
              :class="{ active: openCategory === cat.id }">
              <img class="categories-list__cat-img" :src="cat.img" :alt="cat.id" />
              <h6 class="categories-list__cat-title">
                {{ cat.name }}
              </h6>
            </div>
            <div class="categories-list__subcat-wrapper" :class="{ 'hidden-gradient': cat.subcategories.length <= 6 }"
              v-if="openCategory === cat.id">
              <swiper :loop="true" slides-per-view="auto" :space-between="17" :free-mode="{
                enabled: true,
                momentum: false,
                sticky: false,
              }" :autoplay="{
                delay: 0, // Минимальная задержка
                disableOnInteraction: true, // Не останавливать при взаимодействии
                pauseOnMouseEnter: true, // Не останавливать при наведении
              }" :speed="1500" :pagination="{
                el: pagination,
                clickable: true,
                bulletClass: 'custom-bullet',
                bulletActiveClass: 'custom-bullet-active',
              }" :navigation="{
                nextEl: arrowNext,
                prevEl: arrowPrev,
              }" :modules="modules" @swiper="onSwiper" @slideChange="onSlideChange"
                class="categories-list__subcat-swiper">
                <swiper-slide v-for="sub in cat.subcategories" :key="sub.id" class="categories-list__subcat-slide"
                  :class="{ activeSubcat: selectedSubcat === sub.id }">
                  <div class="categories-list__subcat" @click="onSelectSubcategory(sub.id, sub)">
                    <div class="categories-list__subcat-img-wrapper" :class="{ added: isInPlate(sub.id) }">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM15.4571 7.45711L9 13.9142L4.79289 9.7071L6.20711 8.2929L9 11.0858L14.0429 6.04289L15.4571 7.45711Z" fill="white" />
</svg>
                      <img class="categories-list__subcat-img" :src="sub.preview" :alt="sub.name" />
                    </div>
                    <h6 class="categories-list__subcat-title">
                      {{ sub.name }}
                    </h6>
                  </div>
                </swiper-slide>
              </swiper>
              <div v-if="cat.subcategories.length > 6" class="custom-prev custom-arrow" ref="arrowPrev">
                <div class="tint"></div>
              </div>
              <div v-if="cat.subcategories.length > 6" class="custom-next custom-arrow" ref="arrowNext">
                <div class="tint"></div>
              </div>
              <div class="custom-pagination" ref="pagination" v-if="cat.subcategories.length > 6"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-inputs" :class="{
        active:
          selectedSubcat && selectedSubcat !== 'all' && selectedSubcat != '',
      }">
        <input ref="weightInputRef" class="weight-input bottom-inputs__inp" v-model="weight" @focus="useNumpad = true"
          placeholder="г" />

        <div v-if="!useNumpad" class="quick-btns bottom-inputs__quick">
          <button v-for="w in quickWeights" :key="w" @click="applyQuickWeight(w)" class="bottom-inputs__quick-btn"
            :class="{
              active:
                selectedSubcat &&
                selectedSubcat !== 'all' &&
                selectedSubcat != '',
            }">
            <div class="tint"></div>
            <span> {{ w }} г </span>
          </button>
        </div>

        <div v-else class="numpad bottom-inputs__numpad">
          <button v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']" :key="n" @click="numpadPress(n)"
            class="bottom-inputs__numpad-btn">
            <div class="tint"></div>
            <span>
              {{ n }}
            </span>
          </button>

          <button @click="numpadPress('<')" class="bottom-inputs__numpad-btn">
            <div class="tint"></div>
            <span>
              < </span>
          </button>
          <button @click="numpadPress('C')" class="bottom-inputs__numpad-btn">
            <div class="tint"></div>
            <span> С </span>
          </button>
        </div>

        <button v-if="!useNumpad" class="bottom-inputs__btn" @click="toggleModal">
          Рассчитать
        </button>
        <button v-if="useNumpad" class="bottom-inputs__btn-numpad" @click="confirmWeight">
          ок
        </button>
      </div>
    </div>

    <!-- Weight Modal -->
    <div v-if="isOpenModal" class="modal-backdrop" @click="toggleModal">
      <div class="modal" @click.stop>
        <div class="modal__close" @click="toggleModal">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="25.6" height="25.6" fill="white" />
            <path
              d="M12.7999 11.2915L18.0797 6.01172L19.5882 7.52021L14.3084 12.8L19.5882 18.0796L18.0797 19.5881L12.7999 14.3084L7.52022 19.5881L6.01172 18.0796L11.2915 12.8L6.01172 7.52021L7.52022 6.01172L12.7999 11.2915Z"
              fill="black" />
          </svg>
        </div>
        <div class="modal__inner">
          <h3 class="modal__title">
            Вы уверены, что хотите рассчитать созданный прием пищи или хотите
            добавить еще продуктов?
          </h3>
          <div class="modal__btns">
            <button class="modal__btn cancel" @click="toggleModal">
              Добавить
            </button>
            <button class="modal__btn ok" @click="goResult">Рассчитать</button>
          </div>
        </div>
      </div>
    </div>
    <!-- 
    <div class="controls save-control">
      <button class="btn-save" @click="saveAsImage">💾 Сохранить PNG</button>
    </div> -->
    <MenuNavigation class="footer__btn" on-page="dash" />
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
  height: 2160px;
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

.top-info {
  position: fixed;
  top: 60px;
  right: 60px;
  padding: 32px;
  width: 602px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 38px;
  z-index: 5;
}

.top-info__inner {
  position: relative;
}

.top-info__top {
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.5;
}

.top-info__content {
  margin-top: 16px;
  display: grid;
  gap: 40px;
}
.top-info__content-title{
  font-size: 32px;
}
.top-info__content-title::first-letter {
  text-transform: uppercase;
}

.top-info__content-weight {
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 32px;
}

.top-info__product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 32px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  gap: 20px;
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
  top: 60px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 64px;
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.days-controls.many_days .meals {
  gap: 13.4px;
}

.meal {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 17px;
  align-items: center;
}

.days-controls.many_days .meal {
  gap: 4px;
}

.meal img {
  width: 210.61997985839844px;
  height: 210.61997985839844px;
  border-radius: 24px;
  border-width: 4.21px;

  overflow: hidden;
}

.meal.active img {
  border: 4px solid #ffffff;
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
  font-size: 32px;
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
  height: 100%;
  max-height: 597px;
}

.bottom-prompt.active {
  background: rgba(255, 255, 255, 0.34);
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

.bottom-prompt.active .bottom-prompt__title {
  color: var(--Dark-grey, #1b1c21);
}

.bottom-prompt.active .bottom-prompt__icon {
  fill: var(--Dark-grey, #1b1c21);
}

.bottom-info__products {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  margin-top: 30px;
}

.bottom-info__products::-webkit-scrollbar {
  width: 4px;
}

.bottom-info__products::-webkit-scrollbar-track {
  background: rgba(27, 28, 33, 0.05);
  border-radius: 2px;
}

.bottom-info__products::-webkit-scrollbar-thumb {
  background: #fff;
  border-radius: 2px;
}

.bottom-info__products .product {
  color: #1b1c21;
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

.categories-list__subcat-wrapper::before {
  position: absolute;
  content: "";
  display: block;
  right: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(166, 166, 166, 0) 0%, #a6a6a6 80%);
  width: 11%;
  /* или нужная вам ширина */
  z-index: 2;
}

.categories-list__subcat-wrapper::after {
  position: absolute;
  content: "";
  display: block;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #a6a6a6 20%, rgba(166, 166, 166, 0) 100%);
  width: 11%;
  /* или нужная вам ширина */
  z-index: 1;
}

.categories-list__subcat-wrapper.hidden-gradient::before,
.categories-list__subcat-wrapper.hidden-gradient::after {
  display: none;
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
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.categories-list__subcat-slide {
  width: fit-content;
}

.categories-list__subcat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categories-list__subcat-slide.activeSubcat .categories-list__subcat-img-wrapper {
  border: 4px solid #ffffff;
}

.categories-list__subcat-img-wrapper {
  width: 275px;
  height: 162px;
  min-width: 275px;
  min-height: 162px;
  max-width: 210px;
  max-height: 147px;
  border-radius: 24px;
  overflow: hidden;
  border: 4px solid transparent;
  position: relative;
}

.categories-list__subcat-img-wrapper svg {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  opacity: 0;
  visibility: hidden;
}

.categories-list__subcat-img-wrapper.added svg {
  opacity: 1;
  visibility: visible;
}

.categories-list__subcat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.categories-list__subcat-title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 16px;
  line-height: 110%;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.bottom-inputs {
  display: flex;
  flex-direction: column;
  padding: 40px;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 58px;
}

.bottom-inputs.active {
  background: rgba(255, 255, 255, 0.34);
}

.bottom-inputs__inp::placeholder {
  color: #fff;
}

.bottom-inputs.active .bottom-inputs__inp,
.bottom-inputs.active .bottom-inputs__quick-btn {
  background: #8D8980;
  color: #fff;
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
  background: linear-gradient(85.26deg,
      rgba(217, 217, 217, 0.1) 3.83%,
      rgba(115, 115, 115, 0.1) 99.95%);
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

.bottom-inputs__btn {
  opacity: 1;
}

.bottom-inputs__btn:disabled {
  opacity: 0.2;
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
  background: #8D8980;
}

.bottom-inputs__quick-btn,
.bottom-inputs__numpad-btn {
  border-radius: 16px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  backdrop-filter: blur(10px);
}

.bottom-inputs__quick-btn::before,
.bottom-inputs__numpad-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(85.26deg,
      rgb(255 255 255 / 83%) 3.83%,
      rgb(255 255 255 / 68%) 99.95%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.bottom-inputs__quick-btn span,
.bottom-inputs__numpad-btn span {
  position: relative;
  font-family: "Manrope";
  font-weight: 600;
  font-size: 24.9214px;
  line-height: 37px;
  text-align: center;
  color: #ffffff;
  z-index: 1;
}

.bottom-inputs__quick-btn .tint,
.bottom-inputs__numpad-btn .tint {
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: linear-gradient(85.26deg,
      rgba(217, 217, 217, 0.1) 3.83%,
      rgba(115, 115, 115, 0.1) 99.95%);
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(78, 78, 78, 0.4);
  backdrop-filter: blur(37px);
}

.modal {
  width: 1267px;
  height: 648px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.modal__inner {
  max-width: 700px;
}

.modal__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 50px;
}

.modal__btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal__btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24.4221px 32.5628px;
  width: 343.89px;
  height: 79.53px;
  background: #ffffff;
  border-radius: 26.5085px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 22.0905px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #1b1c21;
}

.modal__btn.ok {
  background: rgba(255, 255, 255, 0.5);
}

.modal__close {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  background-color: #ffffff;
  border-radius: 32px;
  top: 40px;
  right: 40px;
  position: absolute;
}

.custom-arrow {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  position: absolute;
  z-index: 10;
  top: 43%;
  transform: translateY(-50%);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  backdrop-filter: blur(10px);
}

.custom-arrow::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: 1px;
  background: linear-gradient(85.26deg,
      rgb(255 255 255 / 83%) 3.83%,
      rgb(255 255 255 / 68%) 99.95%);
  border-radius: 19px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.custom-arrow::after {
  position: absolute;
  content: ">";
  color: #fff;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 19px;
  z-index: 1;
}

.custom-prev {
  left: 16px;
  top: 27%;
  transform: scaleX(-1) translateY(50%);
}

.custom-next {
  right: 16px;
}

.info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 70px;
  padding: 4px;

  color: #000;
  width: 60px;
  height: 60px;
}

.btnInfo {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.btnInfo svg {
  flex-shrink: 0;
}

.btnInfo svg path {
  fill: #ffffff;
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
  max-width: 0;
  width: fit-content;
}

.text.active {
  opacity: 1;
  visibility: visible;
  max-width: 600px;
}

.footer__btn {
  margin-top: auto;
  position: fixed;
  bottom: 60px;
  right: 60px;
}

.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: linear-gradient(85.26deg,
      rgba(217, 217, 217, 0.1) 3.83%,
      rgba(115, 115, 115, 0.1) 99.95%);
}
</style>
