import routeMap from './routeMap.js'

const normalize = (route) => ({
  name: route.name,
  path: route.path,
  params: route.params ? { ...route.params } : {},
  query: route.query ? { ...route.query } : {},
})

const eq = (a, b) => {
  if (!a || !b) return false
  if (a.name && b.name) return a.name === b.name
  return a.path === b.path
}

const mapToMonitor = (touchRoute) => {
  const key = touchRoute.name || touchRoute.path
  const m = routeMap[key]
  if (!m) return null
  return typeof m === 'function' ? m(touchRoute) : m
}

/**
 * Для тача: слушаем router.beforeEach и router.afterEach
 */
export function initMasterSync(router, bus, pairId) {
  const stack = []
  stack.push(normalize(router.currentRoute.value))

  // 1. Перед роутингом: отсылаем событие "transition-start"
  router.beforeEach((to, from, next) => {
    if (!from.name) return next()

    const n = normalize(to)
    bus.send('transition-start', { route: n }, { role: 'monitor', pairId })

    next() // важно: роутинг всё равно продолжаем (но у тебя можно задержать через анимацию)
  })

  // 2. После роутинга: шлём как раньше "route"
  router.afterEach((to, from) => {
    const n = normalize(to)
    const prev = stack[stack.length - 2] || null
    const top = stack[stack.length - 1]

    if (stack.length >= 2 && eq(n, prev)) {
      stack.pop()
      bus.send('route', { action: 'pop', route: n }, { role: 'monitor', pairId })
      return
    }

    if (eq(n, top)) {
      stack[stack.length - 1] = n
      bus.send('route', { action: 'replace', route: n }, { role: 'monitor', pairId })
      return
    }

    stack.push(n)
    bus.send('route', { action: 'push', route: n }, { role: 'monitor', pairId })
  })
}

/**
 * Для монитора: теперь есть два типа событий
 */
export function initMonitorSync(router, bus, pairId) {
  const slaveStack = []
  slaveStack.push(normalize(router.currentRoute.value))

  // 1. Ловим старт перехода → анимируем уход
  bus.on('transition-start', ({ route }, meta) => {
    if (meta?.origin?.pairId !== pairId) return

    const elements = document.querySelectorAll('.animBtn, .animBtnLeft, .animBtnRight, .animBtnBottom')
    const videos = document.querySelectorAll('.animVideo')
    if (elements.length > 0) {
      gsap.to(elements, {
        opacity: 0,
        duration: 0.5,
      })
    }
    if (videos.length > 0) {
      gsap.to(videos, {
        opacity: 0,
        filter: 'brightness(0%)',
        duration: 1,
      })
    }
  })

  // 2. Ловим реальное событие route → пушим роут
  bus.on('route', (payload, meta) => {
    if (!payload || !payload.action || (meta && meta.origin?.pairId && meta.origin.pairId !== pairId)) return

    const { action, route: touchRoute } = payload
    const mapped = mapToMonitor(touchRoute) || touchRoute
    if (!mapped) return

    const nav = {}
    if (mapped.name) nav.name = mapped.name
    if (mapped.path) nav.path = mapped.path
    if (mapped.params) nav.params = mapped.params
    if (mapped.query) nav.query = mapped.query

    if (action === 'push') {
      router.push(nav).catch(() => {})
      slaveStack.push(normalize(router.currentRoute.value))
    } else if (action === 'replace') {
      router.replace(nav).catch(() => {})
      slaveStack[slaveStack.length - 1] = normalize(router.currentRoute.value)
    } else if (action === 'pop') {
      if (slaveStack.length > 1) {
        slaveStack.pop()
        router.back()
      } else {
        router.replace(nav).catch(() => {})
        slaveStack[0] = normalize(router.currentRoute.value)
      }
    }
  })
}
