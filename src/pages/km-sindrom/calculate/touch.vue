<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const video = "/bg2.mp4";
</script>
<template>
  <div class="wrapper-content">
    <router-view></router-view>
  </div>
</template>
<style scoped>
.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
  position: relative;
  width: 100%;
  height: 100vh;
background: linear-gradient(23.51deg, #000000 -4.02%, #030E22 117.07%, #000000 171.71%);

}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left bottom;
  z-index: 0;
}

.relative {
  position: relative;
}
</style>
