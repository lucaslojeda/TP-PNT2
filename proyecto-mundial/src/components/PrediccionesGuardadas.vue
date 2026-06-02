<template>
  <div class="predicciones-section">
    <h2>Mis Predicciones</h2>
    
    <div v-if="cargando" class="cargando">
      Cargando predicciones...
    </div>

    <div v-else-if="predicciones.length === 0" class="sin-predicciones">
      <p>No tienes predicciones guardadas aún.</p>
      <p>¡Dirígete a la sección de predicciones para crear una!</p>
    </div>

    <div v-else class="predicciones-grid">
      <div v-for="prediccion in predicciones" :key="prediccion.partidoId" class="prediccion-card">
        <div class="prediccion-header">
          <span class="grupo-label">{{ prediccion.grupo }}</span>
          <span class="fecha-label">{{ formatearFecha(prediccion.fecha) }}</span>
        </div>

        <div class="prediccion-equipos">
          <div class="equipo">
            <img 
              v-if="obtenerEquipo(prediccion.local)" 
              :src="obtenerEquipo(prediccion.local).bandera" 
              :alt="obtenerEquipo(prediccion.local).nombre"
              class="bandera"
            >
            <span>{{ obtenerEquipo(prediccion.local)?.nombre || prediccion.local }}</span>
          </div>

          <div class="resultado" v-if="!editando[prediccion.partidoId]">
            <input
              type="text"
              :value="prediccion.golesLocal"
              disabled
              class="goles-input disabled"
            />
            <span>-</span>
            <input
              type="text"
              :value="prediccion.golesVisitante"
              disabled
              class="goles-input disabled"
            />
          </div>

          <div class="resultado-edit" v-else>
            <input
              v-model.number="golesEditLocal[prediccion.partidoId]"
              type="number"
              min="0"
              class="goles-input"
            />
            <span>-</span>
            <input
              v-model.number="golesEditVisitante[prediccion.partidoId]"
              type="number"
              min="0"
              class="goles-input"
            />
          </div>

          <div class="equipo">
            <span>{{ obtenerEquipo(prediccion.visitante)?.nombre || prediccion.visitante }}</span>
            <img 
              v-if="obtenerEquipo(prediccion.visitante)" 
              :src="obtenerEquipo(prediccion.visitante).bandera" 
              :alt="obtenerEquipo(prediccion.visitante).nombre"
              class="bandera"
            >
          </div>
        </div>

        <div class="prediccion-acciones">
          <button 
            v-if="!editando[prediccion.partidoId]"
            @click="iniciarEdicion(prediccion)"
            class="btn-editar-prediccion"
          >
             Editar
          </button>

          <div v-else class="btn-grupo">
            <button 
              @click="guardarEdicion(prediccion)"
              class="btn-guardar"
            >
              ✓ Guardar
            </button>
            <button 
              @click="cancelarEdicion(prediccion.partidoId)"
              class="btn-cancelar"
            >
              ✗ Cancelar
            </button>
          </div>

          <button 
            @click="eliminarPrediccion(prediccion.partidoId)"
            class="btn-eliminar"
          >
             Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import datosProde from '@/dataProde.json'
import { usePrediccionesStore } from '@/stores/storePredicciones'

const prediccionesStore = usePrediccionesStore()

const editando = ref({})
const golesEditLocal = ref({})
const golesEditVisitante = ref({})

const cargando = ref(false)

const predicciones = computed(() => {
  return prediccionesStore.obtenerTodasLasPredicciones().sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha)
  })
})

onMounted(() => {
  cargarPredicciones()
})

const cargarPredicciones = async () => {
  cargando.value = true
  await prediccionesStore.cargarPredicciones()
  cargando.value = false
}

const obtenerEquipo = (idEquipo) => {
  return datosProde.paises.find(pais => pais.id === idEquipo)
}

const formatearFecha = (fecha) => {
  const partes = fecha.split('-')
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

const iniciarEdicion = (prediccion) => {
  editando.value[prediccion.partidoId] = true
  golesEditLocal.value[prediccion.partidoId] = prediccion.golesLocal
  golesEditVisitante.value[prediccion.partidoId] = prediccion.golesVisitante
}

const guardarEdicion = async (prediccion) => {
  const partido = {
    id: prediccion.partidoId,
    local: prediccion.local,
    visitante: prediccion.visitante,
    grupo: prediccion.grupo,
    fechaGrupo: prediccion.fechaGrupo,
    fecha: prediccion.fecha,
    hora: prediccion.hora
  }

  await prediccionesStore.actualizarPrediccion(
    partido,
    golesEditLocal.value[prediccion.partidoId],
    golesEditVisitante.value[prediccion.partidoId]
  )

  editando.value[prediccion.partidoId] = false
}

const cancelarEdicion = (partidoId) => {
  editando.value[partidoId] = false
  delete golesEditLocal.value[partidoId]
  delete golesEditVisitante.value[partidoId]
}

const eliminarPrediccion = async (partidoId) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta predicción?')) {
    await prediccionesStore.reiniciarPrediccion(partidoId)
  }
}
</script>

<style scoped>
.predicciones-section {
  background-color: #242424;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #333;
  margin-bottom: 40px;
}

.predicciones-section h2 {
  color: #00d26a;
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cargando,
.sin-predicciones {
  text-align: center;
  color: #aaa;
  padding: 40px 20px;
  font-size: 16px;
}

.sin-predicciones p {
  margin: 10px 0;
}

.predicciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.prediccion-card {
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: border-color 0.3s;
}

.prediccion-card:hover {
  border-color: #00d26a;
}

.prediccion-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grupo-label {
  background-color: #00d26a;
  color: #1a1a1a;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: bold;
}

.prediccion-equipos {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}

.equipo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ffffff;
}

.equipo:last-child {
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.bandera {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  object-fit: cover;
}

.resultado,
.resultado-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.resultado-edit {
  gap: 5px;
}

.goles-input {
  width: 40px;
  height: 40px;
  background-color: #242424;
  border: 1px solid #444;
  color: #ffffff;
  text-align: center;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
}

.goles-input.disabled {
  border-color: #00d26a;
  color: #00d26a;
  cursor: not-allowed;
}

.goles-input:not(.disabled) {
  cursor: text;
}

.goles-input:not(.disabled):focus {
  outline: none;
  border-color: #00d26a;
  box-shadow: 0 0 8px rgba(0, 210, 106, 0.3);
}

.prediccion-acciones {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-editar-prediccion,
.btn-eliminar {
  flex: 1;
  padding: 10px;
  border: 1px solid #444;
  background-color: transparent;
  color: #00d26a;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-editar-prediccion:hover {
  background-color: #00d26a;
  color: #1a1a1a;
}

.btn-eliminar {
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.btn-eliminar:hover {
  background-color: #ff6b6b;
  color: #1a1a1a;
}

.btn-grupo {
  display: flex;
  gap: 8px;
  flex: 1;
}

.btn-guardar,
.btn-cancelar {
  flex: 1;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s;
  border: none;
}

.btn-guardar {
  background-color: #00d26a;
  color: #1a1a1a;
}

.btn-guardar:hover {
  background-color: #00a84f;
}

.btn-cancelar {
  background-color: #ff6b6b;
  color: #ffffff;
}

.btn-cancelar:hover {
  background-color: #e85555;
}

@media (max-width: 768px) {
  .predicciones-grid {
    grid-template-columns: 1fr;
  }
}
</style>
