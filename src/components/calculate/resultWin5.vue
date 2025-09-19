<script setup>
import { defineProps, computed, defineEmits } from "vue";
const emit = defineEmits(['next'])
const props = defineProps({
  person: Object
})

// --- Дислипидемия ---
const dyslipidemia = computed(() => {
  const { areriya, diabet } = props.person
  const arteriya = props.person.arteriya
  const d = props.person.diabet

  if (arteriya === "Да" && d === "Нет") {
    return `
      <div class="__item--head">Дислипидемия</div>
      <p>
       Типично риск дислипидемии для таких показателей повышен. У людей с артериальной гипертензией дислипидемия встречается в 1,2–1,5 раза чаще, чем в среднем. <br />
       Снижение липопротеинов низкой плотности на 1 ммоль/л уменьшает риски: смерти от всех причин — на 10%, сердечно-сосудистой смерти — на 20%, инсульта — на 17%, коронарных событий — на 23%

      </p>`
  }
  if (d === "Да") {
    return `
      <div class="__item--head">Дислипидемия</div>
      <p>
        Типично риск дислипидемии для таких показателей повышен. При сахарном диабете дислипидемия — очень частая находка, она встречается он более чем у 70%. <br />
Снижение липопротеинов низкой плотности на 1 ммоль/л уменьшает риски: смерти от всех причин — на 10%, сердечно-сосудистой смерти — на 20%, инсульта — на 17%, коронарных событий — на 23%.

      </p>`
  }
  return `
    <div class="__item--head">Дислипидемия</div>
    <p>
      Типично риск дислипидемии при ваших показателях снижен, но помнить о нем всё же стоит: в России повышение уровня холестерина регистрируется у 6 из 10 взрослых. <br />
Снижение липопротеинов низкой плотности на 1 ммоль/л уменьшает риски: смерти от всех причин — на 10%, сердечно-сосудистой смерти — на 20%, инсульта — на 17%, коронарных событий — на 23%

    </p>`
})

// --- Хроническая болезнь почек ---
const kidneys = computed(() => {
  const { areriya, diabet, gender } = props.person
  const arteriya = props.person.arteriya
  const d = props.person.diabet
  const g = props.person.gender

  if (arteriya === "Нет" && d === "Нет" && g === "Мужчины") {
    return `Типично риск хронической болезни почек при ваших показателях снижен, но помнить о нем всё же стоит:  в России этот диагноз регистрируется у 1 из 7 пациентов (13% среди мужчин).`
  }
  if (arteriya === "Нет" && d === "Нет" && g === "Женщины") {
    return `Типично риск хронической болезни почек при ваших показателях снижен, но помнить о нем всё же стоит:  в России этот диагноз регистрируется у 1 из 7 пациентов (16% среди женщин).`
  }
  if (arteriya === "Да" && d === "Нет") {
    return `При артериальной гипертензии риск ХБП повышен по сравнению с общей популяцией: у 1 из 5 пациентов с АГ и  у 1 из 7 в общей популяции.`
  }
  if (d === "Да") {
    return `Сахарный диабет — один из ведущих факторов риска хронической болезни почек, она встречается у 1 из 3 пациентов с СД и у 1 из 7 в общей популяции. `
  }
  return ""
})

// --- Сердечно-сосудистые заболевания ---
const vessels = computed(() => {
  if (props.person.diabet === "Да") {
    return `Сахарный диабет удваивает риск развития сердечно-сосудистых заболеваний.`
  }
  return ``
})
</script>

<template>
  <div class="wrapper">
    <aside class="left">
      <div class="left_top">
        <h3>Вывод</h3>
      </div>
    </aside>
    <div class="container">
      <div class="conclusion">
        <div v-html="dyslipidemia" class="conclusion_item dyslipidemia"></div>
        <div class="conclusion_item kidneys">
          <div class="__item--head">Хроническая болезнь почек</div>
          <p v-html="kidneys"></p>
        </div>
        <div v-if="vessels && vessels !== ''" ref="vessels" class="conclusion_item vessels">
          <div class="__item--head">Сердечно-сосудистые заболевания</div>
          <p v-html="vessels"></p>
        </div>
      </div>
      <div @click="emit('next')" class="btn">Далее</div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  background: #fff;
  padding: 1.75rem;
  display: flex;
  gap: 10rem;
}

.left {
  position: absolute;
  top: 1.75rem;
  left: 1.75rem;
  z-index: 2;
  height: calc(100% - 3.5rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.container {
  width: 100%;
  max-width: 112.24rem;
  margin: 0 auto;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.conclusion {
  height: max-content;
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: auto 0;
  max-width: 46.5rem;
}

.btn {
  margin-top: auto;
  align-self: center;
  width: 26.0625rem;
}

.conclusion_item {

  padding: 2rem;
  border-radius: 1.875rem;
  background: rgba(0, 0, 0, 0.03);
}
</style>