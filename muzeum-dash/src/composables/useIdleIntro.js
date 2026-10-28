import { ref, onMounted, onBeforeUnmount } from "vue";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const INTERACTION_EVENTS = ["pointerdown", "touchstart", "keydown"];

export function useIdleIntro() {
  const visible = ref(true);
  let idleTimer = null;

  const clearIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const scheduleIdleTimer = () => {
    clearIdleTimer();
    idleTimer = setTimeout(() => {
      visible.value = true;
    }, IDLE_TIMEOUT_MS);
  };

  const onInteraction = () => {
    if (visible.value) {
      visible.value = false;
    }
    scheduleIdleTimer();
  };

  onMounted(() => {
    INTERACTION_EVENTS.forEach((event) => {
      window.addEventListener(event, onInteraction, {
        passive: true,
        capture: true,
      });
    });
  });

  onBeforeUnmount(() => {
    clearIdleTimer();
    INTERACTION_EVENTS.forEach((event) => {
      window.removeEventListener(event, onInteraction, { capture: true });
    });
  });

  return { visible };
}
