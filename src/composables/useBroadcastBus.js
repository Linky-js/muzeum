import { ref, reactive, onMounted, onUnmounted } from 'vue'

// ——— Утилиты ———
const uuid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
const now = () => Date.now()

/**
 * useBroadcastBus(userOptions)
 *
 * userOptions:
 *  - channelName
 *  - role ('touch' | 'monitor')
 *  - pairId
 *  - debug
 *  - heartbeatMs
 *  - ackTimeoutMs
 *  - maxRetries
 *  - filterSelf
 *  - idleTimeoutMs
 *  - getState: () => any   // опционально: возвращает состояние (например { route: {...} })
 *  - onState: (state, meta) => void // опционально: применить состояние
 */
export function useBroadcastBus(userOptions = {}) {
  const options = {
    channelName: userOptions.channelName || 'museum-bus',
    role: userOptions.role,
    pairId: userOptions.pairId,
    debug: !!userOptions.debug,
    heartbeatMs: userOptions.heartbeatMs ?? 25000,
    ackTimeoutMs: userOptions.ackTimeoutMs || 1500,
    maxRetries: userOptions.maxRetries || 2,
    filterSelf: userOptions.filterSelf ?? true,
    idleTimeoutMs: userOptions.idleTimeoutMs || 60000,
    getState: typeof userOptions.getState === 'function' ? userOptions.getState : null,
    onState: typeof userOptions.onState === 'function' ? userOptions.onState : null,
  }

  const instanceId = ref(uuid())
  const channel = ref(null)
  const isOpen = ref(false)

  const handlers = new Map()
  const anyHandlers = new Set()

  const pendingAcks = reactive(new Map())
  const presence = reactive(new Map())

  let hbTimer = null
  let idleTimer = null
  let lastActivity = now() // для варианта, если решишь проверять через heartbeat

  const log = (label, ...args) => {
    if (options.debug) {
      console.log(`[BroadcastBus/${options.channelName}] ${label}`, ...args)
    }
  }

  const open = () => {
    if (!('BroadcastChannel' in window)) {
      console.error('[BroadcastBus] BroadcastChannel не поддерживается')
      return
    }
    if (channel.value) return

    channel.value = new BroadcastChannel(options.channelName)
    channel.value.onmessage = onMessage
    isOpen.value = true
    log('open')

    if (options.heartbeatMs && options.heartbeatMs > 0) {
      sendHeartbeat()
      hbTimer = setInterval(sendHeartbeat, options.heartbeatMs)
    }

    resetIdleTimer()
    requestSync()
  }

  const close = () => {
    if (hbTimer) {
      clearInterval(hbTimer)
      hbTimer = null
    }
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
    if (channel.value) {
      channel.value.onmessage = null
      channel.value.close()
      channel.value = null
      isOpen.value = false
      log('close')
    }
    for (const [id, entry] of pendingAcks.entries()) {
      clearTimeout(entry.timer)
      entry.resolve(false)
      pendingAcks.delete(id)
    }
  }

  const post = (envelope) => {
    try {
      channel.value?.postMessage(envelope)
      log('post', envelope)
    } catch (e) {
      console.error('[BroadcastBus] Ошибка postMessage', e)
    }
  }

  // idle через таймер (можно заменить на проверку через heartbeat при желании)
  const resetIdleTimer = () => {
    lastActivity = now()
    if (!options.idleTimeoutMs) return
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      log('idle timeout → defaultScreen')
      // отправляем defaultScreen всей паре
      send('defaultScreen', null, { pairId: options.pairId })
    }, options.idleTimeoutMs)
  }

  const send = (type, data, target, expectAck = false) => {
    const env = {
      v: 1,
      id: uuid(),
      ts: now(),
      type,
      data,
      origin: { instanceId: instanceId.value, role: options.role, pairId: options.pairId },
      target,
    }

    // любое действие кроме служебных сбрасывает idle-таймер
    if (type !== 'heartbeat' && type !== 'ack') {
      resetIdleTimer()
    }

    if (!expectAck) {
      post(env)
      return
    }

    return new Promise((resolve) => {
      const entry = {
        resolve,
        retries: 0,
        envelope: env,
        timer: null,
      }
      const onAckTimeout = () => {
        clearTimeout(entry.timer)
        if (entry.retries < options.maxRetries) {
          entry.retries++
          log('ack:retry', { id: env.id, attempt: entry.retries })
          post(env)
          entry.timer = setTimeout(onAckTimeout, options.ackTimeoutMs)
        } else {
          pendingAcks.delete(env.id)
          resolve(false)
        }
      }
      entry.timer = setTimeout(onAckTimeout, options.ackTimeoutMs)
      pendingAcks.set(env.id, entry)
      post(env)
    })
  }

  const sendAck = (forId, to) => {
    const ack = {
      v: 1,
      id: uuid(),
      ts: now(),
      type: 'ack',
      ack: { for: forId },
      origin: { instanceId: instanceId.value, role: options.role, pairId: options.pairId },
      target: { role: to.role, pairId: to.pairId },
    }
    post(ack)
  }

  const sendHeartbeat = () => {
    // Также можно тут проверять lastActivity и отправлять defaultScreen при простое,
    // тогда можно убрать setTimeout idleTimer (вариант оптимизации)
    send('heartbeat')
  }

  const markPresence = (env) => {
    const key = env.origin.instanceId
    presence.set(key, {
      role: env.origin.role,
      pairId: env.origin.pairId,
      lastSeen: env.ts || now(),
    })
  }

  const requestSync = () => {
    if (options.pairId) {
      send('syncRequest', null, { pairId: options.pairId })
    } else {
      send('syncRequest')
    }
  }

  // respondSync теперь использует options.getState (если есть) — удобно для синхронизации route
  const respondSync = (meta) => {
    if (options.getState) {
      try {
        const state = options.getState()
        send('syncState', { state }, { role: meta.origin.role, pairId: meta.origin.pairId })
        return
      } catch (err) {
        log('getState error', err)
      }
    }
    send('syncState', { ok: true }, { role: meta.origin.role, pairId: meta.origin.pairId })
  }

  const matchesTarget = (env) => {
    if (env.target?.role && env.target.role !== options.role) return false
    if (env.target?.pairId && env.target.pairId !== options.pairId) return false
    return true
  }

  const isFromSelf = (env) => env.origin.instanceId === instanceId.value

  const onMessage = (e) => {
    const env = e.data
    if (!env || env.v !== 1 || !env.id) return

    markPresence(env)

    // защита от приёма своих сообщений
    if (options.filterSelf && isFromSelf(env)) return
    if (!matchesTarget(env)) return

    // обработка ack
    if (env.type === 'ack' && env.ack?.for) {
      const entry = pendingAcks.get(env.ack.for)
      if (entry) {
        clearTimeout(entry.timer)
        pendingAcks.delete(env.ack.for)
        entry.resolve(true)
        log('ack:ok', { for: env.ack.for })
      }
      return
    }

    // всегда подтверждаем получение (если нужно)
    sendAck(env.id, env.origin)

    // служебные типы
    if (env.type === 'heartbeat') return

    if (env.type === 'syncRequest') {
      respondSync(env)
      return
    }

    if (env.type === 'syncState') {
      // пришло состояние — передаём в callback если есть
      if (env.data && env.data.state && options.onState) {
        try {
          options.onState(env.data.state, env)
        } catch (err) {
          log('onState handler error', err)
        }
      }
      return
    }

    // Входящее действие — сбрасываем idle
    if (env.type !== 'heartbeat' && env.type !== 'ack') {
      resetIdleTimer()
    }

    // Пользовательские типа: navigate, defaultScreen и т.д.
    const set = handlers.get(env.type)
    if (set) {
      for (const h of set) h(env.data, env)
    }
    for (const h of anyHandlers) h(env.data, env)
  }

  // API подписки
  const on = (type, handler) => {
    let set = handlers.get(type)
    if (!set) {
      set = new Set()
      handlers.set(type, set)
    }
    set.add(handler)
    return () => off(type, handler)
  }

  const off = (type, handler) => {
    const set = handlers.get(type)
    if (set) {
      set.delete(handler)
      if (set.size === 0) handlers.delete(type)
    }
  }

  const onAny = (handler) => {
    anyHandlers.add(handler)
    return () => anyHandlers.delete(handler)
  }

  const setRole = (role) => { options.role = role }
  const setPairId = (pairId) => { options.pairId = pairId }

  onMounted(() => {
    open()
    window.addEventListener('pagehide', close)
    window.addEventListener('beforeunload', close)
  })

  onUnmounted(() => {
    if (idleTimer) clearTimeout(idleTimer)
    window.removeEventListener('pagehide', close)
    window.removeEventListener('beforeunload', close)
    close()
  })

  return {
    isOpen,
    instanceId,
    presence,
    send,
    on, off, onAny,
    setRole, setPairId,
    close, open,
  }
}
