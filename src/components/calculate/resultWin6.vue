<script setup>
import { defineEmits, defineProps, ref, computed } from "vue";
const emit = defineEmits(['next'])

const props = defineProps({
  person: Object
})

const person2 = ref({
  age: 32,
  gender: "Мужчины", // "Мужчины" / "Женщины"
  region: { id: null, name: "Республика Татарстан" },
  rost: 180,
  ves: 60,
  taliya: "<94 см",
  fizActive: "≥4 часа/неделю",
  yagody: "Да",
  arteriya: "Нет",
  sahar: "Нет",
  diabet: "Нет",
  priem: "Нет",
  diabetFamily: "Нет",
})

// --- BMI ---
function calculateBMI(weight, heightCm) {
  const heightM = heightCm / 100
  if (!weight || !heightM) return null
  return (weight / (heightM * heightM)).toFixed(1)
}

// --- Подсчёт баллов ---
const balls = computed(() => {
  let sum = 0
  const p = props.person

  // возраст
  if (p.age < 45) sum += 0
  else if (p.age <= 54) sum += 2
  else if (p.age <= 64) sum += 3
  else sum += 4

  // ИМТ
  const bmi = calculateBMI(p.ves, p.rost)
  if (bmi < 25) sum += 0
  else if (bmi < 30) sum += 1
  else sum += 3

  // талия
  if (p.gender === "Женщины") {
    if (p.taliya.includes("<80")) sum += 0
    else if (p.taliya.includes("80-88")) sum += 3
    else if (p.taliya.includes(">88")) sum += 4
  } else {
    if (p.taliya.includes("<94")) sum += 0
    else if (p.taliya.includes("94") && p.taliya.includes("102")) sum += 3
    else if (p.taliya.includes("≥102") || p.taliya.includes(">102")) sum += 4
  }

  // физическая активность
  if (p.fizActive.includes("<4")) sum += 2

  // фрукты/овощи
  if (p.yagody === "Нет") sum += 1

  // сахар в анамнезе
  if (p.sahar === "Да") sum += 5

  // приём препаратов
  if (p.priem === "Да") sum += 2

  // семейный анамнез
  if (p.diabetFamily.includes("первой")) sum += 5
  else if (p.diabetFamily.includes("второй")) sum += 3

  return sum
})

// --- Категория риска ---
const risk = computed(() => {
  const b = balls.value
  if (b <= 3) return "Очень низкий"
  if (b <= 8) return "Низкий"
  if (b <= 12) return "Средний"
  if (b <= 20) return "Высокий"
  return "Очень высокий"
})

// --- Вероятность в % ---
const percent = computed(() => {
  const b = balls.value
  const g = props.person.gender
  if (b <= 3) return g === "Мужчины" ? 0.3 : 0.1
  if (b <= 8) return g === "Мужчины" ? 0.8 : 0.4
  if (b <= 12) return g === "Мужчины" ? 2.6 : 2.2
  if (b <= 20) return g === "Мужчины" ? 23.1 : 14.1
  return 50
})
</script>

