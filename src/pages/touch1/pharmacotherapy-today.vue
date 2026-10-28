<script setup>
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import GlassBtn from "@/components/touchScreenComponents/GlassBtn.vue";
import ModalDiscleimer from "@/components/ui/ModalDiscleimer.vue";
import { computed, onMounted, ref, watch } from "vue";
import gsap from 'gsap'
import IconArrow from "@/components/icons/IconArrow.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import { useBroadcastBus } from "@/composables/useBroadcastBus.js";
import { initMasterSync } from "@/composables/syncRouterSimple.js";
import { useRouter } from "vue-router";

import contur from "/contur.png";
import manRed from "/manRed.png";
import manBlue from "/manBlue.png";
const router = useRouter();
const bus = useBroadcastBus({
  role: "touch",
  pairId: "1",
  debug: false,
});
initMasterSync(router, bus, "1");
const sendBtnActive = (index) => {
  console.log(index);
  if (index > 0) {
    defaultY = -100

  } else {
    defaultY = 0
  }

  clearPendingReturnState()
  isSliderLocked.value = false
  gsap.killTweensOf(slider.value)

  const nextY = clampYToBounds(defaultY)
  gsap.to(slider.value, {
    y: nextY,
    duration: 0.5,
    ease: 'power1.inOut',
    onUpdate() {
      const yValue = gsap.getProperty(slider.value, 'y')
      updateGradient(yValue)
      updateSliderStrength(yValue)
    },
    onComplete() {
      currentY = nextY
      updateGradient(nextY)
      updateSliderStrength(nextY)
    }
  })
  btns.value.forEach((item, i) => {
    item.active = i === index
  })

  const { maxTop } = getBounds()
  const safeMaxTop = Number.isFinite(maxTop) ? maxTop : 0
  const currentPositionY = 0
  const payload = sendPositionToBus(currentPositionY, safeMaxTop)

  if (payload?.position !== 'center') {
    tryStartPendingReturn()
  }
}
bus.on('defaultScreen', (payload) => {
  console.log('defaultScreen');
  router.push('/touch1/screen-1')
})

const breadcrumbsList = ref([
  {
    id: 0,
    title: "Главная",
    link: "screen-1",
  },
  {
    id: 1,
    title: "Метаболический синдром",
    link: "screen-3",
  },
  {
    id: 2,
    title: "Фармакотерапия",
    link: "touch1-pharmacotherapy",
  },
]);
const btns = ref([
  {
    id: 1,
    name: "ФИЗИОЛОГИЧЕСКОЕ СОСТОЯНИЕ",
    active: true
  },
  {
    id: 2,
    name: "РЕНИН-ЗАВИСИМЫЙ АЛЬДОСТЕРОНИЗМ",
    active: false
  },
  {
    id: 3,
    name: "РЕНИН-НЕЗАВИСИМЫЙ АЛЬДОСТЕРОНИЗМ",
    active: false
  },
])

// slideBtn
const slider = ref(null)
const container = ref(null)
const gradientStyle = ref({ height: '0px', opacity: 0 })
const sliderStrength = ref(0)
const sliderY = ref(0)
const isSliderLocked = ref(false)
const arrowAngle = ref(0)

let isDragging = false
let startY = 0
let lastClientY = 0
let currentY = 0
let defaultY = 0
let lastTouchStartAt = 0

let lastMoveTime = 0
let velocity = 0
let lockTimer = null
let pendingReturnVideo = null
let returnFallbackTimer = null
let isReturnPending = false
let isReturnAnimating = false
let isReturnScheduled = false

const VELOCITY_THRESHOLD = 0.5 // px/ms — только явный быстрый свайп активирует край
const TOUCH_MOUSE_GHOST_DELAY = 700
const DEFAULT_VIDEO_DURATION = 6000
const VIDEO_DURATION = ref(DEFAULT_VIDEO_DURATION) // ms, обновляется по фактической длительности видео
const videoDurationBySrc = ref({})

const VIDEO_BY_STATE_AND_POSITION = {
  1: {
    center: '/video/farm-today/normatenziya.webm',
    bottom: '/video/farm-today/normatenziya_ponizh_dav.webm',
    top: '/video/farm-today/normatenziya_povish_dav.webm',
  },
  2: {
    center: '/video/farm-today/renin_zavis.webm',
    bottom: '/video/farm-today/renin_zavis_ponizh_dav.webm',
    top: '/video/farm-today/renin_zavis_povish_dav.webm',
  },
  3: {
    center: '/video/farm-today/renin_nezavis.webm',
    bottom: '/video/farm-today/renin_nezavis_ponizh_dav.webm',
    top: '/video/farm-today/renin_nezavis_povish_dav.webm',
  },
}

const isReninActive = computed(() => {
  return btns.value.some((item) => item.active && (item.id === 2 || item.id === 3))
})

const activeBtnId = computed(() => {
  const activeBtn = btns.value.find((item) => item.active)
  return activeBtn ? activeBtn.id : null
})


