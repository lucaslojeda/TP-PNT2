<template>
  <div class="partido-llave">
    <div class="partido-contenido">
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
            :disabled="
              prediccionGuardada ||
              !partido.equipo1 ||
              !partido.equipo2
            "
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
            :disabled="
              prediccionGuardada ||
              !partido.equipo1 ||
              !partido.equipo2
            "
            @input="limpiarGolesEquipo2"
          />
        </div>
      </div>

      <!-- PENALES AL COSTADO -->
      <div
        v-if="resultadoEmpatado"
        class="penales-laterales"
      >
        <span class="penales-etiqueta">
          Penales
        </span>

        <input
          v-model="penalesEquipo1"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="input-penales"
          :disabled="prediccionGuardada"
          @input="limpiarPenalesEquipo1"
        />

        <input
          v-model="penalesEquipo2"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="input-penales"
          :disabled="prediccionGuardada"
          @input="limpiarPenalesEquipo2"
        />
      </div>
    </div>

    <p
      v-if="mensajeError"
      class="mensaje-error"
    >
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

const penalesEquipo1 = ref('')
const penalesEquipo2 = ref('')

const mensajeError = ref('')

const prediccionGuardada = computed(() => {
  return props.partido.prediccionGuardada === true
})

const resultadoEmpatado = computed(() => {
  if (
    golesEquipo1.value === '' ||
    golesEquipo2.value === ''
  ) {
    return false
  }

  return (
    Number(golesEquipo1.value) ===
    Number(golesEquipo2.value)
  )
})

const penalesCompletos = computed(() => {
  return (
    penalesEquipo1.value !== '' &&
    penalesEquipo2.value !== ''
  )
})

const penalesTienenGanador = computed(() => {
  if (!penalesCompletos.value) {
    return false
  }

  return (
    Number(penalesEquipo1.value) !==
    Number(penalesEquipo2.value)
  )
})

const puedeGuardar = computed(() => {
  const existenEquipos =
    props.partido.equipo1 &&
    props.partido.equipo2

  const golesCompletos =
    golesEquipo1.value !== '' &&
    golesEquipo2.value !== ''

  if (!existenEquipos || !golesCompletos) {
    return false
  }

  if (resultadoEmpatado.value) {
    return (
      penalesCompletos.value &&
      penalesTienenGanador.value
    )
  }

  return true
})

const cargarDatosPartido = () => {
  if (props.partido.prediccionGuardada) {
    golesEquipo1.value =
      String(props.partido.golesEquipo1)

    golesEquipo2.value =
      String(props.partido.golesEquipo2)

    penalesEquipo1.value =
      props.partido.penalesEquipo1 === null ||
      props.partido.penalesEquipo1 === undefined
        ? ''
        : String(props.partido.penalesEquipo1)

    penalesEquipo2.value =
      props.partido.penalesEquipo2 === null ||
      props.partido.penalesEquipo2 === undefined
        ? ''
        : String(props.partido.penalesEquipo2)
  } else {
    golesEquipo1.value = ''
    golesEquipo2.value = ''
    penalesEquipo1.value = ''
    penalesEquipo2.value = ''
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

watch(
  resultadoEmpatado,
  (hayEmpate) => {
    if (
      !hayEmpate &&
      !prediccionGuardada.value
    ) {
      penalesEquipo1.value = ''
      penalesEquipo2.value = ''
    }

    mensajeError.value = ''
  }
)

const guardarPrediccion = () => {
  const goles1 = Number(golesEquipo1.value)
  const goles2 = Number(golesEquipo2.value)

  mensajeError.value = ''

  if (
    golesEquipo1.value === '' ||
    golesEquipo2.value === ''
  ) {
    mensajeError.value =
      'Debés ingresar los dos resultados.'

    return
  }

  let penales1 = null
  let penales2 = null
  let ganadorId = null

  if (goles1 === goles2) {
    if (
      penalesEquipo1.value === '' ||
      penalesEquipo2.value === ''
    ) {
      mensajeError.value =
        'Debés ingresar el resultado de los penales.'

      return
    }

    penales1 = Number(penalesEquipo1.value)
    penales2 = Number(penalesEquipo2.value)

    if (penales1 === penales2) {
      mensajeError.value =
        'El resultado por penales no puede terminar empatado.'

      return
    }

    ganadorId =
      penales1 > penales2
        ? props.partido.equipo1.id
        : props.partido.equipo2.id
  } else {
    ganadorId =
      goles1 > goles2
        ? props.partido.equipo1.id
        : props.partido.equipo2.id
  }

  emit('guardar-prediccion', {
    partidoId: props.partido.id,
    fase: props.partido.fase,

    golesEquipo1: goles1,
    golesEquipo2: goles2,

    penalesEquipo1: penales1,
    penalesEquipo2: penales2,

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
  if (
    !equipo ||
    !props.partido.ganadorId
  ) {
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

const limpiarPenalesEquipo1 = () => {
  penalesEquipo1.value =
    penalesEquipo1.value.replace(/\D/g, '')
}

const limpiarPenalesEquipo2 = () => {
  penalesEquipo2.value =
    penalesEquipo2.value.replace(/\D/g, '')
}
</script>

<style scoped>
.partido-llave {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 320px;
}

.partido-contenido {
  display: flex;
  align-items: stretch;
  gap: 6px;
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

.input-goles,
.input-penales {
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

.input-goles:disabled,
.input-penales:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.penales-laterales {
  width: 64px;
  box-sizing: border-box;

  display: grid;
  grid-template-rows: 18px 1fr 1fr;
  justify-items: center;
  align-items: center;
  gap: 2px;

  padding: 4px 6px;

  border: 1px solid #4a4a4a;
  border-radius: 8px;
  background-color: #272727;
  color: white;
}

.penales-etiqueta {
  color: #ccc;
  font-size: 0.65rem;
  font-weight: 700;
}

.input-penales {
  width: 40px;
  height: 32px;
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