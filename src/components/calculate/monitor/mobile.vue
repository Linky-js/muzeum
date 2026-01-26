<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import Result from "./result.vue";
import ResultWin5 from "./resultWin5.vue";
import ResultWin6 from "./resultWin6.vue";
import ResultFinal from "./resultFinal.vue";
import Step1 from "./step1.vue";
import Step2 from "./step2.vue";
import Step3 from "./step3.vue";
import { useStore } from "vuex";
import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMonitorSync } from "@/composables/syncRouterSimple.js";
const store = useStore();

const person = ref({
  age: "",
  gender: "",
  region: { id: null, name: "" },
  rost: "",
  ves: "",
  taliya: "",
  fizActive: "",
  yagody: "",
  arteriya: "",
  sahar: "",
  diabet: "",
  priem: "",
  diabetFamily: "",
});
defineProps({
  isNotMobile: Boolean,
});

const router = useRouter();
const route = useRoute();
const emit = defineEmits(["scrollDirection", "changeMobile"]);
// поля, которые двигаются
const downFields = ["fizActive", "yagody"];
const upFields = ["rost", "ves", "taliya"];
watch(
  person,
  (newVal, oldVal) => {
    if (!oldVal) return;

    for (const field of downFields) {
      if (newVal[field] !== oldVal[field]) {
        emit("scrollDirection", "bottom");
        return;
      }
    }

    for (const field of upFields) {
      if (newVal[field] !== oldVal[field]) {
        emit("scrollDirection", "top");
        return;
      }
    }
  },
  { deep: true }
);

const bus = useBroadcastBus({ role: "monitor", pairId: "1", debug: false });
initMonitorSync(router, bus, "1");
bus.on("person", (data) => {
  console.log("person", person);

  person.value = data;
});
bus.on("stepCalc", (data) => {
  console.log("stepCalc", data);

  step.value = data;

  emit("changeMobile", step.value <= 3);
  emit("scrollDirection", "top");
  changeTitles(step.value);
});
// Константы для переиспользования
const ROUTE_PATH = "/monitor-calculate";
const STEP_VALIDATION_RULES = {
  2: ["age", "gender"],
  3: ["rost", "ves", "taliya", "fizActive", "yagody"],
  4: ["arteriya", "sahar", "diabet", "priem", "diabetFamily"],
};

const breadcrumbsList = ref([
  { id: 0, title: "Главная", link: "/" },
  { id: 1, title: "Калькулятор", link: `${ROUTE_PATH}?step=1` },
]);

const step = ref(1);
const title = ref();
const subtitle = ref();

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
    { id: 0, title: "Главная", link: "/" },
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
        "Введите ваши данные для определения статистической продолжительности жизни на основе данных",
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
</script>
<template>
  <div class="header" v-if="isNotMobile">
    <Breadcrums :list="breadcrumbsList" view="monitor" />
   
  </div>
  <div class="content" :class="{ 'not-mobile': !isNotMobile }">
    <div class="content__top" v-if="![4, 6, 7].includes(step)">
      <h1 class="content__title animBtn" v-html="title"></h1>
      <p class="content__subtitle" v-if="subtitle" v-html="subtitle"></p>
    </div>
    <div
      class="content__inner"
      :class="{
        'full-width': step === 4 || step === 5,
        'not-mobile': !isNotMobile,
      }"
    >
      <Step1
        v-if="step === 1"
        class="step1"
        :person="person"
        :step="step"
        :goNextStep="goNextStep"
        view="mobile"
      />
      <Step2
        v-if="step === 2"
        class="step2"
        :person="person"
        :step="step"
        :goNextStep="goNextStep"
        view="mobile"
      />
      <Step3
        v-if="step === 3"
        class="step3"
        :person="person"
        :step="step"
        :goNextStep="goNextStep"
        view="mobile"
      />
      <Result
        class="step4"
        v-if="step === 4"
        :person="person"
        @next="checkStep"
      />
      <ResultWin6
        v-if="step === 5"
        :person="person"
        :step="step"
        :goNextStep="goNextStep"
      />
      <ResultWin5
        v-if="step === 6"
        :person="person"
        :step="step"
        :goNextStep="goNextStep"
      />
      <ResultFinal v-if="step === 7" :person="person" />
    </div>
  </div>
  <svg style="display: none">
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.01 0.01"
        numOctaves="1"
        seed="5"
        result="turbulence"
      ></feTurbulence>
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR
          type="gamma"
          amplitude="1"
          exponent="10"
          offset="0.5"
        ></feFuncR>
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"></feFuncG>
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"></feFuncB>
      </feComponentTransfer>

      <feGaussianBlur
        in="turbulence"
        stdDeviation="3"
        result="softMap"
      ></feGaussianBlur>

      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lighting-color="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300"></fePointLight>
      </feSpecularLighting>

      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      ></feComposite>

      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="150"
        xChannelSelector="R"
        yChannelSelector="G"
      ></feDisplacementMap>
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
  flex-direction: column-reverse;
  gap: 38px;
  padding: 30px 0;
}

.header__logo {
  max-width: 184px;
}

.header__logo svg {
  width: 100%;
  height: fit-content;
}

.content {
  margin-top: 46px;
  display: block;
  height: auto;
  padding-bottom: 72px;
}

.content.not-mobile {
  margin: 0;
  padding: 0;
}

.content__title {
  font-family: "TT Commons";
  font-weight: 500;
  color: #ffffff;
  font-size: 62px;
  line-height: 100%;
  letter-spacing: -0.03em;
  text-align: left;
  margin-bottom: 30px;
}

.content.not-mobile .content__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 140px;
  line-height: 100%;
  text-align: center;
  letter-spacing: -0.03em;
  margin-bottom: 32px;
}

.content__subtitle {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 27px;
  line-height: 120%;
  text-align: left;
  max-width: 620px;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #808389;
}

.content__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: none;
  margin-top: 64px;
  padding: 0;
  height: auto;
}

.content__inner.not-mobile {
  margin: 0;
  display: block;
}

.full-width {
  max-width: 100%;
}

.step3,
.step2,
.step1 {
  margin-top: 6.25rem;
  height: 100%;
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
