<script setup>
import IconSmileNegative from "@/components/icons/IconSmileNegative.vue";
import IconSmileNeutral from "@/components/icons/IconSmileNeutral.vue";
import IconSmilePositive from "@/components/icons/IconSmilePositive.vue";
import IconSmileQuestion from "@/components/icons/IconSmileQuestion.vue";
import { ref } from "vue";

const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});

const attitudes = ref([
  {
    name: "Положительное",
    icon: IconSmilePositive,
  },
  {
    name: "Нейтральное",
    icon: IconSmileNeutral,
  },
  {
    name: "Отрицательное",
    icon: IconSmileNegative,
  },
  {
    name: "Затрудняюсь",
    icon: IconSmileQuestion,
  },
]);
</script>

<template>
  <div class="quiz-wrapper">
    <div class="answers">
      <label class="answer" v-for="attitude in attitudes" :key="attitude">
        <div class="tint"></div>
        <input
          type="radio"
          name="attitude"
          v-model="person.attitude"
          :value="attitude"
        />
        <div class="answer__info">
          <component :is="attitude.icon" class="answer__icon" />
          <h4 class="answer__name">{{ attitude.name }}</h4>
        </div>
      </label>
    </div>
    <button
      @click="goNextStep(step + 1)"
      :disabled="!person.attitude"
      class="quiz__btn"
    >
      Дальше
    </button>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
  z-index: 1;
}
.quiz-wrapper {
  width: 1614px;
  margin-top: 274px;
}

.answers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
}
.answer {
  position: relative;
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
  border-radius: 61.2976px;
}
.answer::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(347deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  border-radius: 61.2976px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 1;
}
.answer input {
  display: none;
}

.answer__info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 40px;
  height: 265px;
  z-index: 1;
}
.answer__name {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 64px;
  line-height: 100%;
  letter-spacing: -0.03em;
}

.answer .tint {
  opacity: 0;
  transition: all 0.3s ease-in-out;
}
.answer:has(input:checked) .tint {
  opacity: 1;
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

.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 61.2976px;
  backdrop-filter: blur(10px);
  background: rgba(217, 217, 217, 0.4);
}
.tint::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(287deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  border-radius: inherit;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 1;
}
</style>
