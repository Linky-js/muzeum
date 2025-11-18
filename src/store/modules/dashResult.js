import dashData from '@/../public/datas/dash.json'

export default {
  namespaced: true,

  state: () => ({
    result: null, // финальные расчёты
  }),

  getters: {
    getResult(state) {
      return state.result
    },
  },

  mutations: {
    SET_RESULT(state, payload) {
      state.result = payload
    },
  },

  actions: {
    /**
     * Основное действие — пересчитать DASH
     */
    calculateDash({ rootState, commit }, currentDayIndex) {
      const day = rootState.diet.week.days[currentDayIndex]
      const categories = rootState.diet.categories
      console.log('1categories', categories)
      console.log('2day', day)

      const meals = ['breakfast', 'lunch', 'dinner', 'snack']

      let totalCalories = 0
      let totalSodium = 0

      // структура для категорий DASH
      const dashCategories = {}

      // перебор приёмов пищи
      for (const meal of meals) {
        const plate = day.meals[meal].plate

        for (const slotKey in plate) {
          const slot = plate[slotKey]
          if (!slot) continue // пустой слот пропускаем

          const subcatId = slot.subcatId
          const weight = slot.weight ?? 0

          // Ищем субкатегорию в store.state.diet.categories
          const { dashCategoryName, dashSubcatName } =
            findDashCategoryData(categories, subcatId);

          if (!dashSubcatName) continue
          // Ищем соответствующий продукт в dash.json
          const dashProduct = dashData.find((p) => p.subcategory === dashSubcatName)

          if (!dashProduct) continue

          // Расчёты
          const coeff = weight / 100

          const portions = coeff * Number(dashProduct.porc100g)
          const calories = coeff * Number(dashProduct.kkal)
          const sodium = coeff * Number(dashProduct.nat)

          // накапливаем
          totalCalories += calories
          totalSodium += sodium

          if (!dashCategories[dashCategoryName]) {
            dashCategories[dashCategoryName] = {
              portions: 0,
            }
          }

          dashCategories[dashCategoryName].portions += portions
        }
      }

      // добавляем проценты выполнения нормы
      const finalCategories = normalizeDashCategories(dashCategories)

      commit('SET_RESULT', {
        totalCalories,
        totalSodium,
        categories: finalCategories,
      })
    },
  },
}

// Ищем подкатегорию
function findDashCategoryData(categories, subcatId) {
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      if (sub.id === subcatId) {
        return {
          dashCategoryName: cat.name,
          dashSubcatName: sub.alteration ? sub.oldname : sub.name,
        };
      }
    }
  }
  return { dashCategoryName: null, dashSubcatName: null };
}

/**
 * Проставляем проценты выполнения нормы по категорийным порциям
 */
function normalizeDashCategories(cats) {
  // нормы DASH (примерные)
  const DASH_LIMITS = {
    Овощи: 4,
    Фрукты: 4,
    Зерновые: 6,
    'Нежирное мясо, птица и рыба': 2,
    'Обезжиренные / низкожирные молочные': 2,
    'Жиры и масла': 2,
    Сладости: 1,
    'Орехи, семена и бобовые': 4,
  }

  const out = {}

  for (const cat in cats) {
    const portions = cats[cat].portions
    const norm = DASH_LIMITS[cat] ?? 1

    out[cat] = {
      portions,
      percent: Math.min(Math.round((portions / norm) * 100), 150),
    }
  }

  return out
}
