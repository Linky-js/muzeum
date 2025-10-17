<script setup>
import { ref, defineProps, onMounted, computed, defineEmits, onBeforeUnmount } from "vue";
import gsap from 'gsap'
const props = defineProps({
  person: Object
})

const emit = defineEmits(['next'])
const stats = ref({})
const container = ref(null)
let animationFrame
const speed = 0.3
// Загружаем статистику
const getStat = async () => {
  try {
    const res = await fetch("/data.json")
    if (!res.ok) throw new Error("Ошибка HTTP " + res.status)
    const data = await res.json()
    stats.value = data
  } catch (err) {
    console.error("Ошибка загрузк:", err) 
  }
}

// Текущий возраст в неделях
const currentWeeks = computed(() => props.person.age * 52)

// Прогноз по региону и полу
const expectedWeeks = computed(() => {
  if (!stats.value || !props.person.gender) return 0
  let regionStats = '';
  if (!props.person.region.name || ['Луганская народная республика', 'Донецкая народная республика', 'Не выбирать'].includes(props.person.region.name)) {
    regionStats = stats.value['default']
  } else {
    regionStats = stats.value[props.person.region.name]
  }

  if (!regionStats || regionStats == '') return 0
  const avgYears = regionStats[props.person.gender] || 70 // fallback
  return Math.round(avgYears * 52)
})

// Количество блоков nickel (по 5 лет)
const nickelCount = computed(() => {
  const currentYears = props.person.age
  const expectedYears = Math.round(expectedWeeks.value / 52)

  // Берём максимум из возраста и прогноза
  const maxYears = Math.max(currentYears, expectedYears)

  // Округляем в большую сторону до кратного 5
  return Math.ceil(maxYears / 5)
})

// Функция для класса квадратика
const getWeekClass = (weekIndex) => {
  if (weekIndex < currentWeeks.value) return "active"
  if (weekIndex < expectedWeeks.value) return "future"
  return "extra"
}
const pluralizeYears = (num) => {
  num = Math.abs(num) % 100
  const n1 = num % 10
  if (num > 10 && num < 20) return "лет"
  if (n1 > 1 && n1 < 5) return "года"
  if (n1 === 1) return "года"
  return "лет"
}

const pluralizeYears2 = (num) => {
  num = Math.abs(num) % 100
  const n1 = num % 10
  if (num > 10 && num < 20) return "лет"
  if (n1 > 1 && n1 < 5) return "года"
  if (n1 === 1) return "год"
  return "лет"
}

