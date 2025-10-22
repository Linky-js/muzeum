import { createRouter, createWebHistory, RouterView } from "vue-router";
import gsap from "gsap";

const routes = [
  {
    name: "Home",
    path: "/",
    component: () => import("@/pages/touch1/touch-screen-1.vue"),
  },
  {
    name: "touch1-home",
    path: "/touch1",
    component: () => import("@/pages/touch1/touch1.vue"),
    redirect: { name: "touch1-screen-1" },
    children: [
      {
        name: "touch1-screen-1",
        path: "screen-1",
        component: () => import("@/pages/touch1/touch-screen-1.vue"),
      },
      {
        name: "metabolic-syndrome-touch",
        path: "screen-3",
        component: () => import("@/pages/touch1/touch-screen-3.vue"),
      },
      {
        name: "data-science",
        path: "screen-2",
        component: () => import("@/pages/touch1/touch-screen-2.vue"),
      },
    ],
  },
  {
    name: "monitor1-home",
    path: "/monitor1",
    component: () => import("@/pages/monitor1/monitor1.vue"),
    redirect: { name: "monitor1-screen-1" },
    children: [
      {
        name: "monitor1-screen-1",
        path: "screen-1",
        component: () => import("@/pages/monitor1/monitor-screen-1.vue"),
      },
      {
        name: "metabolic-syndrome-monitor",
        path: "screen-3",
        component: () => import("@/pages/monitor1/monitor-screen-3.vue"),
      },
    ],
  },
  {
    name: "touch2-home",
    path: "/touch2",
    component: () => import("@/pages/touch2/touch2.vue"),
    redirect: { name: "touch2-screen-1" },
    children: [
      {
        name: "touch2-screen-1",
        path: "screen-1",
        component: () => import("@/pages/touch2/touch-screen-1.vue"),
      },

      {
        name: "touch2-astrazeneca",
        path: "screen-astrazeneca",
        component: () => import("@/pages/touch2/touch-screen-astrazeneca.vue"),
      },
    ],
  },
  {
    name: "touch2-screen-regions",
    path: "/touch-screen-regions",
    component: () => import("@/pages/touch2/touchmaptwo.vue"),
  },
  {
    name: "monitor2-home",
    path: "/monitor2",
    component: () => import("@/pages/monitor2/monitor2.vue"),
    redirect: { name: "monitor2-screen-1" },
    children: [
      {
        name: "monitor2-screen-1",
        path: "screen-1",
        component: () => import("@/pages/monitor2/monitor-screen-1.vue"),
      },

      {
        name: "metabolic-syndrome-monitor",
        path: "screen-3",
        component: () => import("@/pages/monitor1/monitor-screen-3.vue"),
      },
    ],
  },
  {
    name: "monitor2-screen-regions",
    path: "/monitor-screen-regions",
    component: () => import("@/pages/monitor2/mapTwo.vue"),
  },

  {
    name: "data-science",
    path: "/touch-screen-2",
    component: () => import("@/pages/touch1/touch-screen-2.vue"),
  },
  {
    name: "applications-of-ai",
    path: "/touch-screen-4",
    component: () => import("@/pages/touch1/touch-screen-4.vue"),
  },
  {
    name: "Btns",
    path: "/btns",
    component: () => import("@/pages/btns.vue"),
  },
  {
    name: "touch-home",
    path: "/touch1old",
    component: () => import("@/pages/touch1/touch1OLD.vue"),
  },
  {
    name: "touch-video",
    path: "/touch1-video",
    component: () => import("@/pages/touch1/touch-video.vue"),
  },
  {
    name: "monitor-home",
    path: "/monitor1old",
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
    children: [
      {
        name: "touch-qr",
        path: "touch-qr",
        component: () => import("@/pages/km-sindrom/calculate/touch-qr.vue"),
      },
      {
        name: "touch-calc",
        path: "touch-calc",
        component: () => import("@/pages/km-sindrom/calculate/touch-calc.vue"),
      },
    ],
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
    name: "dashPageTest",
    path: "/dashPageTest",
    component: () => import("@/pages/dashPageTest.vue"),
  },
];

const router = createRouter({
  mode: "history",
  routes,
  history: createWebHistory(),
  scrollBehavior() {
    document.getElementById("app").scrollIntoView({ behavior: "smooth" });
  },
});
router.beforeEach((to, from, next) => {
  if (!from.name) {
    return next();
  }

  const elements = document.querySelectorAll(".animBtn");
  const elementsLeft = document.querySelectorAll(".animBtnLeft");
  const elementsRight = document.querySelectorAll(".animBtnRight");
  const elementsBottom = document.querySelectorAll(".animBtnBottom");
  const videos = document.querySelectorAll(".animVideo");

  if (
    elements.length === 0 &&
    elementsLeft.length === 0 &&
    elementsRight.length === 0 &&
    elementsBottom.length === 0 &&
    videos.length === 0
  ) {
    return next();
  }

  let animationsDone = 0;
  const totalAnimations = 4 + (videos.length ? 1 : 0); // 4 группы + видео

  const checkComplete = () => {
    animationsDone++;
    if (animationsDone >= totalAnimations) {
      next();
    }
  };

  gsap.to(elements, {
    opacity: 0,
    scale: 1,
    duration: 0.5,
    onComplete: checkComplete,
  });
  gsap.to(elementsLeft, {
    opacity: 0,
    x: "-100%",
    duration: 0.5,
    onComplete: checkComplete,
  });
  gsap.to(elementsRight, {
    opacity: 0,
    x: "100%",
    duration: 0.5,
    onComplete: checkComplete,
  });
  gsap.to(elementsBottom, {
    opacity: 0,
    y: "50%",
    duration: 0.5,
    onComplete: checkComplete,
  });

  // затемнение видео
  gsap.to(videos, {
    opacity: 0,
    filter: "brightness(0%)",
    duration: 0.6,
    onComplete: checkComplete,
  });
});

router.afterEach(() => {
  requestAnimationFrame(() => {
    const elements = document.querySelectorAll(
      ".animBtn, .animBtnLeft, .animBtnRight, .animBtnBottom"
    );
    const videos = document.querySelectorAll(".animVideo");

    gsap.to(elements, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      force3D: true,
      onUpdate: () => {
        elements.forEach((el) => el.classList.add("glass-active"));
      },
    });

    // плавное проявление нового видео
    gsap.to(videos, {
      opacity: 1,
      filter: "brightness(100%)",
      duration: 0.5,
      ease: "power2.out",
    });
  });
});

export default router;
