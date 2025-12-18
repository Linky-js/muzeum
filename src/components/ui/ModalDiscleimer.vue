<script setup>
import { ref, defineEmits, defineProps, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const emit = defineEmits(["close", "agreeCoockie"]);
const props = defineProps({
  backLink: String,
  text: String,
});
const goBack = () => {
  if (props.backLink) {
    router.push(props.backLink);
  } else {
    router.back();
  }
  emit("close");
};
const agreeCoockie = () => {
  emit("agreeCoockie");
};
onMounted(() => {});
</script>
<template>
  <div class="modal-backdrop" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal__inner">
        <h3 class="modal__title" v-html="props.text"></h3>
        <div class="modal__btns">
          <button class="modal__btn cancel" @click="goBack">Отмена</button>
          <button class="modal__btn ok" @click="agreeCoockie">Принять</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal-backdrop {
  position: fixed;
}
.modal {
  padding: 100px;
  width: 900px;
  height: 548px;
  background: #1b1c21;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.modal::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(101deg, #646464 0%, #4c4c4c 86%, #ffffff 100%);
  border-radius: 50px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.modal__inner {
  max-width: 700px;
  position: relative;
  z-index: 1;
}

.modal__title {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 130%;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 60px;
}

.modal__btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.modal__btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 32px;
  width: 290px;
  height: 80px;
  background: rgba(0, 0, 0, 0.001);
  border: 1px solid #ffffff;
  border-radius: 24px;
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 24px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
  transition: all 0.3s ease-in-out;
}

.modal__btn:hover {
  background-color: #ffffff;
  color: #1b1c21;
}

.modal__btn.ok {
  background-color: #ffffff;
  color: #1b1c21;
}
</style>
