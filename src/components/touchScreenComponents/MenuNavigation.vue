<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import MenuRecursive from "@/components/touchScreenComponents/MenuRecursive.vue";
import { gsap } from "gsap";
const items = ref([
  {
    id: 0,
    name: "Метаболический синдром",
    link: "/touch-screen-3",
    submenu: [
      {
        id: 0,
        name: "Ожирение",
        link: "/",
        submenu: [],
      },
      {
        id: 1,
        name: "Дислипидемия",
        link: "/",
        submenu: [],
      },
      {
        id: 2,
        name: "Сердечная недостаточность",
        link: "/",
        submenu: [],
      },
      {
        id: 3,
        name: "Сахарный диабет II типа",
        link: "/",
        submenu: [],
      },
      {
        id: 4,
        name: "Хроническая болезнь почек",
        link: "/",
        submenu: [],
      },
      {
        id: 5,
        name: "Артериальная гипертензия",
        link: "/",
        submenu: [],
      },
      {
        id: 6,
        name: "Диета DASH",
        link: "/",
        submenu: [],
      },
      {
        id: 7,
        name: "Фармакотерапия",
        link: "/",
        submenu: [],
      },
      {
        id: 8,
        name: "Калькулятор рисков",
        link: "/",
        submenu: [],
      },
      {
        id: 9,
        name: "Метаболический центр",
        link: "/",
        submenu: [],
      },
    ],
  },
  {
    id: 1,
    name: "Data Science",
    link: "/touch-screen-2",
    submenu: [
      {
        id: 0,
        name: "Области применения ИИ",
        link: "/touch-screen-4",
        submenu: [
          {
            id: 0,
            name: "Образование и кадры",
            link: "/",
          },
          {
            id: 1,
            name: "AI management",
            link: "/",
          },
          {
            id: 2,
            name: "Personification",
            link: "/",
          },
          {
            id: 3,
            name: "AI - telehealth",
            link: "/",
          },
          {
            id: 4,
            name: "Диагностика",
            link: "/",
          },
          {
            id: 5,
            name: "AI - epidemiology",
            link: "/",
          },
          {
            id: 0,
            name: "AI Pharma",
            link: "/",
          },
        ],
      },
      {
        id: 1,
        name: "Что для вас ИИ?",
        link: "/",
        submenu: [],
      },
      {
        id: 2,
        name: "Регистровые исследования",
        link: "/",
        submenu: [],
      },
      {
        id: 3,
        name: "Искусственный интеллект",
        link: "/",
        submenu: [],
      },
    ],
  },
]);
const isOpenMenu = ref(false);
const menuRef = ref(null);
const buttonRef = ref(null);
const svgRef = ref(null);

const animateSVG = (isOpening) => {
  const paths = svgRef.value?.querySelectorAll("path");
  if (!paths || paths.length < 3) return;

  const timeline = gsap.timeline();

  if (isOpening) {
    // Анимация в крестик
    timeline
      .to(paths[0], {
        duration: 0.3,
        attr: { d: "M12 12L36 36" }, // Путь для верхней линии крестика
        fill: "#000000",
        stroke: "#000000",
        strokeWidth: 3,
      })
      .to(
        paths[1],
        {
          duration: 0.2,
          opacity: 0,
          scale: 0,
        },
        0
      )
      .to(
        paths[2],
        {
          duration: 0.3,
          attr: { d: "M12 36L36 12" }, // Путь для нижней линии крестика
          fill: "#000000",
          stroke: "#000000",
          strokeWidth: 3,
        },
        0
      );
  } else {
    // Анимация обратно в гамбургер
    timeline
      .to(paths[0], {
        duration: 0.3,
        attr: { d: "M6 8H42V12H6V8Z" },
        fill: "#FFFFFF",
        strokeWidth: 0,
      })
      .to(
        paths[1],
        {
          duration: 0.2,
          opacity: 1,
          scale: 1,
        },
        0
      )
      .to(
        paths[2],
        {
          duration: 0.3,
          attr: { d: "M6 36H42V40H6V36Z" },
          fill: "#FFFFFF",
          strokeWidth: 0,
        },
        0
      );
  }
};



