<script setup>
import { defineEmits, ref, watch, computed } from "vue";
import IconArrow from "@/components/icons/IconArrow.vue";

const emit = defineEmits(["changePerson"]);
const activeUp = ref(false)
const person = ref({
  age: "",
  gender: "",
  ves: "",
  rost: "",
  active: {
    id: null,
    name: "",
  },
  cel:  "",
});
const activeVersion = ref([
  {
    id: 1.2,
    name: 'Сидячий образ жизни'
  },
  {
    id: 1.375,
    name: 'Легкая активность'
  },
  {
    id: 1.55,
    name: 'Умеренная активность'
  },
  {
    id: 1.725,
    name: 'Высокая активность'
  },
  {
    id: 1.9,
    name: 'Очень высокая'
  },
]);
const isDisabledBtn = computed(() => {
  return (
    person.value.gender === '' ||
    person.value.age === '' ||
    person.value.ves === '' ||
    person.value.rost === '' ||
    person.value.active.id  === null ||
    person.value.cel === ''
  );
});

const goActive = (value) => {
  // Обновляем только локальную переменную для отображения
  person.value.active = value;
  activeUp.value = false;
};
const pushInfo = () => {
  emit("changePerson", person);
};

watch((person), (newPerson) =>{
  console.log('newPerson', newPerson)
}, { deep: true })
</script>

<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h1 class="modal__title">Сбор данных</h1>
      <p class="modal__subtitle">
        Введите ваши данные для определения персональных норм
      </p>
      <div class="modal__elems">
        <div class="question">
          <h4 class="question__title">Пол:</h4>
          <div class="answers">
            <label class="answer">
              <div class="tint"></div>
              <input
                type="radio"
                name="answer"
                v-model="person.gender"
                value="Мужской"
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
                value="Женский"
                id=""
              />
              <span class="relative"> Женский </span>
            </label>
          </div>
        </div>
        <div class="question">
          <h4 class="question__title">Возраст:</h4>
          <div class="input_wrap">
            <input
              type="number"
              class="input_quiz relative"
              v-model="person.age"
              placeholder="Введите возраст"
            />
          </div>
        </div>
        <div class="question">
          <h4 class="question__title">Вес:</h4>
          <div class="input_wrap">
            <input
              type="number"
              class="input_quiz relative"
              v-model="person.ves"
              placeholder="Введите вес"
            />
          </div>
        </div>
        <div class="question">
          <h4 class="question__title">Рост:</h4>
          <div class="input_wrap">
            <input
              type="number"
              class="input_quiz relative"
              v-model="person.rost"
              placeholder="Введите рост"
            />
          </div>
        </div>
        <div class="question relative">
          <h4 class="question__title">Активность:</h4>
          <div class="input_wrap">
            <input
              @focus="activeUp = true"
              type="text"
              class="input_quiz relative"
              v-model="person.active.name"
              placeholder="Выберите регион"
            />
            <IconArrow
              class="input_wrap-arr"
              :class="{ active: activeUp === true }"
            />
            <div v-show="activeUp && activeVersion.length" class="custom_list">
              <div class="custom_list-wrapper">
                <div
                  v-for="value in activeVersion"
                  :key="value.id"
                  @click="goActive(value)"
                  class="region relative"
                  :class="value.id === person.active.id ? 'active' : ''"
                >
                  {{ value.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="question">
          <h4 class="question__title">Цель:</h4>
          <div class="answers answersColumn">
            <label class="answer">
              <div class="tint"></div>
              <input
                type="radio"
                name="cel"
                v-model="person.cel"
                value="Поддержание веса"
              />
              <span class="relative"> Поддержание веса </span>
            </label>
            <label class="answer">
              <div class="tint"></div>
              <input
                type="radio"
                name="cel"
                v-model="person.cel"
                value="Похудение"
              />
              <span class="relative"> Похудение </span>
            </label>
            <label class="answer">
              <div class="tint"></div>
              <input
                type="radio"
                name="cel"
                v-model="person.cel"
                value="Набор веса"
              />
              <span class="relative"> Набор веса </span>
            </label>
          </div>
        </div>
      </div>
      <button class="modal__btn" @click="pushInfo" :disabled="isDisabledBtn">
        Принять
      </button>
    </div>
  </div>
</template>

<style scoped>
.relative{
  position: relative;
  z-index: 1;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 55;
  background: rgba(78, 78, 78, 0.4);
  backdrop-filter: blur(37px);
}

.modal {
  padding: 80px;
  width: 1390px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 58px;
}

.modal__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 140px;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  text-align: center;
  margin-bottom: 16px;
}

.modal__subtitle {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 38px;
  line-height: 120%;
  text-align: center;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  opacity: 0.5;
}

.modal__elems {
  margin: 80px 0;
  display: grid;
}

.question {
  display: flex;
  justify-content: space-between;
  padding: 32px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.question:first-child {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.question__title {
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
  width: 100%;
}
.answer {
  width: 100%;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  padding: 24px 32px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  backdrop-filter: blur(10px);
  border-radius: 100px;
  background: linear-gradient(
    85.26deg,
    rgba(255, 255, 255, 0.06) 3.83%,
    rgba(255, 255, 255, 0.06) 99.95%
  );
}
.answer:has(input:checked){
  background: linear-gradient(
    85.26deg,
    rgba(255, 255, 255, 0.25) 3.83%,
    rgba(255, 255, 255, 0.25) 99.95%
  );
}
.answer span {
  font-family: "Manrope";
  font-weight: 600;
  font-size: 24.9214px;
  line-height: 37px;
  color: #ffffff;
  position: relative;
  z-index: 1;
}
.answer input {
  display: none;
}
.answer .tint {
  border-radius: 100px;
  background: linear-gradient(
    85.26deg,
    rgba(255, 255, 255, 0.15) 3.83%,
    rgba(255, 255, 255, 0.15) 99.95%
  );
}

.input_wrap {
  position: relative;
  max-width: 510px;
  width: 100%;
  height: 90px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  background: linear-gradient(
    85.26deg,
    rgba(255, 255, 255, 0.2) 3.83%,
    rgba(255, 255, 255, 0.2) 99.95%
  );
  backdrop-filter: blur(10px);
  border-radius: 16px;
}
.input_wrap::before {
  border-radius: 16px;
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
  position: relative;
  z-index: 1;
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

.custom_list-wrapper::before,
.input_wrap::before,
.answer::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(
    85.26deg,
    rgb(255 255 255 / 83%) 40.83%,
    rgb(255 255 255 / 68%) 99.95%
  );
  border-radius: 16px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.modal__btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 32px;
  width: 100%;
  height: 134px;
  border-radius: 24px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #1b1c21;
  background: #ffffff;
}

.modal__btn:disabled {
  background-color: rgba(255, 255, 255, 0.12);
  font-family: "TT Hoves";
  color: rgba(255, 255, 255, 0.4);
}


.custom_list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  border-radius: 16px;
  width: 100%;
  overflow-y: scroll;
  z-index: 1;
  background-color: #4c4b47d9;
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
  background: rgba(255, 255, 255, 0.18);
  border-radius: 15.2467px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.region.active {
  background: rgba(255, 255, 255, 0.5);
}
.answersColumn {
  grid-template-columns: repeat(1, 1fr);
}

.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
}
</style>
