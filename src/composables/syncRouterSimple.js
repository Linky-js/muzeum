
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
 * Для тача: слушаем router.afterEach и отправляем простое сообщение по bus
 * router — vue-router instance
 * bus — результат useBroadcastBus()
 * pairId — id пары
 */
export function initMasterSync(router, bus, pairId) {
  const stack = []
  stack.push(normalize(router.currentRoute.value))

  router.afterEach((to, from) => {
    const n = normalize(to)
    const prev = stack[stack.length - 2] || null
    const top = stack[stack.length - 1]

    if (stack.length >= 2 && eq(n, prev)) {
      // back / pop
      stack.pop()
      bus.send('route', { action: 'pop', route: n }, { role: 'monitor', pairId })
      return
    }

    if (eq(n, top)) {
      // replace (same route)
      stack[stack.length - 1] = n
      bus.send('route', { action: 'replace', route: n }, { role: 'monitor', pairId })
      return
    }

    // push
    stack.push(n)
    bus.send('route', { action: 'push', route: n }, { role: 'monitor', pairId })
  })
}

/**
 * Для монитора: слушаем сообщения 'route' и применяем маршрут
 * router — vue-router instance
 * bus — результат useBroadcastBus()
 * pairId — id пары
 */
export function initMonitorSync(router, bus, pairId) {
  const slaveStack = []
  slaveStack.push(normalize(router.currentRoute.value))

  bus.on('route', (payload, meta) => {
    // фильтрация по pairId и роли уже делает useBroadcastBus (target), но лишняя проверка не помешает
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
      router.push(nav).catch(()=>{})
      slaveStack.push(normalize(router.currentRoute.value))
    } else if (action === 'replace') {
      router.replace(nav).catch(()=>{})
      slaveStack[slaveStack.length - 1] = normalize(router.currentRoute.value)
    } else if (action === 'pop') {
      if (slaveStack.length > 1) {
        slaveStack.pop()
        router.back()
      } else {
        // нет истории — просто replace на целевой маршрут
        router.replace(nav).catch(()=>{})
        slaveStack[0] = normalize(router.currentRoute.value)
      }
    }
  })
}
