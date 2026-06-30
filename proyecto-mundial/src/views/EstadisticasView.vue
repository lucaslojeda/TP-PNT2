<template>
  <div class="estadisticas-container">
    <Sidebar />

    <main class="estadisticas-content">
      <header class="page-header">
        <h1>Estadisticas</h1>
        <p>Indicadores de uso y rendimiento generados por el flujo del Prode.</p>
      </header>

      <p v-if="cargando" class="estado">
        Cargando estadisticas...
      </p>

      <section v-else class="dashboard">
        <section class="metric-grid">
          <article class="metric-card">
            <span class="metric-label">Predicciones guardadas</span>
            <strong>{{ totalPredicciones }}</strong>
            <small>Del usuario actual</small>
          </article>

          <article class="metric-card">
            <span class="metric-label">Cobertura del fixture</span>
            <strong>{{ coberturaPredicciones }}%</strong>
            <small>{{ totalPredicciones }} de {{ totalPartidos }} partidos</small>
          </article>

          <article class="metric-card">
            <span class="metric-label">Puntos actuales</span>
            <strong>{{ resultadosStore.puntajeTotalUsuario }}</strong>
            <small>
              Grupos {{ resultadosStore.puntajeFaseGrupos }} | Llave {{ resultadosStore.puntajeLlaveEliminacion }}
            </small>
          </article>

          <article class="metric-card">
            <span class="metric-label">Usuarios activos</span>
            <strong>{{ usuariosQueIngresaron }}</strong>
            <small>{{ totalIngresos }} ingresos registrados</small>
          </article>
        </section>

        <section class="charts-grid">
          <article class="panel panel-large">
            <div class="panel-header">
              <h2>Avance de predicciones</h2>
              <span>{{ coberturaPredicciones }}%</span>
            </div>

            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: `${coberturaPredicciones}%` }"
              ></div>
            </div>

            <div class="coverage-detail">
              <span>Guardadas: {{ totalPredicciones }}</span>
              <span>Pendientes: {{ prediccionesPendientes }}</span>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <h2>Tendencia de pronosticos</h2>
            </div>

            <div class="bar-list">
              <div
                v-for="item in tendenciaPronosticos"
                :key="item.label"
                class="bar-row"
              >
                <div class="bar-meta">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.valor }}</strong>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    :style="{ width: `${item.porcentaje}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <h2>Predicciones por fecha</h2>
            </div>

            <div class="vertical-chart">
              <div
                v-for="item in prediccionesPorFecha"
                :key="item.label"
                class="vertical-item"
              >
                <div class="vertical-bar-wrap">
                  <div
                    class="vertical-bar"
                    :style="{ height: `${item.porcentaje}%` }"
                  ></div>
                </div>
                <strong>{{ item.valor }}</strong>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <h2>Ranking top 3</h2>
            </div>

            <div class="bar-list">
              <div
                v-for="usuario in topRankingConPorcentaje"
                :key="usuario.id"
                class="bar-row"
              >
                <div class="bar-meta">
                  <span>{{ usuario.nombre }}</span>
                  <strong>{{ usuario.puntos }} pts</strong>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill ranking"
                    :style="{ width: `${usuario.porcentaje}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <h2>Uso por usuario</h2>
            </div>

            <div class="user-list">
              <div
                v-for="usuario in usuariosConUso"
                :key="usuario.id"
                class="user-row"
              >
                <img
                  :src="usuario.foto || usuario.avatar"
                  :alt="usuario.nombre"
                >
                <div>
                  <strong>{{ usuario.nombre }}</strong>
                  <span>{{ usuario.ingresos || 0 }} ingresos</span>
                </div>
                <small>{{ formatearFecha(usuario.ultimoIngreso) }}</small>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <h2>Promedio de goles</h2>
              <span>{{ promedioGoles }}</span>
            </div>

            <p class="panel-copy">
              Promedio de goles totales pronosticados por partido guardado por el usuario actual.
            </p>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