const arrowRotationDeg = computed(() => {
  // Определяем maxTop для расчёта положения
  const { maxTop = 1 } = container.value && slider.value ? getBounds() : { maxTop: 1 };
  const y = sliderY.value;
  const EDGE_ZONE = 0.8;
  // Верх
  if (y <= -maxTop * EDGE_ZONE) return 90;
  // Низ
  if (y >= maxTop * EDGE_ZONE) return -90;
  // Центр
  if (activeBtnId.value === 1) return 0;
  if (activeBtnId.value === 2 || activeBtnId.value === 3) return 45;
  return 0;
})

watch(arrowRotationDeg, (newDeg) => {
  if (isReturnAnimating) return

  gsap.to({ angle: arrowAngle.value }, {
    angle: newDeg,
    duration: 0.35,
    ease: 'power2.out',
    onUpdate() {
      arrowAngle.value = this.targets()[0].angle
    }
  })
})

const redOpacity = computed(() => {
  if (!isReninActive.value) return 0
  return 0.7 + sliderStrength.value * 0.3
})

const blueOpacity = computed(() => {
  if (isReninActive.value) return 0
  return 1
})

const getPositionName = (yPos, maxTop) => {
  if (yPos >= maxTop * 0.8) return 'bottom'
  if (yPos <= -maxTop * 0.8) return 'top'
  return 'center'
}

const getVideoByStateAndPosition = (stateId, positionName) => {
  const stateMap = VIDEO_BY_STATE_AND_POSITION[stateId] || VIDEO_BY_STATE_AND_POSITION[1]
  return stateMap?.[positionName] || VIDEO_BY_STATE_AND_POSITION[1][positionName] || null
}

const getCenterTargetAngle = () => {
  return activeBtnId.value === 2 || activeBtnId.value === 3 ? 45 : 0
}

const clearPendingReturnState = () => {
  isReturnPending = false
  pendingReturnVideo = null
  if (returnFallbackTimer) {
    clearTimeout(returnFallbackTimer)
    returnFallbackTimer = null
  }
}

const tryStartPendingReturn = () => {
  if (!isReturnPending || !pendingReturnVideo || isReturnScheduled) return

  const durationMs = videoDurationBySrc.value[pendingReturnVideo]
  if (!Number.isFinite(durationMs) || durationMs <= 0) return

  VIDEO_DURATION.value = durationMs

  scheduleReturnToCenter(durationMs)
}

const startDrag = (e) => {
  if (isSliderLocked.value || isDragging) return
  console.log(e.type);

  const isTouchStart = e.type === 'touchstart'
  if (isTouchStart) {
    lastTouchStartAt = Date.now()
    if (e.cancelable) {
      e.preventDefault()
    }
  }

  if (e.type === 'mousedown' && Date.now() - lastTouchStartAt < TOUCH_MOUSE_GHOST_DELAY) {
    return
  }

  gsap.killTweensOf(slider.value)

  isDragging = true
  const sliderPosition = Number(gsap.getProperty(slider.value, 'y'))
  currentY = Number.isFinite(sliderPosition) ? sliderPosition : defaultY
  startY = getY(e)
  console.log(startY);

  lastClientY = getY(e)
  lastMoveTime = Date.now()
  velocity = 0

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)

  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag, { passive: false })
  document.addEventListener('touchcancel', stopDrag, { passive: false })
}

const onDrag = (e) => {
  if (!isDragging) return

  if (e.touches && e.cancelable) {
    e.preventDefault()
  }

  const now = Date.now()
  const clientY = getY(e)
  const delta = clientY - startY

  const dt = now - lastMoveTime
  if (dt > 0) {
    velocity = (clientY - lastClientY) / dt
  }

  lastMoveTime = now
  lastClientY = clientY

  const { maxTop, minTop } = getBounds()

  const newY = clampYToBounds(currentY + delta)

  gsap.set(slider.value, { y: newY })
  updateGradient(newY)
  updateSliderStrength(newY)
}