onMounted(() => {
  getStat();
   setTimeout(() => {
    if (container.value) {
      gsap.to(container.value, {
        scrollTop: container.value.scrollHeight, // вниз
        duration: 3, // длительность анимации в секундах
        ease: "power1.inOut" // плавное замедление
      })
    }
  }, 2000)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <div class="wrapper">
    <aside class="left">
      <div class="left_top">
        <h4>
          Статистически ожидаемая <br />
          продолжительность жизни в <br />
          вашей когорте — около {{ Math.round(expectedWeeks / 52) }}
          {{ pluralizeYears(Math.round(expectedWeeks / 52)) }}.
        </h4>
        <div class="aside_description">
          {{ ['Луганская народная республика', 'Донецкая народная республика', 'Не выбирать'].includes(props.person.region.name) ? 'Оценка основана на средних по стране данных официальной статистики. Это усредненные данные, а не ваш индивидуальный прогноз.' : '*Оценка основана на данных официальной статистики об ожидаемой продолжительности жизни по полу и регионам. Это усредненные данные, а не ваш индивидуальный прогноз.' }}
          
        </div>
      </div>
      <div class="left_bottom">
        <div class="result_info">
          <div class="life_info">
            <b>Ваша жизнь в неделях:</b> <br />
            1 квадрат - 1 неделя жизни
          </div>
          <div class="life_numbers">
            <li class="currentLife">
              Текущий возраст <br />
              {{ currentWeeks }} недели - {{ props.person.age }} лет
            </li>
            <li class="expectedLife">
              Ожидаемая продолжительность жизни <br />
              {{ expectedWeeks }} недель - {{ Math.round(expectedWeeks / 52) }} {{ pluralizeYears2(Math.round(expectedWeeks / 52)) }}
            </li>
          </div>
        </div>
        <div @click="emit('next')" class="btn">Далее</div>
      </div>
    </aside>

    <div class="container" ref="container">
      <div class="result">
        <div class="nickels">
          <div v-for="(value, index) in nickelCount" :key="index" class="nickel">
            <div class="rows">
              <div v-for="r in 5" :key="r" class="row">
                <div v-for="w in 52" :key="w + r + index" class="week"
                  :class="getWeekClass((index * 260) + (r - 1) * 52 + (w - 1))"></div>
              </div>
            </div>
            <div class="years">{{ 5 * (index + 1) + ' лет' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;

  margin: 0 auto;
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  position: relative;
}

.container::-webkit-scrollbar {
  width: 0;
}
.wrapper {
  background: #fff;
  padding: 1.75rem;
  display: flex;
  gap: 10rem;
}

.wrapper * {
  color: #000;
}



.left {
  z-index: 2;
  height: calc(100% - 3.5rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 60.43rem;
  flex-shrink: 0;
}

.left h3 {
  color: #0E1117;
  font-family: "TT Hoves";
  font-size: 6rem;
  font-weight: 700;
  letter-spacing: -0.04rem;
}

.left h4 {
  color: #445371;
  font-family: "TT Hoves";
  font-size: 4rem;
  font-style: normal;
  font-weight: 600;
  line-height: 120%;
  /* 2.4rem */
  letter-spacing: -0.04rem;
}

.aside_description {
  color: #445371;
  font-family: "TT Hoves";
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.02rem;
}

.life_info {
  color: #000;
  font-family: "TT Hoves";
  font-size: 3rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.02rem;
}

.left .etap {
  font-size: 3.25rem;
  font-weight: 500;
}

.step1 {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: center;
  align-items: center;
}

.step1 h1 {
  color: #0E1117;
  font-size: 5.5425rem;
  font-weight: 700;
  letter-spacing: -0.11088rem;
}

.description {
  color: #000;
  font-size: 3.5rem;
  font-weight: 700;
  opacity: 0.5;
  max-width: 39.9875rem;
}

.qr-code {
  margin-top: 1rem;
  border-radius: 1.25rem;
  background: #000;
  width: 17.6875rem;
  height: 17.6875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.qr-code img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 1.25rem;
}

.step {
  height: 100%;
  width: 100%;
  max-width: 58.0625rem;
  border-radius: 1.875rem;
  background: rgba(0, 0, 0, 0.03);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
}

.quiz {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.label {
  color: #445371;
  font-family: "TT Hoves";
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.03rem;
}

.label:has(small) {
  line-height: 100%;
}

.label small {
  color: #445371;
  font-family: "TT Hoves";
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.02rem;
  opacity: 0.5;
}

.answers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.answersColumn {
  flex-direction: column;
  width: 15.1875rem;
}

.answersColumn .answer {
  width: 100%;
}

.answer {
  display: flex;
  height: var(--button-xl-height, 3.5rem);
  padding: 0 var(--button-xl-padding-right, 1.25rem) 0 var(--button-xl-padding-left, 1.25rem);
  justify-content: center;
  align-items: center;
  gap: var(--button-xl-spacing, 0.25rem);
  border-radius: var(--button-xl-border-radius, 0.375rem);

  background: var(--button-secondary-neutral-bg-color-default, rgba(68, 83, 113, 0.10));
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.00) inset;
  text-align: center;
  font-variant-numeric: lining-nums tabular-nums stacked-fractions;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: "TT Hoves";
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.5rem;
  color: #445371;
}

.answer:has(input:checked) {
  border-radius: var(--button-xl-border-radius, 0.375rem);

  background: var(--button-primary-neutral-bg-color-default, #445371);
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.00) inset;
  color: var(--button-primary-neutral-label-color-default, #FFF);

  /* 150% */
}

.answer input {
  display: none;
}

.input_quiz {
  border-radius: var(--input-l-border-radius, 0.375rem);
  border: 2px solid var(--input-primary-border-color-default, rgba(68, 83, 113, 0.15));
  background: var(--input-primary-bg-color-default, #FFF);
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.00) inset;
  color: var(--input-primary-label-color-default, #445371);
  font-variant-numeric: lining-nums tabular-nums stacked-fractions;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: "TT Hoves";
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5rem;
  padding: 0.75rem;
  width: 17.5rem;
}

.input_wrap {
  position: relative;
  width: 17.5rem;
}

.custom_list {
  position: absolute;
  top: 100%;
  left: 0;
  padding: 0.5rem;
  border-radius: var(--dropdownmenu-m-border-radius, 0.375rem);
  border: 0.001px solid var(--dropdownmenu-primary-border-color, rgba(255, 255, 255, 0.00));
  background: var(--dropdownmenu-primary-bg-color, #FFF);
  box-shadow: 0 0 32px 0 rgba(68, 83, 113, 0.10), 0 32px 32px 0 rgba(68, 83, 113, 0.05);
  width: 17.5rem;
  height: 13rem;
  overflow-y: scroll;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.region {
  padding: 0.5rem;
  color: var(--dropdownmenu-primary-itemvalue-color-default, #0E1117);
  font-family: "TT Hoves";
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem;
  /* 142.857% */
  cursor: pointer;
}

.region.active {
  background: var(--dropdownmenu-primary-itemvalue-bg-color-default, rgba(68, 83, 113, 0.05));
  border-radius: var(--dropdownmenu-m-border-radius, 0.375rem);
}

.btn {
  display: flex;
  min-width: 3.5rem;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 0.375rem;
  border: 2px solid rgba(255, 255, 255, 0.00);
  background: #05F;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.00) inset;
  color: #FFF;
  text-align: center;
  font-family: "TT Hoves";
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.5rem;
  /* 150% */
  padding: 1rem 1.5rem;
}

.result {
  width: 100%;
}

.nickels {
  display: flex;
  flex-direction: column;
  gap: 2.29rem;
  margin: 0 auto;
  width: 100%;
}

.nickel {
  display: flex;
  align-items: flex-end;
  gap: 3.08rem;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 0.56rem;
  row-gap: 1rem;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 0.56rem;

}

.week {
  width: 2.0345rem;
  height: 2.0345rem;
  flex-shrink: 0;
  border: 0.471px solid #000;
  background: #FFF;
}

.week.active {
  background: #4cc9f0;
  /* голубой */
}

.week.future {
  background: #ccc;
  /* серый */
}

.week.extra {
  background: #f2f2f2;
  /* бледный */
}

.years {
  color: #000;
  font-family: "TT Hoves";
  font-size: 1.774rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.0355rem;
  white-space: nowrap;
}

.wrapper .btn {
  color: #fff;
  margin-top: 1.56rem;
}

.descriptionStat {
  color: #000;
  font-family: "TT Hoves";
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.015rem;
  margin-top: 5rem;
  opacity: 0.52;
}
</style>
