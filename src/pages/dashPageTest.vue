<script setup>
import InteractivePlate from "@/components/dash/InteractivePlate.vue";
import GetInfoUser from "@/components/dash/GetInfoUser.vue";
import ResultPlate from "@/components/dash/ResultPlate.vue";
import { ref } from "vue";
import { useStore } from "vuex";

const resultInfo = ref(null);
const sentResult = ref(false)

const store = useStore();
const goResult = () => {
  console.log("goResult");
  store.dispatch("dashResult/calculateDash", 1);
  const result = store.getters["dashResult/getResult"];
  resultInfo.value = result;
  // console.log("result", result);
};

</script>

<template>
  <GetInfoUser v-if="!sentResult" @sentResult="sentResult" />
  <InteractivePlate @goResult="goResult" />
  <ResultPlate v-if="resultInfo" :result-obj="resultInfo"/>
</template>
