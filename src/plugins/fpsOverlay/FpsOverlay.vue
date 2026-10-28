<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const STORAGE_KEY = 'museum-fps'
const IDLE_MS = 2500
const SAMPLE_MS = 1000

const route = useRoute()
const enabled = ref(readEnabled())
const collapsed = ref(false)

const pageFps = ref(0)
const pageAvg = ref(0)
const mode = ref('static')
const videos = ref([])

let rafId = 0
let scanTimer = 0
let lastActivity = 0
let frames = 0
let windowStart = 0
const fpsHistory = []
const trackers = new Map()

const isMonitor = computed(() => {
  const name = String(route.name || '')
  const path = String(route.path || '')
  return name.toLowerCase().includes('monitor') || path.toLowerCase().includes('monitor') || path.includes('kms-m')
})

const visible = computed(() => enabled.value && isMonitor.value)

function readEnabled() {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('fps') === '0') return false
    if (params.get('fps') === '1') return true
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === '0') return false
    if (stored === '1') return true
  } catch {
    /* ignore */
  }
  return true
}

function persist(value) {
  enabled.value = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function fpsClass(value, kind = 'page') {
  const cap = pageFps.value >= 20 ? pageFps.value : 30
  const okAt = Math.max(cap - 2, 28)
  if (kind === 'video') {
    if (value >= Math.min(28, okAt - 1)) return 'ok'
    if (value >= 20) return 'warn'
    return 'bad'
  }
  if (value >= okAt) return 'ok'
  if (value >= cap * 0.7) return 'warn'
  return 'bad'
}

function fileName(src) {
  if (!src) return 'без источника'
  try {
    const url = new URL(src, window.location.origin)
    return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || src)
  } catch {
    return src.split('/').pop() || src
  }
}

function markActivity() {
  lastActivity = performance.now()
}

