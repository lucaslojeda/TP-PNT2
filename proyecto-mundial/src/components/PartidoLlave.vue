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
// ============================================================
// NOTA DE ESTUDIO - PartidoLlave.vue
// ============================================================
// El componente de UN partido del bracket. Es "tonto" en el
// sentido de que no toca el store directamente: recibe
// `partido` por props y emite eventos ('guardar-prediccion',
// 'reiniciar-prediccion') que el padre (RondaLlave ->
// LlaveDeEliminacion) reenvía hacia storeLlaveEliminacion.
// Esto es el patrón estándar de Vue: "props down, events up".
//
// La parte más interesante es la lógica de PENALES:
// - resultadoEmpatado: compara los goles ingresados; si son
//   iguales, hay empate (y en el Mundial eso significa que el
//   partido se define por penales).
// - puedeGuardar: el botón de guardar solo se habilita si: hay
//   los dos equipos definidos Y hay goles cargados, Y SI hay
//   empate, además exige que los penales estén completos
//   (penalesCompletos) Y que tengan un ganador claro
//   (penalesTienenGanador, o sea que no sean iguales entre sí).
//   Si no hay empate, los penales ni se piden.
//
// watch(resultadoEmpatado, ...): si el usuario cambiaba el
// marcador y dejaba de haber empate, limpia los campos de
// penales que pudo haber cargado antes (para no dejar datos
// inconsistentes).
//
// cargarDatosPartido(): rellena el formulario con los datos ya
// guardados del partido (si prediccionGuardada es true) o lo
// vacía. Se dispara con watch(props.partido, ..., {immediate:
// true, deep: true}) porque cuando avanza el bracket, el objeto
// `partido` recibido por props puede cambiar sus propiedades
// internas sin que cambie la referencia del prop en sí (de ahí
// el `deep: true`).
// ============================================================
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
  display: flex;
  flex-direction: column;
  width: 280px;
  background:
    linear-gradient(180deg, rgba(38, 38, 38, 0.98), rgba(18, 18, 18, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.partido-llave:hover {
  border-color: rgba(0, 210, 106, 0.55);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(0, 210, 106, 0.12);
  transform: translateY(-1px);
}

.partido-contenido {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.cruce {
  flex: 1;
}

.equipo {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  box-sizing: border-box;
  color: white;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.equipo:first-child {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.equipo-info {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bandera {
  width: 28px;
  height: 19px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

.nombre-equipo {
  overflow: hidden;
  font-size: 0.85rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-goles {
  width: 38px;
  height: 28px;
  box-sizing: border-box;
  border: 1px solid #444;
  border-radius: 6px;
  background: #111;
  color: white;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.input-goles:focus,
.input-penales:focus {
  outline: none;
  border-color: #00d26a;
  box-shadow: 0 0 0 2px rgba(0, 210, 106, 0.18);
}

.input-goles:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.penales-laterales {
  width: 56px;
  display: grid;
  grid-template-rows: 16px 1fr 1fr;
  justify-items: center;
  align-items: center;
  gap: 2px;
  padding: 4px 4px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

.penales-etiqueta {
  color: #ccc;
  font-size: 0.6rem;
  font-weight: 700;
}

.input-penales {
  width: 36px;
  height: 28px;
  box-sizing: border-box;
  border: 1px solid #444;
  border-radius: 6px;
  background: #111;
  color: white;
  text-align: center;
  font-weight: 700;
}

.input-penales:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ganador {
  background: linear-gradient(90deg, rgba(0, 210, 106, 0.22), rgba(0, 210, 106, 0.05));
  color: #7dffad;
}

/* Botones dentro del partido, ocultos hasta hover */
.acciones {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 0 10px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease, padding 0.2s ease;
}

.partido-llave:hover .acciones {
  max-height: 44px;
  padding: 6px 10px;
}

.boton {
  flex: 1;
  padding: 5px 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.78rem;
  white-space: nowrap;
}

.boton:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.guardar { background: #00a862; color: #06140d; }
.reiniciar { background: #d84343; color: white; }

.guardar:not(:disabled):hover {
  background: #00d26a;
}

.reiniciar:not(:disabled):hover {
  background: #ef5350;
}

.mensaje-error {
  padding: 4px 10px;
  color: #ff7676;
  font-size: 0.75rem;
  text-align: center;
}
</style>
