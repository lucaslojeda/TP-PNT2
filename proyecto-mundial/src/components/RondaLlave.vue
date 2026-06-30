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
// ============================================================
// NOTA DE ESTUDIO - RondaLlave.vue
// ============================================================
// Pinta UNA columna del bracket (una fase) y la matemática de
// dónde ubicar cada partido en altura, para que el árbol del
// bracket se vea bien alineado (cada 2 partidos de una ronda
// "convergen" visualmente en 1 partido de la ronda siguiente).
//
// `nivel` (prop) indica cuántas rondas atrás está esta fase
// respecto de la final (0 = 16avos, ..., 4 = final). Con eso,
// 2 ** nivel ("salto") da el espaciado vertical: cuanto más
// avanzada la fase, más separados están los partidos (porque
// representan más partidos "fusionados" de las fases previas).
//
// obtenerCentroPartido(indice): fórmula de centrado:
// (salto/2 + indice*salto) * ALTO_SLOT. Es la misma idea que
// posicionar hojas de un árbol binario: el primer partido se
// centra a medio salto, y cada uno siguiente se corre un salto
// completo, así los conectores (las líneas que unen rondas)
// quedan perfectamente a mitad de camino entre los dos partidos
// "padres".
//
// conectores (computed): genera, de a pares de partidos
// (i, i+1), un conector vertical entre el centro del partido i
// y el centro del partido i+1 — es la línea que visualmente
// representa "estos dos partidos definen al siguiente".
//
// reenviarGuardarPrediccion/reenviarReiniciarPrediccion: este
// componente NO toca el store, solo retransmite hacia arriba
// los eventos que emite cada PartidoLlave hijo (patrón "props
// down, events up" en cadena: PartidoLlave -> RondaLlave ->
// LlaveDeEliminacion -> store).
// ============================================================
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
  width: 340px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.ronda-titulo {
  min-height: 30px;
  margin: 0 0 14px;
  color: #f4f4f4;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
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
  border-top: 2px solid rgba(0, 210, 106, 0.45);
  border-right: 2px solid rgba(0, 210, 106, 0.45);
  border-bottom: 2px solid rgba(0, 210, 106, 0.45);
  box-sizing: border-box;
  filter: drop-shadow(0 0 6px rgba(0, 210, 106, 0.22));
}
.lado-izquierdo .conector-pareja::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 210, 106, 0.8), rgba(0, 210, 106, 0.15));
  transform: translateY(-1px);
}

/* Conectores derecho */
.lado-derecho .conector-pareja {
  position: absolute;
  right: 280px;
  width: 40px;
  border-top: 2px solid rgba(0, 210, 106, 0.45);
  border-left: 2px solid rgba(0, 210, 106, 0.45);
  border-bottom: 2px solid rgba(0, 210, 106, 0.45);
  box-sizing: border-box;
  filter: drop-shadow(0 0 6px rgba(0, 210, 106, 0.22));
}
.lado-derecho .conector-pareja::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  width: 60px;
  height: 2px;
  background: linear-gradient(270deg, rgba(0, 210, 106, 0.8), rgba(0, 210, 106, 0.15));
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .ronda-llave {
    width: 315px;
    min-width: 315px;
  }
}
</style>
