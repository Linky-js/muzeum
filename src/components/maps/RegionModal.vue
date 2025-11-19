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
    <div class="interesting-fact">
      <div class="avatar animBtn">
        <img v-if="region?.name" class="" :src="'/touch2/regions/IntFact_' + region.regioncode + '.png'"
          :alt="region.name" />
      </div>
      <div class="fact">
        <div class="title animBtn">
          Интересный факт
        </div>
        <div class="description animBtn">
          {{ region.fun }}
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
          {{ region.fact }}
        </div>
      </div>
    </div>
    <div class="monument animBtn">
      <img :src="'/touch2/regions/regicon_' + region.regioncode + '.png'" alt="">
      <div class="icons">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 0C19.2533 0 14.6131 1.40758 10.6663 4.04473C6.71954 6.68188 3.6434 10.4302 1.8269 14.8156C0.0103989 19.201 -0.464881 24.0266 0.461164 28.6822C1.38721 33.3377 3.67299 37.6141 7.02945 40.9706C10.3859 44.327 14.6623 46.6128 19.3178 47.5388C23.9734 48.4649 28.799 47.9896 33.1844 46.1731C37.5698 44.3566 41.3181 41.2805 43.9553 37.3337C46.5924 33.3869 48 28.7467 48 24C47.9931 17.6369 45.4623 11.5364 40.963 7.03704C36.4636 2.53766 30.3631 0.00688216 24 0V0ZM41.294 14H34.852C33.4099 10.658 31.5112 7.53217 29.21 4.712C34.303 6.09785 38.6446 9.43494 41.294 14ZM33 24C32.9836 26.0363 32.6627 28.0586 32.048 30H15.952C15.3373 28.0586 15.0164 26.0363 15 24C15.0164 21.9637 15.3373 19.9413 15.952 18H32.048C32.6627 19.9413 32.9836 21.9637 33 24ZM17.556 34H30.444C28.7465 37.3514 26.5763 40.4417 24 43.176C21.4228 40.4424 19.2525 37.3521 17.556 34ZM17.556 14C19.2535 10.6485 21.4237 7.55832 24 4.824C26.5773 7.55754 28.7475 10.6479 30.444 14H17.556ZM18.8 4.712C16.4953 7.53157 14.5932 10.6574 13.148 14H6.70601C9.35772 9.43286 13.7033 6.09551 18.8 4.712ZM4.92201 18H11.8C11.2815 19.9583 11.0127 21.9743 11 24C11.0127 26.0257 11.2815 28.0417 11.8 30H4.92201C3.69269 26.0944 3.69269 21.9055 4.92201 18ZM6.70601 34H13.148C14.5932 37.3426 16.4953 40.4684 18.8 43.288C13.7033 41.9045 9.35772 38.5671 6.70601 34ZM29.21 43.288C31.5112 40.4678 33.4099 37.342 34.852 34H41.294C38.6446 38.5651 34.303 41.9021 29.21 43.288ZM43.078 30H36.2C36.7185 28.0417 36.9873 26.0257 37 24C36.9873 21.9743 36.7185 19.9583 36.2 18H43.074C44.3033 21.9055 44.3033 26.0944 43.074 30H43.078Z"
            fill="#1162B3" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="49" viewBox="0 0 42 49" fill="none">
          <path
            d="M21 11.8064C23.6837 11.8064 25.8593 9.6112 25.8593 6.90322C25.8593 4.19525 23.6837 2 21 2C18.3162 2 16.1406 4.19525 16.1406 6.90322C16.1406 9.6112 18.3162 11.8064 21 11.8064Z"
            stroke="#1162B3" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" />
          <path
            d="M21 32.1304V44.0698C21 45.1975 21.9233 46.1292 23.0409 46.1292H23.7942C24.9118 46.1292 25.8351 45.1975 25.8351 44.0698V39.0195V21.6375C25.8351 20.093 27.0742 18.8427 28.6049 18.8427H35.9668H38.0806C39.1254 18.8427 40.0001 17.9846 40.0001 16.9059V16.8079C40.0001 15.7537 39.1497 14.8711 38.0806 14.8711H13.1522H3.91944C2.87468 14.8711 2 15.7292 2 16.8079V16.9059C2 17.9601 2.85039 18.8427 3.91944 18.8427H14.367C15.3389 18.8427 16.1407 19.6517 16.1407 20.6324V28.0117V44.0698C16.1407 45.1975 17.064 46.1292 18.1816 46.1292H18.9348C20.0525 46.1292 20.9757 45.1975 20.9757 44.0698"
            stroke="#1162B3" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="47" viewBox="0 0 44 47" fill="none">
          <path
            d="M30.0704 13.0596C30.7053 14.3235 31.0729 15.7583 31.0729 17.2614C31.0729 22.3856 26.996 26.5191 22.0169 26.5191C17.0378 26.5191 12.9609 22.3515 12.9609 17.2614C12.9609 15.7583 13.3285 14.3235 13.9634 13.0596"
            stroke="#1162B3" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          <path
            d="M30.0703 13.0599H13.8965L14.4646 3.25563L15.7344 2.87985C19.7444 1.71837 23.9884 1.71836 27.9984 2.81152L29.5022 3.22149L30.0703 13.0599Z"
            stroke="#1162B3" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M19.8657 7.74805H23.8657" stroke="#1162B3" stroke-width="2" stroke-miterlimit="10"
            stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21.8657 9.74805V5.74805" stroke="#1162B3" stroke-width="2" stroke-miterlimit="10"
            stroke-linecap="round" stroke-linejoin="round" />
          <path
            d="M2 37.4857C2 32.8398 10.9891 29.082 22.0167 29.082C33.0443 29.082 42 32.8398 42 37.4857V45.0012H30.9724H13.061H2V37.4857Z"
            stroke="#1162B3" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21.9832 45.0015L14.999 29.5947" stroke="#1162B3" stroke-width="4" stroke-miterlimit="10"
            stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21.9829 45.0015L28.967 29.5947" stroke="#1162B3" stroke-width="4" stroke-miterlimit="10"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="46" viewBox="0 0 50 46" fill="none">
          <path d="M15.2437 39.5994V43.9999H33.2948V37.0391" stroke="#1162B3" stroke-width="4" stroke-miterlimit="10"
            stroke-linecap="round" stroke-linejoin="round" />
          <path
            d="M15.2437 39.5995H18.3921V35.4923H22.2489V31.5185H26.5518V25.2244H23.4821V21.3039H19.7564V11.0093H23.4821V5.14188H18.8119V3.88839C18.8119 3.54168 19.0218 3.24832 19.3366 3.14164C21.6193 2.39488 24.6365 1.78149 28.1261 2.07486C30.1988 2.23487 33.1636 2.47492 36.2858 4.42182C37.4664 5.16858 40.6936 7.24884 42.2153 11.4627C42.845 13.2496 43.0025 14.8764 43.0025 16.0766C43.0025 16.7167 43.1599 17.3301 43.501 17.8635C44.4193 19.357 46.2558 22.3707 47.1217 23.7842C47.384 24.2109 47.2266 24.7443 46.8068 24.9843L43.7108 26.7179C43.2648 26.9579 43.0024 27.4646 43.0549 27.9714C43.2648 29.9449 43.1074 31.5185 42.95 32.5853C42.7139 34.1321 42.5302 35.1456 41.7956 36.1057C40.3788 37.9459 38.0437 38.1593 37.414 38.2126C33.8457 38.5327 33.7145 37.4659 33.2948 37.0392"
            stroke="#1162B3" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" />
          <path d="M15.3752 3.19531H11.5708V7.06245H15.3752V3.19531Z" fill="#1162B3" />
          <path d="M8.42204 7.0625H4.61768V10.9296H8.42204V7.0625Z" fill="#1162B3" />
          <path d="M15.1125 10.3428H11.3081V14.2099H15.1125V10.3428Z" fill="#1162B3" />
          <path d="M15.1125 18.1035H11.3081V21.9706H15.1125V18.1035Z" fill="#1162B3" />
          <path d="M11.3083 14.21H7.50391V18.0771H11.3083V14.21Z" fill="#1162B3" />
          <path d="M3.80436 13.4102H0V17.2773H3.80436V13.4102Z" fill="#1162B3" />
          <path d="M6.95282 20.4238H3.14844V24.291H6.95282V20.4238Z" fill="#1162B3" />
          <path d="M35.1838 8.39648H31.3794V12.2636H35.1838V8.39648Z" fill="#1162B3" />
          <path d="M28.3625 12.29H24.5581V16.1572H28.3625V12.29Z" fill="#1162B3" />
          <path d="M32.193 16.1572H28.3887V20.0244H32.193V16.1572Z" fill="#1162B3" />
          <path d="M30.2775 34.6396H26.4731V38.5068H30.2775V34.6396Z" fill="#1162B3" />
          <path d="M4.35563 35.4131H0.55127V39.2802H4.35563V35.4131Z" fill="#1162B3" />
          <path d="M10.3112 30.5059H6.50684V34.373H10.3112V30.5059Z" fill="#1162B3" />
          <path d="M18.8386 29.8916H15.0342V33.7588H18.8386V29.8916Z" fill="#1162B3" />
          <path d="M22.6427 26.0254H18.8384V29.8925H22.6427V26.0254Z" fill="#1162B3" />
          <path d="M14.3254 24.291H10.521V28.1581H14.3254V24.291Z" fill="#1162B3" />
          <path d="M18.9167 14.21H15.1123V18.0771H18.9167V14.21Z" fill="#1162B3" />
        </svg>

      </div>
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
  display: flex;
  flex-direction: column;
}

.icons {
  display: flex;
  gap: 100px;
  justify-content: space-between;
  width: 473px;
  margin-top: 620px;
}

.icons svg {
  height: 48px;
}

.show .animBtn {
  opacity: 1;
  transform: scale(1);
  transition: all 0.5s ease-in-out;
}
</style>
