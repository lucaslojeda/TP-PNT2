<template>
  <div class="page-container">
    <Sidebar />

    <main class="main-content">
      <header class="view-header">
        <h1>Selecciones</h1>
        <p>
          Visualizá las selecciones y encontrá la información oficial
        </p>
      </header>

      <div
        v-if="dataProdeStore.cargando"
        class="mensaje-estado"
      >
        Cargando selecciones...
      </div>

      <div
        v-else-if="dataProdeStore.error"
        class="mensaje-error"
      >
        {{ dataProdeStore.error }}
      </div>

      <template v-else>
        <div class="filter-section">
          <label for="grupo-select">
            Seleccionar Grupo:
          </label>

          <select
            id="grupo-select"
            v-model="grupoSeleccionado"
            class="custom-select"
          >
            <option
              v-for="letra in letrasGrupos"
              :key="letra"
              :value="letra"
            >
              Grupo {{ letra }}
            </option>
          </select>
        </div>

        <div class="group-card">
          <div class="group-card-header">
            <h2>GRUPO {{ grupoSeleccionado }}</h2>
          </div>

          <div class="table-responsive">
            <table class="positions-table">
              <thead>
                <tr>
                  <th
                    class="txt-center"
                    style="width: 80px"
                  >
                    Bandera
                  </th>

                  <th>Selección</th>

                  <th>Director Técnico</th>

                  <th
                    class="txt-center"
                    style="width: 200px"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="pais in paisesFiltrados"
                  :key="pais.id"
                >
                  <td class="txt-center">
                    <img
                      :src="pais.bandera"
                      :alt="'Bandera de ' + pais.nombre"
                      class="flag-preview"
                    />
                  </td>

                  <td class="country-name">
                    {{ pais.nombre }}
                  </td>

                  <td class="dt-name">
                    {{
                      pais.cuerpoTecnico?.directorTecnico ||
                      'No definido'
                    }}
                  </td>

                  <td class="txt-center">
                    <button
                      v-if="
                        pais.jugadores &&
                        pais.jugadores.length > 0
                      "
                      class="btn-view-players"
                      @click="abrirPlantel(pais)"
                    >
                      Ver Jugadores
                    </button>

                    <span
                      v-else
                      class="no-players"
                    >
                      Sin jugadores
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-if="seleccionPaisActivo"
          class="modal-overlay"
          @click.self="cerrarPlantel"
        >
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-title-container">
                <img
                  :src="seleccionPaisActivo.bandera"
                  :alt="
                    'Bandera de ' +
                    seleccionPaisActivo.nombre
                  "
                  class="modal-flag"
                />

                <h2>
                  Plantel de
                  {{ seleccionPaisActivo.nombre }}
                </h2>
              </div>

              <button
                class="btn-close"
                @click="cerrarPlantel"
              >
                &times;
              </button>
            </div>

            <div class="modal-body">
              <p class="modal-dt">
                <strong>Director Técnico:</strong>

                {{
                  seleccionPaisActivo.cuerpoTecnico
                    ?.directorTecnico ||
                  'No definido'
                }}
              </p>

              <div class="modal-players-grid">
                <div
                  v-for="jugador in seleccionPaisActivo.jugadores"
                  :key="jugador.dorsal"
                  class="modal-player-card"
                >
                  <span class="modal-dorsal">
                    {{ jugador.dorsal }}
                  </span>

                  <div class="player-info">
                    <p class="player-name">
                      {{ jugador.nombre }}
                    </p>

                    <p class="player-pos">
                      {{ jugador.posicion }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
// NOTA DE ESTUDIO: vista informativa de selecciones por grupo
// (sin lógica de negocio). paisesFiltrados muestra solo los
// países del grupo elegido en el selector. abrirPlantel/
// cerrarPlantel manejan un modal simple con el detalle del
// país clickeado (seleccionPaisActivo null = modal cerrado).
import {
  computed,
  onMounted,
  ref
} from 'vue'

import Sidebar from '@/components/Sidebar.vue'
import { useDatosProdeStore } from '@/stores/storeDataProde'

const dataProdeStore =
  useDatosProdeStore()

const grupoSeleccionado = ref('A')

const letrasGrupos = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L'
]

const seleccionPaisActivo = ref(null)

const paisesFiltrados = computed(() => {
  return dataProdeStore.paises.filter(
    (pais) => {
      return (
        pais.grupo ===
        grupoSeleccionado.value
      )
    }
  )
})

onMounted(async () => {
  await dataProdeStore.inicializar()
})

const abrirPlantel = (pais) => {
  seleccionPaisActivo.value = pais
}

const cerrarPlantel = () => {
  seleccionPaisActivo.value = null
}
</script>

<style scoped>
.page-container {
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 40px;
  box-sizing: border-box;
}

.view-header h1 {
  margin: 0 0 10px;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.view-header p {
  margin: 0 0 30px;
  color: #aaa;
}

.mensaje-estado {
  padding: 20px 0;
  color: #aaa;
  font-weight: 600;
}

.mensaje-error {
  max-width: 500px;
  padding: 15px;
  border-radius: 6px;
  background-color: #4b1818;
  color: #ffb3b3;
  font-weight: 600;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.custom-select {
  padding: 10px 20px;
  border: 2px solid #333;
  border-radius: 6px;
  background-color: #222;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.custom-select:focus {
  border-color: #00c853;
}

.group-card {
  overflow: hidden;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #222;
}

.group-card-header {
  padding: 20px;
  border-bottom: 1px solid #333;
  background-color: #111;
}

.group-card-header h2 {
  margin: 0;
  color: #00c853;
  font-size: 1.3rem;
}

.positions-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.positions-table th {
  padding: 15px 20px;
  border-bottom: 2px solid #333;
  background-color: #1a1a1a;
  color: #888;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.positions-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #333;
  vertical-align: middle;
}

.flag-preview {
  width: 45px;
  height: auto;
  border-radius: 4px;
}

.country-name {
  font-weight: 600;
}

.dt-name {
  color: #bbb;
  font-style: italic;
}

.txt-center {
  text-align: center;
}

.btn-view-players {
  padding: 6px 14px;
  border: 1px solid #00c853;
  border-radius: 4px;
  background-color: #222;
  color: #00c853;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view-players:hover {
  background-color: #00c853;
  color: #111;
}

.no-players {
  color: #555;
  font-size: 0.9rem;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  display: flex;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
}

.modal-content {
  overflow-y: auto;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  border: 1px solid #444;
  border-radius: 12px;
  background-color: #222;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #333;
  background-color: #111;
}

.modal-title-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-title-container h2 {
  margin: 0;
  color: #fff;
  font-size: 1.4rem;
}

.modal-flag {
  width: 40px;
  height: auto;
  border-radius: 4px;
}

.btn-close {
  border: none;
  background: none;
  color: #aaa;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.btn-close:hover {
  color: #ff3333;
}

.modal-body {
  padding: 24px;
}

.modal-dt {
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
  color: #ccc;
  font-size: 1.1rem;
}

.modal-players-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(240px, 1fr)
  );
  gap: 12px;
}

.modal-player-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  border: 1px solid #333;
  border-radius: 6px;
  background-color: #1a1a1a;
}

.modal-dorsal {
  display: flex;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #00c853;
  color: #111;
  font-size: 0.85rem;
  font-weight: bold;
}

.player-info p {
  margin: 0;
}

.player-name {
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
}

.player-pos {
  color: #888;
  font-size: 0.8rem;
}
</style>