// ============================================================
// NOTA DE ESTUDIO - EstadisticasView.vue
// ============================================================
// Dashboard de métricas, todo armado con `computed` que leen
// de varios stores a la vez (dataProde, predicciones,
// resultados reales, ranking, usuario). No tiene lógica de
// negocio propia, solo agrega/cuenta/calcula porcentajes sobre
// datos que YA viven en los stores:
// - coberturaPredicciones: % de partidos del fixture que ya
//   predijiste (totalPredicciones / totalPartidos).
// - tendenciaPronosticos: cuenta cuántas veces predijiste
//   "gana local/empate/gana visitante" y saca el porcentaje
//   relativo al valor más alto (para graficar barras).
// - prediccionesPorFecha: lo mismo pero agrupado por fecha del
//   fixture (Fecha 1/2/3).
// Si en la expo preguntan algo de "cómo armaste las
// estadísticas", la respuesta corta es: todo son `computed`
// reactivos sobre los datos de los stores, no hay cálculos
// guardados aparte.
// ============================================================
import {
  computed,
  onMounted,
  ref
} from 'vue'

import Sidebar from '@/components/Sidebar.vue'
import { useDatosProdeStore } from '@/stores/storeDataProde'
import { usePrediccionesStore } from '@/stores/storePredicciones'
import { useResultadosRealesStore } from '@/stores/storeResultadosReales'
import { useStoreRanking } from '@/stores/storeRanking'
import { useStoreUsuario } from '@/stores/storeUsuario'

const cargando = ref(false)

const dataProdeStore = useDatosProdeStore()
const prediccionesStore = usePrediccionesStore()
const resultadosStore = useResultadosRealesStore()
const rankingStore = useStoreRanking()
const usuarioStore = useStoreUsuario()

const predicciones = computed(() => {
  return prediccionesStore.obtenerTodasLasPredicciones()
})

const totalPredicciones = computed(() => {
  return predicciones.value.length
})

const totalPartidos = computed(() => {
  return dataProdeStore.partidos.length
})

const prediccionesPendientes = computed(() => {
  return Math.max(
    totalPartidos.value - totalPredicciones.value,
    0
  )
})

const coberturaPredicciones = computed(() => {
  if (totalPartidos.value === 0) {
    return 0
  }

  return Math.round(
    (totalPredicciones.value / totalPartidos.value) * 100
  )
})

const usuariosQueIngresaron = computed(() => {
  return usuarioStore.usuarios.filter((usuario) => {
    return Number(usuario.ingresos) > 0
  }).length
})

const totalIngresos = computed(() => {
  return usuarioStore.usuarios.reduce((total, usuario) => {
    return total + (Number(usuario.ingresos) || 0)
  }, 0)
})

const tendenciaPronosticos = computed(() => {
  const totales = {
    'Gana local': 0,
    Empate: 0,
    'Gana visitante': 0
  }

  predicciones.value.forEach((prediccion) => {
    const golesLocal = Number(prediccion.golesLocal)
    const golesVisitante = Number(prediccion.golesVisitante)

    if (golesLocal > golesVisitante) {
      totales['Gana local'] += 1
    } else if (golesLocal < golesVisitante) {
      totales['Gana visitante'] += 1
    } else {
      totales.Empate += 1
    }
  })

  const mayor = Math.max(...Object.values(totales), 1)

  return Object.entries(totales).map(([label, valor]) => {
    return {
      label,
      valor,
      porcentaje: Math.round((valor / mayor) * 100)
    }
  })
})

const prediccionesPorFecha = computed(() => {
  const totales = {
    'Fecha 1': 0,
    'Fecha 2': 0,
    'Fecha 3': 0
  }

  predicciones.value.forEach((prediccion) => {
    const clave = `Fecha ${prediccion.fechaGrupo}`

    if (totales[clave] !== undefined) {
      totales[clave] += 1
    }
  })

  const mayor = Math.max(...Object.values(totales), 1)

  return Object.entries(totales).map(([label, valor]) => {
    return {
      label,
      valor,
      porcentaje: Math.max(
        Math.round((valor / mayor) * 100),
        valor > 0 ? 8 : 0
      )
    }
  })
})

