import { createApp } from 'vue'
import FpsOverlay from './FpsOverlay.vue'
import router from '@/router/router'

let mounted = false

export default {
  install() {
    if (mounted || typeof window === 'undefined') return

    const mount = () => {
      if (mounted || !document.body) return
      mounted = true
      const host = document.createElement('div')
      host.id = 'museum-fps-overlay-root'
      document.body.appendChild(host)
      createApp(FpsOverlay).use(router).mount(host)
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount, { once: true })
    } else {
      mount()
    }
  },
}
