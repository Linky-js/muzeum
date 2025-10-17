<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import result from "@/components/calculate/result.vue";
import resultWin5 from "@/components/calculate/resultWin5.vue";
import resultWin6 from "@/components/calculate/resultWin6.vue";
import resultFinal from "@/components/calculate/resultFinal.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const step = ref(0);
const regionUp = ref(false);
const ageUp = ref(false);
const qrCodeUrl = ref("");

const ages = [
  { id: 1, name: "от 0 до 10 лет" },
  { id: 2, name: "от 11 до 20 лет" },
  { id: 3, name: "от 21 до 30 лет" },
  { id: 4, name: "от 31 до 40 лет" },
  { id: 5, name: "от 41 до 50 лет" },
  { id: 6, name: "от 51 до 60 лет" },
  { id: 7, name: "от 61 до 70 лет" },
  { id: 8, name: "от 71 до 80 лет" },
  { id: 9, name: "от 81 до 90 лет" },
  { id: 10, name: "от 91 до 100 лет" },
]
const regions =
  [
    { id: 0, name: "Не выбирать", stock: true },
    { id: 1, name: "Республика Адыгея" },
    { id: 2, name: "Республика Башкортостан" },
    { id: 3, name: "Республика Бурятия" },
    { id: 4, name: "Республика Алтай" },
    { id: 5, name: "Республика Дагестан" },
    { id: 6, name: "Республика Ингушетия" },
    { id: 7, name: "Кабардино-Балкарская Республика" },
    { id: 8, name: "Республика Калмыкия" },
    { id: 9, name: "Карачаево-Черкесская Республика" },
    { id: 10, name: "Республика Карелия" },
    { id: 11, name: "Республика Коми" },
    { id: 12, name: "Республика Марий Эл" },
    { id: 13, name: "Республика Мордовия" },
    { id: 14, name: "Республика Саха (Якутия)" },
    { id: 15, name: "Республика Северная Осетия — Алания" },
    { id: 16, name: "Республика Татарстан" },
    { id: 17, name: "Республика Тыва" },
    { id: 18, name: "Удмуртская Республика" },
    { id: 19, name: "Республика Хакасия" },
    { id: 20, name: "Чеченская Республика" },
    { id: 21, name: "Чувашская Республика" },
    { id: 22, name: "Алтайский край" },
    { id: 23, name: "Краснодарский край" },
    { id: 24, name: "Красноярский край" },
    { id: 25, name: "Приморский край" },
    { id: 26, name: "Ставропольский край" },
    { id: 27, name: "Хабаровский край" },
    { id: 28, name: "Амурская область" },
    { id: 29, name: "Архангельская область" },
    { id: 30, name: "Астраханская область" },
    { id: 31, name: "Белгородская область" },
    { id: 32, name: "Брянская область" },
    { id: 33, name: "Владимирская область" },
    { id: 34, name: "Волгоградская область" },
    { id: 35, name: "Вологодская область" },
    { id: 36, name: "Воронежская область" },
    { id: 37, name: "Ивановская область" },
    { id: 38, name: "Иркутская область" },
    { id: 39, name: "Калининградская область" },
    { id: 40, name: "Калужская область" },
    { id: 41, name: "Камчатский край" },
    { id: 42, name: "Кемеровская область" },
    { id: 43, name: "Кировская область" },
    { id: 44, name: "Костромская область" },
    { id: 45, name: "Курганская область" },
    { id: 46, name: "Курская область" },
    { id: 47, name: "Ленинградская область" },
    { id: 48, name: "Липецкая область" },
    { id: 49, name: "Магаданская область" },
    { id: 50, name: "Московская область" },
    { id: 51, name: "Мурманская область" },
    { id: 52, name: "Нижегородская область" },
    { id: 53, name: "Новгородская область" },
    { id: 54, name: "Новосибирская область" },
    { id: 55, name: "Омская область" },
    { id: 56, name: "Оренбургская область" },
    { id: 57, name: "Орловская область" },
    { id: 58, name: "Пензенская область" },
    { id: 59, name: "Пермский край" },
    { id: 60, name: "Псковская область" },
    { id: 61, name: "Ростовская область" },
    { id: 62, name: "Рязанская область" },
    { id: 63, name: "Самарская область" },
    { id: 64, name: "Саратовская область" },
    { id: 65, name: "Сахалинская область" },
    { id: 66, name: "Свердловская область" },
    { id: 67, name: "Смоленская область" },
    { id: 68, name: "Тамбовская область" },
    { id: 69, name: "Тверская область" },
    { id: 70, name: "Томская область" },
    { id: 71, name: "Тульская область" },
    { id: 72, name: "Тюменская область" },
    { id: 73, name: "Ульяновская область" },
    { id: 74, name: "Челябинская область" },
    { id: 75, name: "Забайкальский край" },
    { id: 76, name: "Ярославская область" },
    { id: 77, name: "Москва" },
    { id: 78, name: "Санкт-Петербург" },
    { id: 79, name: "Еврейская автономная область" },
    { id: 83, name: "Ненецкий автономный округ" },
    { id: 86, name: "Ханты-Мансийский автономный округ — Югра" },
    { id: 87, name: "Чукотский автономный округ" },
    { id: 89, name: "Ямало-Ненецкий автономный округ" },
    { id: 92, name: "Севастополь" },
    { id: 82, name: "Республика Крым" },
    { id: 80, name: "Луганская народная республика" },
    { id: 81, name: "Донецкая народная республика" },
    { id: 84, name: "Запорожская область" },
    { id: 85, name: "Херсонская область" },
  ];
