<script setup>
import { onMounted, defineProps, computed } from "vue";
// import gsap from "gsap";
// import SplitText from "gsap/SplitText";

const props = defineProps({
  show: { type: Boolean, default: false },
  region: {
    type: Object,
    required: true
  },
  title: { type: String, default: "" },
});
onMounted(() => {
  console.log('reg', props.region);

})
function getImagePath(name) {
  const base = `/touch2/regions/${name}`;
  try {
    console.log(new URL(`${base}.jpg`, import.meta.url).href);

    return new URL(`${base}.jpg`, import.meta.url).href;
  } catch {
    try {
      return new URL(`${base}.png`, import.meta.url).href;
    } catch {
      return "/touch2/regions/default.jpg"; // fallback
    }
  }
}

const imageSrc = computed(() => {
  if (!props.region?.name) return "/touch2/regions/default.jpg";
  return getImagePath(props.region.name);
});
</script>


<template>
  <div class="modal-overlay" :class="props.show ? 'show' : ''">

    <div class="frame animBtn"></div>
    <div class="regionInfo">
      <svg class="line" xmlns="http://www.w3.org/2000/svg" width="11" height="685" viewBox="0 0 11 685" fill="none">
        <path
          d="M5.33301 0.000651042C2.38749 0.000650913 -0.000325392 2.38847 -0.000325521 5.33398C-0.00032565 8.2795 2.38749 10.6673 5.33301 10.6673C8.27853 10.6673 10.6663 8.2795 10.6663 5.33398C10.6663 2.38847 8.27853 0.00065117 5.33301 0.000651042ZM5.33298 674.001C2.38746 674.001 -0.000354854 676.388 -0.000354982 679.334C-0.000355111 682.28 2.38746 684.667 5.33298 684.667C8.2785 684.667 10.6663 682.28 10.6663 679.334C10.6663 676.388 8.2785 674.001 5.33298 674.001ZM5.33301 5.33398L4.33301 5.33398L4.33298 679.334L5.33298 679.334L6.33298 679.334L6.33301 5.33398L5.33301 5.33398Z"
          fill="white" />
      </svg>
      <div class="region__block">
        <div class="names">
          <span :class="{ active: region.type === 'okrug' }">{{ region.type !== 'lpu' ? region.okrug : '' }}</span>
          <span :class="{ active: region.type === 'oblast' }">{{ (region.type !== 'okrug' && region.type !== 'lpu') ?
            region.oblast : '' }}</span>
          <span :class="{ active: region.type === 'gorod' }">{{ (region.type === 'lpu' || region.type === 'gorod') ?
            region.gorod : '' }}</span>
        </div>
        <div v-if="region.type === 'lpu'" class="fullName">
          {{ region.fullname }}
        </div>
        <div class="patients">
          <span class="number">{{ region.patients }}</span>
          {{ region.patients > 1 ? 'пациентов' : 'пациент' }}
        </div>
      </div>
    </div>
    <div class="monument animBtn">
      <img :src="'/touch2/regions/regicon_' + region.regioncode + '.png'" alt="">
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 6rem;
}

.modal-text {
  margin-top: 1rem;
  font-size: 3rem;
  line-height: 1.5;
  transition: none;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  z-index: 2000;
  gap: 46px;
  padding-top: 180px;
  padding-left: 1712px;
  align-items: center;
}

.frame {
  box-sizing: border-box;
  width: 1200px;
  height: 1800px;
  border: 3px dashed #999999;
  border-radius: 100px;
  flex-shrink: 0;
}

.show .animBtn {
  opacity: 1;
  transform: scale(1);
  transition: all 0.5s ease-in-out;
}

.names {
  color: #FFF;
  font-family: "TT Hoves";
  font-size: 64px;
  font-style: normal;
  font-weight: 400;
  line-height: 64px;
  letter-spacing: 3.2px;
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.names .active {
  color: rgba(12, 106, 246, 1);
  font-weight: 700;
}

.regionInfo {
  display: flex;
  gap: 115px;
}

.line {
  height: auto;

}

.region__block {
  height: max-content;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.patients {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 64px;
  font-style: normal;
  font-weight: 400;
  line-height: 64px;
  letter-spacing: 3.2px;
  text-transform: uppercase;
}

.number {
  color: #FFF;
  font-size: 234px;
  font-style: normal;
  font-weight: 600;
  line-height: 100%;
  /* 234px */
  letter-spacing: 4.68px;
}

.fullName {
  color: #115BFF;
  font-family: "TT Hoves";
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 60px;
  /* 125% */
  letter-spacing: 0.96px;
  max-width: 1379px;
}
</style>
