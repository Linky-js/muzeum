<script setup>
import {
  ref,
  defineProps,
  onMounted,
  computed,
  defineEmits,
  onBeforeUnmount,
} from "vue";
import gsap from "gsap";
const props = defineProps({
  person: Object,
});

const emit = defineEmits(["next"]);
const stats = ref({});
const container = ref(null);
let animationFrame;
const speed = 0.3;
// Загружаем статистику
const getStat = async () => {
  try {
    const res = await fetch("/datas/data.json");
    if (!res.ok) throw new Error("Ошибка HTTP " + res.status);
    const data = await res.json();
    stats.value = data;
  } catch (err) {
    console.error("Ошибка загрузк:", err);
  }
};

// Текущий возраст в неделях
const currentWeeks = computed(() => props.person.age * 12);

// Прогноз по региону и полу
const expectedWeeks = computed(() => {
  if (!stats.value || !props.person.gender) return 0;
  let regionStats = "";
  if (
    !props.person.region.name ||
    [
      "Луганская народная республика",
      "Донецкая народная республика",
      "Не выбирать",
    ].includes(props.person.region.name)
  ) {
    regionStats = stats.value["default"];
  } else {
    regionStats = stats.value[props.person.region.name];
  }

  if (!regionStats || regionStats == "") return 0;
  const avgYears = regionStats[props.person.gender] || 70; // fallback
  return Math.round(avgYears * 12);
});

// Количество блоков nickel (по 5 лет)
const nickelCount = computed(() => {
  const currentYears = props.person.age;
  const expectedYears = Math.round(expectedWeeks.value / 12);

  // Берём максимум из возраста и прогноза
  const maxYears = Math.max(currentYears, expectedYears);

  // Округляем в большую сторону до кратного 5
  const roundFive = Math.ceil(maxYears / 5);
  return roundFive;
});

// Функция для класса квадратика
const getWeekClass = (weekIndex) => {
  if (weekIndex < currentWeeks.value) return "active";
  if (weekIndex < expectedWeeks.value) return "future";
  return "extra";
};
const pluralizeYears = (num) => {
  num = Math.abs(num) % 100;
  const n1 = num % 10;
  if (num > 10 && num < 20) return "лет";
  if (n1 > 1 && n1 < 5) return "года";
  if (n1 === 1) return "года";
  return "лет";
};

const pluralizeYears2 = (num) => {
  num = Math.abs(num) % 100;
  const n1 = num % 10;
  if (num > 10 && num < 20) return "лет";
  if (n1 > 1 && n1 < 5) return "года";
  if (n1 === 1) return "год";
  return "лет";
};

onMounted(() => {
  getStat();
  setTimeout(() => {
    if (container.value) {
      gsap.to(container.value, {
        scrollTop: container.value.scrollHeight, // вниз
        duration: 3, // длительность анимации в секундах
        ease: "power1.inOut", // плавное замедление
      });
    }
  }, 2000);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame);
});
</script>

