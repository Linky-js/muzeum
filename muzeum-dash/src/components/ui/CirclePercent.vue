<script setup>
import { computed } from 'vue'

const props = defineProps({
	label: {
		type: String,
		required: true
	},
	percent: {
		type: Number,
		required: true
	},
	size: {
		type: Number,
		default: 191
	},
	stroke: {
		type: Number,
		default: 8
	}
})

// ограничиваем процент
const safePercent = computed(() => {
	return Math.min(Math.max(props.percent, 0), 100)
})

const radius = computed(() => {
	return (props.size - props.stroke) / 2
})

const circumference = computed(() => {
	return 2 * Math.PI * radius.value
})

const dashOffset = computed(() => {
	return circumference.value * (1 - safePercent.value / 100)
})
</script>

<template>
	<div class="circle-percent">
		<svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="circle-svg">
			<!-- фон -->
			<circle class="circle-bg" :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="4" />

			<!-- прогресс -->
			<circle class="circle-progress" :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="stroke"
				:stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" />
		</svg>

		<!-- процент -->
		<div class="percent">
			{{ safePercent }}%
		</div>

		<!-- подпись -->
		<div class="label">
			{{ label }}
		</div>

	</div>
</template>

<style scoped>
.circle-percent {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 32px;
	color: white;
	position: relative;
	width: 233px;
}

.circle-svg {
	transform: rotate(-90deg);
}

.circle-bg {
	fill: none;
	stroke: rgba(255, 255, 255, 0.1);
}

.circle-progress {
	fill: none;
	stroke: #3b82f6;
	stroke-linecap: round;
	transition: stroke-dashoffset 0.8s ease;
	transform: rotate(180deg);
	transform-origin: center;
}

.percent {
	position: absolute;
	font-size: 22px;
	font-weight: 600;
	top: 79px;
	left: 50%;
	transform: translateX(-50%);
}

.label {
	opacity: 0.5;
	text-align: center;
	font-weight: 400;
	font-size: 30px;
	line-height: 110%;
	letter-spacing: -0.02em;
	text-align: center;
	color: #fff;
	width: min-content;
}
</style>