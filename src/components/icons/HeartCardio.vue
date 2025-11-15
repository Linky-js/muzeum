<script setup>
import { ref, onMounted, nextTick } from 'vue'


const svg = ref(null)
const mainPath = ref(null)

onMounted(async () => {
    await nextTick()

    const path1 = svg.value.querySelector('#state1')
    const path2 = svg.value.querySelector('#state2')
    const path3 = svg.value.querySelector('#state3')

    if (!mainPath.value || !path1 || !path2 || !path3) return
})
</script>

<template>
    <svg ref="svg" xmlns="http://www.w3.org/2000/svg" width="140" height="72" viewBox="0 0 140 72" fill="none">
        <!-- основной path -->
        <path ref="mainPath" id="linePath"
            d="M2 40.5H37L44.5 23L50.5 55.5L55.5 40.5H82.5L90.5 2L95 91.5L104.5 40.5H137.5" stroke="white"
            stroke-width="2" />

        <!-- скрытые состояния -->
        <path id="state1" d="M2 40.5H37L44.5 23L50.5 55.5L55.5 40.5H82.5L90.5 2L95 91.5L104.5 40.5H137.5" stroke="white"
            style="display:none" />
        <path id="state2"
            d="M2 29.5H37L44.5 2L50.5 60.5L55.5 29.5L61.5 42L68 13.5L74.5 58L82.5 29.5L90.5 2L95 58L104.5 29.5H137.5"
            stroke="white" style="display:none" />
        <path id="state3" d="M2 40.5H37L44.5 2L50.5 91.5L55.5 40.5H82.5L90.5 22.5L95 54L104.5 40.5H137.5" stroke="white"
            style="display:none" />
    </svg>
</template>
