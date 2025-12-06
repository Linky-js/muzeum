<script setup>
import { ref } from "vue";

const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});

const spheres = ref([
  {
    name: "Общественное здравоохранение",
    img: "./ai/sphere-1.png",
  },
  {
    name: "Точная диагностика",
    img: "./ai/sphere-2.png",
  },
  {
    name: "Доступная диагностика",
    img: "./ai/sphere-3.png",
  },
  {
    name: "Исследования",
    img: "./ai/sphere-4.png",
  },
  {
    name: "Образование",
    img: "./ai/sphere-5.png",
  },
]);
</script>

<template>
  <div class="quiz-wrapper">
    <div class="answers">
      <label class="answer" v-for="sphere in spheres" :key="sphere.name">
        <div class="tint"></div>
        <input
          type="radio"
          name="sphere"
          v-model="person.sphere"
          :value="sphere.name"
        />
        <div class="answer__wrapper">
          <img class="answer__img" :src="sphere.img" :alt="sphere.name" />
          <h4 class="answer__name">{{ sphere.name }}</h4>
        </div>
      </label>
    </div>
    <button
      @click="goNextStep(step + 1)"
      :disabled="!person.sphere"
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
  width: 3488px;
  margin-top: 221px;
}

.answers {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 22px;
}
.answer {
  position: relative;
  padding: 60px;
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
  border-radius: 38px;
}

.answer::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(347deg, #646464 0%, #4c4c4c 86%, #ffffff94 100%);
  border-radius: 38px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 1;
}
.answer input {
  display: none;
}

.answer__wrapper {
  position: relative;
  width: 560px;
  height: 605px;
  border-radius: 38px;
  padding: 44px;
  z-index: 1;
  display: flex;
  align-items: end;
}
.answer__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.answer__name {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 36.4454px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  position: relative;
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
  border-radius: 38px;
  backdrop-filter: blur(10px);
  background: linear-gradient(85.26deg, rgba(217, 217, 217, 0.4) 3.83%, rgba(115, 115, 115, 0.4) 99.95%);
}
.tint::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(287deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  border-radius: inherit;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 1;
}
</style>
