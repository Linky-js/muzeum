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
    5: null, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null,
    13: null, 14: null, 15: null, 16: null,
    17: null, 18: null, 19: null
  },
  usedSlots: [] // список занятых id слотов
});

const initialDay = () => ({
  meals: {
    breakfast: initialMeal(),
    lunch: initialMeal(),
    dinner: initialMeal(),
    snack: initialMeal()
  },
  // флаг: пользователь изменял этот день отдельно (если true — не синхронизируем с day1)
  custom: false
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
        7: null
      }
    },

    // Категории -> подкатегории. Подкатегория хранит:
    // id, name, allowedSlots (куда её можно ставить), images: map slot->path
    categories: [
      {
        id: "grains",
        name: "Зерновые",
        subcategories: [
          {
            id: "grain_snacks",
            name: "зерновые снеки",
            allowedSlots: [1, 2, 3, 4, 5, 6, 7, 8],
            // images: ключ — номер слота; значение — путь к картинке для этого слота
            images: {
              1: "/products/grain_snacks1.png",
              2: "/products/grain_snacks2.png",
              3: "/products/grain_snacks3.png",
              4: "/products/grain_snacks4.png"
            }
          },
          {
            id: "grains_refined",
            name: "злаки рафинир.варен.",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/zlaki_raf1.png",
              2: "/products/zlaki_raf2.png",
              3: "/products/zlaki_raf3.png",
              4: "/products/zlaki_raf4.png"
            }
          },
          {
            id: "grains_whole",
            name: "злаки цельнозерновые",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/zlaki_celno1.png",
              2: "/products/zlaki_celno2.png",
              3: "/products/zlaki_celno3.png",
              4: "/products/zlaki_celno4.png"
            }
          },
          {
            id: "popcorn",
            name: "попкорн несоленый",
            allowedSlots: [1, 2, 3, 4, 5, 6, 7, 8],
            images: {
              1: "/products/popcorn1.png",
              2: "/products/popcorn2.png",
              3: "/products/popcorn3.png",
              4: "/products/popcorn4.png"
            }
          },
          {
            id: "muesli",
            name: "Сухие хлопья/мюсли",
            allowedSlots: [5, 6, 7, 8],
            images: {
              5: "/products/muesli5.png",
              6: "/products/muesli6.png",
              7: "/products/muesli7.png",
              8: "/products/muesli8.png"
            }
          },
          {
            id: "bread_white",
            name: "Хлеб белый",
            allowedSlots: [5, 6, 7, 8],
            images: {
              5: "/products/bread_white5.png",
              6: "/products/bread_white6.png",
              7: "/products/bread_white7.png",
              8: "/products/bread_white8.png"
            }
          },
          {
            id: "bread_whole",
            name: "Хлеб цельнозерновой",
            allowedSlots: [5, 6, 7, 8],
            images: {
              5: "/products/bread_whole5.png",
              6: "/products/bread_whole6.png",
              7: "/products/bread_whole7.png",
              8: "/products/bread_whole8.png"
            }
          }
        ]
      },

      {
        id: "meat_fish",
        name: "Мясо, птица, рыба",
        subcategories: [
          {
            id: "white_meat",
            name: "белое мясо",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/kurica1.png",
              2: "/products/kurica2.png",
              3: "/products/kurica3.png",
              4: "/products/kurica4.png"
            }
          },
          {
            id: "red_meat",
            name: "красное мясо",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/bife1.png",
              2: "/products/bife2.png",
              3: "/products/bife3.png",
              4: "/products/bife4.png"
            }
          },
          {
            id: "seafood",
            name: "морепродукты",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/sea1.png",
              2: "/products/sea2.png",
              3: "/products/sea3.png",
              4: "/products/sea4.png"
            }
          },
          {
            id: "fish",
            name: "рыба",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/fish1.png",
              2: "/products/fish2.png",
              3: "/products/fish3.png",
              4: "/products/fish4.png"
            }
          },
          {
            id: "yaichnicas",
            name: "яйца",
            allowedSlots: [1, 2, 3, 4],
            images: {
              1: "/products/yaichnica1.png",
              2: "/products/yaichnica2.png",
              3: "/products/yaichnica3.png",
              4: "/products/yaichnica4.png"
            }
          }
        ]
      },

      // Далее можно добавить "Овощи", "Фрукты", "Молочные и яйца" и др. — пока оставлю пустыми шаблонами
      {
        id: "vegetables",
        name: "Овощи",
        subcategories: [
          // добавить позже
        ]
      },
      {
        id: "fruits",
        name: "Фрукты",
        subcategories: []
      },
      {
        id: "dairy",
        name: "Молочные и яйца",
        subcategories: []
      },
      {
        id: "nuts",
        name: "Орехи, семена и бобовые",
        subcategories: []
      },
      {
        id: "fats",
        name: "Жиры и масла (+ снеки)",
        subcategories: []
      },
      {
        id: "sweets",
        name: "Сладости (+ эклер)",
        subcategories: []
      },
      {
        id: "drinks",
        name: "Напитки",
        subcategories: []
      }
    ]

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

    // найти категорию по id
    findCategory: (state) => (categoryId) => {
      return state.categories.find(c => c.id === categoryId) || null;
    },

    // найти подкатегорию по id
    findSubcategory: (state) => (subcatId) => {
      for (const cat of state.categories) {
        const sub = cat.subcategories?.find(s => s.id === subcatId);
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
    getFirstFreeSlotForSubcategory: (state, getters) => (dayId, mealId, subcatId) => {
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
      return Object.values(meal.plate || {}).some(slot => slot !== null);
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
        const sub = cat.subcategories?.find(s => s.id === subcatId);
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
        ...extra
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
      meal.usedSlots = meal.usedSlots.filter(s => Number(s) !== Number(slotId));
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
          2: null, 3: null, 4: null, 5: null, 6: null, 7: null
        }
      };
    }
  },

  actions: {
    // Добавить продукт — action принимает либо конкретный slotId, либо подставляет первый свободный из allowedSlots
    addProduct({ commit, getters }, { dayId, mealId = 'breakfast', subcatId, weight = null, slotId = null, extra = {} }) {
      // ensure day inited
      commit('INIT_DAY', dayId);

      // если слот не указан — берём первый свободный подходящий
      let chosenSlot = slotId;
      if (!chosenSlot) {
        chosenSlot = getters.getFirstFreeSlotForSubcategory(dayId, mealId, subcatId);
      }

      if (!chosenSlot) {
        // нет места
        console.warn('Нет свободного слота для выбранной подкатегории');
        return { ok: false, reason: 'no-slot' };
      }

      commit('ADD_PRODUCT', { dayId, mealId, subcatId, slotId: chosenSlot, extra: { weight } });

      return { ok: true, slot: chosenSlot };
    },

    removeProduct({ commit }, payload) {
      commit('REMOVE_PRODUCT', payload);
    },

    fillWeekFromDay1({ commit }) {
      commit('FILL_WEEK_FROM_DAY1');
    },

    disableSync({ commit }) {
      commit('DISABLE_SYNC');
    },

    resetAll({ commit }) {
      commit('RESET_ALL');
    }
  }
};