const toggleMenu = () => {
  isOpenMenu.value = !isOpenMenu.value;
  animateSVG(isOpenMenu.value);
};
// Функция для проверки клика вне области
const handleClickOutside = (event) => {
  // Если меню открыто И клик был вне меню И вне кнопки
  if (
    isOpenMenu.value &&
    menuRef.value &&
    !menuRef.value.contains(event.target) &&
    !buttonRef.value.contains(event.target)
  ) {
    toggleMenu();
  }
};

// Добавляем обработчики при монтировании компонента
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

// Убираем обработчики при размонтировании компонента
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="menu">
    <button
      class="menu-btn"
      @click="toggleMenu"
      :class="{ active: isOpenMenu }"
      ref="buttonRef"
    >
      <div class="tint" v-if="!isOpenMenu"></div>
      <span class="menu-btn__inner">
        <svg
          ref="svgRef"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 8H42V12H6V8Z" fill="white" />
          <path d="M6 22H42V26H6V22Z" fill="white" />
          <path d="M6 36H42V40H6V36Z" fill="white" />
        </svg>
        <span class="menu-btn__name">Меню</span>
      </span>
    </button>
    <div class="menu-block glass main-menu" v-if="isOpenMenu" ref="menuRef">
      <div class="effect"></div>
      <div class="tint"></div>
      <div class="shine"></div>
      <div class="menu-block__top">
        <span class="menu-block__top-text">Меню</span>
      </div>
      <MenuRecursive :items="items" :level="0" />
    </div>
  </div>
</template>

<style scoped>
.menu {
  position: relative;
  width: fit-content;
}

.menu-block {
  position: absolute;
  width: 50.375rem;
  min-height: 22.75rem;
  bottom: 0;
  left: 50%;
  border-radius: 3rem;
  transform: translateY(-9rem) translateX(-50%);
  padding: 3rem;
}
.menu-block__top {
  position: relative;
  z-index: 3;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.menu-block__top-text {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 1.75rem;
  line-height: 100%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.3;
}
.menu-block__list {
  position: relative;
  z-index: 3;
  padding-top: 2.5rem;
  display: grid;
  gap: 2.5rem;
}
.menu-block__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.menu-block__text {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 2.75rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.menu-block__icon {
  width: 1.25rem;
  transform: scale(-1, 1);
}

.submenu {
  transform: scaleY(0);
  transition: all 0.5s;
  transform-origin: bottom;
  z-index: 5;
  left: -3rem;
  bottom: -3rem;
}
.menu-block__item:hover > .submenu {
  transform: scaleY(1);
}

.menu-btn {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: block;
  width: 17.5625rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  padding: 2.1875rem 3.875rem 2.1875rem 3rem;
  height: 7.375rem;
  border-radius: 6.875rem;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
}
.menu-btn.active {
  background: #ffffff;
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(0);
  width: 7.5rem;
  height: 7.5rem;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-btn.active::before {
  display: none;
}

.menu-btn.active .menu-btn__name {
  display: none;
}

.menu-btn.active .menu-btn__inner {
  position: static;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-btn.active svg {
  width: 3rem;
  min-width: 3rem;
  height: 3rem;
  min-height: 3rem;
}
.menu-btn.active svg path {
  fill: black;
}

.menu-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(169deg, #2d3f6e 0%, #a4b3ff 86%, #6575ff 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.menu-btn__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.375rem;
  height: 100%;
  position: relative;
  z-index: 3;
}

.menu-btn__name {
  font-family: "TT Commons";
  font-weight: 400;
  font-size: 2.375rem;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin-top: 0.5rem;
}
.menu-btn__icon {
  width: 7.25rem;
  min-width: 7.25rem;
  height: 7.25rem;
  min-height: 7.25rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.effect {
  position: absolute;
  z-index: 0;
  inset: 0;
  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
  overflow: hidden;
  isolation: isolate;
  border-radius: 3rem;
}
.tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
  background: linear-gradient(
    85.26deg,
    rgba(217, 217, 217, 0.1) 3.83%,
    rgba(115, 115, 115, 0.1) 99.95%
  );
}
.shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.1),
    inset -1px -1px 1px 1px rgba(255, 255, 255, 0.1);
  border-radius: 3rem;
}
</style>
