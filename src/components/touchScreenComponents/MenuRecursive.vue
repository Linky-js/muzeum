<script setup>
import { RouterLink } from "vue-router";
import IconArrow from "@/components/icons/IconArrow.vue";

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  level: {
    type: Number,
    default: 0
  }
});
</script>

<template>
  <ul class="menu-block__list" :class="`menu-level-${level}`">
    <li 
      v-for="item in items" 
      :key="item.id" 
      class="menu-block__item"
    >
      <RouterLink :to="item.link" class="menu-block__link">
        <span class="menu-block__text">{{ item.name }}</span>
        <IconArrow 
          v-if="item.submenu && item.submenu.length" 
          class="menu-block__icon" 
        />
      </RouterLink>
      
      <!-- Рекурсивный вызов для подменю -->
      <div 
        v-if="item.submenu && item.submenu.length" 
        class="menu-block glass submenu"
      >
        <div class="effect"></div>
        <div class="tint"></div>
        <div class="shine"></div>
        <div class="menu-block__top">
          <span class="menu-block__top-text">{{ item.name }}</span>
        </div>
        
        <!-- Рекурсивный компонент -->
        <MenuRecursive 
          :items="item.submenu" 
          :level="level + 1" 
        />
      </div>
    </li>
  </ul>
</template>
<style scoped>
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

.submenu{
  transform: scaleY(0);
  transition: all .5s;
  transform-origin: bottom;
  z-index: 5;
  left: -3rem;
  bottom: -3rem;
}
.menu-block__item:hover > .submenu{
  transform: scaleY(1);
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