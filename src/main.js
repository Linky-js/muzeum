
import './assets/main.css'
import store from "@/store";
import router from './router/router';
import { createApp } from 'vue';
import App from './App.vue';
import clickOutside from './directives/v-click-outside';

const app = createApp(App);
app.use(store).use(router).mount('#app');
app.directive("click-outside", clickOutside);
// === Регистрация service worker ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker зарегистрирован:', registration.scope);
      })
      .catch(err => {
        console.warn('❌ Ошибка при регистрации Service Worker:', err);
      });
  });
}
