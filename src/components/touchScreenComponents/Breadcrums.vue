<script setup>
const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  firstLink: {
    type: Boolean,
    default: false
  },
  view: String,
  dotsInText: {
    type: Boolean,
    default: true
  },
  logo: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div class="breadcrumbs" :class="view">
    <ul class="breadcrumbs__list">
      <li
        class="breadcrumbs__item"
        v-for="(item, index) in list"
        :key="item.id"
      >
        <RouterLink
          class="breadcrumbs__item-inner"
          :to="item.link"
          v-if="index !== list.length - 1 && typeof item.link === 'string'"
        >
          <span class="breadcrumbs__item-top">
            <span class="breadcrumbs__item-round gray"></span>
            <span class="breadcrumbs__item-line"></span>
          </span>
          <span class="breadcrumbs__item-text gray" :class="{dots: dotsInText}">{{ item.title }}</span>
        </RouterLink>
        <RouterLink
          class="breadcrumbs__item-inner"
          :to="item.link"
          v-else-if="firstLink"
        >
          <span class="breadcrumbs__item-top">
            <span class="breadcrumbs__item-round gray"></span>
            <span class="breadcrumbs__item-line"></span>
          </span>
          <span class="breadcrumbs__item-text gray" :class="{dots: dotsInText}">{{ item.title }}</span>
        </RouterLink>
        <div class="breadcrumbs__item-inner" v-else>
          <span class="breadcrumbs__item-top">
            <span class="breadcrumbs__item-round"></span>
            <span class="breadcrumbs__item-line gradient"></span>
          </span>
          <span class="breadcrumbs__item-text" :class="{dots: dotsInText}">
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
  font-family: 'TT Hoves';
  font-size: 2.38rem;
  font-weight: 500;
  line-height: 2.88rem;
  letter-spacing: -0.06em;
  text-align: left;
  opacity: 0.8;
  max-width: 20.25rem;

  
}
.breadcrumbs__item-text.dots {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.breadcrumbs__item-text.gray {
  opacity: 0.3;
}

.breadcrumbs.mobile .breadcrumbs__list {
  flex-wrap: wrap;
  gap: 16px;
}

.breadcrumbs.mobile .breadcrumbs__item-inner {
  flex-direction: row;
  gap: 8px;
}

.breadcrumbs.mobile .breadcrumbs__item-top {
  width: 8px;
  display: block;
}

.breadcrumbs.mobile .breadcrumbs__item-round {
  width: 8px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
}
.breadcrumbs.mobile .breadcrumbs__item-round.gray {
  background: #ffffff;
  opacity: 0.2;
  box-shadow: 0px 0px 11.2px #ffffff;
}
.breadcrumbs.mobile .breadcrumbs__item-line {
  display: none;
}

.breadcrumbs.mobile .breadcrumbs__item-text {
  font-weight: 500;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: -0.03em;
}
.breadcrumbs.monitor .breadcrumbs__list {
  flex-wrap: wrap;
  gap: 30px;
}

.breadcrumbs.monitor .breadcrumbs__item-inner {
  flex-direction: row;
  gap: 15px;
}

.breadcrumbs.monitor .breadcrumbs__item-top {
  width: 15px;
  display: block;
}

.breadcrumbs.monitor .breadcrumbs__item-round {
  width: 15px;
  height: 15px;
  min-width: 15px;
  min-height: 15px;
}
.breadcrumbs.monitor .breadcrumbs__item-round.gray {
  background: #ffffff;
  opacity: 0.2;
  box-shadow: 0px 0px 11.2px #ffffff;
}
.breadcrumbs.monitor .breadcrumbs__item-line {
  display: none;
}

.breadcrumbs.monitor .breadcrumbs__item-text {
  font-weight: 500;
  font-size: 23.168px;
  line-height: 100%;
  letter-spacing: -0.03em;
}
@media screen and (max-width: 475px) {
  .breadcrumbs__list {
    flex-wrap: wrap;
    gap: 16px;
  }

  .breadcrumbs__item-inner {
    flex-direction: row;
    gap: 8px;
  }

  .breadcrumbs__item-top {
    width: 8px;
    display: block;
  }

  .breadcrumbs__item-round {
    width: 8px;
    height: 8px;
    min-width: 8px;
    min-height: 8px;
  }
  .breadcrumbs__item-round.gray {
    background: #ffffff;
    opacity: 0.2;
    box-shadow: 0px 0px 11.2px #ffffff;
  }
  .breadcrumbs__item-line {
    display: none;
  }

  .breadcrumbs__item-text {
    font-weight: 500;
    font-size: 12px;
    line-height: 100%;
    letter-spacing: -0.03em;
  }
}
</style>
