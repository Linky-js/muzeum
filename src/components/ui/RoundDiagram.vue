<script setup>
import { computed, ref, onMounted } from "vue";

const props = defineProps({
  value: {
    type: [String, Number],
    default: "значение",
  },
  label: {
    type: String,
    default: "заголовок",
  },
  maxValue: {
    type: Number,
    default: 100,
  },
  width: {
    type: Number,
    default: 348,
  },
  height: {
    type: Number,
    default: 348,
  },
  strokeWidth: {
    type: Number,
    default: 38,
  },
  backgroundColor: {
    type: String,
    default: "rgba(255, 255, 255, 0.24)",
  },
  fillColor: {
    type: String,
    default: "#ff4444",
  },
  percentage: {
    type: Number,
    default: 500,
  },
  animate: {
    type: Boolean,
    default: true,
  },
});

// Анимированное значение
const animatedValue = ref(0);

// Вычисляемые свойства
const centerX = computed(() => props.width / 2);
const centerY = computed(() => props.height / 2);
const radius = computed(
  () => Math.min(props.width, props.height) / 2 - props.strokeWidth / 2
);
const circumference = computed(() => 2 * Math.PI * radius.value);

const calculatedPercentage = computed(() => {
  const numericValue =
    typeof props.value === "number"
      ? props.value
      : parseFloat(props.value) || 0;
  return Math.min((numericValue / props.maxValue) * 100, 100);
});

const dashOffset = computed(() => {
  const percentage = props.animate
    ? animatedValue.value
    : calculatedPercentage.percentage;
  const filledLength = circumference.value * (percentage / 100);
  return circumference.value - filledLength;
});

// Позиции текста
const textY = computed(() => centerY.value - 10);
const labelY = computed(() => centerY.value + 20);

// Форматируем значение для отображения
const displayValue = computed(() => {
  if (typeof props.value === "string") return props.value;
  return props.value.toString();
});
// Анимация при монтировании
onMounted(() => {
  if (props.animate) {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      animatedValue.value = calculatedPercentage.value * easeOut;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  } else {
    animatedValue.value = calculatedPercentage.value;
  }
});
</script>
<template>
  <div class="gauge-chart">
    <svg :width="width" :height="height" :viewBox="'0 0 347 347'">
      <!-- Фон -->
      <circle
        class="gauge-background"
        :cx="centerX"
        :cy="centerY"
        :r="radius"
        fill="none"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Заполнение с анимацией -->
      <circle
        class="gauge-fill"
        :cx="centerX"
        :cy="centerY"
        :r="radius"
        fill="none"
        :stroke="fillColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        :transform="`rotate(95 ${centerX} ${centerY})`"
      />

      <!-- Тексты -->
      <text :x="centerX" :y="textY" text-anchor="middle" class="gauge-value">
        {{ displayValue }}
      </text>
      <text :x="centerX" :y="labelY" text-anchor="middle" class="gauge-label">
        {{ label }}
      </text>
    </svg>
  </div>
</template>
<style scoped>
.gauge-chart {
  display: inline-block;
  font-family: Arial, sans-serif;
}

.gauge-background {
  stroke-linecap: round;
}

.gauge-fill {
  stroke-linecap: round;
  transition: stroke-dashoffset 1.5s ease-out;
}

.gauge-value {
  font-family: "TT Hoves";
  font-weight: 500;
  font-size: 40px;
  line-height: 100%;
  letter-spacing: -0.03em;
  fill: #ffffff;
  margin-bottom: 4px;
}

.gauge-label {
  font-family: "TT Hoves";
  font-weight: 400;
  font-size: 16px;
  line-height: 110%;
  letter-spacing: -0.02em;
  fill: #ffffff;
  opacity: 0.5;
}
</style>
