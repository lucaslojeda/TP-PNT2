<template>
  <section class="ronda-llave" :class="`lado-${lado}`">
    <h2 class="ronda-titulo">{{ titulo }}</h2>
    <div class="ronda-partidos" :style="{ height: `${alturaRonda}px` }">
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
  titulo: { type: String, required: true },
  partidos: { type: Array, required: true },
  nivel: { type: Number, required: true },
  esFinal: { type: Boolean, default: false },
  lado: { type: String, default: 'izquierdo' }
})

const emit = defineEmits(['guardar-prediccion', 'reiniciar-prediccion'])

const ALTO_SLOT = 140
const CENTRO_PARTIDO = 53

const obtenerCentroPartido = (indice) => {
  const salto = 2 ** props.nivel
  return (salto / 2 + indice * salto) * ALTO_SLOT
}

const obtenerPosicionPartido = (indice) => {
  if (props.esFinal) return {}
  const centro = obtenerCentroPartido(indice)
  return { top: `${centro - CENTRO_PARTIDO}px` }
}

const conectores = computed(() => {
  if (props.esFinal) return []
  const resultado = []
  for (let i = 0; i < props.partidos.length; i += 2) {
    if (!props.partidos[i + 1]) continue
    resultado.push({
      id: `conector-${props.nivel}-${i}`,
      estilo: {
        top: `${obtenerCentroPartido(i)}px`,
        height: `${obtenerCentroPartido(i + 1) - obtenerCentroPartido(i)}px`
      }
    })
  }
  return resultado
})

const reenviarGuardarPrediccion = (d) => emit('guardar-prediccion', d)
const reenviarReiniciarPrediccion = (d) => emit('reiniciar-prediccion', d)

const alturaRonda = computed(() => {
  if (props.esFinal) {
    return 1 * (2 ** 3) * ALTO_SLOT
  }
  return props.partidos.length * (2 ** props.nivel) * ALTO_SLOT
})
</script>

<style scoped>
.ronda-llave {
  width: 380px;
  min-width: 380px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.ronda-titulo {
  height: 30px;
  margin: 0 0 16px;
  color: white;
  font-size: 1.1rem;
  text-align: center;
}

.ronda-partidos {
  position: relative;
  width: 100%;
  overflow: visible;
}

/* Izquierdo */
.lado-izquierdo .partido-posicionado {
  position: absolute;
  left: 0;
  width: 280px;
  z-index: 1;
}
.lado-izquierdo .partido-posicionado:hover {
  z-index: 50;
}

/* Derecho */
.lado-derecho .partido-posicionado {
  position: absolute;
  right: 0;
  width: 280px;
  z-index: 1;
}
.lado-derecho .partido-posicionado:hover {
  z-index: 50;
}

/* Centro / Final */
.lado-centro .partido-posicionado {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
}

/* Conectores izquierdo */
.lado-izquierdo .conector-pareja {
  position: absolute;
  left: 280px;
  width: 40px;
  border-top: 2px solid #b5b5b5;
  border-right: 2px solid #b5b5b5;
  border-bottom: 2px solid #b5b5b5;
  box-sizing: border-box;
}
.lado-izquierdo .conector-pareja::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  width: 60px;
  height: 2px;
  background: #b5b5b5;
  transform: translateY(-1px);
}

/* Conectores derecho */
.lado-derecho .conector-pareja {
  position: absolute;
  right: 280px;
  width: 40px;
  border-top: 2px solid #b5b5b5;
  border-left: 2px solid #b5b5b5;
  border-bottom: 2px solid #b5b5b5;
  box-sizing: border-box;
}
.lado-derecho .conector-pareja::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  width: 60px;
  height: 2px;
  background: #b5b5b5;
  transform: translateY(-1px);
}
</style>