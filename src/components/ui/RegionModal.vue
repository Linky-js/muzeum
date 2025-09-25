<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const props = defineProps({
  show: { type: Boolean, default: false },
  region: {
    type: Object,
    default: () => ({ id: "", name: "", fact: "", fun: "", keywords: "" }),
  },
  title: { type: String, default: "" },
});

const modal = ref(null);
const textBlock = ref(null);
const textBlock2 = ref(null);

let splitInstance = null;
let splitInstance2 = null;


const animateIn = async () => {
  if (!modal.value) return;

  // Сначала скрываем текст (чтобы не мигал)
  if (textBlock.value) {
    gsap.set(textBlock.value, { opacity: 0 });
  }

  // Схлопнутое окно
  gsap.set(modal.value, { scaleY: 0, scaleX: 0.3, opacity: 0 });

  // Поднимаем по высоте
  gsap.to(modal.value, {
    scaleY: 1,
    opacity: 1,
    duration: 0.5,
    ease: "power3.out",
  });

  // Потом растягиваем по ширине
  gsap.to(modal.value, {
    scaleX: 1,
    duration: 0.5,
    delay: 0.5,
    ease: "power3.out",
    onComplete: () => {
      if (textBlock.value) {
        animateText();
      }
      if (textBlock2.value) {
        animateText2();
      }
    },
  });
};

const animateText = () => {
  if (!textBlock.value) return;

  // Уничтожаем старый SplitText (иначе при повторных открытиях будут дубли)
  if (splitInstance) {
    splitInstance.revert();
  }

  // Разбиваем текст на предложения, слова и буквы
  splitInstance = new SplitText(textBlock.value, { type: "lines,words,chars" });
  console.log("splitInstance", splitInstance);
  

  // Прячем всё
  gsap.set(splitInstance.chars, { opacity: 0, y: 20 });
  // Многоуровневая анимация
  gsap.timeline()
  .set(textBlock.value, { opacity: 1 })
  .to(splitInstance.chars, {
    opacity: 1,
    y: 0,
    duration: 0.2,
    stagger: 0.01, // пауза между буквами
    ease: "power2.out",
  });

};
const animateText2 = () => {
  if (!textBlock2.value) return;

  // Уничтожаем старый SplitText (иначе при повторных открытиях будут дубли)
  if (splitInstance2) {
    splitInstance2.revert();
  }

  // Разбиваем текст на предложения, слова и буквы
  splitInstance2 = new SplitText(textBlock2.value, { type: "lines,words,chars" });
  console.log("splitInstance", splitInstance2);
  

  // Прячем всё
  gsap.set(splitInstance2.chars, { opacity: 0, y: 20 });
  // Многоуровневая анимация
  gsap.timeline()
  .set(textBlock2.value, { opacity: 1 })
  .to(splitInstance2.chars, {
    opacity: 1,
    y: 0,
    duration: 0.2,
    stagger: 0.01, // пауза между буквами
    ease: "power2.out",
  });

};

const animateOut = () => {
  if (!modal.value) return;

  gsap.to(modal.value, {
    scaleY: 0,
    scaleX: 0.3,
    opacity: 0,
    duration: 0.4,
    ease: "power3.in",
  });
};

watch(
  () => props.show,
  async (val) => {
    await nextTick(); // ждём, пока DOM появится
    if (val) {
      animateIn();
    } else {
      animateOut();
    }
  }
);

watch(
  () => props.region,
  async () => {
    await nextTick();
    animateText();
    animateText2();
  },
  { deep: true }
);

onMounted(() => {
  if (props.show) {
    animateIn();
  }
});
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div ref="modal" class="modal-content">
        <h1>Факт от Алмазова</h1>
      <h2>{{ region?.region?.name }}</h2>
      <div ref="textBlock" class="modal-text">
        {{ region?.region?.fact || "Интересный факт пока отсутствует" }}
      </div>
    </div>
    <div v-if="region?.region?.fun" ref="modal" class="modal-content">
        <h1>Занимательный факт</h1>
      <div ref="textBlock2" class="modal-text">
        {{ region?.region?.fun || "Интересный факт пока отсутствует" }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-text {
  margin-top: 1rem;
  font-size: 1.2rem;
  line-height: 1.5;
  transition: none;
  opacity: 0;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  justify-content: center;
  padding-right: 30px;
  z-index: 2000;
  gap: 30px;
}

.modal-content {
  border-radius: 15px;
    border: 1px solid #ffffff73;
    background: linear-gradient(85deg, rgba(53, 52, 52, 0.5) 3.83%, rgba(53, 52, 52, 0.50) 99.95%);
  padding: 2rem;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  transform-origin: center top;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}


</style>
