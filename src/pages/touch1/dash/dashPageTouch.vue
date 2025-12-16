<script setup>
import InteractivePlate from "@/components/dash/touch/InteractivePlate.vue";
import GetInfoUser from "@/components/dash/touch/GetInfoUser.vue";
import ResultPlate from "@/components/dash/touch/ResultPlate.vue";
import { ref } from "vue";
import { useStore } from "vuex";
import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMasterSync } from "@/composables/syncRouterSimple.js";
import { useRouter } from "vue-router";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
const router = useRouter();
const bus = useBroadcastBus({
  role: "touch",
  pairId: "1",
  debug: false,
});
initMasterSync(router, bus, "1");

bus.on("defaultScreen", (payload) => {
  router.push('/touch1/screen-1')

})

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

const calculateTDEE = () => {
  const bmr = person.value.gender === "Мужской" ? 88.362 + (13.397 * person.value.ves) + (4.799 * person.value.rost) - (5.677 * person.value.age) : 447.593 + (9.247 * person.value.ves) + (3.098 * person.value.rost) - (4.330 * person.value.age);
  const TDEE = bmr * person.value.active.id;
  console.log(88.362 + (13.397 * person.value.ves) + (4.799 * person.value.rost) - (5.677 * person.value.age));


  const celTDEE = person.value.cel === "Поддержание" ? TDEE : person.value.cel === "Похудение" ? TDEE - 500 : TDEE + 500;
  console.log('TDEE', bmr, person.value.active.id, TDEE,);
  store.commit("dashResult/SET_TDEE", { TDEE: celTDEE });
  return celTDEE
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
  bus.send('sentResult', {}, { role: 'monitor', pairId: '1' })
}

</script>

<template>
  <GetInfoUser v-if="!sentResult" @changePerson="changePerson" />
  <InteractivePlate @goResult="goResult" />
  <ResultPlate v-if="resultInfo" :result-obj="resultInfo" />
  
</template>
<style scoped>
  
</style>