const topRankingConPorcentaje = computed(() => {
  const top = rankingStore.top3Ranking
  const mayor = Math.max(
    ...top.map((usuario) => Number(usuario.puntos) || 0),
    1
  )

  return top.map((usuario) => {
    return {
      ...usuario,
      porcentaje: Math.round((Number(usuario.puntos) / mayor) * 100)
    }
  })
})

const usuariosConUso = computed(() => {
  return [...usuarioStore.usuarios].sort((usuarioA, usuarioB) => {
    return (
      (Number(usuarioB.ingresos) || 0) -
      (Number(usuarioA.ingresos) || 0)
    )
  })
})

const promedioGoles = computed(() => {
  if (predicciones.value.length === 0) {
    return '0.0'
  }

  const totalGoles = predicciones.value.reduce((total, prediccion) => {
    return (
      total +
      Number(prediccion.golesLocal) +
      Number(prediccion.golesVisitante)
    )
  }, 0)

  return (totalGoles / predicciones.value.length).toFixed(1)
})

const formatearFecha = (fechaIso) => {
  if (!fechaIso) {
    return 'Sin ingresos'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(fechaIso))
}

onMounted(async () => {
  cargando.value = true

  try {
    await dataProdeStore.inicializar()
    await prediccionesStore.cargarPredicciones()
    await resultadosStore.inicializar()
    await rankingStore.cargarRanking()
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.estadisticas-container {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
}

.estadisticas-content {
  min-height: 100vh;
  margin-left: 250px;
  padding: 40px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 10px;
  color: #00d26a;
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.page-header p,
.estado {
  margin: 0;
  color: #b8b8b8;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card,
.panel {
  background-color: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  box-sizing: border-box;
}

.metric-card {
  min-height: 130px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-label {
  color: #aaa;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-card strong {
  color: #00d26a;
  font-size: 34px;
  line-height: 1;
}

.metric-card small {
  color: #cfcfcf;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.panel {
  padding: 22px;
}

.panel-large {
  grid-column: span 2;
}

.panel-header {
  min-height: 32px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.panel-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
}

.panel-header span {
  color: #00d26a;
  font-weight: 800;
}

.progress-track,
.bar-track {
  overflow: hidden;
  width: 100%;
  background-color: #141414;
  border: 1px solid #343434;
  border-radius: 999px;
}

.progress-track {
  height: 18px;
}

.progress-fill,
.bar-fill {
  height: 100%;
  border-radius: inherit;
  background-color: #00d26a;
}

.coverage-detail {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: #cfcfcf;
  font-size: 14px;
}

.bar-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #ddd;
}

.bar-track {
  height: 12px;
}

.bar-fill.ranking {
  background-color: #3b82f6;
}

.vertical-chart {
  height: 230px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  align-items: end;
}

.vertical-item {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto auto;
  gap: 8px;
  justify-items: center;
  color: #ddd;
}

.vertical-bar-wrap {
  width: 54px;
  height: 100%;
  display: flex;
  align-items: end;
  overflow: hidden;
  background-color: #141414;
  border: 1px solid #343434;
  border-radius: 8px;
}

.vertical-bar {
  width: 100%;
  min-height: 0;
  background-color: #f59e0b;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-row {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
}

.user-row img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.user-row div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-row span,
.user-row small,
.panel-copy {
  color: #aaa;
}

.panel-copy {
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .panel-large {
    grid-column: span 1;
  }
}

@media (max-width: 760px) {
  .estadisticas-content {
    margin-left: 0;
    padding: 24px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .coverage-detail,
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-row {
    grid-template-columns: 42px 1fr;
  }

  .user-row small {
    grid-column: 2;
  }
}
</style>
