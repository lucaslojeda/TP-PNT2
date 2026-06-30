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

        <span class="team-name">
          {{ equipoLocal?.nombre || partido.local }}
        </span>
      </div>

      <span class="versus">VS</span>

      <div class="team team-visitante">
        <span class="team-name">
          {{ equipoVisitante?.nombre || partido.visitante }}
        </span>

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
        :disabled="
          prediccionGuardada ||
          operacionEnCurso
        "
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
        :disabled="
          prediccionGuardada ||
          operacionEnCurso
        "
        @input="validarGolesVisitante"
      />
    </div>

    <p class="prediction-status">
      {{ estadoPrediccion }}
    </p>

    <p
      v-if="mensajeError"
      class="prediction-error"
    >
      {{ mensajeError }}
    </p>

    <button
      class="save-button"
      :disabled="
        prediccionGuardada ||
        operacionEnCurso
      "
      @click="guardarPrediccion"
    >
      {{
        operacionEnCurso
          ? 'Guardando...'
          : 'Guardar predicción'
      }}
    </button>

    <button
      v-if="prediccionGuardada"
      class="reset-button"
      :disabled="operacionEnCurso"
      @click="reiniciarPrediccion"
    >
      {{
        operacionEnCurso
          ? 'Eliminando...'
          : 'Reiniciar predicción'
      }}
    </button>
  </article>
</template>

<script setup>
// ============================================================
// NOTA DE ESTUDIO - Matchcard.vue
// ============================================================
// Tarjeta de un partido de fase de grupos: recibe `partido`
// por props y maneja el formulario de predicción (goles local/
// visitante) para ese partido puntual.
//
// watch(prediccionExistente, ..., {immediate:true}): cada vez
// que cambia la predicción guardada en el store (por ejemplo al
// cargar la página, o si se reinicia desde otro lado), este
// watch resincroniza los inputs locales (golesLocal/
// golesVisitante) con lo que hay guardado. El `immediate: true`
// hace que también corra una vez al montar el componente, no
// solo en cambios futuros.
//
// validarGolesLocal/validarGolesVisitante: sanitizan el input
// en tiempo real con regex (/\D/g, quita todo lo que no sea
// dígito), evitando que el usuario tipee letras o símbolos.
//
// estadoPrediccion: es un mini estado derivado de 3 situaciones
// posibles ("Sin predicción" / "Predicción sin guardar" /
// "Predicción guardada"), útil para mostrar feedback visual sin
// guardar ese estado aparte (se calcula solo).
// ============================================================
import { computed, ref, watch } from 'vue'

import { useDatosProdeStore } from '@/stores/storeDataProde'
import { usePrediccionesStore } from '@/stores/storePredicciones'

const props = defineProps({
  partido: {
    type: Object,
    required: true
  }
})

const dataProdeStore = useDatosProdeStore()
const prediccionesStore = usePrediccionesStore()

const golesLocal = ref('')
const golesVisitante = ref('')
const prediccionGuardada = ref(false)
const operacionEnCurso = ref(false)
const mensajeError = ref('')

const prediccionExistente = computed(() => {
  return prediccionesStore.obtenerPrediccion(
    props.partido.id
  )
})

watch(
  prediccionExistente,
  (prediccion) => {
    mensajeError.value = ''

    if (prediccion) {
      golesLocal.value = String(
        prediccion.golesLocal
      )

      golesVisitante.value = String(
        prediccion.golesVisitante
      )

      prediccionGuardada.value = true
    } else {
      golesLocal.value = ''
      golesVisitante.value = ''
      prediccionGuardada.value = false
    }
  },
  {
    immediate: true
  }
)

const validarGolesLocal = () => {
  golesLocal.value =
    golesLocal.value.replace(/\D/g, '')
}

const validarGolesVisitante = () => {
  golesVisitante.value =
    golesVisitante.value.replace(/\D/g, '')
}

const equipoLocal = computed(() => {
  return dataProdeStore.obtenerPaisPorId(
    props.partido.local
  )
})

const equipoVisitante = computed(() => {
  return dataProdeStore.obtenerPaisPorId(
    props.partido.visitante
  )
})

const fechaFormateada = computed(() => {
  const partesFecha =
    props.partido.fecha.split('-')

  const mes = partesFecha[1]
  const dia = partesFecha[2]

  return `${dia}/${mes}`
})

const estadoPrediccion = computed(() => {
  if (prediccionGuardada.value) {
    return 'Predicción guardada'
  }

  if (
    golesLocal.value !== '' ||
    golesVisitante.value !== ''
  ) {
    return 'Predicción sin guardar'
  }

  return 'Sin predicción'
})

const guardarPrediccion = async () => {
  if (prediccionExistente.value) {
    prediccionGuardada.value = true
    return
  }

  if (
    golesLocal.value === '' ||
    golesVisitante.value === ''
  ) {
    prediccionGuardada.value = false
    mensajeError.value =
      'Debés ingresar los dos resultados.'

    return
  }

  operacionEnCurso.value = true
  mensajeError.value = ''

  try {
    await prediccionesStore.guardarPrediccion(
      props.partido,
      golesLocal.value,
      golesVisitante.value
    )

    prediccionGuardada.value = true
  } catch (error) {
    mensajeError.value =
      error.message ||
      'No se pudo guardar la predicción.'
  } finally {
    operacionEnCurso.value = false
  }
}

const reiniciarPrediccion = async () => {
  operacionEnCurso.value = true
  mensajeError.value = ''

  try {
    await prediccionesStore.reiniciarPrediccion(
      props.partido.id
    )

    golesLocal.value = ''
    golesVisitante.value = ''
    prediccionGuardada.value = false
  } catch (error) {
    mensajeError.value =
      error.message ||
      'No se pudo eliminar la predicción.'
  } finally {
    operacionEnCurso.value = false
  }
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

.score-input:disabled {
  background-color: #222;
  color: #aaa;
  cursor: not-allowed;
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

.prediction-error {
  margin: -4px 0 12px;
  color: #ff7676;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
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

.save-button:hover {
  background-color: #00e060;
  transform: translateY(-1px);
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

.reset-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
</style>
