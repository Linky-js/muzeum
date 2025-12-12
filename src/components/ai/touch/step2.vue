<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'

const router = useRouter()

const bus = useBroadcastBus({
  role: 'touch',
  pairId: '1',
  debug: false,
})
initMasterSync(router, bus, '1')

const props = defineProps({
  person: Object,
  step: Number,
  goNextStep: Function,
});



const typesAi = ref([
  {
    id: 1,
    name: "Золушка",
    responsibilities:
      "ИИ берет на себя рутинную работу<br> и освобождает ваше время",
    img: "./ai/Cinderella.png",
    video: '/video/heroes/zolushka_loop.webm'
  },
  {
    id: 2,
    name: "Стажер",
    responsibilities: "ИИ требует надзора, но со<br> временем учится",
    img: "./ai/Intern.png",
    video: '/video/heroes/stasher_loop.webm'
  },
  {
    id: 3,
    name: "Супермен",
    responsibilities: "ИИ делает человеческие задачи<br> быстрее и эффективнее",
    img: "./ai/Superman.png",
    video: '/video/heroes/super_loop.webm'
  },
  {
    id: 4,
    name: "Шерлок Холмс",
    responsibilities: "ИИ находит скрытые связи и<br> объясняет непонятное",
    img: "./ai/Sherlock.png",
    video: '/video/heroes/sherlok_loop.webm'
  },
  {
    id: 5,
    name: "Хрустальный шар",
    responsibilities:
      "ИИ мыслит иначе, чем человек,<br> и дает неожиданные прогнозы",
    img: "./ai/Crystal.png",
    video: '/video/heroes/mag_loop.webm'
  },
]);
const addPerson = () => {
  console.log(props.person);
  let ai = props.person.ai
  bus.send('currentHero', { hero: JSON.parse(JSON.stringify(ai)) })
}
</script>

<template>
  <div class="quiz-wrapper">
    <div class="answers">
      <label class="answer" v-for="ai in typesAi" :key="ai.id">
        <input type="radio" name="ai" v-model="person.ai" @change="addPerson" :value="ai" :id="ai.id" />
        <div class="answer__wrapper">
          <div class="tint"></div>
          <img class="answer__img" :src="ai.img" :alt="ai.name" />
        </div>
        <div class="answer__info">
          <h4 class="answer__name">{{ ai.name }}</h4>
          <p class="answer__text" v-html="ai.responsibilities"></p>
        </div>
      </label>
    </div>
    <button @click="goNextStep(step + 1)" :disabled="!person.ai" class="quiz__btn">
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
  width: 3400px;
  margin-top: 177px;
}

.answers {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.answer {
  padding: 60px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.answer input {
  display: none;
}

.answer__wrapper {
  width: 560px;
  height: 721px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.answer__wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(273deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  border-radius: 28px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 2;
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.answer__img {
  object-fit: contain;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.answer__info {
  display: grid;
  gap: 16px;
}

.answer__name {
  font-family: "TT Hoves";
  font-weight: 600;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.answer__text {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.5;
}

.answer .tint {
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.answer:has(input:checked) .tint {
  opacity: 1;
}

.answer:has(input:checked) .answer__wrapper::before {
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
  border-radius: 28px;
  backdrop-filter: blur(10px);
  background: rgba(217, 217, 217, 0.13);
}

.tint::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(273deg, #ffffff3b 100%);
  border-radius: 28px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 2;
  transition: all 0.3s ease-in-out;
}
</style>
