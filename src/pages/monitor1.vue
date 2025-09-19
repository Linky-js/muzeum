<script setup>
import { useRouter } from 'vue-router'
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMonitorSync } from '@/composables/syncRouterSimple.js'

const router = useRouter()

const bus = useBroadcastBus({
  role: 'monitor',
  pairId: '1',
  debug: true,
})
initMonitorSync(router, bus, '1')

bus.on('navigate', (payload) => {
  if (!payload || !payload.route) return
  router.push(payload.route).catch(()=>{})
})

bus.on('defaultScreen', () => {
  router.push({ name: 'monitor-home' }).catch(()=>{})
})
</script>