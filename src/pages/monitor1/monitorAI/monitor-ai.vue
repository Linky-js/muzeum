<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import step1 from '@/components/ai/monitor/step1.vue'
import step2 from '@/components/ai/monitor/step2.vue'
import step3 from '@/components/ai/monitor/step3.vue'
import step4 from '@/components/ai/monitor/step4.vue'
import step5 from '@/components/ai/monitor/step5.vue'


import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const step = ref(1)
const currentHero = ref({})

bus.on('currentHeroGlobal', (payload) => {
  currentHero.value = payload.hero
  console.log(currentHero.value);
})
bus.on('step', (data) => {
  console.log(data);
  step.value = data.step
})

</script>

<template>
  <div class="wrapper-ai">
    <step1 v-if="step === 1" />
    <step2 v-if="step === 2" />
    <step3 v-if="step === 3" :currentHero="currentHero" />
    <step4 v-if="step === 4" :currentHero="currentHero" />
    <step5 v-if="step === 5" />
  </div>
</template>
<style>
.wrapper-ai {
  background: linear-gradient(185deg, #030e22 0%, #030e22 68.91%, #000 100%);
  height: 100vh;
  width: 100vw;
}

.title {
  font-weight: 500;
  font-size: 140px;
  line-height: 100%;
  letter-spacing: -0.03em;
  text-align: center;
  color: #fff;
}

.description {
  font-weight: 400;
  font-size: 52px;
  line-height: 130%;
  letter-spacing: -0.02em;
  text-align: center;
  color: #fff;
  opacity: 0.5;
}
</style>
