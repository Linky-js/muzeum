<script setup>
import { ref, computed, watch } from "vue";
import IconArrow from "@/components/icons/IconArrow.vue";

const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});
const regionUp = ref(false);
const ageUp = ref(false);
const localRegionName = ref("");

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
];
const regions = [
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


const goRegion = (value) => {
  // Обновляем только локальную переменную для отображения
  props.person.region = value;
  regionUp.value = false;
  
  // Если нужно обновить объект person.region, раскомментируйте следующую строку:
  // props.person.region = value;
};

// const goAges = (value) => {
//   props.person.age = value;
//   ageUp.value = false;
// };
const regionsHints = computed(() => {
  if (!props.person.region.name) return regions;
  return regions.filter((r) =>
    r.name.toLowerCase().includes(props.person.region.name.toLowerCase())
  );
});
</script>

<template>
  <div class="quiz-wrapper">
    <div class="quiz">
      <div class="question">
        <div class="label">Пол:</div>
        <div class="answers">
          <label class="answer">
            <div class="tint"></div>
            <input
              type="radio"
              name="answer"
              v-model="person.gender"
              value="Мужчины"
              id=""
            />
            <span class="relative"> Мужской </span>
          </label>
          <label class="answer">
            <div class="tint"></div>
            <input
              type="radio"
              name="answer"
              v-model="person.gender"
              value="Женщины"
              id=""
            />
            <span class="relative"> Женский </span>
          </label>
        </div>
      </div>
      <div class="question">
        <div class="label">Возраст:</div>
        <div class="input_wrap">
          <input
            type="number"
            class="input_quiz relative"
            v-model="person.age"
            placeholder="Введите возраст"
          />
          <div v-show="ageUp" class="custom_list">
            <div
              v-for="value in ages"
              :key="value.id"
              @click="goAges(value)"
              class="region"
              :class="value.id == person.age.id ? 'active' : ''"
            >
              {{ value.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="question">
        <div class="label">Регион:</div>
        <div class="input_wrap">
          <input
            @focus="regionUp = true"
            type="text"
            class="input_quiz relative"
            v-model="person.region.name"
            placeholder="Выберите регион"
          />
          <IconArrow
            class="input_wrap-arr"
            :class="{ active: regionUp === true }"
          />
          <div v-show="regionUp && regionsHints.length" class="custom_list">
            <div class="custom_list-wrapper">
              <div
                v-for="value in regionsHints"
                :key="value.id"
                @click="goRegion(value)"
                class="region relative"
                :class="value.id === person.region.id ? 'active' : ''"
              >
                {{ value.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button @click="goNextStep(step + 1)" :disabled="person.age == '' || person.gender == '' || !person.region.id" class="quiz__btn">Дальше</button>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
  z-index: 1;
}
.quiz {
  display: grid;
  gap: 64px;
  padding: 32px 0 64px;
  width: 100%;
  margin-bottom: 695px;
}
.question {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  height: fit-content;
}
.answers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 510px;
}
.answer {
  width: 247px;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  padding: 24px 32px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 100px;
}
.answer span {
  font-family: "Manrope";
  font-weight: 600;
  font-size: 24.9214px;
  line-height: 37px;
  color: #ffffff;
}

.custom_list-wrapper::before,
.input_wrap::before,
.answer::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(169deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  border-radius: 100px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.answer input {
  display: none;
}

.input_wrap {
  position: relative;
  max-width: 510px;
  width: 100%;
  height: 90px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}
.input_wrap::before {
  border-radius: 16px;
}
.input_wrap-arr {
  position: absolute;
  top: 38px;
  right: 33px;
  rotate: -90deg;
  width: 13px;
  height: 21px;
  opacity: 0.2;
  transition: all 0.3s ease-in-out;
}

.input_wrap-arr.active {
  opacity: 1;
}
.input_quiz {
  display: block;
  padding: 24px;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
  border-radius: 16px;
  font-variant-numeric: lining-nums tabular-nums stacked-fractions;
  font-feature-settings: "liga" off, "clig" off;
  font-weight: 400;
  font-size: 32px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.answer .tint {
  opacity: 0;
  transition: all 0.3s ease-in-out;
}
.answer:has(input:checked) .tint {
  opacity: 1;
}

.input_quiz::placeholder {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.2;
}

.custom_list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  border-radius: 16px;
  width: 100%;
  height: 520px;
  overflow-y: scroll;
  z-index: 1;
}
.custom_list-wrapper {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
  position: relative;
}
.custom_list-wrapper::before {
  height: 100%;
  top: 0;
  bottom: 0;
  border-radius: 16px;
}

.region {
  padding: 15.2467px 20.329px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15.2467px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.region.active{
  background: rgba(255, 255, 255, 0.5);
}

.quiz__btn {
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
.quiz__btn:disabled {
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.4);
}

.effect {
  position: absolute;
  z-index: 0;
  inset: 0;
  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
  overflow: hidden;
  isolation: isolate;
  border-radius: 3rem;
}

.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: rgba(217, 217, 217, 0.4);
}

.shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.1),
    inset -1px -1px 1px 1px rgba(255, 255, 255, 0.1);
  border-radius: 3rem;
}
</style>
