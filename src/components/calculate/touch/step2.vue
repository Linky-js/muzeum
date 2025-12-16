<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

import VirtualKeyboard from "@/components/ui/VirtualKeyboard.vue";

const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});

const showKeyboard = ref(false);
const activeInput = ref(null);
const keyboardRef = ref(null);
const quizRef = ref(null);

const activateKeyboard = (field) => {
  activeInput.value = null;
  activeInput.value = field;
  showKeyboard.value = true;
};
const onKeyboardInput = (text) => {
  if (activeInput.value === "rost") {
    props.person.rost = text.replace(/\D/g, "");
  }

  if (activeInput.value === "ves") {
    props.person.ves = text.replace(/\D/g, ""); // только цифры
  }
};
const handleClickOutside = (event) => {
  const keyboard = keyboardRef.value?.$refs.keyboardEl;
  const quiz = quizRef.value;
  console.log("keyboard", keyboard);

  // Если клавиатура не открыта — ничего не делаем
  if (!showKeyboard.value) return;

  // Если клик внутри инпутов или внутри клавиатуры — игнорируем
  if (
    keyboard?.contains(event.target) ||
    quiz?.contains(event.target.closest("input"))
  ) {
    return;
  }

  // Иначе — скрываем клавиатуру
  showKeyboard.value = false;
  activeInput.value = null;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div ref="quizRef" class="quiz-wrapper">
    <div class="quiz">
      <div class="question animBtnBottom">
        <div class="label">Рост:</div>
        <div class="input_wrap">
          <input
            type="number"
            class="input_quiz relative"
            v-model="person.rost"
            placeholder="См"
            @focus="activateKeyboard('rost')"
          />
        </div>
      </div>
      <div class="question animBtnBottom">
        <div class="label">Вес:</div>
        <div class="input_wrap">
          <input
            type="number"
            class="input_quiz relative"
            v-model="person.ves"
            placeholder="Кг"
            @focus="activateKeyboard('ves')"
          />
        </div>
      </div>
      <div v-if="person.gender == 'Мужчины'" class="question animBtnBottom">
        <div class="label">
          Окружность талии: <br />
          <small>Мужчина</small>
        </div>
        <div class="answers answersColumn">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">&#60;94 см</span>
            <input
              type="radio"
              name="taliya"
              v-model="person.taliya"
              value=" &#60;94 см"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">от 94 до &#60; 102 см</span>
            <input
              type="radio"
              name="taliya"
              v-model="person.taliya"
              value="от 94 до &#60; 102 см"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">≥102 см</span>
            <input
              type="radio"
              name="taliya"
              v-model="person.taliya"
              value="≥102 см"
              id=""
            />
          </label>
        </div>
      </div>
      <div v-if="person.gender == 'Женщины'" class="question animBtnBottom">
        <div class="label">
          Окружность талии: <br />
          <small>Женшина</small>
        </div>
        <div class="answers answersColumn">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">&#60;80 см</span>
            <input
              type="radio"
              name="taliya"
              v-model="person.taliya"
              value=" &#60;80 см"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">80-88 см</span>
            <input
              type="radio"
              name="taliya"
              v-model="person.taliya"
              value="80-88 см"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">>88 см</span>
            <input
              type="radio"
              name="taliya"
              v-model="person.taliya"
              value=">88 см"
              id=""
            />
          </label>
        </div>
      </div>
      <div class="question animBtnBottom">
        <div class="label">Уровень физической активности:</div>
        <div class="answers answersColumn">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">≥4 часа/неделю</span>
            <input
              type="radio"
              name="fizActive"
              value="≥4 часа/неделю"
              v-model="person.fizActive"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">&#60;4 часа в неделю</span>
            <input
              type="radio"
              name="fizActive"
              value="&#60;4 часа в неделю"
              v-model="person.fizActive"
              id=""
            />
          </label>
        </div>
      </div>
      <div class="question animBtnBottom">
        <div class="label">
          Ежедневное потребление <br />
          фруктов,овощей, ягод
        </div>
        <div class="answers">
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Да</span>
            <input
              type="radio"
              name="yagody"
              value="Да"
              v-model="person.yagody"
              id=""
            />
          </label>
          <label class="answer">
            <div class="tint"></div>
            <span class="relative">Нет</span>
            <input
              type="radio"
              name="yagody"
              value="Нет"
              v-model="person.yagody"
              id=""
            />
          </label>
        </div>
      </div>
    </div>
    <button
      @click="goNextStep(3)"
      :disabled="
        person.rost == '' ||
        person.ves == '' ||
        person.taliya == '' ||
        person.fizActive == '' ||
        person.yagody == ''
      "
      class="quiz__btn animBtnBottom"
    >
      Дальше
    </button>
  <transition>
    <VirtualKeyboard
      ref="keyboardRef"
      v-if="showKeyboard"
      @input="onKeyboardInput"
    />
  </transition>
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
  margin-bottom: 69px;
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
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  backdrop-filter: blur(10px);
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
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

.tint::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(286deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

@media screen and (max-width: 475px) {
  .quiz-wrapper {
    margin-top: 0 !important;
    height: auto !important;
    width: 100%;
  }

  .quiz {
    gap: 0;
    padding: 0;
    max-width: 100%;
    margin-bottom: 0;
  }

  .question {
    flex-direction: column;
    align-items: start;
    gap: 16px;
    padding: 24px 0;
    border-bottom: 1px solid #31353c;
  }

  .question:first-child {
    border-top: 1px solid #31353c;
  }

  .label {
    font-weight: 400;
    font-size: 20px;
    line-height: 110%;
    letter-spacing: -0.02em;
  }

  .answers {
    gap: 8px;
    max-width: none;
    width: 100%;
  }

  .answer {
    padding: 24px 32px;
    width: auto;
    height: 48px;
    border-radius: 109.09px;
  }

  .answer span {
    font-weight: 600;
    font-size: 16px;
    line-height: 37px;
  }

  .input_wrap {
    width: 100%;
    height: 48px;
    background: linear-gradient(
      85.26deg,
      rgba(217, 217, 217, 0.1) 3.83%,
      rgba(115, 115, 115, 0.1) 99.95%
    );
    border-radius: 16px;
  }
  .answer::before {
    padding: 2px;
  }
  .input_wrap::before {
    padding: 1px;
  }
  .input_quiz {
    font-size: 16px;
    padding: 5px 16px;
    padding-right: 40px;
  }

  .input_quiz::placeholder {
    font-size: 16px;
  }
  .input_wrap-arr {
    top: 18px;
    right: 16px;
    width: 15px;
    height: 16px;
  }

  .quiz__btn {
    position: fixed;
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
    width: auto;
    border-radius: 12px;
    height: 48px;
    font-size: 14px;
  }

  .quiz__btn:disabled {
    background-color: #10131b;
  }

  .custom_list {
    height: 350px;
    bottom: 120%;
    top: initial;
    background-color: #010101d6;
  }

  .region {
    font-size: 16px;
    padding: 15px;
  }
}
</style>
