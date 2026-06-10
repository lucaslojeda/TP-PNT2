<template>
  <main>
    <router-view />
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { usePrediccionesStore } from '@/stores/storePredicciones'
const prediccionesStore = usePrediccionesStore()

onMounted(async () => {
  await prediccionesStore.cargarPredicciones()
})
</script>