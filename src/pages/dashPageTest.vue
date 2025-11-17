<script setup>
import InteractivePlate from '@/components/dash/InteractivePlate.vue';
import { useStore } from 'vuex';

const store = useStore();
const goResult = () => {
    console.log('goResult');
    store.dispatch("dashResult/calculateDash", 1);
    const result = store.getters["dashResult/getResult"];

    console.log('result', result);
}
</script>

<template>
    <InteractivePlate @goResult="goResult" />
</template>