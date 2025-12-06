<script setup>
import { ref } from "vue";

const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});
const isOpenModal = ref(false);
const isAgreeCoockie = ref(false);
const agreeCoockie = () => {
  isAgreeCoockie.value = true;
  isOpenModal.value = false;
};
const toggleModal = () => {
  if (isAgreeCoockie.value) return;
  isOpenModal.value = !isOpenModal.value;
};
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
              @click="toggleModal"
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
              @click="toggleModal"
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
            @focus="toggleModal"
          />
        </div>
      </div>
    </div>
    <button
      @click="goNextStep(step + 1)"
      :disabled="person.age == '' || person.gender == '' || !isAgreeCoockie"
      class="quiz__btn"
    >
      Дальше
    </button>
  </div>
  <div v-if="isOpenModal" class="modal-backdrop" @click="toggleModal">
    <div class="modal" @click.stop>
      <div class="modal__inner">
        <h3 class="modal__title">
          При прохождении опроса мы собираем данные для демонстрации статистики.
          Вы соглашаетесь на обработку персональных данных?
        </h3>
        <div class="modal__btns">
          <button class="modal__btn cancel" @click="toggleModal">Отмена</button>
          <button class="modal__btn ok" @click="agreeCoockie">Принять</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
  z-index: 1;
}
.quiz-wrapper {
  width: 1386px;
  margin-top: 457px;
}
.quiz {
  display: grid;
  gap: 64px;
  padding: 32px 0 64px;
  width: 100%;
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

.region.active {
  background: rgba(255, 255, 255, 0.5);
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
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(0, 0, 0, 0.4);
}

.modal {
  padding: 100px;
  width: 900px;
  height: 548px;
  background: #1b1c21;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.modal::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(101deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  border-radius: 50px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.modal__inner {
  max-width: 700px;
  position: relative;
  z-index: 1;
}

.modal__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 130%;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 60px;
}

.modal__btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.modal__btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 32px;
  width: 290px;
  height: 80px;
  background: rgba(0, 0, 0, 0.001);
  border: 1px solid #ffffff;
  border-radius: 24px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  transition: all 0.3s ease-in-out;
}
.modal__btn:hover {
  background-color: #ffffff;
  color: #1b1c21;
}

.modal__btn.ok {
  background-color: #ffffff;
  color: #1b1c21;
}
</style>
