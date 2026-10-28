<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import IconArrow from "@/components/icons/IconArrow.vue";
import Step1 from "@/components/ai/touch/step1.vue";
import Step2 from "@/components/ai/touch/step2.vue";
import Step3 from "@/components/ai/touch/step3.vue";
import Step4 from "@/components/ai/touch/step4.vue";
import Step5 from "@/components/ai/touch/step5.vue";

const router = useRouter();
const route = useRoute();

import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'

const bus = useBroadcastBus({
  role: 'touch',
  pairId: '1',
  debug: false,
})
initMasterSync(router, bus, '1')
// Константы для переиспользования
const ROUTE_PATH = "/touch-ai";
const STEP_VALIDATION_RULES = {
  1: ["age", "gender"],
  2: ["ai"],
  3: ["attitude"],
  4: ["sphere"],
};

const breadcrumbsList = ref([
  { id: 0, title: "Главная", link: "/touch1/screen-1" },
  { id: 1, title: "Какой вы тип ИИ?", link: `${ROUTE_PATH}?step=1` },
]);

const step = ref(1);
const title = ref();
const subtitle = ref();
const person = ref({
  age: "",
  gender: "",
  ai: null,
  attitude: "",
  sphere: ""
});
watch(() => person.value, (newPerson) => {
  bus.send('currentHeroGlobal', { hero: JSON.parse(JSON.stringify(newPerson)) })
}, { deep: true })
bus.on('defaultScreen', () => {

  router.push('/touch1/screen-1')
})
// Универсальная функция для перехода по шагам
const navigateToStep = (targetStep, updateUrl = true) => {
  step.value = targetStep;
  changeTitles(targetStep);
  updateBreadcrumbs(targetStep);

  if (updateUrl) {
    router.push({ path: ROUTE_PATH, query: { step: targetStep } });
  }
};

// Функция проверки заполненности полей
const validateStepFields = (stepNumber) => {
  const fieldsToCheck = STEP_VALIDATION_RULES[stepNumber] || [];
  return fieldsToCheck.every((field) => person.value[field] !== "");
};

// Оптимизированная функция перехода на шаг
const goToStep = (targetStep) => {
  if (targetStep === 1) {
    navigateToStep(targetStep);
    return;
  }

  const validationMap = {
    4: {
      requiredStep: 3,
      error: "Заполните все предыдущие шаги для перехода к следующему шагу",
    },
    5: { requiredStep: 4, error: "Заполните все данные для перехода к Выводу" },
    6: { requiredStep: 4, error: "Заполните все данные для перехода к Выводу" },
  };

  const validation = validationMap[targetStep];
  if (validation && !validateStepFields(validation.requiredStep)) {
    toast.error(validation.error);
    return;
  }
  navigateToStep(targetStep);
};
async function saveUserResult(result) {
  // Создаём уникальный ключ для этого результата
  // Используем сочетание пола, сферы и ИИ (очень устойчиво для твоего квиза)
  const key = `quiz_result_${result?.gender}_${result?.sphere}_${result?.ai?.id}`;

  // Если такой ключ уже есть — выходим
  if (localStorage.getItem(key)) {
    console.log('Результат уже отправлен ранее. Повтор не сохраняем.');
    return;
  }

  // Если записи нет — отправляем на сервер
  try {
    const res = await fetch('http://127.0.0.1:3001/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    });
    console.log('RES: ', res);

    // Ставим метку, что запись уже отправлялась
    localStorage.setItem(key, '1');
  } catch (err) {
    console.error('Ошибка сохранения:', err);
  }
}

// Упрощенная функция goNextStep
const goNextStep = async (nextStep) => {
  console.log('nextStep', nextStep)
  if (!validateStepFields(nextStep - 1)) {
    console.log('nextStep', nextStep)
    const errorMessages = {
      2: "Заполните поля Возраст и Пол",
      3: "Выберите ИИ",
      4: "Выберите как вы относитесь к ИИ",
      5: "Выберите какие сферы получат наибольшие выгоды от ИИ",
    };
    toast.error(errorMessages[nextStep] || "Заполните необходимые поля");
    return;
  }
  if (nextStep === 5) {
    await saveUserResult(person.value)
  }
  bus.send('step', { step: nextStep })

  navigateToStep(nextStep);

};

const checkStep = () => {
  const targetStep = person.value.diabet === "Нет" ? 5 : 6;
  navigateToStep(targetStep);
};

// Оптимизированная функция хлебных крошек
const updateBreadcrumbs = (currentStep) => {
  const baseBreadcrumbs = [
    { id: 0, title: "Главная", link: "/touch1/screen-1" },
    { id: 1, title: "Восприятие ИИ", link: `${ROUTE_PATH}?step=1` },
  ];

  const breadcrumbsConfig = {
    1: baseBreadcrumbs,
    2: [
      ...baseBreadcrumbs,
      { id: 2, title: "Выбор ИИ", link: `${ROUTE_PATH}?step=2` },
    ],
    3: [
      ...baseBreadcrumbs,
      { id: 2, title: "Выбор ИИ", link: `${ROUTE_PATH}?step=2` },
      { id: 3, title: "Отношение к ИИ", link: `${ROUTE_PATH}?step=3` },
    ],
    4: [
      ...baseBreadcrumbs,
      { id: 2, title: "Выбор ИИ", link: `${ROUTE_PATH}?step=2` },
      { id: 3, title: "Отношение к ИИ", link: `${ROUTE_PATH}?step=3` },
      { id: 4, title: "Сферы применения", link: `${ROUTE_PATH}?step=4` },
    ],
    5: [
      ...baseBreadcrumbs,
      { id: 2, title: "Выбор ИИ", link: `${ROUTE_PATH}?step=2` },
      { id: 3, title: "Отношение к ИИ", link: `${ROUTE_PATH}?step=3` },
      { id: 4, title: "Сферы применения", link: `${ROUTE_PATH}?step=4` },
      { id: 5, title: "Вывод", link: `${ROUTE_PATH}?step=5` },
    ],
  };

  breadcrumbsList.value = breadcrumbsConfig[currentStep] || baseBreadcrumbs;
};

const changeTitles = (step) => {
  const titles = {
    1: { title: "Расскажите о себе", subtitle: "" },
    2: { title: "Какое восприятие ИИ<br> вам ближе?", subtitle: "" },
    3: { title: "Ваше отношение<br> к широкому использованию ИИ<br> в здравоохранении", subtitle: "" },
    4: { title: "Какие сферы получат<br> наибольшие выгоды от ИИ?", subtitle: "" },
    5: { title: "Спасибо за участие!", subtitle: "Вот как ответили вы и другие пользователи" },
  };

  const { title: newTitle, subtitle: newSubtitle } =
    titles[step] || titles.default;
  title.value = newTitle;
  subtitle.value = newSubtitle;
};


const goBack = () => {
  router.back();
}
// Обработка изменения параметров URL
watch(
  () => route.query.step,
  (newStep) => {
    if (newStep) {
      const stepNumber = parseInt(newStep);
      bus.send('step', { step: stepNumber })
      bus.send('currentHeroGlobal', { hero: JSON.parse(JSON.stringify(person.value)) })
      if (stepNumber >= 1 && stepNumber <= 7) {
        goToStep(stepNumber);
      }
    }
  }
);

// Инициализация при загрузке
onMounted(() => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('quiz_result_')) {
      localStorage.removeItem(key)
    }
  })
  const urlStep = parseInt(route.query.step);
  if (urlStep >= 1 && urlStep <= 5) {
    step.value = urlStep;
  }

  changeTitles(step.value);
  updateBreadcrumbs(step.value);
});


