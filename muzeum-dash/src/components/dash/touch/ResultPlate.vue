<script setup>
import { computed, onMounted, ref } from "vue";
import RoundDiagram from "@/components/ui/RoundDiagram.vue";
import IconInfo from "@/components/icons/IconInfo.vue";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps({
  resultObj: Object,
});

const emit = defineEmits(["back", "repeat"]);

const categories = ref(null);
const reccomendations = ref([
  {
    title: "Отлично! Потребление соответствует норме DASH.",
    color: "#5FD567",
  },
  {
    title: "Вы молодец, но можете лучше.",
    color: "#FFBF36",
  },
  {
    title:
      "Показатель значительно отклонился - обратите на него внимание.",
    color: "#D95356",
  },
]);
const sortCategories = computed(() => {
  if (!categories.value) return [];

  // Преобразуем объект в массив и сортируем
  return Object.entries(categories.value).sort(
    ([, a], [, b]) => b.percent - a.percent
  );
});

const formatColor = (percent) => {
  if (percent >= 70 && percent <= 110) {
    return "#5FD567";
  }
  if (percent <= 40) {
    return "#D95356";
  }

  if (percent >= 40 && percent <= 70) {
    return "#FFBF36";
  }

  return "#D95356";
};

console.log("props.resultObj", props.resultObj);
onMounted(() => {
  if (props.resultObj?.categories) {
    categories.value = { ...props.resultObj.categories };
  }
  const porciesDash = {
    'Зерновые': Math.round((props.resultObj.TDEE * 7) / 2000),
  }
  console.log('porciesDash', porciesDash);

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
                  <h4 class="diagram-item__title">
                    Потребляемые каллории
                  </h4>
                  <p class="diagram-item__subtitle">Диапазон отклонение</p>
                </div>
                <div class="diagram-item__right">
                  <RoundDiagram :value="resultObj.totalCalories" label="Целевой диапазон" :maxValue="resultObj.TDEE"
                    :fill-color="resultObj.totalCalories * 100 / resultObj.TDEE < 70 ? '#FFBF36' : resultObj.totalCalories * 100 / resultObj.TDEE > 70 && resultObj.totalCalories * 100 / resultObj.TDEE < 100 ? '#5FD567' : '#D95356'"
                    :width="557" :height="557" />
                </div>
                <p class="diagram-item__text">
                  Чем меньше отклонение - тем лучше
                </p>
              </div>
            </div>
            <div class="modal__diagrams-item diagram-item">
              <div class="diagram-item__left">
                <div class="diagram-item__left-top">
                  <h4 class="diagram-item__title">Потребляемый натрий</h4>
                  <p class="diagram-item__subtitle">Значение</p>
                </div>
                <div class="diagram-item__right">
                  <RoundDiagram :value="resultObj.totalSodium" :label="'Целевой диапазон'" :maxValue="2300"
                    :fill-color="resultObj.totalSodium * 100 / 2300 < 70 ? '#5FD567' : resultObj.totalSodium * 100 / 2300 > 70 && resultObj.totalSodium * 100 / 2300 < 100 ? '#FFBF36' : '#D95356'"
                    :width="557" :height="557" />
                </div>
                <p class="diagram-item__text">
                  Чем меньше отклонение - тем лучше
                </p>
              </div>
            </div>
          </div>
          <div class="modal__recom">
            <div class="modal__recom-top">
              <h4 class="modal__recom-title">
                Рекомендации для улучшения показателей
              </h4>

            </div>
            <div class="modal__recom-items">
              <div class="modal__recom-item" v-for="item in reccomendations" :key="item.title">
                <div class="modal__recom-color" :style="{ backgroundColor: item.color }"></div>
                <h5 class="modal__recom-text">{{ item.title }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal__right">
        <div class="modal__items" v-if="sortCategories">
          <div class="modal__item" v-for="([name, item], key) in sortCategories" :key="key">
            <div class="modal__item-top">
              <h5 class="modal__item-title">{{ name }}</h5>
              <p class="modal__item-percent">{{ item.percent }}%</p>
            </div>
            <div class="modal__item-bottom">
              <div class="modal__item-line">
                <span class="line"
                  :style="{ width: `${item.percent}%`, backgroundColor: formatColor(item.percent) }"></span>
              </div>
              <!-- <div class="modal__item-dot">
                <span class="modal__item-color" :style="{ backgroundColor: formatColor(item.percent) }"></span>
              </div> -->
            </div>
          </div>
        </div>

      </div>
      <div class="modal__btns">
        <RouterLink @click="$emit('repeat')" class="quiz__btn">
          Пройти вновь
        </RouterLink>
        <RouterLink @click="$emit('back')" class="quiz__btn">
          Назад
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal__btns {
  position: fixed;
  bottom: 75px;
  z-index: 52;
  transform: translateX(-50%);
  left: 50%;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 50px;
}

.quiz__btn {
  position: static;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  /* align-items: center; */
  justify-content: center;
  z-index: 52;
  backdrop-filter: blur(154px);
  background: rgba(74, 74, 74, 0.3);
}

.modal {
  display: flex;
  justify-content: flex-end;
  gap: 88px;
  width: 2823px;
  margin-top: 200px;
  height: max-content;
}

.modal::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(34, 31, 29, 0.6);
  z-index: 1;
}

.modal__left {

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.modal__top {
  text-align: center;
  margin-bottom: 62px;
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
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}

.diagram-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #fff;
  border-radius: 40px;
  padding: 32px;
  width: 765px;
  height: 828px;
  flex-shrink: 0;
}

.diagram-item__left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}

.diagram-item__right {
  width: max-content;
  align-self: center;
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

  gap: 32px;
}

.modal__recom-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal__recom-title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.modal__recom-items {
  display: grid;
  gap: 8px;
}

.modal__recom-item {
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 24px;
}

.modal__recom-color {
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border-radius: 50%;
}

.modal__recom-text {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 32px;
  line-height: 140%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.modal__right {
  padding: 64px 48px;

  height: 100%;
  position: relative;
  z-index: 2;
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
  grid-template-columns: minmax(0, 905px);
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
}
</style>
