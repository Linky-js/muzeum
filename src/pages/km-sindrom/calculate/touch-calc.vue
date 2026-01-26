<script setup>
import { onMounted, ref, watch, computed, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import IconArrow from "@/components/icons/IconArrow.vue";
import result from "@/components/calculate/touch/result.vue";
import resultWin5 from "@/components/calculate/touch/resultWin5.vue";
import resultWin6 from "@/components/calculate/touch/resultWin6.vue";
import resultFinal from "@/components/calculate/touch/resultFinal.vue";
import Step1 from "@/components/calculate/touch/step1.vue";
import Step2 from "@/components/calculate/touch/step2.vue";
import Step3 from "@/components/calculate/touch/step3.vue";

import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMasterSync } from "@/composables/syncRouterSimple.js";
import { useStore } from "vuex";

const store = useStore();
const router = useRouter();
const route = useRoute();

const bus = useBroadcastBus({ role: "touch", pairId: "1", debug: false });
initMasterSync(router, bus, "1");

bus.on("defaultScreen", (payload) => {
  router.push("/touch1/screen-1");
});

// Константы для переиспользования
const ROUTE_PATH = "/touch-calculate/touch-calc";
const STEP_VALIDATION_RULES = {
  2: ["age", "gender"],
  3: ["rost", "ves", "taliya", "fizActive", "yagody"],
  4: ["arteriya", "sahar", "diabet", "priem", "diabetFamily"],
};

const breadcrumbsList = ref([
  { id: 0, title: "Главная", link: "/touch1/screen-1" },
  { id: 1, title: "Калькулятор", link: `${ROUTE_PATH}?step=1` },
]);

const step = ref(1);
const title = ref();
const subtitle = ref();
const person = computed(() => store.state.person);

watch(
  person,
  (newValue) => {
    bus.send("person", JSON.parse(JSON.stringify(newValue)), {
      role: "monitor",
      pairId: "1",
    });
  },
  { deep: true }
);

const updateField = (key, value) => {
  store.commit("updatePerson", { [key]: value });
};
// Универсальная функция для перехода по шагам
const navigateToStep = (targetStep, updateUrl = true) => {
  step.value = targetStep;
  bus.send("stepCalc", targetStep, { role: "monitor", pairId: "1" });
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
      error: "Заполните все предыдущие шаги для перехода к Календарю дней",
    },
    5: { requiredStep: 4, error: "Заполните все данные для перехода к Выводу" },
    6: { requiredStep: 4, error: "Заполните все данные для перехода к Выводу" },
  };

  const validation = validationMap[targetStep];
  if (validation && !validateStepFields(validation.requiredStep)) {
    toast.error(validation.error);
    return;
  }

  // Дополнительные проверки для шагов 5 и 6
  if (targetStep === 5 && person.value.diabet !== "Нет") {
    toast.error("Нельзя перейти на этот шаг при наличии диабета");
    return;
  }
  if (targetStep === 6 && person.value.diabet === "Нет") {
    toast.error("Нельзя перейти на этот шаг при отсутствии диабета");
    return;
  }

  navigateToStep(targetStep);
};

// Упрощенная функция goNextStep
const goNextStep = (nextStep) => {
  if (!validateStepFields(nextStep - 1)) {
    const errorMessages = {
      2: "Заполните поля Возраст и Пол",
      3: "Заполните поля Рост, Вес, Окружность талии",
      4: "Заполните поля Артерия, Сахар",
    };
    toast.error(errorMessages[nextStep] || "Заполните необходимые поля");
    return;
  }

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
    { id: 1, title: "Калькулятор", link: `${ROUTE_PATH}?step=1` },
  ];

  const breadcrumbsConfig = {
    1: baseBreadcrumbs,
    2: baseBreadcrumbs,
    3: baseBreadcrumbs,
    4: [
      ...baseBreadcrumbs,
      { id: 2, title: "Календарь дней", link: `${ROUTE_PATH}?step=4` },
    ],
    5: [
      ...baseBreadcrumbs,
      { id: 2, title: "Календарь дней", link: `${ROUTE_PATH}?step=4` },
      { id: 3, title: "Вывод", link: `${ROUTE_PATH}?step=5` },
    ],
    6: [
      ...baseBreadcrumbs,
      { id: 2, title: "Календарь дней", link: `${ROUTE_PATH}?step=4` },
      { id: 3, title: "Вывод", link: `${ROUTE_PATH}?step=6` },
    ],
    7: [
      ...baseBreadcrumbs,
      { id: 2, title: "Календарь дней", link: `${ROUTE_PATH}?step=4` },
      {
        id: 3,
        title: "Вывод",
        link: `${ROUTE_PATH}?step=${person.value.diabet === "Нет" ? 5 : 6}`,
      },
      { id: 4, title: "Рекомендации", link: `${ROUTE_PATH}?step=7` },
    ],
  };

  breadcrumbsList.value = breadcrumbsConfig[currentStep] || baseBreadcrumbs;
};

