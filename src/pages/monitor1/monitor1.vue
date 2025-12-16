<script>
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
const bus = useBroadcastBus({ role: 'monitor', pairId: 'touch1', debug: false })
</script>
<template>
    <RouterView></RouterView>

</template>