<template>
  <div class="ranking-container">
    <Sidebar />

    <main class="ranking-content">
      <header class="ranking-header">
        <h1>RANKING GLOBAL</h1>
        <p>Tabla de posiciones oficial de la facultad. ¡Seguí sumando para alcanzar la punta!</p>
      </header>

      <div v-if="rankingStore.cargando" class="loading-container">
        <div class="spinner"></div>
        <p>Actualizando posiciones en tiempo real...</p>
      </div>

      <div v-else class="table-container">
        <table class="ranking-table">
          <thead>
            <tr>
              <th class="text-center">Pos</th>
              <th>Usuario</th>
              <th class="text-center">Puntos Totales</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(competidor, index) in rankingStore.rankingOrdenado" 
              :key="competidor.id"
              :class="{ 'mi-fila': competidor.esUsuarioActivo }"
            >
              <td class="text-center posicion-col">
                <span v-if="index === 0" class="badge oro">🥇 1</span>
                <span v-else-if="index === 1" class="badge plata">🥈 2</span>
                <span v-else-if="index === 2" class="badge bronce">🥉 3</span>
                <span v-else class="posicion-numero">{{ index + 1 }}°</span>
              </td>

              <td class="usuario-col">
                <img :src="competidor.avatar" :alt="competidor.nombre" class="avatar-img" />
                <span class="usuario-nombre">
                  {{ competidor.nombre }}
                </span>
              </td>

              <td class="text-center puntos-col">
                <span class="puntos-texto">{{ competidor.puntos }} pts</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
// NOTA DE ESTUDIO: el orden del onMounted importa. Carga
// predicciones y resultados ANTES de cargarRanking, porque
// storeRanking.cargarRanking() llama a sincronizarPuntajeActual()
// que necesita storeResultados.puntajeTotalUsuario ya calculado
// (computed que depende de ambos stores) para mostrar tu
// puntaje correcto en la tabla, no un 0 desactualizado.
import { onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

// 1. Importamos los stores necesarios para armar el cruce del ranking
import { useStoreRanking } from '@/stores/storeRanking'
import { useResultadosRealesStore } from '@/stores/storeResultadosReales'
import { usePrediccionesStore } from '@/stores/storePredicciones'

// 2. Instanciamos los stores
const rankingStore = useStoreRanking()
const resultadosStore = useResultadosRealesStore()
const prediccionesStore = usePrediccionesStore()

// 3. Unificamos todo el ciclo de vida en un único onMounted
onMounted(async () => {
  // Cargamos secuencialmente los datos de las APIs de manera segura
  await prediccionesStore.cargarPredicciones()
  await resultadosStore.inicializar()
  await rankingStore.cargarRanking()
})
</script>

<style scoped>
.ranking-container {
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
}

.ranking-content {
  flex: 1;
  padding: 40px;
  margin-left: 250px;
  box-sizing: border-box;
}

.ranking-header {
  margin-bottom: 40px;
}

.ranking-header h1 {
  font-size: 32px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #00d26a; /* Verde neón haciendo juego con Perfil */
}

.ranking-header p {
  color: #aaa;
  font-size: 1rem;
  margin: 0;
}

/* Contenedor de la Tabla */
.table-container {
  background-color: #242424;
  border-radius: 12px;
  border: 1px solid #333;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.ranking-table th {
  background-color: #1f1f1f;
  color: #00d26a;
  padding: 16px 20px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
  border-bottom: 2px solid #333;
}

.ranking-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #2d2d2d;
  vertical-align: middle;
}

/* Fila destacada cuando sos vos */
.ranking-table tr.mi-fila {
  background-color: rgba(0, 210, 106, 0.08);
}
.ranking-table tr.mi-fila td {
  border-bottom: 1px solid rgba(0, 210, 106, 0.3);
}
.ranking-table tr.mi-fila .usuario-nombre {
  color: #00d26a;
  font-weight: bold;
}

.vos-tag {
  font-size: 0.8rem;
  color: #00d26a;
  margin-left: 6px;
  font-style: italic;
}

/* Alineaciones útiles */
.text-center {
  text-align: center;
}

/* Estilos de las Columnas */
.posicion-col {
  width: 100px;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
}
.badge.oro { background-color: #ffd700; color: #1a1a1a; }
.badge.plata { background-color: #c0c0c0; color: #1a1a1a; }
.badge.bronce { background-color: #cd7f32; color: #1a1a1a; }

.posicion-numero {
  color: #888;
  font-weight: bold;
}

.usuario-col {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1a1a1a;
  border: 1px solid #444;
}

.usuario-nombre {
  font-size: 1.05rem;
  color: #fff;
}

.puntos-col {
  width: 150px;
}

.puntos-texto {
  font-weight: bold;
  font-size: 1.1rem;
}

/* Spinner de Carga */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #aaa;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #00d26a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
