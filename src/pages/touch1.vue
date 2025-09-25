<script setup>
import { useRouter } from "vue-router";
import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMasterSync } from "@/composables/syncRouterSimple.js";
import HeartCardio from "@/components/icons/HeartCardio.vue";
import LiquidGlassData from "@/components/ui/LiquidGlassData.vue";
const video = '/bg.mp4'

const router = useRouter();

const bus = useBroadcastBus({
  role: "touch",
  pairId: "1",
  debug: true,
});
initMasterSync(router, bus, "1");

function goToVideo() {
  router.push({ name: "touch-video" }).catch(() => { });
}
function goToKms() {
  router.push({ name: "kms" }).catch(() => { });
}
</script>

<template>
  <div class="home">
    <video class="bg" :src="video" autoplay muted loop playsinline></video>
    <div class="header">
      <div class="header__left">
        <div class="header__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="92" height="92" viewBox="0 0 92 92" fill="none">
            <g filter="url(#filter0_d_2433_1353)">
              <path
                d="M58 46C58 52.6274 52.6274 58 46 58C39.3726 58 34 52.6274 34 46C34 39.3726 39.3726 34 46 34C52.6274 34 58 39.3726 58 46Z"
                fill="white" />
              <path
                d="M58 46C58 52.6274 52.6274 58 46 58C39.3726 58 34 52.6274 34 46C34 39.3726 39.3726 34 46 34C52.6274 34 58 39.3726 58 46Z"
                fill="white" />
            </g>
            <defs>
              <filter id="filter0_d_2433_1353" x="0.399998" y="0.399998" width="91.2" height="91.2"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha" />
                <feOffset />
                <feGaussianBlur stdDeviation="16.8" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2433_1353" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2433_1353" result="shape" />
              </filter>
            </defs>
          </svg>
          <div class="line__left"></div>
        </div>
        <div class="header__text">
          Главная
        </div>
      </div>
      <div class="header__right">
        <svg xmlns="http://www.w3.org/2000/svg" width="237" height="60" viewBox="0 0 237 60" fill="none">
          <path
            d="M79.3457 54.6206L79.2016 44.6736C79.2016 44.6736 79.2592 41.4444 77.0968 39.801C75.5687 38.6188 73.2333 38.1575 71.4458 38.1575C68.1877 38.1575 65.91 39.4838 64.7567 41.6174C64.6991 41.7327 64.6414 41.8192 64.5837 41.9345L67.5823 43.2031C67.8994 42.021 68.8221 40.6947 71.5611 40.6947C75.8859 40.6947 75.8859 44.0681 75.8859 46.0575V46.5476L72.8009 46.8071C67.0345 47.2684 64.9586 48.5659 63.8629 50.2093C63.2863 51.0743 62.998 52.0834 62.998 53.1213C62.998 56.4082 65.7947 58.6283 69.5717 58.6283C73.2622 58.6283 75.0786 56.5235 76.0589 55.4856C76.1454 56.9848 76.4337 58.3399 76.4337 58.3399H79.8359C79.4611 57.5038 79.3457 54.6206 79.3457 54.6206ZM75.4246 52.9772C74.4731 54.9954 72.5702 55.8892 70.2925 55.8892C67.8706 55.8892 66.6597 54.5629 66.6597 53.006C66.6597 51.6509 67.2651 50.2958 70.8691 49.5173C72.9739 49.056 74.6749 48.8254 75.9436 48.6235C75.9436 51.4491 75.9147 51.9104 75.4246 52.9772ZM192.108 54.6206L191.964 44.6736C191.964 44.6736 192.021 41.4444 189.859 39.801C188.331 38.6188 185.995 38.1575 184.208 38.1575C180.95 38.1575 178.672 39.4838 177.519 41.6174C177.461 41.7327 177.403 41.8192 177.346 41.9345L180.344 43.2031C180.661 42.021 181.584 40.6947 184.323 40.6947C188.648 40.6947 188.648 44.0681 188.648 46.0575V46.5476L185.563 46.8071C179.797 47.2684 177.721 48.5659 176.625 50.2093C176.048 51.0743 175.76 52.0834 175.76 53.1213C175.76 56.4082 178.557 58.6283 182.334 58.6283C186.024 58.6283 187.841 56.5235 188.821 55.4856C188.907 56.9848 189.196 58.3399 189.225 58.3399H192.598C192.223 57.5038 192.108 54.6206 192.108 54.6206ZM188.187 52.9772C187.235 54.9954 185.332 55.8892 183.055 55.8892C180.633 55.8892 179.393 54.5629 179.393 53.006C179.393 51.6509 179.998 50.2958 183.602 49.5173C185.707 49.056 187.408 48.8254 188.677 48.6235C188.734 51.4491 188.677 51.9104 188.187 52.9772ZM148.427 56.2352C143.843 56.3217 142.488 52.1987 142.574 48.9695H156.529C156.529 48.1622 156.529 46.663 156.154 45.0195C155.001 40.1469 151.599 38.1863 148.024 38.1863C143.929 38.1863 139.115 40.9831 139.115 48.2776C139.115 54.7936 142.401 58.7148 148.139 58.7148C152.348 58.7148 154.511 56.5524 155.606 54.6494L152.435 54.044C151.628 55.3414 150.301 56.1775 148.427 56.2352ZM147.764 40.6659C149.725 40.6659 152.637 41.5309 152.925 46.6053H142.632C143.007 42.713 144.996 40.6659 147.764 40.6659ZM111.407 56.2352C106.823 56.3217 105.468 52.1987 105.554 48.9695H119.509C119.509 48.1622 119.509 46.663 119.134 45.0195C117.981 40.1469 114.578 38.1863 111.003 38.1863C106.909 38.1863 102.094 40.9831 102.094 48.2776C102.094 54.7936 105.381 58.7148 111.119 58.7148C115.357 58.7148 117.491 56.5524 118.586 54.6494L115.415 54.044C114.578 55.3414 113.281 56.1775 111.407 56.2352ZM110.744 40.6659C112.704 40.6659 115.616 41.5309 115.905 46.6053H105.612C105.987 42.713 107.947 40.6659 110.744 40.6659ZM167.485 56.2064C165.294 56.2064 161.604 54.8224 161.604 48.4217C161.604 46.6918 161.921 40.6082 167.255 40.6082C169.965 40.6082 171.205 42.0787 171.781 43.3473L174.837 42.0787C172.963 38.936 169.561 38.2152 167.139 38.2152C160.969 38.2152 157.971 43.2031 157.971 48.6812C157.971 53.4385 160.566 58.7148 167.428 58.7148C171.406 58.7148 173.598 56.783 174.837 54.8801L171.954 53.6691C171.262 54.9954 169.994 56.2064 167.485 56.2064ZM137.039 42.8283C136.087 39.628 133.117 38.3882 130.667 38.3882C129.513 38.3882 126.428 38.6765 124.612 41.848V39.0225H121.354V58.3111H124.612V47.2973C124.612 45.8557 124.612 44.3852 126.054 42.9436C127.092 41.9057 128.331 41.4732 129.773 41.4732C131.532 41.4732 133.348 42.2805 133.925 44.1258C134.127 44.7889 134.127 45.3655 134.127 47.3261V58.3111H137.385V46.8071C137.385 45.1637 137.385 43.9816 137.039 42.8283ZM86.1213 55.2549L100.566 35.9663V32.7948H82.1713V35.9375H96.6738L82.1713 54.9954V58.3111H100.941V55.2549H86.1213ZM56.2513 42.367V38.8783H52.9933V58.2823H56.2513V49.3732C56.2513 47.7009 56.1936 45.7403 57.0874 44.3276C58.1542 42.5976 59.7111 41.9345 62.9115 41.9345V38.5612C61.5852 38.6188 58.0965 38.7053 56.2513 42.367ZM50.0524 41.5597V38.8495H46.5349V32.7948L43.1615 34.2075V38.8495H40.0765V41.5597H43.1615V54.0728C43.1327 56.61 43.1327 58.4264 46.9097 58.4264C48.1495 58.4264 49.5046 58.167 50.0812 58.1093V55.4279C49.4181 55.6297 48.5531 55.8892 47.9477 55.8892C46.5637 55.8892 46.5637 54.9089 46.5637 52.6024V41.5597H50.0524ZM31.3692 46.6053C29.2933 46.2017 26.8714 45.4232 26.8714 43.5779C26.8714 42.2805 28.1401 40.7524 30.7061 40.7524C33.3298 40.7524 34.8868 42.54 35.1174 43.232L38.1448 41.9634C36.7608 39.3108 33.993 38.244 31.0809 38.244C26.5831 38.244 23.6134 40.4641 23.6134 43.9816C23.6134 47.9892 27.0444 48.7677 30.3601 49.4885C33.2145 50.1228 35.9824 50.8148 35.9824 53.006C35.9824 55.0819 34.2813 56.1775 31.3981 56.1775C29.0627 56.1775 27.5058 55.5144 26.6408 54.0151L23.2098 54.6206C24.5649 57.3596 27.3328 58.6859 31.2827 58.6859C36.6167 58.6859 39.4134 55.7451 39.4134 52.6024C39.3845 48.5659 35.6652 47.4703 31.3692 46.6053ZM13.2627 32.7659H9.71639L0 58.3111H3.604L6.45837 50.4976H16.1748L18.9426 58.3111H22.5178L13.2627 32.7659ZM7.55399 47.6144L11.4463 37.0042L15.1656 47.6144H7.55399Z"
            fill="white" />
          <path
            d="M221.488 21.8098C221.055 17.8598 223.045 -6.07079 212.06 1.45437C205.14 7.22077 195.049 19.4456 190.984 27.259C189.455 30.3441 191.214 30.9207 193.636 32.4488L193.924 32.593L200.959 36.2546L207.966 40.0604L213.184 43.0013C207.62 46.0863 194.328 58.2823 208.6 59.2049C212.579 59.0319 227.456 56.1776 229.791 53.2944C230.195 52.7177 230.224 52.1122 229.878 51.4779L229.532 50.9878L229.128 50.5841L228.754 50.2958L225.582 48.3641L221.661 46.0575C238.701 35.1302 245.332 28.5853 221.488 21.8098ZM215.491 20.0799L210.676 18.9554L206.178 18.2058L204.736 18.1193C214.655 8.48939 214.338 4.48173 215.491 20.0799ZM223.045 48.9407L224.631 50.0075L225.697 50.8436L226.13 51.2761L226.447 51.6509V51.6798V51.7086V51.7374L226.418 51.7663L226.36 51.7951L211.916 52.9195L212.521 52.3429L215.606 50.0363L220.104 46.9801L223.045 48.9407ZM227.917 32.5065L227.831 32.7083L227.485 33.1696L226.216 34.2652L224.602 35.4762L222.468 36.9466L214.568 42.021L202.92 35.3608L196.519 31.5262L194.905 30.3729L194.674 30.1422L194.415 29.6809C194.213 29.0754 194.934 28.2682 195.308 27.8933L202.286 20.7718C206.524 30.3152 220.133 51.3914 221.257 27.951L224.169 29.3061L226.908 30.8919L227.6 31.4685L227.889 31.9298L227.946 32.1893L227.917 32.5065Z"
            fill="white" />
        </svg>
      </div>
    </div>
    <div class="liquidGlass">
      <!-- <div class="liquidGlass-wrapper menu">
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint"></div>
        <div class="liquidGlass-shine"></div>
        <div class="liquidGlass-text">
          <div>New file</div>
          <div>Open file</div>
          <div>Settings</div>
          <div>Repository</div>
        </div>
      </div> -->
      <RouterLink to="/touch1-video" class="liquidGlass-Small">
        <div class="liq__small--text">
          <div class="label">
            Видео
          </div>
          <div class="liq__small--title">Метаболический центр</div>
        </div>
        <div class="iconVideo">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M28.3322 15.3337L37.021 9.25151C37.398 8.98758 37.9177 9.07928 38.1815 9.45633C38.2795 9.59639 38.3322 9.76323 38.3322 9.93421V30.0665C38.3322 30.5267 37.959 30.8998 37.4989 30.8998C37.3279 30.8998 37.161 30.8472 37.021 30.7492L28.3322 24.667V31.667C28.3322 32.5875 27.586 33.3337 26.6655 33.3337H3.33219C2.41173 33.3337 1.66553 32.5875 1.66553 31.667V8.33366C1.66553 7.41319 2.41173 6.66699 3.33219 6.66699H26.6655C27.586 6.66699 28.3322 7.41319 28.3322 8.33366V15.3337Z"
              fill="white" />
          </svg>
        </div>

      </RouterLink>

      <RouterLink to="/kms" class="liquidGlass-wrapper blur">
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint2"></div>
        <div class="liquidGlass-shine"></div>

        <div class="dock">
          Метаболический синдром
          <HeartCardio />
        </div>
      </RouterLink>
      <RouterLink to="/maptwo" class="liquidGlass-wrapper ">
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint"></div>
        <div class="liquidGlass-shine"></div>
        <div class="dock">
          Data Science
          <HeartCardio />
        </div>
      </RouterLink>

      <RouterLink to="touchmaptwo" class="liquidGlass-Small">
        <div class="liquidGlass-tint"></div>

        <div class="liq__small--text">

          <div class="label">
            Ссылка
          </div>
          <div class="liq__small--title">Курируемые регионы</div>
        </div>

      </RouterLink>
      <RouterLink to="/maptwo" class="testBtn"></RouterLink>
      <LiquidGlassData>Видео</LiquidGlassData>
    </div>
    <svg style="display: block;">
      <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence">
        </feTurbulence>
        <!-- Seeds: 14, 17,  -->

        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"></feFuncR>
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"></feFuncG>
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"></feFuncB>
        </feComponentTransfer>

        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"></feGaussianBlur>

        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100"
          lighting-color="white" result="specLight">
          <fePointLight x="-200" y="-200" z="300"></fePointLight>
        </feSpecularLighting>

        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage"></feComposite>

        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G">
        </feDisplacementMap>
      </filter>
    </svg>
  </div>

