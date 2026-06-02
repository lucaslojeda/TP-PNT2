<template>
  <div class="fase-grupos-container">
    <Sidebar />

    <main class="fase-grupos-content">
      <header class="fase-grupos-header">
        <h1>Fase de grupos</h1>
        <p>Consultá las posiciones de cada grupo.</p>
      </header>

      <div class="tabs">
        <button
          :class="['tab', { activo: modoActivo === 'predicciones' }]"
          @click="modoActivo = 'predicciones'"
        >
          Mis Predicciones
        </button>
        <button
          :class="['tab', { activo: modoActivo === 'real' }]"
          @click="cambiarAReal"
        >
          Resultados Reales
        </button>
      </div>

      <p v-if="cargando" class="cargando">Cargando resultados...</p>

      <section v-else class="grupos-grid">
        <GrupoTabla
          v-for="grupo in grupos"
          :key="grupo"
          :grupo="grupo"
          :modo="modoActivo"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import GrupoTabla from '@/components/GrupoTabla.vue'
import { useResultadosRealesStore } from '@/stores/storeResultadosReales'

const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const modoActivo = ref('predicciones')
const resultadosRealesStore = useResultadosRealesStore()
const cargando = ref(false)

const cambiarAReal = async () => {
  modoActivo.value = 'real'
  if (resultadosRealesStore.resultados.length === 0) {
    cargando.value = true
    await resultadosRealesStore.inicializar()
    cargando.value = false
  }
}
</script>

<style scoped>
.fase-grupos-container {
  background-color: grey;
  min-height: 100vh;
  width: 100vw;
}

.fase-grupos-content {
  margin-left: 250px;
  min-height: 100vh;
  width: calc(100vw - 250px);
  background-color: grey;
  padding: 32px 40px;
  box-sizing: border-box;
}

.fase-grupos-header {
  background-color: #1f1f1f;
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  max-width: 600px;
  box-sizing: border-box;
}

.fase-grupos-header h1 {
  margin: 0;
  line-height: 1.1;
}

.fase-grupos-header p {
  margin-top: 8px;
  color: #ccc;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.tab {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  background-color: #1f1f1f;
  color: #ccc;
  transition: all 0.2s;
}

.tab.activo {
  background-color: #00c853;
  color: white;
  font-weight: 700;
}

.cargando {
  color: white;
  font-size: 1.2rem;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(420px, 1fr));
  gap: 24px;
}

@media (max-width: 1200px) {
  .grupos-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 950px) {
  .fase-grupos-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
}
</style>