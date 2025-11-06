<script setup>
import { defineEmits, defineProps, ref, computed } from "vue";
const emit = defineEmits(["next"]);

const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});

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
});

// --- BMI ---
function calculateBMI(weight, heightCm) {
  const heightM = heightCm / 100;
  if (!weight || !heightM) return null;
  return (weight / (heightM * heightM)).toFixed(1);
}

// --- Подсчёт баллов ---
const balls = computed(() => {
  let sum = 0;
  const p = props.person;

  // возраст
  if (p.age < 45) sum += 0;
  else if (p.age <= 54) sum += 2;
  else if (p.age <= 64) sum += 3;
  else sum += 4;

  // ИМТ
  const bmi = calculateBMI(p.ves, p.rost);
  if (bmi < 25) sum += 0;
  else if (bmi < 30) sum += 1;
  else sum += 3;

  // талия
  if (p.gender === "Женщины") {
    if (p.taliya.includes("<80")) sum += 0;
    else if (p.taliya.includes("80-88")) sum += 3;
    else if (p.taliya.includes(">88")) sum += 4;
  } else {
    if (p.taliya.includes("<94")) sum += 0;
    else if (p.taliya.includes("94") && p.taliya.includes("102")) sum += 3;
    else if (p.taliya.includes("≥102") || p.taliya.includes(">102")) sum += 4;
  }

  // физическая активность
  if (p.fizActive.includes("<4")) sum += 2;

  // фрукты/овощи
  if (p.yagody === "Нет") sum += 1;

  // сахар в анамнезе
  if (p.sahar === "Да") sum += 5;

  // приём препаратов
  if (p.priem === "Да") sum += 2;

  // семейный анамнез
  if (p.diabetFamily.includes("первой")) sum += 5;
  else if (p.diabetFamily.includes("второй")) sum += 3;

  return sum;
});

// --- Категория риска ---
const risk = computed(() => {
  const b = balls.value;
  if (b <= 3) return "Очень низкий";
  if (b <= 8) return "Низкий";
  if (b <= 12) return "Средний";
  if (b <= 20) return "Высокий";
  return "Очень высокий";
});

// --- Вероятность в % ---
const percent = computed(() => {
  const b = balls.value;
  const g = props.person.gender;
  if (b <= 3) return g === "Мужчины" ? 0.3 : 0.1;
  if (b <= 8) return g === "Мужчины" ? 0.8 : 0.4;
  if (b <= 12) return g === "Мужчины" ? 2.6 : 2.2;
  if (b <= 20) return g === "Мужчины" ? 23.1 : 14.1;
  return 50;
});
</script>

<template>
  <div class="diabet-wrapper">
    <div class="diabet__head">
      вероятность в течение 10 лет - {{ percent }}%
    </div>
    <div class="diabet__info">
      <table class="table">
        <thead class="table__head reltive">
          <div class="tint-light"></div>
          <tr class="relative">
            <th class="table__item relative"><span>Баллы</span></th>
            <th class="table__item relative"><span>Уровень риска</span></th>
            <th
              v-if="props.person.gender === 'Мужчины'"
              class="table__item relative"
            >
              <span>10-летний риск развития СДII</span>
            </th>
            <th
              v-if="props.person.gender === 'Женщины'"
              class="table__item relative"
            >
              <span>10-летний риск развития СДII</span>
            </th>
          </tr>
        </thead>
        <tbody class="table__body reltive">
          <tr class="table__row">
            <td class="table__item"><span>0-3</span></td>
            <td class="table__item"><span>Очень низкий</span></td>
            <td v-if="props.person.gender === 'Мужчины'" class="table__item">
              <span>0,3%</span>
            </td>
            <td v-if="props.person.gender === 'Женщины'" class="table__item">
              <span>0,1%</span>
            </td>
          </tr>
          <tr class="table__row">
            <td class="table__item"><span>4-8</span></td>
            <td class="table__item"><span>Низкий</span></td>
            <td v-if="props.person.gender === 'Мужчины'" class="table__item">
              <span>0,8%</span>
            </td>
            <td v-if="props.person.gender === 'Женщины'" class="table__item">
              <span>0,4%</span>
            </td>
          </tr>
          <tr class="table__row">
            <td class="table__item"><span>9-12</span></td>
            <td class="table__item"><span>Средний</span></td>
            <td v-if="props.person.gender === 'Мужчины'" class="table__item">
              <span>2,6%</span>
            </td>
            <td v-if="props.person.gender === 'Женщины'" class="table__item">
              <span>2,2%</span>
            </td>
          </tr>
          <tr class="table__row">
            <td class="table__item"><span>13-20</span></td>
            <td class="table__item"><span>Высокий</span></td>
            <td v-if="props.person.gender === 'Мужчины'" class="table__item">
              <span>23,1%</span>
            </td>
            <td v-if="props.person.gender === 'Женщины'" class="table__item">
              <span>14,1%</span>
            </td>
          </tr>
          <tr class="table__row">
            <td class="table__item"><span>&gt;21</span></td>
            <td class="table__item"><span>Очень высокий</span></td>
            <td v-if="props.person.gender === 'Мужчины'" class="table__item">
              <span>50%</span>
            </td>
            <td v-if="props.person.gender === 'Женщины'" class="table__item">
              <span>50%</span>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="goNextStep(7)" class="quiz__btn">Расчитать</button>
    </div>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
  z-index: 2;
}
.diabet-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.diabet__head {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 64px;
  line-height: 110%;
  text-align: center;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  opacity: 0.5;
  margin-bottom: 233px;
}

.diabet__info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 233px;
  height: 100%;
}

.quiz__btn {
  margin-top: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 2rem;
  width: 86.625rem;
  height: 8.375rem;
  border-radius: 1.5rem;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 2.5rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  background-color: #ffffff;
  color: #00040b;
}

.table {
  border-radius: 24px;
  overflow: hidden;
  border-collapse: collapse;
  width: 100%;
  position: relative;
  max-width: 1611px;
}

.table::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(169deg, #646464 0%, #4c4c4c 86%, #7c7c7c 100%);
  border-radius: 24px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.table__head {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border-width: 1.74805px 0px 0px 1.74805px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.1);
}

.table__head th {
  padding: 17px 20px;
  text-align: left;
}

.table__body span,
.table__head span {
  font-weight: 400;
  font-size: 20.9766px;
  line-height: 130%;
  color: #ffffff;
}

/* Тело таблицы */
.table__body td {
  padding: 25px 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* При наведении подсветка */
.table__row:hover {
  background-color: #f0f8ff;
}

th,
td {
  width: 18.8rem;
}

.tint-black {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: linear-gradient(
    92deg,
    rgb(20 20 20) 3.83%,
    rgb(20 20 20 / 10%) 99.95%
  );
}
.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: rgba(217, 217, 217, 0.4);
}
</style>
