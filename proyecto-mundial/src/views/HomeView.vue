<template>
  <div class="home-container">
    <Sidebar />

    <main class="home-content">
      <section class="home-main">
        <div class="home-left">
          <header class="home-header">
            <h1>Bienvenido, Usuario</h1>

            <p>
              Completá tus predicciones por fecha y seguí tu progreso.
            </p>
          </header>

          <section class="home-filters">
            <FechaSelector v-model="fechaSeleccionada" />
          </section>

          <p
            v-if="dataProdeStore.cargando"
            class="mensaje-estado"
          >
            Cargando partidos...
          </p>

          <p
            v-else-if="dataProdeStore.error"
            class="mensaje-error"
          >
            {{ dataProdeStore.error }}
          </p>

          <section
            v-else
            class="matches-section"
          >
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

            <div
              v-if="rankingStore.cargando"
              class="loading-text"
            >
              Cargando posiciones...
            </div>

            <div v-else>
              <div
                v-for="(competidor, index) in rankingStore.top3Ranking"
                :key="competidor.id"
                class="ranking-item"
              >
                <p>
                  <strong>
                    {{ index + 1 }}° {{ competidor.nombre }}
                  </strong>

                  - {{ competidor.puntos }} pts
                </p>
              </div>
            </div>
          </aside>

          <aside class="home-summary">
            <h2>Resumen</h2>

            <p>
              Puntos actuales:

              <span class="puntos-destacados">
                {{ resultadosStore.puntajeTotalUsuario }}
              </span>
            </p>

            <p>
              Fase de grupos:
              {{ resultadosStore.puntajeFaseGrupos }}
            </p>

            <p>
              Llave de eliminación:
              {{ resultadosStore.puntajeLlaveEliminacion }}
            </p>

            <p>
              Predicciones guardadas:
              {{ totalPrediccionesGuardadas }}
            </p>

            <p>
              Fecha seleccionada:
              {{ fechaSeleccionada }}
            </p>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

import Sidebar from '@/components/Sidebar.vue'
import Matchcard from '@/components/Matchcard.vue'
import FechaSelector from '@/components/FechaSelector.vue'

import { useDatosProdeStore } from '@/stores/storeDataProde'
import { usePrediccionesStore } from '@/stores/storePredicciones'
import { useResultadosRealesStore } from '@/stores/storeResultadosReales'
import { useStoreRanking } from '@/stores/storeRanking'

const fechaSeleccionada = ref(1)

const dataProdeStore =
  useDatosProdeStore()

const prediccionesStore =
  usePrediccionesStore()

const resultadosStore =
  useResultadosRealesStore()

const rankingStore =
  useStoreRanking()

const partidosFiltrados = computed(() => {
  return [...dataProdeStore.partidos]
    .filter((partido) => {
      return (
        partido.fechaGrupo ===
        fechaSeleccionada.value
      )
    })
    .sort((partidoA, partidoB) => {
      const fechaA = new Date(
        `${partidoA.fecha}T${partidoA.hora}`
      )

      const fechaB = new Date(
        `${partidoB.fecha}T${partidoB.hora}`
      )

      return fechaA - fechaB
    })
})

const totalPrediccionesGuardadas =
  computed(() => {
    return prediccionesStore
      .obtenerTodasLasPredicciones()
      .length
  })

onMounted(async () => {
  await dataProdeStore.inicializar()
  await prediccionesStore.cargarPredicciones()
  await resultadosStore.inicializar()
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
  width: 100vw;
  min-height: 100vh;
  background-color: grey;
}

.home-content {
  width: calc(100vw - 250px);
  min-height: 100vh;
  margin-left: 250px;
  padding: 32px 40px;
  box-sizing: border-box;
  background-color: grey;
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
  width: 500px;
  margin-bottom: 20px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #1f1f1f;
  color: white;
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
  grid-template-columns: repeat(
    2,
    minmax(380px, 1fr)
  );
  gap: 24px;
  align-items: start;
  width: 100%;
}

.mensaje-estado {
  color: white;
  font-weight: 700;
}

.mensaje-error {
  max-width: 500px;
  padding: 12px;
  border-radius: 8px;
  background-color: #4b1818;
  color: #ffb3b3;
  font-weight: 700;
}

.home-right {
  position: sticky;
  top: 32px;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-ranking,
.home-summary {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #1f1f1f;
  color: white;
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

.loading-text {
  color: #888;
  font-size: 0.9rem;
  font-style: italic;
}

.ranking-item {
  padding-bottom: 4px;
  border-bottom: 1px solid #333;
}

.ranking-item:last-child {
  border-bottom: none;
}

.puntos-destacados {
  color: #00c853;
  font-size: 1.1rem;
  font-weight: bold;
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
