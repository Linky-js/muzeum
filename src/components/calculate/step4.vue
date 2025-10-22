<script setup>
const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});
</script>

<template>
  <div class="quiz-wrapper">
    <div class="quiz">
      <div class="question">
        <div class="label">
          Наличие артериальной <br />
          гипертензии:
        </div>
        <div class="answers">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Да</span>
            <input
              type="radio"
              name="arteriya"
              v-model="person.arteriya"
              value="Да"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Нет</span>
            <input
              type="radio"
              name="arteriya"
              v-model="person.arteriya"
              value="Нет"
              id=""
            />
          </label>
        </div>
      </div>
      <div class="question">
        <div class="label">
          Повышение уровня сахара в <br />
          анамнезе:
        </div>
        <div class="answers">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Да</span>
            <input
              type="radio"
              name="sahar"
              v-model="person.sahar"
              value="Да"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Нет</span>
            <input
              type="radio"
              name="sahar"
              v-model="person.sahar"
              value="Нет"
              id=""
            />
          </label>
        </div>
      </div>
      <div class="question">
        <div class="label">Наличие сахарного диабета:</div>
        <div class="answers">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Да</span>
            <input
              type="radio"
              name="diabet"
              v-model="person.diabet"
              value="Да"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Нет</span>
            <input
              type="radio"
              name="diabet"
              v-model="person.diabet"
              value="Нет"
              id=""
            />
          </label>
        </div>
      </div>
      <div class="question">
        <div class="label">
          Прием препаратов, снижающих <br />
          артериальное давление
        </div>
        <div class="answers">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Да</span>
            <input
              type="radio"
              name="priem"
              v-model="person.priem"
              value="Да"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Нет</span>
            <input
              type="radio"
              name="priem"
              v-model="person.priem"
              value="Нет"
              id=""
            />
          </label>
        </div>
      </div>
      <div class="question">
        <div class="label">
          Семейный анамнез сахарного <br />
          диабета.
        </div>
        <div class="answers answersColumn">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Нет</span>
            <input
              type="radio"
              name="diabetFamily"
              v-model="person.diabetFamily"
              value="Нет"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Да, в первой линии родства</span>
            <input
              type="radio"
              name="diabetFamily"
              v-model="person.diabetFamily"
              value="Да, в первой линии родства"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Да, во второй линии родства</span>
            <input
              type="radio"
              name="diabetFamily"
              v-model="person.diabetFamily"
              value="Да, во второй линии родства"
              id=""
            />
          </label>
        </div>
      </div>
    </div>
    <button
      @click="goNextStep(step + 1)"
      :disabled="
        person.arteriya == '' ||
        person.sahar == '' ||
        person.diabet == '' ||
        person.priem == '' ||
        person.diabetFamily == ''
      "
      class="quiz__btn"
    >
      Рассчитать
    </button>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
  z-index: 1;
}

.quiz-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.quiz {
  display: grid;
  gap: 64px;
  padding: 32px 0 64px;
  width: 100%;
  max-width: 1422px;
  margin-bottom: 175px;
}
.question {
  display: flex;
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
  width: 100%;
}
.answer {
  height: 90px;
  width: 100%;
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

.answersColumn {
  grid-template-columns: repeat(1, 1fr);
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
