<template>
  <main class="app-shell">
    <CopaMundialGlobal />
    <router-view />
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import CopaMundialGlobal from '@/components/CopaMundialGlobal.vue'
import { usePrediccionesStore } from '@/stores/storePredicciones'

const prediccionesStore = usePrediccionesStore()

onMounted(async () => {
  await prediccionesStore.cargarPredicciones()
})
</script>
