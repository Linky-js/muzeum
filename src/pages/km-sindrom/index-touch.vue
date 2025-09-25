<script setup>
import { useRouter } from "vue-router";
import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMasterSync } from "@/composables/syncRouterSimple.js";

const router = useRouter();

const bus = useBroadcastBus({
  role: "touch",
  pairId: "1",
  debug: true,
});
initMasterSync(router, bus, "1");

function goToVideo() {
  router.push({ name: "touch-video" }).catch(() => {});
}
function goToCalculate() {
  router.push({ name: "touch-calculate" }).catch(() => {});
}
</script>

<template>
  <div class="home">
    <div class="breadcrumbs1">Главная / КМ Синдром</div>
    <div class="home__btns">
      <div class="btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          fill="currentColor"
          class="bi bi-arrow-right-short"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
          />
        </svg>
        Диета Даш
      </div>
      <div @click="goToCalculate()" class="btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          fill="currentColor"
          class="bi bi-arrow-right-short"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
          />
        </svg>
        Калькулятор Жизни
      </div>
      <div @click="goToVideo()" class="btn_green">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          fill="currentColor"
          class="bi bi-camera-reels"
          viewBox="0 0 16 16"
        >
          <path
            d="M6 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0M1 3a2 2 0 1 0 4 0 2 2 0 0 0-4 0"
          />
          <path
            d="M9 6h.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 7.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 16H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm6 8.73V7.27l-3.5 1.555v4.35zM1 8v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1"
          />
          <path
            d="M9 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6M7 3a2 2 0 1 1 4 0 2 2 0 0 1-4 0"
          />
        </svg>
        Видеоролик КМ Синдром
      </div>
    </div>
  </div>
</template>
<style scoped>

.home {
  padding: 20px;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  position: relative;
}
.home__btns {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 50px;
  width: 80%;
  margin: 0 auto;
}
.btn {
  padding: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  border: 1px solid rgb(107, 107, 107);
  background: rgb(107, 107, 107);
  cursor: pointer;
  font-size: 40px;
  width: calc(50% - 25px);
}
.btn_green {
  padding: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  cursor: pointer;
  font-size: 40px;
  background-color: rgb(19, 49, 19);
}
.btn:hover, .btn_green:hover {
  opacity: 0.8;
}

</style>
