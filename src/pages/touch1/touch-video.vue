<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'

const router = useRouter()
const muteBtn = ref(null)
const bus = useBroadcastBus({
  role: 'touch',
  pairId: '1',
  debug: true,
})
initMasterSync(router, bus, '1')

// UI state
const playing = ref(true)
const muted = ref(false)

function videoControl() {
  playing.value = !playing.value
  bus.send('videoCommand', { cmd: playing.value ? 'play' : 'pause' }, { role: 'monitor', pairId: '1' })
}

function toggleMute() {
  muted.value = !muted.value
  bus.send('videoCommand', { cmd: muted.value ? 'mute' : 'unmute' }, { role: 'monitor', pairId: '1' })
}

function finish() {
  // остановить и сбросить на мониторе, затем вернуться назад
  bus.send('videoCommand', { cmd: 'pause' }, { role: 'monitor', pairId: '1' })
  bus.send('videoCommand', { cmd: 'seek', payload: { seconds: 0 } }, { role: 'monitor', pairId: '1' })
  router.back()
}
onMounted(() => {
})
</script>
<template>
  <div class="home">
    <div class="video__btns">
      <div @click="$router.back()" class="btn_video">Завершить просмотр</div>
      <div @click="videoControl()" ref="playBtn" class="btn_video">
        <span v-if="playing">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-pause-circle"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
            />
            <path
              d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z"
            />
          </svg>
          Пауза
        </span>
        <span v-else>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-play-circle"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
            />
            <path
              d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"
            />
          </svg>
          Пуск
        </span>
      </div>
      <div @click="toggleMute()" class="btn_video" ref="muteBtn">
        <span v-if="muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-volume-up"
            viewBox="0 0 16 16"
          >
            <path
              d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"
            />
            <path
              d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"
            />
            <path
              d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"
            />
          </svg>
          Включить звук
        </span>
        <span v-else>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-volume-mute-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"
            />
          </svg>
          Выключить звукА
        </span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  position: relative;
  padding: 20px;
}
.video__btns{
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 00px;
    background: rgb(48, 48, 48);    
    width: max-content;
    margin: 0 auto;
}
.btn_video{
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 40px;
    cursor: pointer;
}
.btn_video:hover{
    background: rgb(19, 49, 19);
}
.btn_video:not(:last-child){
    border-right: 1px solid rgb(107, 107, 107);
}
</style>