const changeTitles = (step) => {
  const titles = {
    4: { title: "Календарь дней", subtitle: "" },
    5: {
      title:
        "Для людей с подобным<br /> профилем риск развития<br /> диабета - низкий.",
      subtitle: "",
    },
    6: { title: "Вывод", subtitle: "" },
    7: {
      title: "Практические советы для<br /> долгой и здоровой жизни",
      subtitle: "",
    },
    default: {
      title: "Калькулятор",
      subtitle:
        "Введите ваши данные для определения статистической<br /> продолжительности жизни на основе данных",
    },
  };

  const { title: newTitle, subtitle: newSubtitle } =
    titles[step] || titles.default;
  title.value = newTitle;
  subtitle.value = newSubtitle;
};

// Обработка изменения параметров URL
watch(
  () => route.query.step,
  (newStep) => {
    if (newStep) {
      const stepNumber = parseInt(newStep);
      if (stepNumber >= 1 && stepNumber <= 7) {
        goToStep(stepNumber);
      }
    }
  }
);

// Инициализация при загрузке
onMounted(() => {
  const urlStep = parseInt(route.query.step);
  if (urlStep >= 1 && urlStep <= 7) {
    step.value = urlStep;
  }

  changeTitles(step.value);
  updateBreadcrumbs(step.value);
});

const goBack = () => {
  if (step.value === 1) {
    router.push(`/touch-calculate/touch-qr`);
  } else if (step.value === 7 && person.value.diabet) {
    router.push(`${ROUTE_PATH}?step=${step.value - 2}`);
  } else {
    router.push(`${ROUTE_PATH}?step=${step.value - 1}`);
  }
};
onBeforeUnmount(() => {
  store.commit("resetPerson");
})
</script>
<template>
  <div class="header">
    <Breadcrums :list="breadcrumbsList" />
    
  </div>
  <div class="content relative">
    <div class="content__top">
      <h1 class="content__title animBtn" v-html="title"></h1>
      <div @click="goBack" class="to-back">
        <IconArrow class="to-back__icon" />
        <span class="to-back__text">Назад</span>
      </div>
      <p class="content__subtitle animBtn" v-if="subtitle" v-html="subtitle"></p>
    </div>
    <div class="content__inner" :class="{ 'full-width': step === 4 || step === 5 }">
      <Step1 v-if="step === 1" class="step1" :person="person" :step="step" :goNextStep="goNextStep" />
      <Step2 v-if="step === 2" class="step2" :person="person" :step="step" :goNextStep="goNextStep" />
      <Step3 v-if="step === 3" class="step3" :person="person" :step="step" :goNextStep="goNextStep" />
      <result class="step4" v-if="step === 4" :person="person" @next="checkStep" />
      <resultWin6 v-if="step === 5" :person="person" :step="step" :goNextStep="goNextStep" />
      <resultWin5 v-if="step === 6" :person="person" :step="step" :goNextStep="goNextStep" />
      <result-final v-if="step === 7" :person="person" />
    </div>
  </div>
  <MenuNavigation v-if="step !== 4" class="footer__btn" />
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
</template>
<style scoped>
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
  opacity: 0;
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
  max-width: 86.625rem;
  width: 100%;
  height: 100%;
}

.full-width {
  max-width: 100%;
}

.step3,
.step2 {
  margin-top: 6.25rem;
  height: 100%;
}

.step4 {
  width: 100%;
  margin-top: 375px;
  height: 100%;
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