function startPageLoop() {
  frames = 0
  windowStart = performance.now()
  lastActivity = 0

  const tick = (now) => {
    frames++
    const elapsed = now - windowStart
    if (elapsed >= SAMPLE_MS) {
      const fps = (frames * 1000) / elapsed
      pageFps.value = Math.round(fps * 10) / 10
      fpsHistory.push(fps)
      if (fpsHistory.length > 20) fpsHistory.shift()
      pageAvg.value = Math.round((fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length) * 10) / 10
      frames = 0
      windowStart = now
      mode.value = lastActivity && now - lastActivity < IDLE_MS ? 'active' : 'static'
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function snapshotVideo(video, tracker) {
  const quality = typeof video.getVideoPlaybackQuality === 'function' ? video.getVideoPlaybackQuality() : null
  const rect = video.getBoundingClientRect()
  const playing = !video.paused && !video.ended && video.readyState >= 2
  const opacity = Number(getComputedStyle(video).opacity || 1)
  const visibleOnScreen = rect.width > 2 && rect.height > 2 && opacity > 0.05
  const fps = playing ? tracker.fps : 0

  return {
    id: tracker.id,
    name: fileName(video.currentSrc || video.src),
    fps: Math.round(fps * 10) / 10,
    dropped: quality ? quality.droppedVideoFrames : tracker.dropped,
    total: quality ? quality.totalVideoFrames : tracker.total,
    size: video.videoWidth && video.videoHeight ? `${video.videoWidth}×${video.videoHeight}` : '—',
    playing,
    visible: visibleOnScreen,
    paused: video.paused,
  }
}

function publishVideos() {
  const list = []
  for (const [video, tracker] of trackers) {
    if (!document.contains(video)) continue
    if (!video.currentSrc) continue
    list.push(snapshotVideo(video, tracker))
  }
  videos.value = list
}

function attachTracker(video) {
  if (trackers.has(video)) return

  const tracker = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    fps: 0,
    dropped: 0,
    total: 0,
    frames: 0,
    windowStart: performance.now(),
    lastQuality: null,
    rvfc: 0,
    qualityTimer: 0,
    stop() {},
  }

  const countFrame = (now) => {
    tracker.frames++
    const elapsed = now - tracker.windowStart
    if (elapsed >= SAMPLE_MS) {
      tracker.fps = (tracker.frames * 1000) / elapsed
      tracker.frames = 0
      tracker.windowStart = now
    }
  }

  const onRvfc = (now) => {
    countFrame(now)
    if (document.contains(video)) {
      tracker.rvfc = video.requestVideoFrameCallback(onRvfc)
    }
  }

  const pollQuality = () => {
    const quality = typeof video.getVideoPlaybackQuality === 'function' ? video.getVideoPlaybackQuality() : null
    if (quality) {
      const now = performance.now()
      if (tracker.lastQuality) {
        const dt = (now - tracker.lastQuality.t) / 1000
        const delta = quality.totalVideoFrames - tracker.lastQuality.total
        if (!tracker.rvfc && dt > 0) tracker.fps = delta / dt
      }
      tracker.dropped = quality.droppedVideoFrames
      tracker.total = quality.totalVideoFrames
      tracker.lastQuality = { t: now, total: quality.totalVideoFrames }
    } else if (!tracker.rvfc) {
      tracker.fps = video.paused ? 0 : 0
    }
  }

  if (typeof video.requestVideoFrameCallback === 'function') {
    tracker.rvfc = video.requestVideoFrameCallback(onRvfc)
  }
  tracker.qualityTimer = window.setInterval(pollQuality, SAMPLE_MS)

  tracker.stop = () => {
    if (tracker.rvfc && typeof video.cancelVideoFrameCallback === 'function') {
      try {
        video.cancelVideoFrameCallback(tracker.rvfc)
      } catch {
        /* ignore */
      }
    }
    clearInterval(tracker.qualityTimer)
  }

  trackers.set(video, tracker)
}

function scanVideos() {
  const live = [...document.querySelectorAll('video')]
  for (const video of live) attachTracker(video)
  for (const video of [...trackers.keys()]) {
    if (!live.includes(video)) {
      trackers.get(video)?.stop()
      trackers.delete(video)
    }
  }
  publishVideos()
}

function onKeydown(event) {
  if (event.ctrlKey && event.shiftKey && event.code === 'KeyF') {
    event.preventDefault()
    persist(!enabled.value)
  }
}

onMounted(() => {
  startPageLoop()
  scanVideos()
  scanTimer = window.setInterval(scanVideos, 500)
  window.addEventListener('pointerdown', markActivity, { passive: true })
  window.addEventListener('pointermove', markActivity, { passive: true })
  window.addEventListener('keydown', markActivity, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearInterval(scanTimer)
  for (const tracker of trackers.values()) tracker.stop()
  trackers.clear()
  window.removeEventListener('pointerdown', markActivity)
  window.removeEventListener('pointermove', markActivity)
  window.removeEventListener('keydown', markActivity)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <aside v-if="visible" class="fps-overlay" :class="{ collapsed }">
      <header class="fps-overlay__head">
        <strong>FPS монитор</strong>
        <div class="fps-overlay__actions">
          <button type="button" @click="collapsed = !collapsed">{{ collapsed ? 'развернуть' : 'свернуть' }}</button>
          <button type="button" @click="persist(false)">скрыть</button>
        </div>
      </header>

      <div v-show="!collapsed" class="fps-overlay__body">
        <div class="fps-overlay__row">
          <span>Приложение / экран</span>
          <b :class="fpsClass(pageFps)">{{ pageFps.toFixed(1) }}</b>
        </div>
        <div class="fps-overlay__row muted">
          <span>Среднее ~20с</span>
          <span>{{ pageAvg.toFixed(1) }}</span>
        </div>
        <div class="fps-overlay__row">
          <span>Режим</span>
          <span :class="mode === 'active' ? 'ok' : 'static'">{{ mode === 'active' ? 'пользование' : 'статика' }}</span>
        </div>
        <div class="fps-overlay__hint">Ctrl+Shift+F — вкл/выкл · ?fps=0 в URL</div>

        <div class="fps-overlay__section">Видео ({{ videos.length }})</div>
        <div v-if="!videos.length" class="muted">На экране нет &lt;video&gt;</div>
        <ul v-else class="fps-overlay__videos">
          <li v-for="item in videos" :key="item.id">
            <div class="fps-overlay__name" :title="item.name">{{ item.name }}</div>
            <div class="fps-overlay__row">
              <span>{{ item.size }} · {{ item.playing && item.visible ? 'играет' : item.paused ? 'пауза' : 'скрыто' }}</span>
              <b :class="fpsClass(item.playing ? item.fps : 0, 'video')">{{ item.fps.toFixed(1) }}</b>
            </div>
            <div class="fps-overlay__row muted">
              <span>кадры</span>
              <span>{{ item.total }} / drop {{ item.dropped }}</span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  </Teleport>
</template>

<style scoped>
.fps-overlay {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483000;
  width: 320px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: 12px 14px;
  border-radius: 12px;
  color: #e8eefc;
  font: 12px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: rgba(6, 10, 22, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.fps-overlay.collapsed {
  width: auto;
}

.fps-overlay__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.fps-overlay__actions {
  display: flex;
  gap: 6px;
}

button {
  border: 0;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  font: inherit;
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
}

.fps-overlay__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0;
}

.fps-overlay__section {
  margin: 10px 0 6px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-size: 10px;
  color: #9db0d0;
}

.fps-overlay__videos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.fps-overlay__videos li {
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}

.fps-overlay__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.fps-overlay__hint {
  margin-top: 6px;
  font-size: 10px;
  color: #8b9bb8;
}

.muted {
  color: #8b9bb8;
}

.ok {
  color: #5ee0a0;
}

.warn {
  color: #ffd166;
}

.bad {
  color: #ff6b6b;
}

.static {
  color: #9db0d0;
}
</style>
