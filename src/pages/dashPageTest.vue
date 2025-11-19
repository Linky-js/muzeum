<script setup>
import InteractivePlate from "@/components/dash/InteractivePlate.vue";
import ResultPlate from "@/components/dash/ResultPlate.vue";
import { ref } from "vue";
import { useStore } from "vuex";

const resultInfo = ref(null);

const store = useStore();


const person = ref({
  age: "25",
  gender: "мужской",
  rost: "181",
  ves: "75",
  active: {
    id: 1.2,
    name: "Сидячий образ жизни",
  },
  cel: {
    id: 1,
    name: "Поддержание",
  },
})
const bmr = person.value.gender === "мужской" ? 88.362 + (13.397 * person.value.ves) + (4.799 * person.value.rost) - (5.677 * person.value.age) : 447.593 + (9.247 * person.value.ves) + (3.098 * person.value.rost) - (4.330 * person.value.age);
const TDEE = bmr * person.value.active.id;
const celTDEE = person.value.cel.name === "Поддержание" ? TDEE : person.value.cel.name === "Похудение" ? TDEE - 500 : TDEE + 500;
store.commit("dashResult/SET_TDEE", { TDEE: celTDEE });

const goResult = () => {
  console.log("goResult");
  store.dispatch("dashResult/calculateDash", 1);
  const result = store.getters["dashResult/getResult"];
  resultInfo.value = result;
  resultInfo.value.TDEE = TDEE;
};
</script>

<template>
  <InteractivePlate @goResult="goResult" />
  <ResultPlate v-if="resultInfo" :result-obj="resultInfo" />
</template>
