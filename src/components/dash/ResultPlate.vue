<script setup>
import { computed, onMounted, ref } from "vue";
import RoundDiagram from "../ui/RoundDiagram.vue";

const props = defineProps({
  resultObj: Object,
});

const categories = ref(null);
const reccomendations = ref([
  {
    title: "Отлично! Потребление фруктов соответствует норме DASH.",
    color: "#00FF11",
  },
  {
    title: "Уменьшите порции хлеба и круп, выбирайте цельнозерновые варианты.",
    color: "#FFAE00",
  },
  {
    title:
      "Снизьте потребление соли: ограничьте готовые соусы, консервы и обработанные продукты",
    color: "#FF0004",
  },
  {
    title:
      "Добавьте больше овощей: стремитесь к 4-5 порциям в день. Овощи богаты калием, который помогает контролировать давление.",
    color: "#FF0004",
  },
]);
const sortCategories = computed(() => {
  if (!categories.value) return [];

  const colorOrder = {
    "#00FF11": 1, // зеленый
    "#FFAE00": 2, // оранжевый
    "#FF0004": 3, // красный
  };

  // Преобразуем объект в массив и сортируем
  return Object.entries(categories.value).sort(([, a], [, b]) => {
    const orderA = colorOrder[a.color] || 4;
    const orderB = colorOrder[b.color] || 4;
    return orderA - orderB;
  });
});

console.log("props.resultObj", props.resultObj);
onMounted(() => {
  if (props.resultObj?.categories) {
    categories.value = { ...props.resultObj.categories };
  }
});
</script>

<template>
  <div class="modal-backdrop">
    <div class="modal">
      <div class="modal__left">
        <div class="modal__top">
          <h1 class="modal__title">Анализ резуальтатов</h1>
          <h3 class="modal__subtitle">
            Калькулятор предназначен для образовательных целей. <br />Не
            заменяет консультацию врача.
          </h3>
        </div>
        <div class="modal__bottom">
          <div class="modal__diagrams">
            <div class="modal__diagrams-item diagram-item">
              <div class="diagram-item__left">
                <div class="diagram-item__left-top">
                  <h4 class="diagram-item__title">Потребляемый <br />натрий</h4>
                  <p class="diagram-item__subtitle">Значение</p>
                </div>
                <p class="diagram-item__text">
                  Чем меньше отклонение - <br />тем лучше
                </p>
              </div>
              <div class="diagram-item__right">
                <RoundDiagram
                  :value="resultObj.totalSodium"
                  label="Критичное превышение"
                  :percentage="180"
                  fill-color="#FF0004"
                />
              </div>
            </div>
            <div class="modal__diagrams-item diagram-item">
              <div class="diagram-item__left">
                <div class="diagram-item__left-top">
                  <h4 class="diagram-item__title">
                    Потребляемые <br />каллории
                  </h4>
                  <p class="diagram-item__subtitle">Диапазон отклонение</p>
                </div>
                <p class="diagram-item__text">
                  Чем меньше отклонение - <br />тем лучше
                </p>
              </div>
              <div class="diagram-item__right">
                <h4 class="diagram-item__num">{{ resultObj.totalCalories }}</h4>
                <p class="diagram-item__info">Целевой диапазон</p>
              </div>
            </div>
          </div>
          <div class="modal__recom">
            <div class="modal__recom-top">
              <h4 class="modal__recom">
                Рекомендации для улучшения показателей
              </h4>
              <div class="modal__recom-icon"></div>
            </div>
            <div class="modal__recom-items">
              <div
                class="modal__recom-item"
                v-for="item in reccomendations"
                :key="item.title"
              >
                <div
                  class="modal__recom-color"
                  :style="{ backgroundColor: item.color }"
                ></div>
                <h5 class="modal__recom-text">{{ item.title }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal__right">
        <div class="modal__items" v-if="sortCategories">
          <div
            class="modal__item"
            v-for="([name, item], key) in sortCategories"
            :key="key"
          >
            <div class="modal__item-top">
              <h5 class="modal__item-title">{{ name }}</h5>
              <p class="modal__item-percent">{{ item.percent }}%</p>
            </div>
            <div class="modal__item-bottom">
              <div class="modal__item-line">
                <span
                  class="line"
                  :style="{ width: `${item.percent}%` }"
                ></span>
              </div>
              <div class="modal__item-dot">
                <span
                  class="modal__item-color"
                  :style="{ backgroundColor: item.color }"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background: rgba(78, 78, 78, 0.4);
  backdrop-filter: blur(37px);
}

.modal {
  display: grid;
  grid-template-columns: minmax(0, 1782px) minmax(0, 1001px);
  gap: 40px;
  width: 2823px;
}

.modal__left {
  padding: 48px;
  height: 1552px;
  background-color: rgba(0, 0, 0, 0.3);
  box-shadow: 0px 4px 184px rgba(0, 0, 0, 0.25);
  border-radius: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.modal__top {
  text-align: center;
}

.modal__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 140px;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin-bottom: 16px;
}

.modal__subtitle {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 38px;
  line-height: 120%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  opacity: 0.5;
}
.modal__diagrams {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-bottom: 32px;
}

.diagram-item {
  display: flex;
  justify-content: space-between;
  padding: 32px;
  background: rgba(255, 255, 255, 0.24);
  border-radius: 40px;
  height: 411px;
}

.diagram-item__left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.diagram-item__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 8px;
}

.diagram-item__subtitle {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.5;
}

.diagram-item__text {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.5;
}

.modal__recom {
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 32px;
  height: 585px;
  background: rgba(255, 255, 255, 0.24);
  border-radius: 40px;
}

.modal__right {
  padding: 64px 48px;
  background-color: rgba(0, 0, 0, 0.3);
  box-shadow: 0px 4px 184px rgba(0, 0, 0, 0.25);
  border-radius: 64px;
  height: 100%;
}

.modal__items {
  display: grid;
  gap: 32px;
}
.modal__item-top {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 16px;
}
.modal__item-title {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.5;
}
.modal__item-percent {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 64px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.modal__item-bottom {
  display: grid;
  grid-template-columns: minmax(0, 833px) minmax(0, 64px);
  gap: 8px;
}
.modal__item-line {
  width: 100%;
  height: 64px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 46.3102px;
  overflow: hidden;
  position: relative;
}
.line {
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 46.3102px;
  background-color: #fff;
}
.modal__item-dot {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal__item-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #00ff11;
}
</style>
