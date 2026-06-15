<template>
  <div class="home-container">
    <Sidebar />

    <main class="home-content">
      <section class="home-main">
        <div class="home-left">
          <header class="home-header">
            <h1>Bienvenido, Usuario</h1>
            <p>Completá tus predicciones por fecha y seguí tu progreso.</p>
          </header>

          <section class="home-filters">
            <FechaSelector v-model="fechaSeleccionada" />
          </section>

          <section class="matches-section">
            <Matchcard
              v-for="partido in partidosFiltrados"
              :key="partido.id"
              :partido="partido"
            />
          </section>
        </div>

        <div class="home-right">
          <aside class="top-ranking">
            <h2>Top 3 Ranking</h2>
            <div v-if="rankingStore.cargando" class="loading-text">Cargando posiciones...</div>
            <div v-else>
              <div 
                v-for="(competidor, index) in rankingStore.top3Ranking" 
                :key="competidor.id" 
                class="ranking-item"
              >
                <p>
                  <strong>{{ index + 1 }}° {{ competidor.nombre }}</strong> 
                  - {{ competidor.puntos }} pts
                </p>
              </div>
            </div>
          </aside>

          <aside class="home-summary">
            <h2>Resumen</h2>
            <p>
              Puntos actuales: 
              <span class="puntos-destacados">{{ resultadosStore.puntajeTotalUsuario }}</span>
            </p>
            <p>Predicciones guardadas: {{ totalPrediccionesGuardadas }}</p>
            <p>Fecha seleccionada: {{ fechaSeleccionada }}</p>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import Sidebar from '@/components/Sidebar.vue'
import Matchcard from '@/components/Matchcard.vue'
import FechaSelector from '@/components/FechaSelector.vue'

import datosProde from '@/dataProde.json'
import { usePrediccionesStore } from '@/stores/storePredicciones'
// 1. Importamos los nuevos stores que manejan los puntos y el ranking
import { useResultadosRealesStore } from '@/stores/storeResultadosReales'
import { useStoreRanking } from '@/stores/storeRanking'

const fechaSeleccionada = ref(1)

// 2. Instanciamos los 3 stores para usarlos en la vista
const prediccionesStore = usePrediccionesStore()
const resultadosStore = useResultadosRealesStore()
const rankingStore = useStoreRanking()

const partidosFiltrados = computed(() => {
  return datosProde.partidos
    .filter(partido => partido.fechaGrupo === fechaSeleccionada.value)
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`)
      const fechaB = new Date(`${b.fecha}T${b.hora}`)
      return fechaA - fechaB
    })
})

// COMPUTED AUXILIAR: Cuenta cuántas predicciones hizo el usuario en total
const totalPrediccionesGuardadas = computed(() => {
  return prediccionesStore.obtenerTodasLasPredicciones().length
})

// 3. El ciclo de vida: Ejecutamos los llamados asíncronos en orden correcto
onMounted(async () => {
  // Primero cargamos tus predicciones guardadas
  await prediccionesStore.cargarPredicciones()
  
  // Segundo cargamos los resultados de Mockachino para cruzar datos y sacar tus puntos
  await resultadosStore.inicializar()
  
  // Tercero cargamos el ranking de los chicos y le inyectamos tu puntaje calculado
  await rankingStore.cargarRanking()
})
</script>

<style scoped>
:global(body) {
  margin: 0;
  background-color: grey;
  overflow-x: hidden;
}

:global(#app) {
  min-height: 100vh;
  background-color: grey;
}

.home-container {
  background-color: grey;
  min-height: 100vh;
  width: 100vw;
}

.home-content {
  margin-left: 250px;
  min-height: 100vh;
  width: calc(100vw - 250px);
  background-color: grey;
  padding: 32px 40px;
  box-sizing: border-box;
}

.home-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 36px;
  align-items: start;
  width: 100%;
}

.home-left {
  width: 100%;
  min-width: 0;
}

.home-header {
  background-color: #1f1f1f;
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  width: 500px;
  box-sizing: border-box;
}

.home-header h1 {
  margin: 0;
  line-height: 1.1;
}

.home-header p {
  margin-top: 8px;
  color: #ccc;
}

.home-filters {
  margin-bottom: 24px;
}

.matches-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(380px, 1fr));
  gap: 24px;
  width: 100%;
  align-items: start;
}

.home-right {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 32px;
}

.top-ranking,
.home-summary {
  width: 100%;
  background-color: #1f1f1f;
  color: white;
  padding: 20px;
  border-radius: 12px;
  box-sizing: border-box;
}

.top-ranking h2,
.home-summary h2 {
  margin-top: 0;
  margin-bottom: 10px;
}

.top-ranking p,
.home-summary p {
  margin: 8px 0;
}

/* Clases agregadas para darle facha a los nuevos datos */
.loading-text {
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
}

.ranking-item {
  border-bottom: 1px solid #333;
  padding-bottom: 4px;
}
.ranking-item:last-child {
  border-bottom: none;
}

.puntos-destacados {
  color: #00c853;
  font-weight: bold;
  font-size: 1.1rem;
}

@media (max-width: 1300px) {
  .home-main {
    grid-template-columns: 1fr;
  }

  .home-right {
    position: static;
    width: 100%;
    max-width: 320px;
  }
}

@media (max-width: 1050px) {
  .matches-section {
    grid-template-columns: 1fr;
  }
}
</style>