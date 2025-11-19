<script setup>
import { defineEmits } from "vue";
const emit = defineEmits(['sentResult'])
const pushInfo = () => {
  emit("sentResult", true);
};
</script>

<template>
  <div class="modal-backdrop">
    <div class="modal">
      <button class="btn-test" @click="pushInfo">test</button>
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
  z-index: 55;
  background: rgba(78, 78, 78, 0.4);
  backdrop-filter: blur(37px);
}

.modal {
    display: flex;
  justify-content: center;
  align-items: center;
  padding: 24.4221px 32.5628px;
  width: 343.89px;
  height: 79.53px;
  background: #ffffff;
  border-radius: 26.5085px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 22.0905px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #1b1c21;
}

.btn-test {
}
</style>