const stopDrag = (e) => {
  console.log(e.type);

  if (!isDragging) return
  isDragging = false

  const clientY = getY(e)
  if (!Number.isFinite(clientY)) {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('touchend', stopDrag)
    document.removeEventListener('touchcancel', stopDrag)
    return
  }
  const delta = clientY - startY

  const { maxTop, minTop } = getBounds()

  // центр — магнит по умолчанию
  // крайнее положение если: быстрый свайп ИЛИ остановился в пределах 10% от края
  const finalY = clampYToBounds(currentY + delta)
  const EDGE_ZONE = 0.8 // 90% от maxTop = последние 10%

  let targetY = 0
  let isEdgePosition = false

  if (finalY >= maxTop * EDGE_ZONE) {
    targetY = maxTop
    isEdgePosition = true
  } else if (finalY <= minTop * EDGE_ZONE) {
    targetY = minTop
    isEdgePosition = true
  } else if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
    targetY = velocity > 0 ? maxTop : minTop

    isEdgePosition = true
  }

  // если прилетели в крайнее положение — блокируем и отправляем через bus
  if (isEdgePosition) {
    isSliderLocked.value = true
    isReturnScheduled = false
    sendPositionToBus(targetY, maxTop)
  } else {
    targetY = clampYToBounds(defaultY)
  }

  gsap.to(slider.value, {
    y: targetY,
    duration: 1,
    ease: targetY === defaultY
      ? 'elastic.out(1, 0.4)' // центр = приятный возврат
      : 'power3.out',
    onUpdate() {
      const yValue = gsap.getProperty(slider.value, 'y')
      updateGradient(yValue)
      updateSliderStrength(yValue)

    },
    onComplete() {
      updateGradient(targetY)
      updateSliderStrength(targetY)

      // если на краю — запускаем возврат после видео
      if (isEdgePosition) {
        isReturnPending = true
        tryStartPendingReturn()

        // fallback, если метаданные не пришли вовремя
        if (isReturnPending && !returnFallbackTimer) {
          returnFallbackTimer = setTimeout(() => {
            if (!isReturnPending || isReturnScheduled) return
            VIDEO_DURATION.value = DEFAULT_VIDEO_DURATION
            scheduleReturnToCenter(DEFAULT_VIDEO_DURATION)
          }, 1200)
        }
      }
    }
  })

  currentY = clampYToBounds(targetY)

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)

  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  document.removeEventListener('touchcancel', stopDrag)
}

const getBounds = () => {
  if (!container.value || !slider.value) {
    return { maxTop: 0, minTop: 0 }
  }

  const containerRect = container.value.getBoundingClientRect()
  const sliderRect = slider.value.getBoundingClientRect()

  const maxTop = containerRect.height / 2 - sliderRect.height / 2
  const minTop = -maxTop

  return { maxTop, minTop }
}

const clampYToBounds = (yPos) => {
  if (!Number.isFinite(yPos)) return 0

  const { maxTop, minTop } = getBounds()
  if (!Number.isFinite(maxTop) || !Number.isFinite(minTop)) return yPos

  return Math.min(maxTop, Math.max(minTop, yPos))
}

const getY = (e) => {
  if (e?.touches?.length) return e.touches[0].clientY
  if (e?.changedTouches?.length) return e.changedTouches[0].clientY
  if (Number.isFinite(e?.clientY)) return e.clientY
  return Number.isFinite(lastClientY) ? lastClientY : 0
}

const updateGradient = (yPos) => {
  const absY = Math.abs(yPos)
  if (absY < 2) {
    gradientStyle.value = { height: '0px', opacity: 0 }
    return
  }
  if (yPos > 0) {
    gradientStyle.value = {
      height: absY + 'px',
      top: '50%',
      transform: 'translate(-50%, 0)',
      background: 'linear-gradient(to top, rgba(90, 128, 208, 0.4), rgba(9, 161, 255, 0))',
    }
  } else {
    gradientStyle.value = {
      height: absY + 'px',
      top: '50%',
      transform: 'translate(-50%, -100%)',
      background: 'linear-gradient(to bottom, rgba(90, 128, 208, 0.4), rgba(9, 161, 255, 0))',
    }
  }
}

const sendPositionToBus = (yPos, maxTop) => {
  const positionName = getPositionName(yPos, maxTop)

  const activeBtn = btns.value.find(btn => btn.active)
  const stateId = activeBtn ? activeBtn.id : null
  const currentVideo = getVideoByStateAndPosition(stateId, positionName)

  if (positionName !== 'center') {
    pendingReturnVideo = currentVideo
    isReturnPending = true
  }

  const payload = {
    stateId,
    stateName: activeBtn?.name || 'NONE',
    position: positionName,
    video: currentVideo
  }

  bus.send('pharmacoState', payload, { pairId: '1' })
  console.log('[pharmacotherapy] Sent state:', payload)

  return payload
}

const scheduleReturnToCenter = (durationMs = DEFAULT_VIDEO_DURATION) => {
  if (isReturnScheduled) return

  isReturnScheduled = true

  if (lockTimer) clearTimeout(lockTimer)

  clearPendingReturnState()
  isReturnAnimating = true

  const durationSec = Math.max(durationMs, 300) / 1000

  gsap.to(slider.value, {
    y: defaultY,
    duration: durationSec,

    onUpdate() {
      const yValue = gsap.getProperty(slider.value, 'y')
      updateGradient(yValue)
      updateSliderStrength(yValue)

    },
    onComplete() {
      updateGradient(defaultY)
      updateSliderStrength(defaultY)
      isSliderLocked.value = false
      currentY = defaultY
      isReturnScheduled = false
      sendPositionToBus(0, getBounds().maxTop)
    }
  })

  // Анимируем стрелку обратно в центр за ту же длительность, что и видео
  gsap.to({ angle: arrowAngle.value }, {
    angle: getCenterTargetAngle(),
    duration: durationSec,
    ease: 'power1.inOut',
    onUpdate() {
      arrowAngle.value = this.targets()[0].angle
    },
    onComplete() {
      isReturnAnimating = false
    }
  })
}

