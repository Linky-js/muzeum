<script setup>
import { RouterLink } from "vue-router";

const props = defineProps({
  link: {
    type: String,
    required: false,
  },
  // toPage || toInfo
  typeBtn: {
    type: String,
    default: "toPage",
  },
  supname: String,
  name: {
    type: String,
    required: true,
  },
  // transparent || pink
  iconWrapperColor: {
    type: String,
    default: null,
  },
  icon: {
    type: Object,
    default: null,
  },
});
</script>

<template>
  <!-- если есть link — рендерим RouterLink -->
  <RouterLink
    v-if="link"
    :to="{ name: link }"
    class="glass-btn"
    :class="[typeBtn, iconWrapperColor]"
  >
    <div v-if="typeBtn === 'toPage'" class="effect"></div>
    <div class="tint"></div>
    <div v-if="typeBtn === 'toPage'" class="shine"></div>
    <span class="glass-btn__inner" :class="{ 'flex-center': !icon }">
      <span class="glass-btn__text">
        <span class="glass-btn__supname" v-if="supname">{{ supname }}</span>
        <span class="glass-btn__name">{{ name }}</span>
      </span>
      <component
        class="glass-btn__page-icon"
        v-if="icon && typeBtn === 'toPage' && !iconWrapperColor"
        :is="icon"
      />
      <span
        v-if="iconWrapperColor"
        class="glass-btn__icon"
        :class="iconWrapperColor"
      >
        <component
          class="glass-btn__info-icon"
          v-if="icon && typeBtn === 'toInfo'"
          :is="icon"
        />
      </span>
    </span>
  </RouterLink>

  <!-- если link не задан — рендерим просто кнопку/див -->
  <div
    v-else
    class="glass-btn"
    :class="[typeBtn, iconWrapperColor]"
  >
    <div v-if="typeBtn === 'toPage'" class="effect"></div>
    <div class="tint"></div>
    <div v-if="typeBtn === 'toPage'" class="shine"></div>
    <span class="glass-btn__inner" :class="{ 'flex-center': !icon }">
      <span class="glass-btn__text">
        <span class="glass-btn__supname" v-if="supname">{{ supname }}</span>
        <span class="glass-btn__name">{{ name }}</span>
      </span>
      <component
        class="glass-btn__page-icon"
        v-if="icon && typeBtn === 'toPage' && !iconWrapperColor"
        :is="icon"
      />
      <span
        v-if="iconWrapperColor"
        class="glass-btn__icon"
        :class="iconWrapperColor"
      >
        <component
          class="glass-btn__info-icon"
          v-if="icon && typeBtn === 'toInfo'"
          :is="icon"
        />
      </span>
    </span>
  </div>
</template>


<style scoped>
.glass-btn {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: block;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
}
.glass-btn.toPage {
  padding: 1.5rem 4rem;
  height: 11.375rem;
  border-radius: 3rem;
}
.glass-btn.toInfo:hover .tint::after,
.glass-btn.toPage:hover .tint::after {
  opacity: 1;
}
.glass-btn.toInfo {
  padding: 1.5rem;
  padding-left: 4rem;
  height: 10.25rem;
  border-radius: 6.875rem;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
}
.glass-btn.toInfo.pink {
  background: linear-gradient(
    23deg,
    rgba(219, 35, 179, 0.05) 4.04%,
    rgba(73, 132, 186, 0.05) 94.58%
  );
}

/* 👉 псевдоэлемент для градиентного бордера */
.glass-btn.toInfo::before {
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
.glass-btn.toInfo.pink::before {
  background: linear-gradient(25deg, #2d3f6e 15%, #db23b394 62%, #2d3f6e 100%);
}

.glass-btn.toInfo .effect,
.glass-btn.toInfo .shine {
  border-radius: 6.875rem;
}

.glass-btn__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5rem;
  height: 100%;
  position: relative;
  z-index: 3;
}
.glass-btn__inner.flex-center {
  justify-content: center;
  align-items: center;
}

.glass-btn__text {
  display: flex;
  flex-direction: column;
}
.glass-btn__supname {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 1.75rem;
  line-height: 100%;
  letter-spacing: -0.02em;
  color: #ffffff;
  opacity: 0.3;
  margin-bottom: 0.375rem;
}
.glass-btn__name {
  font-family: "TT Commons";
  font-weight: 500;
  font-size: 2.5rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.glass-btn__page-icon {
  width: 11.3125rem;
}
.glass-btn__info-icon {
  height: 2.5rem;
}

.glass-btn__icon {
  width: 7.25rem;
  min-width: 7.25rem;
  height: 7.25rem;
  min-height: 7.25rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.glass-btn__icon.transparent {
  background-color: rgba(73, 132, 186, 0.2);
}
.glass-btn__icon.pink {
  background: linear-gradient(
    76.34deg,
    rgba(219, 35, 179, 0.5) -22.55%,
    rgba(219, 35, 179, 0.36) 102.9%
  );
  backdrop-filter: blur(9.24456px);
}


.glass-btn.toPage .tint::after {
  background: rgba(255, 255, 255, 0.2);
}
.glass-btn.toInfo .tint::after {
  background: linear-gradient(
    79.65deg,
    rgba(73, 132, 186, 0.35) 7.72%,
    rgba(73, 132, 186, 0.35) 81.57%
  );
}
.glass-btn.toInfo.pink .tint::after {
  background: linear-gradient(79.65deg, rgb(219 35 179 / 11%) 7.72%, rgb(219 35 179 / 20%) 81.57%);
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
