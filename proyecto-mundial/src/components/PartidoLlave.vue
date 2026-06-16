<template>
  <div class="partido-llave">
    <div class="cruce">
      <!-- EQUIPO 1 -->
      <div
        class="equipo"
        :class="{ ganador: esGanador(partido.equipo1) }"
      >
        <div class="equipo-info">
          <img
            v-if="partido.equipo1"
            :src="partido.equipo1.bandera"
            :alt="`Bandera de ${partido.equipo1.nombre}`"
            class="bandera"
          />

          <span class="nombre-equipo">
            {{ partido.equipo1?.nombre || 'Por definir' }}
          </span>
        </div>

        <input
          v-model="golesEquipo1"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="input-goles"
          :disabled=" prediccionGuardada || !partido.equipo1 || !partido.equipo2 "
          @input="limpiarGolesEquipo1"
        />
      </div>

      <!-- EQUIPO 2 -->
      <div
        class="equipo"
        :class="{ ganador: esGanador(partido.equipo2) }"
      >
        <div class="equipo-info">
          <img
            v-if="partido.equipo2"
            :src="partido.equipo2.bandera"
            :alt="`Bandera de ${partido.equipo2.nombre}`"
            class="bandera"
          />

          <span class="nombre-equipo">
            {{ partido.equipo2?.nombre || 'Por definir' }}
          </span>
        </div>

        <input
          v-model="golesEquipo2"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="input-goles"
          :disabled=" prediccionGuardada || !partido.equipo1 || !partido.equipo2 "
          @input="limpiarGolesEquipo2"
        />
      </div>
    </div>

    <p v-if="mensajeError" class="mensaje-error">
      {{ mensajeError }}
    </p>

    <div class="acciones">
      <button
        class="boton guardar"
        :disabled="!puedeGuardar || prediccionGuardada"
        @click="guardarPrediccion"
      >
        {{ prediccionGuardada ? 'Guardado' : 'Guardar' }}
      </button>

      <button
        class="boton reiniciar"
        :disabled="!prediccionGuardada"
        @click="reiniciarPrediccion"
      >
        Reiniciar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  partido: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'guardar-prediccion',
  'reiniciar-prediccion'
])

const golesEquipo1 = ref('')
const golesEquipo2 = ref('')
const mensajeError = ref('')

const prediccionGuardada = computed(() => {
  return props.partido.prediccionGuardada === true
})

const puedeGuardar = computed(() => {
  const existenEquipos =
    props.partido.equipo1 &&
    props.partido.equipo2

  const golesCompletos =
    golesEquipo1.value !== '' &&
    golesEquipo2.value !== ''

  return existenEquipos && golesCompletos
})

const cargarDatosPartido = () => {
  if (props.partido.prediccionGuardada) {
    golesEquipo1.value = String(props.partido.golesEquipo1)
    golesEquipo2.value = String(props.partido.golesEquipo2)
  } else {
    golesEquipo1.value = ''
    golesEquipo2.value = ''
  }

  mensajeError.value = ''
}

watch(
  () => props.partido,
  () => {
    cargarDatosPartido()
  },
  {
    immediate: true,
    deep: true
  }
)

const guardarPrediccion = () => {
  const goles1 = Number(golesEquipo1.value)
  const goles2 = Number(golesEquipo2.value)

  mensajeError.value = ''

  if (golesEquipo1.value === '' || golesEquipo2.value === '') {
    mensajeError.value = 'Debés ingresar los dos resultados.'
    return
  }

  if (goles1 < 0 || goles2 < 0) {
    mensajeError.value = 'Los goles no pueden ser negativos.'
    return
  }

  if (goles1 === goles2) {
    mensajeError.value =
      'En eliminación directa debe haber un ganador.'
    return
  }

  const ganadorId =
    goles1 > goles2
      ? props.partido.equipo1.id
      : props.partido.equipo2.id

  emit('guardar-prediccion', {
    partidoId: props.partido.id,
    fase: props.partido.fase,
    golesEquipo1: goles1,
    golesEquipo2: goles2,
    ganadorId
  })
}

const reiniciarPrediccion = () => {
  mensajeError.value = ''

  emit('reiniciar-prediccion', {
    partidoId: props.partido.id,
    fase: props.partido.fase
  })
}

const esGanador = (equipo) => {
  if (!equipo || !props.partido.ganadorId) {
    return false
  }

  return equipo.id === props.partido.ganadorId
}

const limpiarGolesEquipo1 = () => {
  golesEquipo1.value =
    golesEquipo1.value.replace(/\D/g, '')
}

const limpiarGolesEquipo2 = () => {
  golesEquipo2.value =
    golesEquipo2.value.replace(/\D/g, '')
}
</script>

<style scoped>
.partido-llave {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 250px;
}

.cruce {
  width: 220px;
  overflow: hidden;
  background-color: #1f1f1f;
  border: 1px solid #3b3b3b;
  border-radius: 10px;
}

.equipo {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  box-sizing: border-box;
  color: white;
}

.equipo:first-child {
  border-bottom: 1px solid #3b3b3b;
}

.equipo-info {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bandera {
  width: 32px;
  height: 22px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid #555;
  border-radius: 3px;
}

.nombre-equipo {
  overflow: hidden;
  font-size: 0.9rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-goles {
  width: 42px;
  height: 32px;
  box-sizing: border-box;
  border: 1px solid #555;
  border-radius: 6px;
  background-color: #2c2c2c;
  color: white;
  text-align: center;
  font-weight: 700;
}

.input-goles:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ganador {
  background-color: #143d25;
  color: #64f092;
}

.acciones {
  width: 220px;
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.boton {
  padding: 7px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}

.boton:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.guardar {
  background-color: #1e88e5;
  color: white;
}

.reiniciar {
  background-color: #d84343;
  color: white;
}

.mensaje-error {
  width: 220px;
  margin: 6px 0 0;
  color: #ff7676;
  font-size: 0.78rem;
  text-align: center;
}
</style>