<template>
  <div class="result-wrapper">
    <aside class="left">
      <div class="left_top">
        <h4>
          Статистически ожидаемая <br />
          продолжительность жизни в <br />
          вашей когорте — около {{ Math.round(expectedWeeks / 12) }}
          {{ pluralizeYears(Math.round(expectedWeeks / 12)) }}.
        </h4>
        <div class="aside_description">
          {{
            [
              "Луганская народная республика",
              "Донецкая народная республика",
              "Не выбирать",
            ].includes(props.person.region.name)
              ? "Оценка основана на средних по стране данных официальной статистики. Это усредненные данные, а не ваш индивидуальный прогноз."
              : "*Оценка основана на данных официальной статистики об ожидаемой продолжительности жизни по полу и регионам. Это усредненные данные, а не ваш индивидуальный прогноз."
          }}
        </div>
        <div class="result_info">
          <div class="life_info">
            Ваша жизнь в месяцах: <br />
            1 квадрат - 1 месяц жизни
          </div>
          <ul class="life_numbers">
            <li class="currentLife life_numbers-point">
              <span></span>
              <p>
                Текущий возраст <br />
                {{ currentWeeks }} месяцев -
                <strong>{{ props.person.age }} лет</strong>
              </p>
            </li>
            <li class="expectedLife life_numbers-point">
              <span></span>
              <p>
                Ожидаемая продолжительность жизни <br />
                {{ expectedWeeks }} месяцев -
                <strong
                  >{{ Math.round(expectedWeeks / 12) }}
                  {{ pluralizeYears2(Math.round(expectedWeeks / 12)) }}</strong
                >
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div class="left_bottom">
        <p class="left_bottom-text">
          *Это оценка по популяционным данным, а не прогноз для вас персонально.
        </p>
        <button @click="emit('next')" class="quiz__btn">Дальше</button>
      </div>
    </aside>

    <div class="calendar" ref="container">
      <div class="tint"></div>
      <div class="nickels relative">
        <div v-for="(value, index) in nickelCount" :key="index" class="nickel">
          <div class="rows">
            <div v-for="row in 5" :key="row" class="row">
              <div
                v-for="month in 12"
                :key="month + row + index"
                class="week"
                :class="getWeekClass(index * 60 + (row - 1) * 12 + (month - 1))"
              ></div>
            </div>
          </div>
          <div class="years">{{ 5 * (index + 1) + " лет" }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-wrapper {
  display: flex;
  gap: 250px;
}

.relative {
  position: relative;
  z-index: 1;
}

.container::-webkit-scrollbar {
  width: 0;
}

.left {
  z-index: 2;
  height: 1156px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 1182px;
  width: 100%;
}

.left h3 {
  color: #0e1117;
  font-family: "TT Hoves";
  font-size: 6rem;
  font-weight: 700;
  letter-spacing: -0.04rem;
}

.left h4 {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 80px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 32px;
}

.aside_description {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.result_info {
  margin-top: 64px;
  display: flex;
  align-items: center;
  gap: 48px;
}
.life_numbers {
  display: grid;
  gap: 24px;
  list-style: none;
}
.life_numbers-point {
  display: flex;
  gap: 16px;
  align-items: center;
}

.life_numbers-point span {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
}
.life_numbers-point p {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.5);
}
.life_numbers-point p strong {
  color: rgb(255, 255, 255);
  font-weight: 700;
}
.currentLife span {
  background: #14599b;
  border: 1.4325px solid #14599b;
}
.expectedLife span {
  background: #9d9d9d;
  border: 1.4325px solid #9d9d9d;
}
.life_info {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 130%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.left_bottom-text {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 57px;
  max-width: 436px;
}

.quiz__btn {
  margin-top: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 2rem;
  width: 671px;
  height: 134px;
  border-radius: 1.5rem;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 2.5rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  background-color: #ffffff;
  color: #00040b;
}
.calendar {
  padding: 40px;
  width: 1511px;
  height: 1156px;
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 38px;
}

.calendar::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(169deg, #646464 0%, #4c4c4c 86%, #7c7c7c  100%);
  border-radius: 38px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
    background: linear-gradient(92deg, rgb(20 20 20) 3.83%, rgb(20 20 20 / 10%) 99.95%);
}

.nickels {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}

.nickel {
  display: flex;
  flex-direction: column;
  gap: 11px;
  max-width: 340px;
  width: 100%;
}

.rows {
  display: grid;
  gap: 11px;
}

.row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 5px;
}

.week {
  width: 2.0345rem;
  height: 2.0345rem;
  flex-shrink: 0;
  border: 0.471px solid #000;
  background: #fff;
}

.week {
  width: 22px;
  height: 22px;
}

.week.active {
  background: #14599b;
  /* голубой */
}

.week.future {
  background: #9d9d9d;
  /* серый */
}

.week.extra {
  background: #24272c;
  /* бледный */
}

.years {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #e2e3e5;
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
