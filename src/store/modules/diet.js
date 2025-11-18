// store/modules/diet.js
// Vuex модуль для интерактива "Тарелка / неделя".
// Фокус сейчас на слотах 1..4 (тарелка). Остальные слоты оставлены в конфиге для будущего расширения.

const initialMeal = () => ({
  // plate: ключи — id слотов (строго числа или строк)
  plate: {
    1: null,
    2: null,
    3: null,
    4: null,
    // остальное оставляем на будущее, но пока null
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    10: null,
    11: null,
    12: null,
    13: null,
    14: null,
    15: null,
    16: null,
    17: null,
    18: null,
    19: null,
  },
  usedSlots: [], // список занятых id слотов
});

const initialDay = () => ({
  meals: {
    breakfast: initialMeal(),
    lunch: initialMeal(),
    dinner: initialMeal(),
   
  },
  // флаг: пользователь изменял этот день отдельно (если true — не синхронизируем с day1)
  custom: false,
});

export default {
  namespaced: true,

  state: () => ({
    // Конфигурация слотов: указываем все слоты (1..19) но отметим, что
    // текучая работа ведётся с 1..4 (тарелка).
    slots: [
      { id: 1, name: "plate-1" },
      { id: 2, name: "plate-2" },
      { id: 3, name: "plate-3" },
      { id: 4, name: "plate-4" },
      { id: 5, name: "board-dry-1" },
      { id: 6, name: "board-dry-2" },
      { id: 7, name: "board-dry-3" },
      { id: 8, name: "board-dry-4" },
      { id: 9, name: "glass-slot" },
      { id: 10, name: "yogurt-slot" },
      { id: 11, name: "plate-type-1" },
      { id: 12, name: "plate-type-2" },
      { id: 13, name: "cup" },
      { id: 14, name: "tumbler" },
      { id: 15, name: "reserved-15" },
      { id: 16, name: "sauce-1" },
      { id: 17, name: "sauce-2" },
      { id: 18, name: "sauce-3" },
      { id: 19, name: "sauce-4" },
    ],
    week: {
      synced: true, // если true — дни 2..7 копируют day1 (пока)
      days: {
        1: initialDay(),
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
      },
    },

    // Категории -> подкатегории. Подкатегория хранит:
    // id, name, allowedSlots (куда её можно ставить), images: map slot->path
    categories: [
      {
        id: "grains",
        name: "Зерновые",
        img: "/products/cat/zernovie.png",
        subcategories: [
          {
            id: "grain_snacks",
            name: "Крекеры",
            oldname: "Зерновые снеки (крекеры и пр.)",
            alteration: true,
            preview: "/products/subcat/subcat-1-1.png",
            allowedSlots: [5],
            // images: ключ — номер слота; значение — путь к картинке для этого слота
            images: {
              5: "/products/kreker1.png",
              5_1: "/products/kreker2.png",
            },
          },
          {
            id: "grains_refined",
            name: "Макароны",
            oldname: "Злаки рафинированные (варёные, 1/2 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-1-2.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/makaroshki1.png",
              2: "/products/makaroshki2.png",
              3: "/products/makaroshki3.png",
              4: "/products/makaroshki4.png",
            },
          },
          {
            id: "grains_whole",
            name: "Гречка",
            oldname: "Злаки цельнозерновые (варёные, 1/2 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-1-3.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/grecha1.png",
              2: "/products/grecha2.png",
              3: "/products/grecha3.png",
              4: "/products/grecha4.png",
            },
          },
          {
            id: "popcorn",
            name: "Попкорн",
            oldname: "Попкорн несолёный",
            alteration: true,
            preview: "/products/subcat/subcat-1-4.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/popcorn1.png",
              2: "/products/popcorn2.png",
              3: "/products/popcorn3.png",
              4: "/products/popcorn4.png",
            },
          },
          {
            id: "muesli",
            name: "Мюсли",
            oldname: "Сухие хлопья/мюсли (1 oz)",
            alteration: true,
            preview: "/products/subcat/subcat-1-5.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/musli1.png",
              2: "/products/musli2.png",
              3: "/products/musli3.png",
              4: "/products/musli4.png",
            },
          },
          {
            id: "bread_white",
            name: "Кусок хлеба",
            oldname: "Хлеб белый/рафинированный (ломтик)",
            alteration: true,
            preview: "/products/subcat/subcat-1-6.png",
            allowedSlots: [11],
            images: {
              11: "/products/hleb1.png",
              11_1: "/products/hleb2.png",
            },
          },
          {
            id: "bread_whole",
            name: "кусок хлеба зерновой",
            oldname: "Хлеб цельнозерновой (ломтик)",
            alteration: true,
            preview: "/products/subcat/subcat-1-7.png",
            allowedSlots: [11],
            images: {
              11: "/products/hleb_zerno_1.png",
              11_1: "/products/hleb_zerno_2.png",
            },
          },
        ],
      },
      {
        id: "fats",
        name: "Жиры и масла",
        img: "/products/cat/maslo.png",
        subcategories: [
          {
            id: "sunflower-oil",
            name: "Подсолнечное масло",
            oldname: "Растительные масла (1 ч. л.)",
            alteration: true,
            preview: "/products/subcat/subcat-2-1.png",
            allowedSlots: [16, 17, 18, 19],
            images: {
              16: "/products/maslo1.png",
              17: "/products/maslo2.png",
              18: "/products/maslo3.png",
              19: "/products/maslo4.png",
            },
          },
          {
            id: "mayonnaise",
            name: "Майонез",
            oldname: "Майонез (1 ст. л.)",
            alteration: true,
            preview: "/products/subcat/subcat-2-3.png",
            allowedSlots: [16, 17, 18, 19],
            images: {
              16: "/products/mazik1.png",
              17: "/products/mazik2.png",
              18: "/products/mazik3.png",
              19: "/products/mazik4.png",
            },
          },
          {
            id: "piece-of-butter",
            name: "кусочек слив. масла",
            oldname: "Маргарин мягкий (1 ч. л.)",
            alteration: true,
            preview: "/products/subcat/subcat-2-2.png",
            allowedSlots: [16, 17, 18, 19],
            images: {
              16: "/products/maslo_cube1.png",
              17: "/products/maslo_cube2.png",
              18: "/products/maslo_cube3.png",
              19: "/products/maslo_cube4.png",
            },
          },
          {
            id: "sauce",
            name: "Соус (бальзамик или масло с травами)",
            oldname: "Заправки/соусы (1 ст. л.)",
            alteration: true,
            preview: "/products/subcat/subcat-2-4.png",
            allowedSlots: [16, 17, 18, 19],
            images: {
              16: "/products/maslo_travi1.png",
              17: "/products/maslo_travi2.png",
              18: "/products/maslo_travi3.png",
              19: "/products/maslo_travi4.png",
            },
          },
        ],
      },
      {
        id: "meat_fish",
        name: "Нежирное мясо, птица и рыба",
        img: "/products/cat/myaso.png",
        subcategories: [
          {
            id: "white_meat",
            name: "куриная грудка жарен",
            oldname: "Белое мясо (готовое, 1 oz)",
            alteration: true,
            preview: "/products/subcat/subcat-3-1.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/kurica1.png",
              2: "/products/kurica2.png",
              3: "/products/kurica3.png",
              4: "/products/kurica4.png",
            },
          },
          {
            id: "yaichnicas",
            name: "яичница",
            oldname: "Яйца (1 шт)",
            alteration: true,
            preview: "/products/subcat/subcat-3-2.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/yaichnica1.png",
              2: "/products/yaichnica2.png",
              3: "/products/yaichnica3.png",
              4: "/products/yaichnica4.png",
            },
          },
          {
            id: "#FF0004_meat",
            name: "свинина или говяд. кусок жар.",
            oldname: "Красное мясо (готовое, 1 oz)",
            alteration: true,
            preview: "/products/subcat/subcat-3-3.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/bife1.png",
              2: "/products/bife2.png",
              3: "/products/bife3.png",
              4: "/products/bife4.png",
            },
          },
          {
            id: "seafood",
            name: "набор (креветки, мидии, осьминог)",
            oldname: "Морепродукты (готовые, 1 oz)",
            alteration: true,
            preview: "/products/subcat/subcat-3-4.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/more1.png",
              2: "/products/more2.png",
              3: "/products/more3.png",
              4: "/products/more4.png",
            },
          },
          {
            id: "fish",
            name: "Рыба готовая",
            oldname: "Рыба (готовая, 1 oz)",
            alteration: true,
            preview: "/products/subcat/subcat-3-5.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/riba1.png",
              2: "/products/riba2.png",
              3: "/products/riba3.png",
              4: "/products/riba4.png",
            },
          },
        ],
      },
      {
        id: "dairy",
        name: "Обезжиренные/ низкожирные молочные",
        img: "/products/cat/moloko.png",
        subcategories: [
          {
            id: "kefir",
            name: "Кефир (обезжиренный)",
            preview: "/products/subcat/subcat-4-1.png",
            allowedSlots: [10],
            images: {
              10: "/products/kefir1.png",
            },
          },
          {
            id: "yogurt",
            name: "Йогурт (обезжиренный)",
            oldname: "Йогурт (обезжиренный)",
            alteration: true,
            preview: "/products/subcat/subcat-4-2.png",
            allowedSlots: [10],
            images: {
              10: "/products/yogurt1.png",
            },
          },
          {
            id: "cheese",
            name: "кусочек (2 кусочка)",
            oldname: "Сыр (пониженной жирности)",
            alteration: true,
            preview: "/products/subcat/subcat-4-3.png",
            allowedSlots: [8],
            images: {
              8: "/products/sir1.png",
              8_1: "/products/sir2.png",
            },
          },
        ],
      },
      {
        id: "vegetables",
        name: "Овощи",
        img: "/products/cat/ovoshi.png",
        subcategories: [
          {
            id: "leafy",
            name: "салат микс",
            oldname: "Листовые (сырые, 1 стакан)",
            alteration: true,
            preview: "/products/subcat/subcat-5-1.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/salat1.png",
              2: "/products/salat2.png",
              3: "/products/salat3.png",
              4: "/products/salat4.png",
            },
          },
          {
            id: "cruciferous",
            name: "огурец, томаты (кусочки крупно)",
            oldname: "Крестоцветные/прочие (1/2 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-5-2.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/ogurci_tomat1.png",
              2: "/products/ogurci_tomat2.png",
              3: "/products/ogurci_tomat3.png",
              4: "/products/ogurci_tomat4.png",
            },
          },
          {
            id: "roots",
            name: "Овощи варенные",
            oldname: "Корнеплоды/крахмалистые (1/2 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-5-3.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/kartof_svekl1.png",
              2: "/products/kartof_svekl2.png",
              3: "/products/kartof_svekl3.png",
              4: "/products/kartof_svekl4.png",
            },
          },
        ],
      },
      {
        id: "nuts",
        name: "Орехи, семена и бобовые",
        img: "/products/cat/orehi.png",
        subcategories: [
          {
            id: "legumes",
            name: "вареная фасоль, бобы",
            oldname: "Бобовые (варёные, 1/2 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-6-1.png",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/bobi1.png",
              2: "/products/bobi2.png",
              3: "/products/bobi3.png",
              4: "/products/bobi4.png",
            },
          },
          {
            id: "nuts",
            name: "горсть небольшая",
            oldname: "Орехи (1/3 стакана ≈ 42 г)",
            alteration: true,
            preview: "/products/subcat/subcat-6-2.png",
            allowedSlots: [6],
            images: {
              6: "/products/orehi1.png",
            },
          },
          {
            id: "seeds",
            name: "горсть небольшая",
            oldname: "Семена (2 ст. л. ≈ 16 г)",
            alteration: true,
            preview: "/products/subcat/subcat-6-3.png",
            allowedSlots: [6],
            images: {
              6: "/products/semki1.png",
            },
          },
          {
            id: "peanut-butter",
            name: "Арахисовая паста",
            oldname: "Арахисовая паста (2 ст. л.)",
            alteration: true,
            preview: "/products/subcat/subcat-6-4.png",
            allowedSlots: [16, 17, 18, 19],
            images: {
              16: "/products/arahis1.png",
              17: "/products/arahis2.png",
              18: "/products/arahis3.png",
              19: "/products/arahis4.png",
            },
          },
        ],
      },
      {
        id: "sweets",
        name: "Сладости и добавленные сахара",
        img: "/products/cat/sladosti.png",
        subcategories: [
          {
            id: "jam-preserve",
            name: "варенье",
            oldname: "Джем/варенье (1 ст. л.)",
            alteration: true,
            preview: "/products/subcat/subcat-7-1.png",
            allowedSlots: [16, 17, 18, 19],
            images: {
              16: "/products/varenia1.png",
              17: "/products/varenia2.png",
              18: "/products/varenia3.png",
              19: "/products/varenia4.png",
            },
          },
          {
            id: "jelly-sorbet",
            name: "желе",
            oldname: "Желейные/сорбет (1/2 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-7-2.png",
            allowedSlots: [16, 17, 18, 19],
            images: {
              16: "/products/zhele1.png",
              17: "/products/zhele2.png",
              18: "/products/zhele3.png",
              19: "/products/zhele4.png",
            },
          },
          {
            id: "sweet-pastries",
            name: "кусок торта/пирожное",
            oldname: "Сладкая сдоба",
            alteration: true,
            preview: "/products/subcat/subcat-7-3.png",
            allowedSlots: [12],
            images: {
              12: "/products/desert1.png",
            },
          },
        ],
      },
      {
        id: "fruits",
        name: "Фрукты",
        img: "/products/cat/fructi.png",
        subcategories: [
          {
            id: "fresh-fruit",
            name: "кусок яблока, банан кус. (или др.)",
            oldname: "Свежие (1 средний плод)",
            alteration: true,
            preview: "/products/subcat/subcat-8-1.png",
            allowedSlots: [15],
            images: {
              15: "/products/frukti.png",
            },
          },
          {
            id: "dried-fruits",
            name: "горсть курага/изюм",
            oldname: "Сухофрукты (1/4 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-8-2.png",
            allowedSlots: [6],
            images: {
              6: "/products/suho1.png",
            },
          },
          {
            id: "berries-slices",
            name: "малина, черника (или др)",
            oldname: "Ягоды/ломтики (1/2 стакана)",
            alteration: true,
            preview: "/products/subcat/subcat-8-3.png",
            allowedSlots: [16],
            images: {
              16: "/products/yagodi_1.png",
            },
          },
        ],
      },

      {
        id: "drinks",
        name: "Напитки",
        img: "/products/cat/napitki.png",
        subcategories: [
          {
            id: "milk",
            name: "Молоко",
            oldname: "Молоко (обезжиренное)",
            alteration: true,
            oldCategory: "Обезжиренные/ низкожирные молочные",
            preview: "/products/subcat/subcat-9-1.png",
            allowedSlots: [14, 9],
            images: {
              9: "/products/moloko2_right.png",
              14: "/products/moloko1_left.png",
            },
          },
          {
            id: "tea",
            name: "чай",
            oldname: "чай",
            alteration: true,
            preview: "/products/subcat/subcat-9-2.png",
            allowedSlots: [13],
            images: {
              13: "/products/chay.png",
            },
          },
          {
            id: "black-coffee",
            name: "кофе черный",
            oldname: "кофе черный",
            alteration: true,
            preview: "/products/subcat/subcat-9-3.png",
            allowedSlots: [13],
            images: {
              13: "/products/cofe2.png",
            },
          },
          {
            id: "coffee-with-milk",
            name: "кофе с молоком",
            oldname: "кофе с молоком",
            alteration: true,
            preview: "/products/subcat/subcat-9-4.png",
            allowedSlots: [13],
            images: {
              13: "/products/cofe1.png",
            },
          },
          {
            id: "vegetable-juice",
            name: "овощной сок",
            oldname: "Овощной сок (1/2 стакана)",
            alteration: true,
            oldCategory: "Овощи",
            preview: "/products/subcat/subcat-9-5.png",
            allowedSlots: [14, 9],
            images: {
              9: "/products/yaichnica1.png",
              14: "/products/yaichnica1.png",
            },
          },
          {
            id: "fruit-juice",
            name: "фруктовый сок",
            oldname: "100% сок (1/2 стакана)",
            alteration: true,
            oldCategory: "Фрукты",
            preview: "/products/subcat/subcat-9-6.png",
            allowedSlots: [9, 14],
            images: {
              14: "/products/yaichnica1.png",
              9: "/products/yaichnica1.png",
            },
          },
          {
            id: "sweetened-drinks",
            name: "подслащенные напитки",
            oldname: "Подслащённые напитки (1 стакан)",
            alteration: true,
            oldCategory: "Сладости и добавленные сахара",
            preview: "/products/subcat/subcat-9-7.png",
            allowedSlots: [9, 14],
            images: {
              14: "/products/yaichnica1.png",
              9: "/products/yaichnica1.png",
            },
          },
        ],
      },
    ],
  }),

  getters: {
    // вернуть структуру дня (если synced=true и day!=1 — возвращаем копию day1)
    getDay: (state) => (dayId) => {
      if (state.week.synced && String(dayId) !== "1") {
        // возвращаем копию (не мутируем оригинал)
        return JSON.parse(JSON.stringify(state.week.days[1]));
      }
      if (!state.week.days[dayId]) {
        // лениво инициализируем
        state.week.days[dayId] = initialDay();
      }
      return state.week.days[dayId];
    },

    // получить meal объекта (breakfast/lunch/...)
    getMeal: (state, getters) => (dayId, mealId) => {
      const day = getters.getDay(dayId);
      return day?.meals?.[mealId] || null;
    },

    getActiveMealSimpleProducts:
      (state, getters) => (activeDay, activeMeal) => {
        const meal = getters.getMeal(activeDay, activeMeal);
        if (!meal) return [];

        return Object.entries(meal.plate || {})
          .filter(([_, product]) => product && product.subcatId)
          .map(([slotId, product]) => ({
            slotId: Number(slotId),
            subcatId: product.subcatId,
            weight: product.weight || null,
          }));
      },
    // найти категорию по id
    findCategory: (state) => (categoryId) => {
      return state.categories.find((c) => c.id === categoryId) || null;
    },

    // найти подкатегорию по id
    findSubcategory: (state) => (subcatId) => {
      for (const cat of state.categories) {
        const sub = cat.subcategories?.find((s) => s.id === subcatId);
        if (sub) return { category: cat, subcategory: sub };
      }
      return null;
    },

    // возвращает путь к картинке для subcategory и конкретного слота (если есть)
    getImageForSubcategory: (state, getters) => (subcatId, slotId) => {
      const found = getters.findSubcategory(subcatId);
      if (!found) return null;
      const { subcategory } = found;
      return subcategory.images?.[slotId] || null;
    },

    // возвращает первый свободный слот из allowedSlots для заданного дня/приёма
    getFirstFreeSlotForSubcategory:
      (state, getters) => (dayId, mealId, subcatId) => {
        const found = getters.findSubcategory(subcatId);
        if (!found) return null;
        const allowed = found.subcategory.allowedSlots || [];
        const meal = getters.getMeal(dayId, mealId);
        if (!meal) return null;
        // ищем первый allowed, который свободен
        for (const s of allowed) {
          if (!meal.usedSlots.includes(Number(s))) {
            return Number(s);
          }
        }
        return null; // нет свободного слота
      },
    isMealFilled: (state, getters) => (dayId, mealId) => {
      const meal = getters.getMeal(dayId, mealId);
      if (!meal) return false;
      // meal.plate может содержать много слотов (1..19) — проверяем, есть ли непустой
      return Object.values(meal.plate || {}).some((slot) => slot !== null);
    },
  },

  mutations: {
    // инициализация дня, если null
    INIT_DAY(state, dayId) {
      if (!state.week.days[dayId]) {
        state.week.days[dayId] = initialDay();
      }
    },
    // Добавление продукта в указанный слот
    ADD_PRODUCT(state, { dayId, mealId, subcatId, slotId, extra = {} }) {
      // гарантируем инициализацию дня
      if (!state.week.days[dayId]) state.week.days[dayId] = initialDay();
      const meal = state.week.days[dayId].meals[mealId];
      if (!meal) return;

      const weight = extra.weight || null;
      // если слот занят — перезаписываем? сейчас предотвращаем повторное добавление
      if (meal.usedSlots.includes(Number(slotId))) {
        console.warn(`Слот ${slotId} уже занят в day ${dayId} meal ${mealId}`);
        return;
      }

      // получаем картинку
      // ищем подкатегорию
      let image = null;
      for (const cat of state.categories) {
        const sub = cat.subcategories?.find((s) => s.id === subcatId);
        if (sub) {
          image = sub.images?.[slotId] || null;
          break;
        }
      }

      // помещаем объект продукта в слот
      meal.plate[slotId] = {
        subcatId,
        image,
        slot: Number(slotId),
        weight,
        ...extra,
      };
      meal.usedSlots.push(Number(slotId));

      // отметить день как кастомный (если это не day1 and week was synced)
      if (Number(dayId) !== 1) {
        state.week.days[dayId].custom = true;
        // если пользовалель изменил любой день — выключаем синхронизацию.
        state.week.synced = false;
      }
    },

    // Удалить продукт с позиции
    REMOVE_PRODUCT(state, { dayId, mealId, slotId }) {
      if (!state.week.days[dayId]) state.week.days[dayId] = initialDay();
      const meal = state.week.days[dayId].meals[mealId];
      if (!meal) return;
      meal.plate[slotId] = null;
      meal.usedSlots = meal.usedSlots.filter(
        (s) => Number(s) !== Number(slotId)
      );
    },

    // Копирование day1 на все дни (полная замена)
    FILL_WEEK_FROM_DAY1(state) {
      for (let i = 2; i <= 7; i++) {
        state.week.days[i] = JSON.parse(JSON.stringify(state.week.days[1]));
      }
      state.week.synced = true;
      // и помечаем, что остальные дни не custom
      for (let i = 2; i <= 7; i++) {
        state.week.days[i].custom = false;
      }
    },

    // принудительно выключить синхронизацию (если пользователь редактирует другие дни)
    DISABLE_SYNC(state) {
      state.week.synced = false;
    },

    // сброс всего
    RESET_ALL(state) {
      state.week = {
        synced: true,
        days: {
          1: initialDay(),
          2: null,
          3: null,
          4: null,
          5: null,
          6: null,
          7: null,
        },
      };
    },
  },

  actions: {
    // Добавить продукт — action принимает либо конкретный slotId, либо подставляет первый свободный из allowedSlots
    addProduct(
      { commit, getters },
      {
        dayId,
        mealId = "breakfast",
        subcatId,
        weight = null,
        slotId = null,
        extra = {},
      }
    ) {
      // ensure day inited
      commit("INIT_DAY", dayId);

      // если слот не указан — берём первый свободный подходящий
      let chosenSlot = slotId;
      if (!chosenSlot) {
        chosenSlot = getters.getFirstFreeSlotForSubcategory(
          dayId,
          mealId,
          subcatId
        );
      }

      if (!chosenSlot) {
        // нет места
        console.warn("Нет свободного слота для выбранной подкатегории");
        return { ok: false, reason: "no-slot" };
      }

      commit("ADD_PRODUCT", {
        dayId,
        mealId,
        subcatId,
        slotId: chosenSlot,
        extra: { weight },
      });

      return { ok: true, slot: chosenSlot };
    },

    removeProduct({ commit }, payload) {
      commit("REMOVE_PRODUCT", payload);
    },

    fillWeekFromDay1({ commit }) {
      commit("FILL_WEEK_FROM_DAY1");
    },

    disableSync({ commit }) {
      commit("DISABLE_SYNC");
    },

    resetAll({ commit }) {
      commit("RESET_ALL");
    },
  },
};
