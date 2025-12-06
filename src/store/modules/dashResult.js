import dashData from '@/../public/datas/dash.json'

export default {
  namespaced: true,

  state: () => ({
    result: null, // финальные расчёты
    TDEE: null,
    BMR: null,
  }),

  getters: {
    getResult(state) {
      return state.result
    },
    getTDEE(state) {
      return state.TDEE
    },
    getBMR(state) {
      return state.BMR
    },
  },

  mutations: {
    SET_RESULT(state, payload) {
      state.result = payload
    },
    SET_TDEE(state, payload) {
      state.TDEE = payload
    },
    SET_BMR(state, payload) {
      state.BMR = payload
    },
  },

  actions: {
    /**
     * Основное действие — пересчитать DASH
     */
    calculateDash({ rootState, state, commit }, currentDayIndex) {
      const day = rootState.diet.week.days[currentDayIndex]
      const categories = rootState.diet.categories

      const meals = ['breakfast', 'lunch', 'dinner']

      let totalCalories = 0
      let totalSodium = 0

      const dashCategories = {}

      for (const meal of meals) {
        const plate = day.meals[meal].plate

        for (const slotKey in plate) {
          const slot = plate[slotKey]
          if (!slot) continue

          const subcatId = slot.subcatId
          const weight = slot.weight ?? 0

          const { dashCategoryName, dashSubcatName } = findDashCategoryData(categories, subcatId)

          if (!dashSubcatName) continue

          const dashProduct = dashData.find((p) => p.subcategory === dashSubcatName)

          if (!dashProduct) continue
          console.log(weight);
          
          const coeff = weight / 100

          const portions = coeff * Number(dashProduct.porc100g)
          const calories = coeff * Number(dashProduct.kkal)
          const sodium = coeff * Number(dashProduct.nat)

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

      const finalCategories = normalizeDashCategories(dashCategories, state.TDEE.TDEE)

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
  console.log('categories', categories)
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      if (sub.id === subcatId) {
        return {
          dashCategoryName: sub.oldCategory ? sub.oldCategory : cat.name,
          dashSubcatName: sub.alteration ? sub.oldname : sub.name,
        }
      }
    }
  }
  return { dashCategoryName: null, dashSubcatName: null }
}

/**
 * Проставляем проценты выполнения нормы по категорийным порциям
 */
function normalizeDashCategories(cats, TDEE) {
  const DASH_LIMITS = {
    'Овощи': Math.round((TDEE * 4.5) / 2000),
    'Фрукты': Math.round((TDEE * 4.5) / 2000),
    'Зерновые': Math.round((TDEE * 7) / 2000),
    'Нежирное мясо, птица и рыба': Math.round((TDEE * 2) / 2000),
    'Обезжиренные/ низкожирные молочные': Math.round((TDEE * 2.5) / 2000),
    'Жиры и масла': Math.round((TDEE * 2.5) / 2000),
    'Сладости и добавленные сахара': Math.round((TDEE * 0.71) / 2000),
    'Орехи, семена и бобовые': Math.round((TDEE * 0.64) / 2000),
  }

  const out = {}

  // перебираем ВСЕ существующие категории
  for (const categoryName in DASH_LIMITS) {
    const portions = cats[categoryName]?.portions ?? 0
    const norm = DASH_LIMITS[categoryName]

    out[categoryName] = {
      portions,
      percent: Math.round((portions / norm) * 100),
    }
  }

  return out
}

