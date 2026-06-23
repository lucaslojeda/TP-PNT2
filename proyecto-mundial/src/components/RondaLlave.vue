<template>
  <section class="ronda-llave">
    <h2 class="ronda-titulo">
      {{ titulo }}
    </h2>

    <div class="ronda-partidos">
      <div
        v-for="(partido, indice) in partidos"
        :key="partido.id"
        class="partido-posicionado"
        :style="obtenerPosicionPartido(indice)"
      >
        <PartidoLlave
          :partido="partido"
          @guardar-prediccion="reenviarGuardarPrediccion"
          @reiniciar-prediccion="reenviarReiniciarPrediccion"
        />
      </div>

      <div
        v-for="conector in conectores"
        :key="conector.id"
        class="conector-pareja"
        :style="conector.estilo"
      ></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PartidoLlave from '@/components/PartidoLlave.vue'

const props = defineProps({
  titulo: {
    type: String,
    required: true
  },

  partidos: {
    type: Array,
    required: true
  },

  nivel: {
    type: Number,
    required: true
  },

  esFinal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'guardar-prediccion',
  'reiniciar-prediccion'
])

const ALTO_SLOT = 190
const CENTRO_PARTIDO = 53

const obtenerCentroPartido = (indice) => {
  const salto = 2 ** props.nivel

  return (
    salto / 2 +
    indice * salto
  ) * ALTO_SLOT
}

const obtenerPosicionPartido = (indice) => {
  const centro =
    obtenerCentroPartido(indice)

  return {
    top: `${centro - CENTRO_PARTIDO}px`
  }
}

const conectores = computed(() => {
  if (props.esFinal) {
    return []
  }

  const resultado = []

  for (
    let indice = 0;
    indice < props.partidos.length;
    indice += 2
  ) {
    if (!props.partidos[indice + 1]) {
      continue
    }

    const centroPrimerPartido =
      obtenerCentroPartido(indice)

    const centroSegundoPartido =
      obtenerCentroPartido(indice + 1)

    resultado.push({
      id: `conector-${props.nivel}-${indice}`,
      estilo: {
        top: `${centroPrimerPartido}px`,
        height: `${
          centroSegundoPartido -
          centroPrimerPartido
        }px`
      }
    })
  }

  return resultado
})

const reenviarGuardarPrediccion = (
  datosPrediccion
) => {
  emit(
    'guardar-prediccion',
    datosPrediccion
  )
}

const reenviarReiniciarPrediccion = (
  datosPrediccion
) => {
  emit(
    'reiniciar-prediccion',
    datosPrediccion
  )
}
</script>

<style scoped>
.ronda-llave {
  width: 420px;
  min-width: 420px;
  display: flex;
  flex-direction: column;
}

.ronda-titulo {
  height: 30px;
  margin: 0 0 24px;
  color: white;
  font-size: 1.2rem;
  text-align: center;
}

.ronda-partidos {
  position: relative;
  width: 100%;
  height: 3040px;
}

.partido-posicionado {
  position: absolute;
  left: 0;
  width: 320px;
  z-index: 1;
}

.partido-posicionado:focus-within {
  z-index: 100;
}

.conector-pareja {
  position: absolute;
  left: 320px;
  width: 40px;
  box-sizing: border-box;
  border-top: 2px solid #b5b5b5;
  border-right: 2px solid #b5b5b5;
  border-bottom: 2px solid #b5b5b5;
}

.conector-pareja::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  width: 60px;
  height: 2px;
  background-color: #b5b5b5;
  transform: translateY(-1px);
}
</style>