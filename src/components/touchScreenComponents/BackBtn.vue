<script setup>
import { defineProps }   from "vue";

const props = defineProps({
  link: {
    type: String,
    required: false,
  }
})
</script>
<template>
  <button class="menu-btn" @click="link ? $router.push(link) : $router.back().back()" ref="buttonRef">
    <div class="tint" v-if="!isOpenMenu"></div>
    <span class="menu-btn__inner">
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="38" viewBox="0 0 25 38" fill="none">
        <g clip-path="url(#clip0_2692_9105)">
          <path d="M7.64053 19L20.1365 6.44231L16.5662 2.85443L0.500111 19L16.5662 35.1453L20.1365 31.5575L7.64053 19Z"
            fill="white" />
        </g>
        <defs>
          <clipPath id="clip0_2692_9105">
            <rect width="24" height="36.6545" fill="white" transform="matrix(-1 0 0 1 24.5 0.672729)" />
          </clipPath>
        </defs>
      </svg>
      <span class="menu-btn__name">Назад</span>
    </span>
  </button>
</template>
<style scoped>
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
</style>