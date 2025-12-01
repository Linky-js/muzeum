<script setup>
import { ref, onMounted } from 'vue'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'
import InteractivePlate from '@/components/dash/monitor/InteractivePlate.vue'

const router = useRouter()
const intro = ref(true)

const bus = useBroadcastBus({ role: 'monitor', pairId: '1', debug: false })
initMonitorSync(router, bus, '1')

const showIntroVideo = ref(true)
const showLoopVideo = ref(false)

const introVideoRef = ref(null)
const loopVideoRef = ref(null)

const VIDEO_SRC = '/video/intro.mp4'
const VIDEO_SRC_2 = '/video/cikl.mp4'

bus.on('sentResult', () => {
    intro.value = false
})

onMounted(() => {
    introVideoRef.value.onended = () => {
        showIntroVideo.value = false
        showLoopVideo.value = true
    }
})
</script>

<template>
    <transition name="wrap-fade">
        <div v-if="intro" class="video-wrap">

            <!-- Intro video -->
            <transition name="fade">
                <video v-if="showIntroVideo"
                    ref="introVideoRef"
                    class="animVideo intro"
                    :src="VIDEO_SRC"
                    autoplay muted playsinline></video>
            </transition>

            <!-- Loop video -->
            <transition name="fade">
                <video v-if="showLoopVideo"
                    ref="loopVideoRef"
                    class="cikl intro"
                    :src="VIDEO_SRC_2"
                    autoplay loop muted playsinline></video>
            </transition>

        </div>
    </transition>

    <InteractivePlate />
</template>

<style scoped>
.video-wrap {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2;
}

.intro {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
}

/* Плавное исчезновение всей обёртки */
.wrap-fade-enter-active,
.wrap-fade-leave-active {
  transition: opacity 0.8s ease;
}
.wrap-fade-enter-from,
.wrap-fade-leave-to {
  opacity: 0;
}

/* Плавное переключение видео */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>