<template>
  <div class="wrapper">
    <aside class="left">
      <div class="left_top">
        <h3>Вывод</h3>
        <p class="balls">Набрано баллов: {{ balls }}</p>
      </div>
    </aside>
    <div class="container">
      <div class="diabet__info">
        <div class="diabet__head">
          Для людей с подобным профилем вероятность развития диабета в течение 10 лет - {{ percent }}%
        </div>
        <table class="table">
          <thead class="table__head">
            <tr>
              <th class="table__item"><span>Баллы</span></th>
              <th class="table__item"><span>Уровень риска</span></th>
              <th v-if="props.person.gender === 'Мужчины'" class="table__item"><span>10-летний риск развития СД 2-го типа (%)</span></th>
              <th v-if="props.person.gender === 'Женщины'" class="table__item"><span>10-летний риск развития СД 2-го типа (%)</span></th>
            </tr>
          </thead>
          <tbody class="table__body">
            <tr class="table__row">
              <td class="table__item"><span>0-3</span></td>
              <td class="table__item"><span>Очень низкий</span></td>
              <td v-if="props.person.gender === 'Мужчины'" class="table__item"><span>0,3%</span></td>
              <td v-if="props.person.gender === 'Женщины'" class="table__item"><span>0,1%</span></td>
            </tr>
            <tr class="table__row">
              <td class="table__item"><span>4-8</span></td>
              <td class="table__item"><span>Низкий</span></td>
              <td v-if="props.person.gender === 'Мужчины'" class="table__item"><span>0,8%</span></td>
              <td v-if="props.person.gender === 'Женщины'" class="table__item"><span>0,4%</span></td>
            </tr>
            <tr class="table__row">
              <td class="table__item"><span>9-12</span></td>
              <td class="table__item"><span>Средний</span></td>
              <td v-if="props.person.gender === 'Мужчины'" class="table__item"><span>2,6%</span></td>
              <td v-if="props.person.gender === 'Женщины'" class="table__item"><span>2,2%</span></td>
            </tr>
            <tr class="table__row">
              <td class="table__item"><span>13-20</span></td>
              <td class="table__item"><span>Высокий</span></td>
              <td v-if="props.person.gender === 'Мужчины'" class="table__item"><span>23,1%</span></td>
              <td v-if="props.person.gender === 'Женщины'" class="table__item"><span>14,1%</span></td>
            </tr>
            <tr class="table__row">
              <td class="table__item"><span>&gt;21</span></td>
              <td class="table__item"><span>Очень высокий</span></td>
              <td v-if="props.person.gender === 'Мужчины'" class="table__item"><span>50%</span></td>
              <td v-if="props.person.gender === 'Женщины'" class="table__item"><span>50%</span></td>
            </tr>
          </tbody>
        </table>

      </div>
      <div @click="emit('next')" class="btn">Далее</div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  background: #fff;
  padding: 1.75rem;
  display: flex;
  gap: 10rem;
}

.left {
  position: absolute;
  top: 1.75rem;
  left: 1.75rem;
  z-index: 2;
  height: calc(100% - 3.5rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.container {
  width: 100%;
  max-width: 112.24rem;
  margin: 0 auto;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.conclusion {
  height: max-content;
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: auto 0;
  max-width: 46.5rem;
}

.btn {
  margin-top: auto;
  align-self: center;
  width: 26.0625rem;
}

.conclusion_item {

  padding: 2rem;
  border-radius: 1.875rem;
  background: rgba(0, 0, 0, 0.03);
}

.diabet__info {
  display: flex;
  flex-direction: column;
  gap: 3.69375rem;
}

.diabet__head {
  color: #445371;
  text-align: center;
  font-family: Manrope;
  font-size: 3.875rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.0775rem;
  max-width: 72.4375rem;
}




.table__head span {
  color: #000;
  font-family: Manrope;
  font-size: 0.72044rem;
  font-style: normal;
  font-weight: 600;
  line-height: 130%;
  text-align: left;
}

.table__body span {
  color: #000;
  font-family: Manrope;
  font-size: 0.92044rem;
  font-style: normal;
  font-weight: 400;
  line-height: 130%;
  /* 1.19656rem */
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

/* Заголовок */
.table__head {
  background-color: #f5f5f5;
}

.table__head th {
  padding: 12px 8px;
  border: 1px solid #ccc;
  font-weight: 600;
}

/* Тело таблицы */
.table__body td {
  padding: 10px 8px;
  border: 1px solid #ccc;
}

/* Ряд */
.table__row:nth-child(even) {

  /* лёгкая зебра */
}

/* Общие ячейки */
.table__item span {
  display: block;
  font-size: 14px;
  color: #333;
}

/* Визуальное выделение первой колонки (Баллы) */
.table__body td:first-child {
  font-weight: 600;
  color: #000;
}

/* При наведении подсветка */
.table__row:hover {
  background-color: #f0f8ff;
}

th,
td {
  width: 18.8rem;
}
</style>