bus.on('video_meta', (payload) => {
  if (!payload?.video) return

  const durationMs = Number(payload.durationMs)
  if (!Number.isFinite(durationMs) || durationMs <= 0) return

  videoDurationBySrc.value = {
    ...videoDurationBySrc.value,
    [payload.video]: durationMs,
  }

  if (pendingReturnVideo === payload.video) {
    VIDEO_DURATION.value = durationMs
    tryStartPendingReturn()
  }
})

onMounted(() => {
  // стартовый режим: первая кнопка активна, слайдер в центре, монитор получает center-состояние
  const firstBtn = btns.value[0]
  if (firstBtn) {
    btns.value.forEach((item, index) => {
      item.active = index === 0
    })
  }

  const { maxTop } = getBounds()
  sendPositionToBus(0, maxTop)
})

const updateSliderStrength = (yPos) => {

  sliderY.value = yPos

  const { maxTop } = getBounds()
  if (!maxTop) {
    sliderStrength.value = 0
    return
  }

  const progress = Math.min(Math.abs(yPos) / maxTop, 1)
  sliderStrength.value = Number.isFinite(progress) ? progress : 0
}
</script>
<template>
  <div class="header">
    <Breadcrums :list="breadcrumbsList" />
    <div class="header__logo">
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
  <div class="content relative">
    <div class="content__top">
      <h1 class="content__title animBtn">Мишени терапии</h1>
      <p class="content__subtitle animBtn">Ренин-Ангиотензин-Альдостероновая система</p>
      <div @click="$router.back()" class="to-back">
        <IconArrow class="to-back__icon" />
        <span class="to-back__text">Назад</span>
      </div>
    </div>
    <div class="content__btns">
      <div class="btns_column">
        <div class="label">
          Выберите состояние
        </div>
        <GlassBtn v-for="(item, index) in btns" :key="item.id" class="animBtnBottom"
          :class="{ activeGlass: item.active }" :name="item.name" @click="sendBtnActive(index)" />
      </div>
      <div class="arrowSlide" :class="{ opacity05: isSliderLocked }">
        <svg v-if="!isSliderLocked" class="touchStatus" width="99" height="109" viewBox="0 0 99 109" fill="none"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <rect width="99" height="109" fill="url(#pattern0_4572_129)" />
          <defs>
            <pattern id="pattern0_4572_129" patternContentUnits="objectBoundingBox" width="1" height="1">
              <use xlink:href="#image0_4572_129" transform="scale(0.00252525 0.00229358)" />
            </pattern>
            <image id="image0_4572_129" width="396" height="436" preserveAspectRatio="none"
              xlink:href="data:image/png;base64,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" />
          </defs>
        </svg>

        <div class="labelsvg">
          <svg width="356" height="24" viewBox="0 0 356 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 19.88V0.280029H16.24V19.88H11.76V4.62H4.47998V19.88H0ZM35.05 17.304C33.22 19.208 30.96 20.16 28.27 20.16C25.58 20.16 23.33 19.208 21.5 17.304C19.67 15.4 18.75 12.992 18.75 10.08C18.75 7.16802 19.67 4.76002 21.5 2.85602C23.33 0.952018 25.58 0 28.27 0C30.96 0 33.22 0.952018 35.05 2.85602C36.88 4.76002 37.79 7.16802 37.79 10.08C37.79 12.992 36.88 15.4 35.05 17.304ZM24.66 14.252C25.63 15.297 26.84 15.82 28.27 15.82C29.71 15.82 30.9 15.297 31.86 14.252C32.83 13.188 33.3101 11.797 33.3101 10.08C33.3101 8.36302 32.83 6.98104 31.86 5.93604C30.9 4.87204 29.71 4.34003 28.27 4.34003C26.84 4.34003 25.63 4.87204 24.66 5.93604C23.71 6.98104 23.23 8.36302 23.23 10.08C23.23 11.797 23.71 13.188 24.66 14.252ZM40.3101 19.88V0.280029H49.8301C51.5601 0.280029 52.95 0.783992 54 1.79199C55.04 2.79999 55.5701 4.11599 55.5701 5.73999C55.5701 6.91599 55.21 7.97099 54.5 8.90399C54.24 9.27699 53.9001 9.623 53.4701 9.94V10.08C53.9501 10.416 54.34 10.771 54.64 11.144C55.44 12.171 55.8501 13.263 55.8501 14.42C55.8501 16.044 55.32 17.36 54.28 18.368C53.23 19.376 51.84 19.88 50.11 19.88H40.3101ZM44.79 8.12H49.13C49.69 8.12 50.15 7.933 50.53 7.56C50.9 7.187 51.0901 6.72003 51.0901 6.16003C51.0901 5.60003 50.9 5.13301 50.53 4.76001C50.15 4.38701 49.69 4.20001 49.13 4.20001H44.79V8.12ZM44.79 15.96H49.41C49.97 15.96 50.4301 15.773 50.8101 15.4C51.1801 15.027 51.37 14.56 51.37 14C51.37 13.44 51.1801 12.973 50.8101 12.6C50.4301 12.227 49.97 12.04 49.41 12.04H44.79V15.96ZM75.4401 19.88V0.280029H79.92V19.88H75.4401ZM58.64 19.88V0.280029H63.12V6.44H67.1801C69.0801 6.44 70.6301 7.05602 71.8301 8.28802C73.0201 9.52002 73.62 11.144 73.62 13.16C73.62 15.176 73.0201 16.8 71.8301 18.032C70.6301 19.264 69.0801 19.88 67.1801 19.88H58.64ZM63.12 15.54H66.9C67.53 15.54 68.07 15.325 68.5 14.896C68.93 14.448 69.14 13.869 69.14 13.16C69.14 12.451 68.93 11.881 68.5 11.452C68.07 11.004 67.53 10.78 66.9 10.78H63.12V15.54ZM83.29 19.88V0.280029H87.77V15.54H92.8101V0.280029H97.29V15.54H102.33V0.280029H106.81V19.88H83.29ZM110.18 19.88V0.280029H123.62V4.34003H114.66V8.12H123.06V12.04H114.66V15.82H123.62V19.88H110.18ZM126.41 19.88V0.280029H130.89V7.70001H138.45V0.280029H142.93V19.88H138.45V12.32H130.89V19.88H126.41ZM146.31 19.88V0.280029H150.79V7.70001H158.35V0.280029H162.83V19.88H158.35V12.32H150.79V19.88H146.31ZM181.66 17.304C179.83 19.208 177.57 20.16 174.88 20.16C172.19 20.16 169.93 19.208 168.1 17.304C166.27 15.4 165.36 12.992 165.36 10.08C165.36 7.16802 166.27 4.76002 168.1 2.85602C169.93 0.952018 172.19 0 174.88 0C177.57 0 179.83 0.952018 181.66 2.85602C183.49 4.76002 184.4 7.16802 184.4 10.08C184.4 12.992 183.49 15.4 181.66 17.304ZM171.27 14.252C172.24 15.297 173.44 15.82 174.88 15.82C176.32 15.82 177.51 15.297 178.46 14.252C179.43 13.188 179.92 11.797 179.92 10.08C179.92 8.36302 179.43 6.98104 178.46 5.93604C177.51 4.87204 176.32 4.34003 174.88 4.34003C173.44 4.34003 172.24 4.87204 171.27 5.93604C170.32 6.98104 169.84 8.36302 169.84 10.08C169.84 11.797 170.32 13.188 171.27 14.252ZM186.91 19.88V0.280029H200.35V4.34003H191.39V8.12H199.79V12.04H191.39V15.82H200.35V19.88H186.91ZM208.31 23.8V15.54C209.15 15.54 209.76 15.353 210.13 14.98C210.52 14.607 210.75 14 210.83 13.16L211.95 0.280029H225.67V15.54H227.77V23.8H223.29V19.88H212.79V23.8H208.31ZM214.33 15.54H221.19V4.62H216.01L215.31 13.16C215.23 13.907 215.05 14.532 214.75 15.036C214.62 15.241 214.48 15.409 214.33 15.54ZM227.62 19.88L234.34 0.280029H240.78L247.5 19.88H242.6L241.34 15.96H233.78L232.52 19.88H227.62ZM235.04 12.04H240.08L237.84 5.03998H237.28L235.04 12.04ZM248.77 19.88V0.280029H258.29C260.02 0.280029 261.41 0.783992 262.46 1.79199C263.5 2.79999 264.03 4.11599 264.03 5.73999C264.03 6.91599 263.67 7.97099 262.96 8.90399C262.7 9.27699 262.36 9.623 261.93 9.94V10.08C262.41 10.416 262.8 10.771 263.1 11.144C263.91 12.171 264.31 13.263 264.31 14.42C264.31 16.044 263.78 17.36 262.74 18.368C261.69 19.376 260.3 19.88 258.57 19.88H248.77ZM253.25 8.12H257.59C258.15 8.12 258.61 7.933 258.99 7.56C259.36 7.187 259.55 6.72003 259.55 6.16003C259.55 5.60003 259.36 5.13301 258.99 4.76001C258.61 4.38701 258.15 4.20001 257.59 4.20001H253.25V8.12ZM253.25 15.96H257.87C258.43 15.96 258.89 15.773 259.27 15.4C259.64 15.027 259.83 14.56 259.83 14C259.83 13.44 259.64 12.973 259.27 12.6C258.89 12.227 258.43 12.04 257.87 12.04H253.25V15.96ZM264.73 20.02V15.68H265.29C266.64 15.68 267.39 14.933 267.53 13.44L268.65 0.280029H282.37V19.88H277.89V4.62H272.71L271.87 14.56C271.73 16.333 271.17 17.687 270.19 18.62C269.22 19.553 267.87 20.02 266.13 20.02H264.73ZM285.74 19.88V0.280029H299.18V4.34003H290.22V8.12H298.62V12.04H290.22V15.82H299.18V19.88H285.74ZM301.97 19.88V0.280029H306.45V7.70001H314.01V0.280029H318.49V19.88H314.01V12.32H306.45V19.88H301.97ZM321.86 19.88V0.280029H326.34V12.04H326.9L333.06 0.280029H338.38V19.88H333.9V8.12H333.34L327.18 19.88H321.86ZM341.75 19.88V0.280029H355.19V4.34003H346.23V8.12H354.63V12.04H346.23V15.82H355.19V19.88H341.75Z"
              fill="white" />
          </svg>
        </div>
        <div class="arrowVector" ref="container">
          <div class="slideBtn" ref="slider" @mousedown="startDrag" @touchstart="startDrag">
            <svg width="139" height="139" viewBox="0 0 139 139" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M69.5 134C105.122 134 134 105.122 134 69.5C134 33.8776 105.122 5 69.5 5C33.8776 5 5 33.8776 5 69.5C5 105.122 33.8776 134 69.5 134Z"
                fill="#0A284C" fill-opacity="0.98" stroke="white" stroke-width="10" />
            </svg>
          </div>
          <svg width="52" height="800" viewBox="0 0 52 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.77734 400.498H45.7773" stroke="white" stroke-width="10" stroke-linecap="round" />
            <path
              d="M23.3075 798.967C24.6675 800.337 26.8875 800.337 28.2475 798.967L50.5275 776.697C51.8975 775.327 51.8975 773.117 50.5275 771.747C49.1575 770.377 46.9475 770.377 45.5775 771.747L25.7775 791.548L5.97745 771.747C4.60745 770.377 2.3975 770.377 1.0275 771.747C-0.3425 773.117 -0.3425 775.327 1.0275 776.697L23.3075 798.967ZM28.2475 1.0275C26.8875 -0.3425 24.6675 -0.3425 23.3075 1.0275L1.0275 23.2975C-0.3425 24.6675 -0.3425 26.8775 1.0275 28.2475C2.3975 29.6175 4.60745 29.6175 5.97745 28.2475L25.7775 8.44742L45.5775 28.2475C46.9475 29.6175 49.1575 29.6175 50.5275 28.2475C51.8975 26.8775 51.8975 24.6675 50.5275 23.2975L28.2475 1.0275ZM25.7775 796.497H29.2775V3.49747H25.7775H22.2775V796.497H25.7775Z"
              fill="white" />
          </svg>
          <div class="gradientsvg" :style="gradientStyle"></div>
        </div>
        <div class="labelsvg">
          <svg width="350" height="24" viewBox="0 0 350 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 19.88V0.280029H16.24V19.88H11.76V4.62H4.47998V19.88H0ZM35.05 17.3C33.22 19.21 30.96 20.16 28.27 20.16C25.58 20.16 23.33 19.21 21.5 17.3C19.67 15.4 18.75 12.99 18.75 10.08C18.75 7.16996 19.67 4.75999 21.5 2.85999C23.33 0.949985 25.58 0 28.27 0C30.96 0 33.22 0.949985 35.05 2.85999C36.88 4.75999 37.79 7.16996 37.79 10.08C37.79 12.99 36.88 15.4 35.05 17.3ZM24.66 14.25C25.63 15.3 26.84 15.8199 28.27 15.8199C29.71 15.8199 30.9 15.3 31.86 14.25C32.83 13.19 33.3101 11.8 33.3101 10.08C33.3101 8.35996 32.83 6.98006 31.86 5.94006C30.9 4.87006 29.71 4.33997 28.27 4.33997C26.84 4.33997 25.63 4.87006 24.66 5.94006C23.71 6.98006 23.23 8.35996 23.23 10.08C23.23 11.8 23.71 13.19 24.66 14.25ZM40.3101 19.88V0.280029H44.79V7.69995H52.3501V0.280029H56.8301V19.88H52.3501V12.3199H44.79V19.88H40.3101ZM60.2001 19.88V0.280029H64.6801V12.04H65.24L71.4 0.280029H76.7201V19.88H72.24V8.12H71.6801L65.52 19.88H60.2001ZM77.8501 19.88L83.73 9.94006L78.41 0.280029H83.73L88.2101 8.81995V0.280029H92.6901V8.81995L97.17 0.280029H102.49L97.17 9.94006L103.05 19.88H97.73L92.6901 10.92V19.88H88.2101V10.92L83.17 19.88H77.8501ZM104.17 19.88V0.280029H117.61V4.33997H108.65V8.12H117.05V12.04H108.65V15.8199H117.61V19.88H104.17ZM120.4 19.88V0.280029H124.88V7.69995H132.44V0.280029H136.92V19.88H132.44V12.3199H124.88V19.88H120.4ZM140.29 19.88V0.280029H144.77V7.69995H152.33V0.280029H156.81V19.88H152.33V12.3199H144.77V19.88H140.29ZM175.64 17.3C173.81 19.21 171.55 20.16 168.86 20.16C166.18 20.16 163.92 19.21 162.09 17.3C160.26 15.4 159.34 12.99 159.34 10.08C159.34 7.16996 160.26 4.75999 162.09 2.85999C163.92 0.949985 166.18 0 168.86 0C171.55 0 173.81 0.949985 175.64 2.85999C177.47 4.75999 178.38 7.16996 178.38 10.08C178.38 12.99 177.47 15.4 175.64 17.3ZM165.25 14.25C166.22 15.3 167.43 15.8199 168.86 15.8199C170.3 15.8199 171.5 15.3 172.45 14.25C173.42 13.19 173.9 11.8 173.9 10.08C173.9 8.35996 173.42 6.98006 172.45 5.94006C171.5 4.87006 170.3 4.33997 168.86 4.33997C167.43 4.33997 166.22 4.87006 165.25 5.94006C164.3 6.98006 163.82 8.35996 163.82 10.08C163.82 11.8 164.3 13.19 165.25 14.25ZM180.9 19.88V0.280029H194.34V4.33997H185.38V8.12H193.78V12.04H185.38V15.8199H194.34V19.88H180.9ZM202.29 23.8V15.54C203.13 15.54 203.74 15.35 204.11 14.98C204.51 14.61 204.74 14 204.81 13.16L205.93 0.280029H219.65V15.54H221.75V23.8H217.27V19.88H206.77V23.8H202.29ZM208.31 15.54H215.17V4.62H209.99L209.29 13.16C209.22 13.91 209.03 14.53 208.73 15.04C208.6 15.24 208.46 15.41 208.31 15.54ZM221.61 19.88L228.33 0.280029H234.77L241.49 19.88H236.59L235.33 15.96H227.77L226.51 19.88H221.61ZM229.03 12.04H234.07L231.83 5.04004H231.27L229.03 12.04ZM242.75 19.88V0.280029H252.27C254.01 0.280029 255.4 0.780039 256.44 1.79004C257.49 2.80004 258.01 4.11999 258.01 5.73999C258.01 6.91999 257.66 7.97002 256.95 8.90002C256.69 9.28002 256.34 9.62006 255.91 9.94006V10.08C256.4 10.42 256.79 10.77 257.09 11.14C257.89 12.17 258.29 13.26 258.29 14.42C258.29 16.04 257.77 17.36 256.72 18.37C255.68 19.38 254.29 19.88 252.55 19.88H242.75ZM247.23 8.12H251.57C252.13 8.12 252.6 7.93006 252.97 7.56006C253.34 7.19006 253.53 6.72003 253.53 6.16003C253.53 5.60003 253.34 5.13001 252.97 4.76001C252.6 4.39001 252.13 4.19995 251.57 4.19995H247.23V8.12ZM247.23 15.96H251.85C252.41 15.96 252.88 15.77 253.25 15.4C253.62 15.03 253.81 14.56 253.81 14C253.81 13.44 253.62 12.97 253.25 12.6C252.88 12.23 252.41 12.04 251.85 12.04H247.23V15.96ZM258.72 20.02V15.6801H259.28C260.62 15.6801 261.37 14.9301 261.52 13.4401L262.64 0.280029H276.36V19.88H271.88V4.62H266.7L265.86 14.5601C265.71 16.3301 265.15 17.69 264.18 18.62C263.21 19.55 261.85 20.02 260.12 20.02H258.72ZM279.72 19.88V0.280029H293.16V4.33997H284.2V8.12H292.6V12.04H284.2V15.8199H293.16V19.88H279.72ZM295.95 19.88V0.280029H300.43V7.69995H307.99V0.280029H312.47V19.88H307.99V12.3199H300.43V19.88H295.95ZM315.84 19.88V0.280029H320.32V12.04H320.88L327.04 0.280029H332.36V19.88H327.88V8.12H327.32L321.16 19.88H315.84ZM335.74 19.88V0.280029H349.18V4.33997H340.22V8.12H348.62V12.04H340.22V15.8199H349.18V19.88H335.74Z"
              fill="white" />
          </svg>
        </div>
      </div>
      <div class="manBlock">
        <svg class="tanometr" width="252" height="163" viewBox="0 0 252 163" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M219.383 89.4091C219.056 88.6477 218.174 88.2949 217.413 88.6213C216.652 88.9476 216.299 89.8294 216.625 90.5909L218.004 90L219.383 89.4091ZM63.0039 128.5L63.3 129.97C99.046 122.771 118.076 127.068 132.905 134.593C140.41 138.402 146.835 143.028 153.969 147.627C161.065 152.201 168.743 156.661 178.53 159.923L179.004 158.5L179.478 157.077C170.038 153.93 162.602 149.623 155.594 145.105C148.623 140.611 141.951 135.82 134.263 131.918C118.706 124.023 98.9618 119.728 62.7078 127.029L63.0039 128.5ZM179.004 158.5L178.53 159.923C188.442 163.227 197.027 162.761 204.063 159.486C211.079 156.22 216.381 150.24 219.904 142.825C226.93 128.036 227.03 107.253 219.383 89.4091L218.004 90L216.625 90.5909C223.978 107.747 223.805 127.623 217.194 141.538C213.898 148.475 209.041 153.859 202.796 156.766C196.57 159.665 188.792 160.182 179.478 157.077L179.004 158.5Z"
            fill="white" />
          <path d="M12.5039 137C23.5039 132.5 39.0039 127 54.5039 127" stroke="white" stroke-width="25"
            stroke-linecap="round" />
          <path d="M216.004 82L218.504 89.5" stroke="white" stroke-width="15" stroke-linecap="round" />
          <circle cx="210.004" cy="41.5" r="36.5" stroke="white" stroke-width="10" />
          <path class="strelka" :style="{ transform: `rotate(${arrowAngle}deg)` }"
            d="M207.525 21.162C208.241 18.5666 209.251 17.8962 210.901 17.9974C212.551 18.0988 213.412 19.986 213.72 22.1002L214.511 34.076C214.748 34.2135 214.98 34.3642 215.207 34.5288C218.78 37.1267 219.572 42.1299 216.974 45.7036C214.376 49.2774 209.373 50.0683 205.799 47.4706C202.225 44.8727 201.434 39.8695 204.032 36.2957C204.661 35.4299 205.432 34.7285 206.29 34.1979C206.589 29.5091 207.059 22.85 207.525 21.162Z"
            fill="white" />
        </svg>
        <img :src="contur" alt="" class="contur">
        <img class="manColor manColorRed" :src="manRed" alt="" :style="{ opacity: redOpacity }">
        <img class="manColor manColorBlue" :src="manBlue" alt="" :style="{ opacity: blueOpacity }">
      </div>
    </div>
  </div>
  <MenuNavigation class="footer__btn" />

