let activeEl = null; // глобально для всех элементов с директивой

export default {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
        
        
      if (!(el === event.target || el.contains(event.target))) {
        console.log('event', activeEl);
        if (activeEl === el) {
          binding.value(event);
          activeEl = null;
        }
      }
    };

    el.activateClickOutside = () => { activeEl = el; };

    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  }
};