const person = ref({
  age: "",
  gender: "",
  region: { id: null, name: "" },
  rost: "",
  ves: "",
  taliya: "",
  fizActive: "",
  yagody: "",
  arteriya: "",
  sahar: "",
  diabet: "",
  priem: "",
  diabetFamily: "",
})
const goNextStep = (st) => {
  if (st == 2) {
    if (person.value.age == "" || person.value.gender == "") {
      toast.error("Заполните поля Возраст и Пол")
    }
    else {
      step.value = st
    }
  } else if (st == 3) {
    if (person.value.rost == "" || person.value.ves == "" || person.value.taliya == "" || person.value.fizActive == "" || person.value.yagody == "") {
      toast.error("Заполните поля Рост, Вес, Окружность талии")
    } else {
      step.value = st
    }
  } else if (st == 4) {
    if (person.value.arteriya == "" || person.value.sahar == "" || person.value.diabet == "" || person.value.priem == "" || person.value.diabetFamily == "") {
      toast.error("Заполните поля Артерия, Сахар")
    } else {
      step.value = st
    }
    
  } else {
    step.value = st
  }
}
// функция для генерации рандомного QR
const generateQr = () => {
  // случайное число для "уникальности"
  const randomData = Math.random().toString(36).substring(2, 10);
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${randomData}`;
};

const regionsHints = computed(() => {
  if (!person.value.region.name) return regions;
  return regions.filter((r) =>
    r.name.toLowerCase().includes(person.value.region.name.toLowerCase())
  );
});

const goRegion = (value) => {
  person.value.region = value;
  regionUp.value = false;
};
const goAges = (value) => {
  person.value.age = value;
  ageUp.value = false
}

const checkStep = () => {
  if (person.value.diabet == "Нет") {
    step.value = 5
  } else {
    step.value = 6
  }
}
let intervalId;

onMounted(() => {
  generateQr(); // первый QR сразу
  intervalId = setInterval(generateQr, 2000); // каждые 2 секунды обновляем
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div v-if="step < 4" class="wrapper">
    <aside class="left">
      <div class="left_top">
        <h3 v-if="step !== 4">Калькулятор рисков</h3>
        <h4 v-else>Статистически ожидаемая <br> продолжительность жизни в <br> вашей когорте - 72 года.</h4>
        <div v-if="step !== 4" class="etap"> Шаг {{ step }}</div>
        <div v-else class="aside_description">Это оценка по популяционным данным, а не прогноз для <br> вас
          персонально.*</div>
      </div>

    </aside>
    <div class="container">
      <div v-if="step === 0" class="step1">
        <h1>Отсканируйте QR КОД</h1>
        <div class="description">
          Узнайте статистическую оценку долголетия и рисков метаболического синдрома
        </div>
        <div class="qr-code">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
        <div @click="goNextStep(1)" class="btn">Далее</div>
      </div>
      <div v-if="step === 1" class="step2 step">
        <div class="quiz">
          <div class="question">
            <div class="label">Пол:</div>
            <div class="answers">
              <label class="answer">Мужской
                <input type="radio" name="answer" v-model="person.gender" value="Мужчины" id="">
              </label>
              <label class="answer">Женский
                <input type="radio" name="answer" v-model="person.gender" value="Женщины" id="">
              </label>
            </div>
          </div>
          <div class="question">
            <div class="label">Возраст:</div>
            <div class="input_wrap">
              <input type="number" class="input_quiz" v-model="person.age" placeholder="Введите возраст">
              <div v-show="ageUp" class="custom_list">
                <div v-for="value in ages" :key="value.id" @click="goAges(value)" class="region"
                  :class="value.id == person.age.id ? 'active' : ''">{{ value.name }}</div>
              </div>
            </div>
          </div>
          <div class="question">
            <div class="label">Регион:</div>
            <div class="input_wrap">
              <input @focus="regionUp = true" type="text" class="input_quiz" v-model="person.region.name"
                placeholder="Выберите регион" />
              <div v-show="regionUp && regionsHints.length" class="custom_list">
                <div v-for="value in regionsHints" :key="value.id" @click="goRegion(value)" class="region"
                  :class="value.id === person.region.id ? 'active' : ''">
                  {{ value.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div @click="goNextStep(2)" class="btn">Дальше</div>
      </div>
      <div v-if="step === 2" class="step3 step">
        <div class="quiz">
          <div class="question">
            <div class="label">Рост:</div>
            <div class="input_wrap">
              <input type="number" class="input_quiz" v-model="person.rost" placeholder="См">

            </div>
          </div>
          <div class="question">
            <div class="label">Вес:</div>
            <div class="input_wrap">
              <input type="number" class="input_quiz" v-model="person.ves" placeholder="Кг">

            </div>
          </div>
          <div v-if="person.gender == 'Мужчины'" class="question">
            <div class="label">Окружность талии: <br> <small>Мужчина</small></div>
            <div class="answers answersColumn">
              <label class="answer"> &#60;94 см
                <input type="radio" name="taliya" v-model="person.taliya" value=" &#60;94 см" id="">
              </label>
              <label class="answer">от 94 до &#60; 102 см
                <input type="radio" name="taliya" v-model="person.taliya" value="от 94 до &#60; 102 см" id="">
              </label>
              <label class="answer">≥102 см
                <input type="radio" name="taliya" v-model="person.taliya" value="≥102 см" id="">
              </label>
            </div>
          </div>
          <div v-if="person.gender == 'Женщины'" class="question">
            <div class="label">Окружность талии: <br> <small>Женшина</small></div>
            <div class="answers answersColumn">
              <label class="answer"> &#60;80 см
                <input type="radio" name="taliya" v-model="person.taliya" value=" &#60;80 см" id="">
              </label>
              <label class="answer">80-88 см
                <input type="radio" name="taliya" v-model="person.taliya" value="80-88 см" id="">
              </label>
              <label class="answer">>88 см
                <input type="radio" name="taliya" v-model="person.taliya" value=">88 см" id="">
              </label>
            </div>
          </div>
          <div class="question">
            <div class="label">Уровень физической активности:</div>
            <div class="answers answersColumn">
              <label class="answer"> ≥4 часа/неделю
                <input type="radio" name="fizActive" value="≥4 часа/неделю" v-model="person.fizActive" id="">
              </label>
              <label class="answer">&#60;4 часа в неделю
                <input type="radio" name="fizActive" value="&#60;4 часа в неделю" v-model="person.fizActive" id="">
              </label>
            </div>
          </div>
          <div class="question">
            <div class="label">Ежедневное потребление <br> фруктов,овощей, ягод</div>
            <div class="answers answersColumn">
              <label class="answer"> Да
                <input type="radio" name="yagody" value="Да" v-model="person.yagody" id="">
              </label>
              <label class="answer">Нет
                <input type="radio" name="yagody" value="Нет" v-model="person.yagody" id="">
              </label>
            </div>
          </div>
        </div>
        <div @click="goNextStep(3)" class="btn">Дальше</div>
      </div>
      <div v-if="step === 3" class="step4 step">
        <div class="quiz">
          <div class="question">
            <div class="label">Наличие артериальной <br> гипертензии:</div>
            <div class="answers">
              <label class="answer">Да
                <input type="radio" name="arteriya" v-model="person.arteriya" value="Да" id="">
              </label>
              <label class="answer">Нет
                <input type="radio" name="arteriya" v-model="person.arteriya" value="Нет" id="">
              </label>
            </div>
          </div>
          <div class="question">
            <div class="label">Повышение уровня сахара в <br> анамнезе:</div>
            <div class="answers">
              <label class="answer">Да
                <input type="radio" name="sahar" v-model="person.sahar" value="Да" id="">
              </label>
              <label class="answer">Нет
                <input type="radio" name="sahar" v-model="person.sahar" value="Нет" id="">
              </label>
            </div>
          </div>
          <div class="question">
            <div class="label">Наличие сахарного диабета: </div>
            <div class="answers">
              <label class="answer">Да
                <input type="radio" name="diabet" v-model="person.diabet" value="Да" id="">
              </label>
              <label class="answer">Нет
                <input type="radio" name="diabet" v-model="person.diabet" value="Нет" id="">
              </label>
            </div>
          </div>
          <div class="question">
            <div class="label">Прием препаратов, снижающих <br> артериальное давление</div>
            <div class="answers">
              <label class="answer">Да
                <input type="radio" name="priem" v-model="person.priem" value="Да" id="">
              </label>
              <label class="answer">Нет
                <input type="radio" name="priem" v-model="person.priem" value="Нет" id="">
              </label>
            </div>
          </div>
          <div class="question">
            <div class="label">Семейный анамнез сахарного <br> диабета.</div>
            <div class="answers answersColumn">
              <label class="answer ">Нет
                <input type="radio" name="diabetFamily" v-model="person.diabetFamily" value="Нет" id="">
              </label>
              <label class="answer">Да, в первой линии родства
                <input type="radio" name="diabetFamily" v-model="person.diabetFamily" value="Да, в первой линии родства"
                  id="">
              </label>
              <label class="answer">Да, во второй линии родства
                <input type="radio" name="diabetFamily" v-model="person.diabetFamily"
                  value="Да, во второй линии родства" id="">
              </label>
            </div>
          </div>
          <div @click="goNextStep(4)" class="btn">Получить результат</div>
        </div>
      </div>
    </div>
  </div>
  <result v-if="step === 4" :person="person" @next="checkStep(5)" />
  
  <resultWin6 v-if="step === 5" :person="person" @next="step = 6" />
  <resultWin5 v-if="step === 6" :person="person" @next="step = 7"  />
  <result-final v-if="step === 7" :person="person" />
</template>

<style scoped>
.wrapper {
  background: #fff;
  padding: 1.75rem;
}

* {
  color: #000;
}

.container {
  width: 100%;
  max-width: 112.24rem;
  margin: 0 auto;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
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

.left h3 {
  color: #0E1117;
  font-family: "TT Hoves";
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.04rem;
}

.left h4 {
  color: #445371;
  font-family: "TT Hoves";
  font-size: 2rem;
  font-style: normal;
  font-weight: 600;
  line-height: 120%;
  /* 2.4rem */
  letter-spacing: -0.04rem;
}

.aside_description {
  color: #445371;
  font-family: "TT Hoves";
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.02rem;
}

.life_info {
  color: #000;
  font-family: "TT Hoves";
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.02rem;
}

.left .etap {
  font-size: 1.25rem;
  font-weight: 500;
}

.step1 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  align-items: center;
}

.step1 h1 {
  color: #0E1117;
  font-size: 8.5425rem;
  font-weight: 700;
  letter-spacing: -0.11088rem;
}

.description {
  color: #000;
  font-size: 3.5rem;
  font-weight: 700;
  opacity: 0.5;
  max-width: 50.9875rem;
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
  max-width: 130.0625rem;
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
  font-size: 3.5rem;
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
  width: 32.1875rem;
}

.answersColumn .answer {
  width: 100%;
}

.answer {
  display: flex;
  
  padding: 2rem 3.25rem 2rem 3.25rem;
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
  font-size: 3rem;
  font-style: normal;
  font-weight: 600;
  line-height: 3rem;
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
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5rem;
  padding: 1.75rem;
  width: 100%;
}

.input_wrap {
  position: relative;
  width: 37.5rem;
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
  width: 37.5rem;
  height: 30rem;
  overflow-y: scroll;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.region {
  padding: 0.5rem;
  color: var(--dropdownmenu-primary-itemvalue-color-default, #0E1117);
  font-family: "TT Hoves";
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 400;
  line-height: 2.5rem;
  /* 142.857% */
  cursor: pointer;

}

.region.active {
  background: var(--dropdownmenu-primary-itemvalue-bg-color-default, rgba(68, 83, 113, 0.05));
  border-radius: var(--dropdownmenu-m-border-radius, 0.375rem);
}



.result {
  max-width: 34.75475rem;
  width: 100%;
}

.nickels {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 auto;
  width: 100%;
}

.nickel {
  display: flex;
  align-items: flex-end;
  gap: 1.08rem;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 0.12rem;
}

.week {
  width: 0.5rem;
  height: 0.5rem;
  flex-shrink: 0;
  border: 0.471px solid #000;
  background: #FFF;
}

.years {
  color: #000;
  font-family: "TT Hoves";
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.02rem;
  white-space: nowrap;
}

.btn {
  color: #FFF;
  margin: 0 auto;
  margin-top: 1.56rem;

}
</style>
