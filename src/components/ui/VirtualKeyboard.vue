<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import russian from "simple-keyboard-layouts/build/layouts/russian";

const props = defineProps({
  modelValue: String,
  layoutName: { type: String, default: "default" }
});
const emit = defineEmits(["input"]);

let keyboard;

// Функция удаления клавиш из строк раскладки
function cleanRows(rows) {
  return rows.map(row =>
    row
      .replace("@", "")
      .replace(".com", "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// Создаем свою раскладку
const customLayout = {
  default: cleanRows(russian.layout.default),
  shift: cleanRows(russian.layout.shift)
};

onMounted(async () => {
  await nextTick();

  keyboard = new Keyboard(".vk-container", {
    layout: customLayout,
    layoutName: props.layoutName,

    onChange: input => emit("input", input),

    onKeyPress: btn => {
      if (btn === "{shift}" || btn === "{lock}") {
        const next =
          keyboard.options.layoutName === "default"
            ? "shift"
            : "default";
        keyboard.setOptions({ layoutName: next });
      }
    }
  });
});

watch(
  () => props.modelValue,
  val => {
    if (keyboard) keyboard.setInput(val);
  }
);
</script>

<template>
  <div ref="keyboardEl" class="vk-container"></div>
</template>

<style>
.vk-container {
  width: 100%;
}
/* --- базовые кнопки --- */
.vk-container.hg-theme-default .hg-button {
  background: #333333 !important;
  color: #ffffff !important;
  border-radius: 6px !important;
  border: none !important;
  font-size: 16px;
}

/* --- кнопка при нажатии --- */
.vk-container.hg-theme-default .hg-button:active,
.vk-container.hg-theme-default .hg-button.hg-activeButton {
  background: #1a1a1a !important;
}

/* --- контейнер (по желанию) --- */
.vk-container {
  background: #00000000; /* прозрачный / поменяй при необходимости */
  padding: 10px;
  width: 1310px;
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
}

</style>