</script>
<template>
  <div class="wrapper-content">
    <div class="header">
      <Breadcrums :list="breadcrumbsList" :dots-in-text="false" />
      
    </div>
    <div class="content relative">
      <div class="content__top">
        <h1 class="content__title animBtn" v-html="title"></h1>
        <div @click="goBack()" class="to-back">
          <IconArrow class="to-back__icon" />
          <span class="to-back__text">Назад</span>
        </div>
        <p class="content__subtitle" v-if="subtitle" v-html="subtitle"></p>
      </div>
      <div class="content__inner">
        <Step1 v-if="step === 1" class="step1" :person="person" :step="step" :goNextStep="goNextStep" />
        <Step2 v-if="step === 2" class="step2" :person="person" :step="step" :goNextStep="goNextStep" />
        <Step3 v-if="step === 3" class="step3" :person="person" :step="step" :goNextStep="goNextStep" />
        <Step4 v-if="step === 4" class="step4" :person="person" :step="step" :goNextStep="goNextStep" />
        <Step5 v-if="step === 5" class="step4" :person="person" :step="step" />
      </div>
    </div>
    <MenuNavigation class="footer__btn" />
    <svg style="display: none">
      <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence">
        </feTurbulence>
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"></feFuncR>
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"></feFuncG>
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"></feFuncB>
        </feComponentTransfer>

        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"></feGaussianBlur>

        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100"
          lighting-color="white" result="specLight">
          <fePointLight x="-200" y="-200" z="300"></fePointLight>
        </feSpecularLighting>

        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage"></feComposite>

        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G">
        </feDisplacementMap>
      </filter>
    </svg>
  </div>
</template>
<style scoped>
.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
  position: relative;
  width: 100%;
  height: 100vh;
}

.relative {
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.content {
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.content__title {
  font-family: "TT Commons";
  font-weight: 500;
  font-size: 8.75rem;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  text-align: center;
}

.content__subtitle {
  font-family: "TT Hoves";
  font-weight: 400;

  font-size: 38px;
  line-height: 110%;
  text-align: center;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #808389;
}

.to-back {
  position: absolute;
  left: 0;
  top: 1.75rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.to-back__icon {
  width: 3.4375rem;
}

.to-back__text {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 3.375rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.content__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
}

.footer__btn {
  margin-top: auto;
  position: fixed;
  bottom: 10rem;
  right: 31.875rem;
  z-index: 5;
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
  background: linear-gradient(85.26deg,
      rgba(217, 217, 217, 0.1) 3.83%,
      rgba(115, 115, 115, 0.1) 99.95%);
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