</template>
<style scoped>
.home {
  padding: 3rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
  max-width: 176.25rem;
  position: relative;
  width: 100%;
  height: 100%;
}

.liquidGlass {
  margin-top: 5.44rem;
  display: flex;
  gap: 2.31rem;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: calc(100% - 5.44rem);
}

.header {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.header__left {
  display: flex;
  flex-direction: column;
  gap: 2.31rem;
}

.header__icon {
  position: relative;
}

.header__left svg {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-40%, -48%);
}

.header__text {
  color: #EEE;
  font-family: "TT Commons";
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  /* 2.5rem */
  letter-spacing: -0.075rem;
  text-transform: capitalize;
}

.line__left {
  width: 20.25rem;
  height: 0.1875rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.43) 7.09%, rgba(255, 255, 255, 0.00) 100%);

}

.liquidGlass-wrapper {
  position: relative;
  display: flex;
  font-weight: 600;
  overflow: hidden;
  color: black;
  cursor: pointer;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  width: 57.625rem;
  padding: 2.3rem 3.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 6.75rem;
  border-radius: 3rem;
  white-space: nowrap;
}
.blur {
  backdrop-filter: blur(px);
}

.liquidGlass-wrapper div {
  z-index: 3;
}

/* .liquidGlass-wrapper:hover {
  padding: 2.8rem 4.5rem;
} */

