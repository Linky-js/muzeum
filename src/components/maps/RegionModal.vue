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
  <div  class="modal-overlay" :class="props.show ? 'show' : ''">
    <div class="interesting-fact">
      <div class="avatar animBtn">
        <img v-if="region?.name"
        class=""
          :src="'/touch2/regions/IntFact_' + region.regioncode + '.png'"
          :alt="region.name" />
      </div>
      <div class="fact">
        <div class="title animBtn">
          Интересный факт
        </div>
        <div class="description animBtn">
          {{ region.fact }}
        </div>
      </div>
    </div>
    <div class="frame animBtn"></div>
    <div class="region__block">
      <div class="region__title animBtn">{{ region.name }}</div>
      <div class="fact">
        <div class="title animBtn">
          Региональные решения
        </div>
        <div class="description animBtn">
          {{ region.fun }}
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
  gap: 159px;
  padding-top: 180px;
}

.avatar {
  width: 400px;
  height: 400px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;

}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}


.title {
  font-family: 'TT Hoves';
  font-style: normal;
  font-weight: 400;
  font-size: 64px;
  line-height: 64px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #FFFFFF;

}

.fact .description {
  max-width: 1000px;

  font-family: 'TT Hoves';
  font-style: italic;
  font-weight: 300;
  font-size: 40px;
  line-height: 55px;

  color: #FFFFFF;
}

.interesting-fact {
  display: flex;
  flex-direction: column;
  gap: 130px;
  padding-left: 553px;
  padding-top: 93px;
  flex-shrink: 0;
}

.fact {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.frame {
  box-sizing: border-box;
  width: 1200px;
  height: 1800px;
  flex-shrink: 0;
}

.region__block {
  display: flex;
  flex-direction: column;
  gap: 220px;
  padding-top: 143px;
  flex-shrink: 0;
}

.region__block .region__title {

width: 1713px;
height: 260px;

font-family: 'TT Hoves';
font-style: normal;
font-weight: 500;
font-size: 130px;
line-height: 100%;
display: flex;
align-items: flex-end;
letter-spacing: 0.02em;
color: #FFFFFF;


}

.region__block .description {
  max-width: 1600px;
  font-family: 'TT Hoves';
  font-style: normal;
  font-weight: 400;
  font-size: 48px;
  line-height: 60px;
  color: #FFFFFF;
}

.monument {

  width: 620px;
  height: 840px;
  margin-top: 300px;
}
.show .animBtn{
  opacity: 1;
  transform: scale(1);
  transition: all 0.5s ease-in-out;
}
</style>
