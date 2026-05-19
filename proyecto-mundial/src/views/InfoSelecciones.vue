<template>
  <div class="page-container">
    <Sidebar />

    <main class="main-content">
      <header class="view-header">
        <h1>Selecciones</h1>
        <p>Visualizá las selecciones y encontrá la información oficial</p>
      </header>

      <div class="filter-section">
        <label for="grupo-select">Seleccionar Grupo: </label>
        <select id="grupo-select" v-model="grupoSeleccionado" class="custom-select">
          <option v-for="letra in letrasGrupos" :key="letra" :value="letra">
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
                <th class="txt-center" style="width: 80px;">Bandera</th>
                <th>Selección</th>
                <th>Director Técnico</th>
                <th class="txt-center" style="width: 200px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pais in paisesFiltrados" :key="pais.id">
                <td class="txt-center">
                  <img :src="pais.bandera" :alt="'Bandera de ' + pais.nombre" class="flag-preview" />
                </td>
                <td class="country-name">{{ pais.nombre }}</td>
                <td class="dt-name">{{ pais.cuerpoTecnico?.directorTecnico || 'No definido' }}</td>
                <td class="txt-center">
                  <button 
                    v-if="pais.jugadores && pais.jugadores.length > 0"
                    class="btn-view-players"
                    @click="abrirPlantel(pais)"
                  >
                    Ver Jugadores
                  </button>
                  <span v-else class="no-players">Sin jugadores</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="seleccionPaisActivo" class="modal-overlay" @click.self="cerrarPlantel">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title-container">
              <img :src="seleccionPaisActivo.bandera" class="modal-flag" />
              <h2>Plantel de {{ seleccionPaisActivo.nombre }}</h2>
            </div>
            <button class="btn-close" @click="cerrarPlantel">&times;</button>
          </div>
          
          <div class="modal-body">
            <p class="modal-dt"><strong>Director Técnico:</strong> {{ seleccionPaisActivo.cuerpoTecnico?.directorTecnico || 'No definido' }}</p>
            
            <div class="modal-players-grid">
              <div 
                v-for="jugador in seleccionPaisActivo.jugadores" 
                :key="jugador.dorsal"
                class="modal-player-card"
              >
                <span class="modal-dorsal">{{ jugador.dorsal }}</span>
                <div class="player-info">
                  <p class="player-name">{{ jugador.nombre }}</p>
                  <p class="player-pos">{{ jugador.posicion }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import { ref, computed } from 'vue';
import datosProde from '../dataProde.json';

const grupoSeleccionado = ref('A');
const letrasGrupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Estado reactivo clave para guardar el objeto del país que se clickeó
const seleccionPaisActivo = ref(null);

const paisesFiltrados = computed(() => {
  return datosProde.paises.filter(pais => pais.grupo === grupoSeleccionado.value);
});

// Métodos para cambiar el estado del modal
const abrirPlantel = (pais) => {
  seleccionPaisActivo.value = pais;
};

const cerrarPlantel = () => {
  seleccionPaisActivo.value = null;
};
</script>

<style scoped>
/* Estilos generales de tu vista */
.page-container {
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 250px; 
  padding: 40px;
  box-sizing: border-box;
}

.view-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 10px 0;
  letter-spacing: 1px;
}

.view-header p {
  color: #aaa;
  margin: 0 0 30px 0;
}

.filter-section {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.custom-select {
  background-color: #222;
  color: white;
  border: 2px solid #333;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.custom-select:focus {
  border-color: #00c853;
}

.group-card {
  background-color: #222;
  border-radius: 8px;
  border: 1px solid #333;
  overflow: hidden;
}

.group-card-header {
  background-color: #111;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.group-card-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #00c853;
}

.positions-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.positions-table th {
  background-color: #1a1a1a;
  color: #888;
  padding: 15px 20px;
  text-transform: uppercase;
  font-size: 0.9rem;
  border-bottom: 2px solid #333;
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

/* BOTÓN DE ACCIÓN */
.btn-view-players {
  background-color: #222;
  color: #00c853;
  border: 1px solid #00c853;
  padding: 6px 14px;
  border-radius: 4px;
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

/* ESTILOS DEL MODAL (Fondo difuminado y tarjeta flotante) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px); /* Efecto difuminado moderno de fondo */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Asegura que se monte por encima del Sidebar */
}

.modal-content {
  background-color: #222;
  border: 1px solid #444;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto; /* Scroll interno si la lista es muy larga */
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.modal-header {
  background-color: #111;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #333;
}

.modal-title-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-title-container h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #fff;
}

.modal-flag {
  width: 40px;
  height: auto;
  border-radius: 4px;
}

.btn-close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
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
  font-size: 1.1rem;
  color: #ccc;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

/* Grilla de dos columnas para los jugadores */
.modal-players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.modal-player-card {
  background-color: #1a1a1a;
  border: 1px solid #333;
  padding: 10px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-dorsal {
  background-color: #00c853;
  color: #111;
  font-weight: bold;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.player-info p {
  margin: 0;
}

.player-name {
  font-weight: bold;
  font-size: 0.95rem;
  color: #fff;
}

.player-pos {
  font-size: 0.8rem;
  color: #888;
}
</style>