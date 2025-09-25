import { createRouter, createWebHistory, RouterView } from 'vue-router';


const routes = [
  {
    name: "Home",
    path: "/",
    component: () => import("@/pages/touch-screen-1.vue"),
  },
  {
    name: "data-science",
    path: "/touch-screen-2",
    component: () => import("@/pages/touch-screen-2.vue"),
  },
  {
    name: "metabolic-syndrome",
    path: "/touch-screen-3",
    component: () => import("@/pages/touch-screen-3.vue"),
  },
  {
    name: "applications-of-ai",
    path: "/touch-screen-4",
    component: () => import("@/pages/touch-screen-4.vue"),
  },
  {
    name: "Btns",
    path: "/btns",
    component: () => import("@/pages/btns.vue"),
  },
  {
    name: "touch-home",
    path: "/touch1",
    component: () => import("@/pages/touch1.vue"),
  },
  {
    name: "touch-video",
    path: "/touch1-video",
    component: () => import("@/pages/touch1/touch-video.vue"),
  },
  {
    name: "monitor-home",
    path: "/monitor1",
    component: () => import("@/pages/monitor1.vue"),
  },
  {
    name: "monitor-video",
    path: "/monitor1-video",
    component: () => import("@/pages/touch1/monitor-video.vue"),
  },

  // КМ синдром
  {
    name: "kms",
    path: "/kms",
    component: () => import("@/pages/km-sindrom/index-touch.vue"),
  },
  {
    name: "kms-m",
    path: "/kms-m",
    component: () => import("@/pages/km-sindrom/index-monitor.vue"),
  },
  {
    name: "touch-calculate",
    path: "/touch-calculate",
    component: () => import("@/pages/km-sindrom/calculate/touch.vue"),
  },
  {
    name: "monitor-calculate",
    path: "/monitor-calculate",
    component: () => import("@/pages/km-sindrom/calculate/monitor.vue"),
  },

  // пробы
  {
    name: "map",
    path: "/map",
    component: () => import("@/pages/mapRussia.vue"),
  },
  {

    name: 'maptwo',
    path: '/maptwo',
    component: () => import('@/pages/mapTwo/mapTwo.vue'),
  },
  {
    name: 'touchmaptwo',
    path: '/touchmaptwo',
    component: () => import('@/pages/mapTwo/touchmaptwo.vue'),
  }
];

const router = createRouter({
  mode: 'history',
  routes,
  history: createWebHistory(),
  scrollBehavior() {
    document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
  },
});

export default router;
