// store/modules/diet.js
// Vuex модуль для интерактива "Тарелка / неделя".
// Фокус сейчас на слотах 1..4 (тарелка). Остальные слоты оставлены в конфиге для будущего расширения.
import categoriesJson from '@/data/categories.json'

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
  items: [
    // {
    //   id,           // уникальный id (uuid или timestamp)
    //   subcatId,
    //   weight,
    //   slotId: null | number
    // }
  ],
})

const initialDay = () => ({
  meals: {
    breakfast: initialMeal(),
    lunch: initialMeal(),
    dinner: initialMeal(),
  },
  // флаг: пользователь изменял этот день отдельно (если true — не синхронизируем с day1)
  custom: false,
})

export default {
  namespaced: true,

  state: () => ({
    // Конфигурация слотов: указываем все слоты (1..19) но отметим, что
    // текучая работа ведётся с 1..4 (тарелка).
    slots: [
      { id: 1, name: 'plate-1' },
      { id: 2, name: 'plate-2' },
      { id: 3, name: 'plate-3' },
      { id: 4, name: 'plate-4' },
      { id: 5, name: 'board-dry-1' },
      { id: 6, name: 'board-dry-2' },
      { id: 7, name: 'board-dry-3' },
      { id: 8, name: 'board-dry-4' },
      { id: 9, name: 'glass-slot' },
      { id: 10, name: 'yogurt-slot' },
      { id: 11, name: 'plate-type-1' },
      { id: 12, name: 'plate-type-2' },
      { id: 13, name: 'cup' },
      { id: 14, name: 'tumbler' },
      { id: 15, name: 'reserved-15' },
      { id: 16, name: 'sauce-1' },
      { id: 17, name: 'sauce-2' },
      { id: 18, name: 'sauce-3' },
      { id: 19, name: 'sauce-4' },
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
    categories: [...categoriesJson],
  }),

  getters: {
    // вернуть структуру дня (если synced=true и day!=1 — возвращаем копию day1)
    getDay: (state) => (dayId) => {
      if (state.week.synced && String(dayId) !== '1') {
        // возвращаем копию (не мутируем оригинал)
        return JSON.parse(JSON.stringify(state.week.days[1]))
      }
      if (!state.week.days[dayId]) {
        // лениво инициализируем
        state.week.days[dayId] = initialDay()
      }
      return state.week.days[dayId]
    },

    // получить meal объекта (breakfast/lunch/...)
    getMeal: (state, getters) => (dayId, mealId) => {
      const day = getters.getDay(dayId)
      return day?.meals?.[mealId] || null
    },

    getActiveMealSimpleProducts: (state, getters) => (activeDay, activeMeal) => {
      const meal = getters.getMeal(activeDay, activeMeal)
      if (!meal) return []

      return Object.entries(meal.plate || {})
        .filter(([_, product]) => product && product.subcatId)
        .map(([slotId, product]) => ({
          slotId: Number(slotId),
          subcatId: product.subcatId,
          weight: product.weight || null,
        }))
    },
    // найти категорию по id
    findCategory: (state) => (categoryId) => {
      return state.categories.find((c) => c.id === categoryId) || null
    },

    // найти подкатегорию по id
    findSubcategory: (state) => (subcatId) => {
      for (const cat of state.categories) {
        const sub = cat.subcategories?.find((s) => s.id === subcatId)
        if (sub) return { category: cat, subcategory: sub }
      }
      return null
    },

    // возвращает путь к картинке для subcategory и конкретного слота (если есть)
    getImageForSubcategory: (state, getters) => (subcatId, slotId) => {
      const found = getters.findSubcategory(subcatId)
      if (!found) return null
      const { subcategory } = found
      return subcategory.images?.[slotId] || null
    },

    // возвращает первый свободный слот из allowedSlots для заданного дня/приёма
    getFirstFreeSlotForSubcategory: (state, getters) => (dayId, mealId, subcatId) => {
      const found = getters.findSubcategory(subcatId)
      if (!found) return null
      const allowed = found.subcategory.allowedSlots || []
      const meal = getters.getMeal(dayId, mealId)
      if (!meal) return null
      // ищем первый allowed, который свободен
      for (const s of allowed) {
        if (!meal.usedSlots.includes(Number(s))) {
          return Number(s)
        }
      }
      return null // нет свободного слота
    },
    isMealFilled: (state, getters) => (dayId, mealId) => {
      const meal = getters.getMeal(dayId, mealId)
      if (!meal) return false
      // meal.plate может содержать много слотов (1..19) — проверяем, есть ли непустой
      return Object.values(meal.plate || {}).some((slot) => slot !== null)
    },
  },

  mutations: {
    // инициализация дня, если null
    INIT_DAY(state, dayId) {
      if (!state.week.days[dayId]) {
        state.week.days[dayId] = initialDay()
      }
    },
    // Добавление продукта в указанный слот
    ADD_PRODUCT(state, { dayId, mealId, subcatId, slotId, extra = {} }) {
      // гарантируем инициализацию дня
      if (!state.week.days[dayId]) state.week.days[dayId] = initialDay()
      const meal = state.week.days[dayId].meals[mealId]
      if (!meal) return

      const weight = extra.weight || null
      // если слот занят — перезаписываем? сейчас предотвращаем повторное добавление
      if (meal.usedSlots.includes(Number(slotId))) {
        console.warn(`Слот ${slotId} уже занят в day ${dayId} meal ${mealId}`)
        return
      }

      // получаем картинку
      // ищем подкатегорию
      let image = null
      for (const cat of state.categories) {
        const sub = cat.subcategories?.find((s) => s.id === subcatId)
        if (sub) {
          image = sub.images?.[slotId] || null
          break
        }
      }

      // помещаем объект продукта в слот
      meal.plate[slotId] = {
        subcatId,
        image,
        slot: Number(slotId),
        weight,
        ...extra,
      }
      meal.usedSlots.push(Number(slotId))

      // отметить день как кастомный (если это не day1 and week was synced)
      if (Number(dayId) !== 1) {
        state.week.days[dayId].custom = true
        // если пользовалель изменил любой день — выключаем синхронизацию.
        state.week.synced = false
      }
    },
    REMOVE_ITEM(state, { dayId, mealId, itemId }) {
      const meal = state.week.days[dayId].meals[mealId]

      const idx = meal.items.findIndex((i) => i.id === itemId)
      if (idx === -1) return

      const item = meal.items[idx]

      if (item.slotId) {
        meal.plate[item.slotId] = null
        meal.usedSlots = meal.usedSlots.filter((s) => s !== item.slotId)
      }

      meal.items.splice(idx, 1)
    },

    // Удалить продукт с позиции
    REMOVE_PRODUCT(state, { dayId, mealId, slotId }) {
      if (!state.week.days[dayId]) state.week.days[dayId] = initialDay()
      const meal = state.week.days[dayId].meals[mealId]
      if (!meal) return
      meal.plate[slotId] = null
      meal.usedSlots = meal.usedSlots.filter((s) => Number(s) !== Number(slotId))
    },

    // Копирование day1 на все дни (полная замена)
    FILL_WEEK_FROM_DAY1(state) {
      for (let i = 2; i <= 7; i++) {
        state.week.days[i] = JSON.parse(JSON.stringify(state.week.days[1]))
      }
      state.week.synced = true
      // и помечаем, что остальные дни не custom
      for (let i = 2; i <= 7; i++) {
        state.week.days[i].custom = false
      }
    },

    // принудительно выключить синхронизацию (если пользователь редактирует другие дни)
    DISABLE_SYNC(state) {
      state.week.synced = false
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
      }
    },
    ADD_ITEM(state, { dayId, mealId, subcatId, weight, slotId }) {
      const meal = state.week.days[dayId].meals[mealId]

      const id = Date.now() + Math.random()

      const item = {
        id,
        subcatId,
        weight,
        slotId,
      }

      meal.items.push(item)

      // ⬇️ если слот есть — визуально кладём
      if (slotId) {
        let image = null
      for (const cat of state.categories) {
        const sub = cat.subcategories?.find((s) => s.id === subcatId)
        if (sub) {
          image = sub.images?.[slotId] || null
          break
        }
      }

        meal.plate[slotId] = {
          subcatId,
          image,
          slot: slotId,
          weight,
          itemId: id,
        }

        meal.usedSlots.push(slotId)
      }
    },
  },

  actions: {
    // Добавить продукт — action принимает либо конкретный slotId, либо подставляет первый свободный из allowedSlots
    addProduct({ commit, getters }, { dayId, mealId, subcatId, weight }) {
      commit('INIT_DAY', dayId)

      const slotId = getters.getFirstFreeSlotForSubcategory(dayId, mealId, subcatId) || null

      commit('ADD_ITEM', {
        dayId,
        mealId,
        subcatId,
        weight,
        slotId,
      })

      return { ok: true, placed: !!slotId }
    },

    removeProduct({ commit }, payload) {
      commit('REMOVE_ITEM', payload)
    },

    fillWeekFromDay1({ commit }) {
      commit('FILL_WEEK_FROM_DAY1')
    },

    disableSync({ commit }) {
      commit('DISABLE_SYNC')
    },

    resetAll({ commit }) {
      commit('RESET_ALL')
    },
  },
}
