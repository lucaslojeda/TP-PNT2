<template>
  <article class="match-card">
    <div class="match-header">
      <span>{{ fechaFormateada }}</span>
      <span>{{ partido.hora }}</span>
    </div>

    <div class="match-teams">
      <div class="team team-local">
        <img
          v-if="equipoLocal"
          :src="equipoLocal.bandera"
          :alt="'Bandera de ' + equipoLocal.nombre"
          class="team-flag"
        />
        <span class="team-name">{{ equipoLocal?.nombre || partido.local }}</span>
      </div>

      <span class="versus">VS</span>

      <div class="team team-visitante">
        <span class="team-name">{{ equipoVisitante?.nombre || partido.visitante }}</span>
        <img
          v-if="equipoVisitante"
          :src="equipoVisitante.bandera"
          :alt="'Bandera de ' + equipoVisitante.nombre"
          class="team-flag"
        />
      </div>
    </div>

    <div class="prediction-section">
      <input
        v-model="golesLocal"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        class="score-input"
        placeholder=""
        :disabled="prediccionGuardada"
        @input="validarGolesLocal"
      />

      <span class="score-separator">-</span>

      <input
        v-model="golesVisitante"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        class="score-input"
        placeholder=""
        :disabled="prediccionGuardada"
        @input="validarGolesVisitante"
      />
    </div>

    <p class="prediction-status">{{ estadoPrediccion }}</p>

    <button class="save-button" :disabled="prediccionGuardada" @click="guardarPrediccion">
  Guardar predicción
</button>
    <button v-if="prediccionGuardada" class="reset-button" @click="reiniciarPrediccion">
    Reiniciar predicción
  </button>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import datosProde from '@/dataProde.json'
import { usePrediccionesStore } from '@/stores/storePredicciones'

const prediccionesStore = usePrediccionesStore()

const props = defineProps({
  partido: {
    type: Object,
    required: true
  }
})

const golesLocal = ref('')
const golesVisitante = ref('')
const prediccionGuardada = ref(false)

const prediccionExistente = prediccionesStore.obtenerPrediccion(props.partido.id)

const validarGolesLocal = () => {
  golesLocal.value = golesLocal.value.replace(/\D/g, '')
}

const validarGolesVisitante = () => {
  golesVisitante.value = golesVisitante.value.replace(/\D/g, '')
}

if (prediccionExistente) {
  golesLocal.value = prediccionExistente.golesLocal
  golesVisitante.value = prediccionExistente.golesVisitante
  prediccionGuardada.value = true
}

const equipoLocal = computed(() => {
  return datosProde.paises.find(pais => pais.id === props.partido.local)
})

const equipoVisitante = computed(() => {
  return datosProde.paises.find(pais => pais.id === props.partido.visitante)
})

const fechaFormateada = computed(() => {
  const partesFecha = props.partido.fecha.split('-')
  const anio = partesFecha[0]
  const mes = partesFecha[1]
  const dia = partesFecha[2]

  return `${dia}/${mes}`
})

const estadoPrediccion = computed(() => {
  if (prediccionGuardada.value) {
    return 'Predicción guardada'
  }

  if (golesLocal.value !== '' || golesVisitante.value !== '') {
    return 'Predicción sin guardar'
  }

  return 'Sin predicción'
})

const guardarPrediccion = () => {
  if (prediccionGuardada.value) {
    return
  }

  if (golesLocal.value === '' || golesVisitante.value === '') {
    prediccionGuardada.value = false
    return
  }

  prediccionesStore.guardarPrediccion(
    props.partido,
    golesLocal.value,
    golesVisitante.value
  )

  prediccionGuardada.value = true
}

const reiniciarPrediccion = () => {
  prediccionesStore.reiniciarPrediccion(props.partido.id)

  golesLocal.value = ''
  golesVisitante.value = ''
  prediccionGuardada.value = false
}
</script>

<style scoped>
.match-card {
  width: 100%;
  max-width: none;
  min-height: 250px;
  background-color: #1f1f1f;
  border: 1px solid #333;
  border-radius: 14px;
  padding: 18px 22px;
  color: #ffffff;
  box-sizing: border-box;
}

.match-header {
  display: flex;
  justify-content: center;
  gap: 40px;
  color: #b5b5b5;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 18px;
}

.match-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
}

.team {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-local {
  justify-content: flex-end;
}

.team-visitante {
  justify-content: flex-start;
}

.team-flag {
  width: 42px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #444;
}

.team-name {
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
}

.versus {
  color: #00c853;
  font-weight: 900;
  font-size: 0.9rem;
}

.prediction-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.score-input {
  width: 54px;
  height: 38px;
  background-color: #111;
  color: #ffffff;
  border: 1px solid #444;
  border-radius: 8px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
}

.score-input:focus {
  outline: none;
  border-color: #00c853;
}

.score-separator {
  color: #aaa;
  font-size: 1.2rem;
  font-weight: 700;
}

.prediction-status {
  text-align: center;
  color: #aaa;
  font-size: 0.85rem;
  margin: 8px 0 14px;
}

.save-button {
  display: block;
  margin: 0 auto;
  background-color: #00c853;
  color: #111;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button:disabled {
  background-color: #555;
  color: #aaa;
  cursor: not-allowed;
  transform: none;
}

.save-button:disabled:hover {
  background-color: #555;
  transform: none;
}

.score-input:disabled {
  background-color: #222;
  color: #aaa;
  cursor: not-allowed;
}

.save-button:hover {
  background-color: #00e060;
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .match-card {
    padding: 16px;
  }

  .match-teams {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .team,
  .team-local,
  .team-visitante {
    justify-content: center;
  }

  .versus {
    text-align: center;
  }
}

.reset-button {
  display: block;
  margin: 10px auto 0;
  background-color: transparent;
  color: #ff5c5c;
  border: 1px solid #ff5c5c;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background-color: #ff5c5c;
  color: #111;
}
</style>