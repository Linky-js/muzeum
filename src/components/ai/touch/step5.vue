<script setup>
const props = defineProps({
  person: Object,
  step: Number,
});
const getStatistickAtitudes = () => {
  
};
</script>
<template>
  <div class="result__wrapper">
    <div class="stat">
      <div class="head">
        Отношение к ИИ в медицине
      </div>
      <div class="percents">
        <div class="current__percent">

        </div>
      </div>
    </div>
  </div>
</template>