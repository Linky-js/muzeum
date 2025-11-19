<script setup>
import InteractivePlate from "@/components/dash/InteractivePlate.vue";
import GetInfoUser from "@/components/dash/GetInfoUser.vue";
import ResultPlate from "@/components/dash/ResultPlate.vue";
import { ref } from "vue";
import { useStore } from "vuex";

const resultInfo = ref(null);
const sentResult = ref(false)


const store = useStore();
const person = ref(null)

// const person = ref({
//   age: "25",
//   gender: "мужской",
//   rost: "181",
//   ves: "75",
//   active: {
//     id: 1.2,
//     name: "Сидячий образ жизни",
//   },
//   cel: "Поддержание",
// })

const calculateTDEE = () =>{
 const bmr = person.value.gender === "мужской" ? 88.362 + (13.397 * person.value.ves) + (4.799 * person.value.rost) - (5.677 * person.value.age) : 447.593 + (9.247 * person.value.ves) + (3.098 * person.value.rost) - (4.330 * person.value.age);
  const TDEE = bmr * person.value.active.id;
  const celTDEE = person.value.cel === "Поддержание" ? TDEE : person.value.cel === "Похудение" ? TDEE - 500 : TDEE + 500;
  store.commit("dashResult/SET_TDEE", { TDEE: celTDEE });
  return TDEE
}

const goResult = () => {
  const TDEE = calculateTDEE();
  console.log("goResult");
  store.dispatch("dashResult/calculateDash", 1);
  const result = store.getters["dashResult/getResult"];
  resultInfo.value = result;
  resultInfo.value.TDEE = TDEE;
};
const changePerson = (event) => {
  person.value = event.value
  sentResult.value = true
}

</script>

<template>
  <GetInfoUser v-if="!sentResult" @changePerson="changePerson" />
  <InteractivePlate @goResult="goResult" />
  <ResultPlate v-if="resultInfo" :result-obj="resultInfo" />
</template>
