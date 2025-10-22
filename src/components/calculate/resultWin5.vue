<script setup>
  import { defineProps, computed, defineEmits } from "vue";
import IconDislip from "../icons/IconDislip.vue";
import IconPochki from "../icons/IconPochki.vue";
import IconHeart from "../icons/IconHeart.vue";
  const emit = defineEmits(["next"]);
  const props = defineProps({
    person: Object,
    step: Number,
    goNextStep: Function,
  });

  // --- Дислипидемия ---
  const dyslipidemiaData = computed(() => {
    const arteriya = props.person.arteriya;
    const d = props.person.diabet;

    if (arteriya === "Да" && d === "Нет") {
      return {
        hasContent: true,
        text: `Типично риск дислипидемии для таких показателей повышен — он встречается у людей с артериальной гипертензией в 1,2–1,5 раза чаще, чем у остальных.`,
        text2: `Снижение липопротеинов низкой плотности (“плохого” холестерина) на 1 ммоль/л уменьшает риски: смерти от всех причин — на 10%, сердечно-сосудистой смерти — на 20%, инсульта — на 17%, коронарных событий — на 23%`
      };
    }
    if (d === "Да") {
      return {
        hasContent: true,
        text: `Типично риск дислипидемии для таких показателей повышен. При сахарном диабете дислипидемия — очень частая находка, она встречается он более чем у 70%. `,
        text2: `Снижение липопротеинов низкой плотности на 1 ммоль/л уменьшает риски: смерти от всех причин — на 10%, сердечно-сосудистой смерти — на 20%, инсульта — на 17%, коронарных событий — на 23%.`
      };
    }
    return {
      hasContent: true,
      text: `Типично риск дислипидемии при ваших показателях снижен, но помнить о нем всё же стоит: в России повышение уровня холестерина регистрируется у 6 из 10 взрослых. `,
      text2: `Снижение липопротеинов низкой плотности на 1 ммоль/л уменьшает риски: смерти от всех причин — на 10%, сердечно-сосудистой смерти — на 20%, инсульта — на 17%, коронарных событий — на 23%`
    };
  });

  // --- Хроническая болезнь почек ---
  const kidneysData = computed(() => {
    const arteriya = props.person.arteriya;
    const d = props.person.diabet;
    const g = props.person.gender;

    if (arteriya === "Нет" && d === "Нет" && g === "Мужчины") {
      return {
        hasContent: true,
        text: `Типично риск хронической болезни почек при ваших показателях снижен, но помнить о нем всё же стоит: в России этот диагноз регистрируется у 1 из 7 пациентов (13% среди мужчин).`
      };
    }
    if (arteriya === "Нет" && d === "Нет" && g === "Женщины") {
      return {
        hasContent: true,
        text: `Типично риск хронической болезни почек при ваших показателях снижен, но помнить о нем всё же стоит: в России этот диагноз регистрируется у 1 из 7 пациентов (16% среди женщин).`
      };
    }
    if (arteriya === "Да" && d === "Нет") {
      return {
        hasContent: true,
        text: `При артериальной гипертензии риск ХБП повышен по сравнению с общей популяцией: у 1 из 5 пациентов с АГ и у 1 из 7 в общей популяции.`
      };
    }
    if (d === "Да") {
      return {
        hasContent: true,
        text: `Сахарный диабет — один из ведущих факторов риска хронической болезни почек, она встречается у 1 из 3 пациентов с СД и у 1 из 7 в общей популяции.`
      };
    }
    return { hasContent: false, text: "" };
  });

  // --- Сердечно-сосудистые заболевания ---
  const vesselsData = computed(() => {
    if (props.person.diabet === "Да") {
      return {
        hasContent: true,
        text: `Сахарный диабет удваивает риск развития сердечно-сосудистых заболеваний.`
      };
    }
    return { hasContent: false, text: "" };
  });
</script>

<template>
  <div class="conclusion-wrapper">
    <div class="conclusion">
      <div class="tint"></div>

      <!-- Дислипидемия -->
      <div class="conclusion_item relative dyslipidemia" v-if="dyslipidemiaData.hasContent">
        <div class="__item--head">
          <IconDislip/>
          <span>Дислипидемия</span>
        </div>
        <p class="__item--text">{{ dyslipidemiaData.text }}</p>
        <p class="__item--text">{{ dyslipidemiaData.text2 }}</p>
      </div>

      <!-- Хроническая болезнь почек -->
      <div class="conclusion_item relative kidneys" v-if="kidneysData.hasContent">
        <div class="__item--head">
          <IconPochki/>
          <span>Хроническая болезнь почек</span></div>
        <p class="__item--text">{{ kidneysData.text }}</p>
      </div>

      <!-- Сердечно-сосудистые заболевания -->
      <div class="conclusion_item relative vessels" v-if="vesselsData.hasContent">
        <div class="__item--head">
          <IconHeart/>
          <span>Сердечно-сосудистые заболевания</span>
        </div>
        <p class="__item--text">{{ vesselsData.text }}</p>
      </div>
    </div>
    <button @click="goNextStep(7)" class="quiz__btn">Рассчитать</button>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
  z-index: 1;
}
.conclusion-wrapper {
  height: 100%;
  max-width: 1386px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.conclusion {
  margin-top: 100px;
  position: relative;
  display: grid;
  padding: 60px 50px;
}
.conclusion::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(169deg, #646464 0%, #4c4c4c 86%, #7c7c7c 100%);
  border-radius: 38px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: linear-gradient(
    92deg,
    rgb(20 20 20) 3.83%,
    rgb(20 20 20 / 10%) 99.95%
  );
}
.conclusion_item {
  padding: 32px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}
.conclusion_item:first-child {
  padding-top: 0;
}
.conclusion_item:last-child {
  padding-bottom: 0;
  border: none;
}

.__item--head {
  margin-bottom: 26px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.conclusion_item p {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 40px;
  line-height: 120%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.5;
  margin-bottom: 20px;
}

.conclusion_item p:last-child {
  margin-bottom: 0;
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
</style>
