<script setup>
const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="breadcrumbs">
    <ul class="breadcrumbs__list">
      <li
        class="breadcrumbs__item"
        v-for="(item, index) in list"
        :key="item.id"
      >
        <RouterLink
          class="breadcrumbs__item-inner"
          :to="item.link"
          v-if="index !== list.length - 1"
        >
          <span class="breadcrumbs__item-top">
            <span class="breadcrumbs__item-round"></span>
            <span class="breadcrumbs__item-line"></span>
          </span>
          <span class="breadcrumbs__item-text gray">{{ item.title }}</span>
        </RouterLink>
        <div class="breadcrumbs__item-inner" v-else>
          <span class="breadcrumbs__item-top">
            <span class="breadcrumbs__item-round"></span>
            <span class="breadcrumbs__item-line gradient"></span>
          </span>
          <span class="breadcrumbs__item-text">
            {{ item.title }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.breadcrumbs__list {
  display: flex;
  align-items: start;
}
.breadcrumbs__item-inner {
  display: flex;
  flex-direction: column;
  gap: 1.6875rem;
}

.breadcrumbs__item-top {
  display: flex;
  align-items: center;
  width: 21.31rem;
}
.breadcrumbs__item-round {
  display: block;
  position: relative;
  z-index: 1;
  min-width: 1.5rem;
  min-height: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  box-shadow: 0rem 0rem 2.1rem rgba(255, 255, 255, 1);
  background-color: rgba(255, 255, 255, 1);
  border-radius: 50%;
}
.breadcrumbs__item-line {
  display: block;
  margin-left: -0.4375px;
  width: 20.25rem;
  height: 0.19rem;
  min-width: 20.25rem;
  min-height: 0.19rem;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.43) 7.09%,
    rgba(255, 255, 255, 0.44) 100%
  );
}
.breadcrumbs__item-line.gradient {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.43),
    rgba(255, 255, 255, 0) 100%
  );
}
.breadcrumbs__item-text {
  color: rgba(255, 255, 255, 1);
  font-family: TT Hoves;
  font-size: 2.38rem;
  font-weight: 500;
  line-height: 2.88rem;
  letter-spacing: -3%;
  text-align: left;
  opacity: 0.8;
}
.breadcrumbs__item-text.gray {
  opacity: 0.3;
}
</style>
