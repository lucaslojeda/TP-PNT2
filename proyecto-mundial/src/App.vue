<template>
  <main class="app-shell">
    <CopaMundialGlobal />
    <router-view />
  </main>
</template>

<script setup>
// NOTA DE ESTUDIO: componente raíz. <router-view /> es el
// "hueco" donde Vue Router inyecta la vista correspondiente a
// la ruta actual (HomeView, LoginView, etc). Acá también se
// precargan las predicciones del usuario apenas arranca la app
// (antes incluso de saber qué vista se va a mostrar), así están
// disponibles cuanto antes para cualquier componente que las
// necesite.
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import CopaMundialGlobal from '@/components/CopaMundialGlobal.vue'
import { usePrediccionesStore } from '@/stores/storePredicciones'

const prediccionesStore = usePrediccionesStore()

onMounted(async () => {
  await prediccionesStore.cargarPredicciones()
})
</script>