.liquidGlass-effect {
  position: absolute;
  z-index: 0;
  inset: 0;
  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
  overflow: hidden;
  isolation: isolate;
}

.liquidGlass-tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.liquidGlass-tint2 {
  z-index: 1;
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
}

.liquidGlass-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.1), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.1);
  border-radius: 3rem;
}

.liquidGlass-Small {
  position: relative;
  display: flex;
  padding: 1.3rem 1.3rem 1.3rem 3.5rem;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  width: 57.625rem;
  gap: 6.75rem;
  white-space: nowrap;
  margin-top: auto;

  border-radius: 6.875rem;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 74px 0 rgba(73, 132, 186, 0.12);
  backdrop-filter: blur(10px);
}

/* 👉 псевдоэлемент для градиентного бордера */
.liquidGlass-Small::before {
  content: "";
  position: absolute;
  inset: 0;
  /* заполняем всю область */
  border-radius: inherit;
  padding: 3px;
  /* толщина бордера */
  background: linear-gradient(169deg, #2D3F6E 0%, #A4B3FF 86%, #6575FF 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  /* чтобы бордер не мешал кликам */
}


.liquidGlass-Small div {
  z-index: 3;
}

.liquidGlass-Small .liquidGlass-effect,
.liquidGlass-Small .liquidGlass-shine {
  border-radius: 6.875rem;
}

.iconVideo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 7.21019rem;
  height: 7.21019rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: #0486ff4b;
}