</template>
<style scoped>
.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100vh;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 150%;
  height: 100%;
  object-fit: cover;
  object-position: left bottom;
  z-index: 0;
}

.relative {
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.to-back {
  position: absolute;
  left: 0;
  top: 1.75rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.to-back__icon {
  width: 3.4375rem;
}

.to-back__text {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 3.375rem;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.content {
  margin-top: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.content__top {
  margin-bottom: 15.625rem;
}

.content__title {
  font-family: "TT Commons";
  font-weight: 500;
  font-size: 8.75rem;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  text-align: center;
}

.content__subtitle {
  font-family: "TT Commons";
  font-weight: 400;
  font-size: 2.375rem;
  line-height: 100%;
  text-align: center;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #8e8e8e;
  text-align: center;
  opacity: 0.5;
}

.content__btns {
  display: flex;
  flex-direction: row;
  gap: 306px;
  width: 100%;
  position: relative;
  justify-content: center;
}

.animBtnBottom {
  width: 707px;
}

.content__btns-title {
  position: absolute;
  top: -6.375rem;
  text-align: center;
  width: 100%;
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 2.375rem;
  line-height: 100%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  opacity: 0.5;
}

.content__btns-top {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem 1.5rem;
}

.content__btns-bottom {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.grid-col-2 {
  grid-column: span 2;
}

.footer__btn {
  margin-top: auto;
  position: fixed;
  bottom: 10rem;
  right: 31.875rem;
}

.btns_column {
  display: flex;
  flex-direction: column;
  gap: 64px;
  align-items: center;
}

.label {
  font-weight: 400;
  font-size: 38px;
  line-height: 100%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-align: center;
  color: #fff;
  margin-bottom: calc(132px - 64px);
}

.content_column--head {
  font-weight: 400;
  font-size: 38px;
  line-height: 100%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-align: center;
  color: #fff;
}

.content_info {
  border-radius: 48px;
  padding: 84px;
  width: 1093px;
  height: 476px;
  background: rgba(0, 0, 0, 0);
  border: 3px solid rgba(255, 255, 255, 0.14);
  font-weight: 500;
  font-size: 40px;
  line-height: 110%;
  letter-spacing: -0.02em;
  color: #fff;
  backdrop-filter: blur(10px);
}

.manBlock {
  width: 1030px;
  height: 1030px;
  position: relative;
}

.tanometr {
  position: absolute;
  top: 206px;
  right: 170px;
  z-index: 4;
}

.contur {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
}

.manColor {
  position: absolute;
  top: 0;
  left: 0;
}

.manColorBlue {
  opacity: 0;
}

.arrowSlide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 49px;
  position: relative;
}

.opacity05 {
  opacity: 0.8;
}

.touchStatus {
  position: absolute;
  top: 217px;
  left: 0;
}

.slideBtn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: none;
}

.arrowVector {
  position: relative;
  z-index: 5;
}

.gradientsvg {
  position: absolute;
  left: 50%;
  width: 50px;
  z-index: 1;
  pointer-events: none;
  transition: none;
}

.strelka {
  transform-origin: 83.5% 25.5%;
}
</style>