.iconVideo svg {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.liq__small--text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label {
  color: #FFF;
  -webkit-text-stroke-width: 0.79px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.15);
  font-family: "TT Commons";
  font-size: 2rem;
  font-style: normal;
  font-weight: 400;
  line-height: 110%;
  /* 2.2rem */
  letter-spacing: -0.04rem;
  opacity: 0.3;
}

.liq__small--title {
  color: #FFF;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.15);
  font-family: "TT Commons";
  font-size: 3.125rem;
  font-style: normal;
  font-weight: 400;
  line-height: 110%;
  letter-spacing: -0.0625rem;
}

/* .menu>div>div:hover {
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: inset -2px -2px 2px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
} */



.dock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  border-radius: 2rem;
  color: #FFF;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.15);
  font-family: "TT Commons";
  font-size: 3.125rem;
  font-style: normal;
  font-weight: 400;
  line-height: 110%;
  /* 3.4375rem */
  letter-spacing: -0.0625rem;
}

video {
  position: absolute;
  top: 0;
  left: 0;
  width: 150%;
  height: 100%;
  object-fit: cover;
  object-position: left bottom;
  z-index: 0;
}
.testBtn {
  /* Frame 25 */

box-sizing: border-box;

/* Auto layout */
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
padding: 24px 64px;
gap: 157px;

width: 922px;
height: 182px;

background: linear-gradient(85.26deg, rgba(217, 217, 217, 0.1) 3.83%, rgba(115, 115, 115, 0.1) 99.95%);
/* Glass */
border-radius: 48px;

/* Inside auto layout */
flex: none;
order: 1;
flex-grow: 0;


/* Data Science */

margin: 0 auto;
width: 232px;
height: 44px;

font-family: 'TT Hoves';
font-style: normal;
font-weight: 500;
font-size: 40px;
line-height: 110%;
/* identical to box height, or 44px */
letter-spacing: -0.02em;

/* White */
color: #FFFFFF;


/* Inside auto layout */
flex: none;
order: 0;
flex-grow: 0;


/* chrome_fXG8NDZdWN 1 */

margin: 0 auto;
width: 165px;
height: 110px;

background: url(chrome_WZpagJPfyt.png);
mix-blend-mode: screen;
border-radius: 0px;

/* Inside auto layout */
flex: none;
order: 1;
flex-grow: 0;

}
</style>
