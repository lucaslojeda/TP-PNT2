<template>
  <div class="llave-container">
    <Sidebar />

    <main class="llave-content">
      <header class="llave-header">
        <h1>Llave de eliminación directa</h1>

        <p>
          Realizá tus predicciones desde dieciseisavos hasta elegir al campeón.
        </p>
      </header>

      <p
        v-if="llaveStore.cargando"
        class="mensaje-estado"
      >
        Cargando llave...
      </p>

      <p
        v-if="llaveStore.error"
        class="mensaje-error"
      >
        {{ llaveStore.error }}
      </p>

      <div
        ref="llaveScroll"
        class="llave-scroll"
        @scroll="sincronizarDesdeLlave"
      >
        <section
          v-if="!llaveStore.cargando"
          ref="llaveTablero"
          class="llave-tablero"
        >
          <RondaLlave
            titulo="Dieciseisavos"
            :partidos="llaveStore.partidosDieciseisavos"
            :nivel="0"
            @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion"
          />

          <RondaLlave
            titulo="Octavos"
            :partidos="llaveStore.partidosOctavos"
            :nivel="1"
            @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion"
          />

          <RondaLlave
            titulo="Cuartos"
            :partidos="llaveStore.partidosCuartos"
            :nivel="2"
            @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion"
          />

          <RondaLlave
            titulo="Semifinales"
            :partidos="llaveStore.partidosSemifinales"
            :nivel="3"
            @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion"
          />

          <RondaLlave
            titulo="Final"
            :partidos="llaveStore.partidosFinal"
            :nivel="4"
            :es-final="true"
            @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion"
          />
        </section>
      </div>

      <div
        v-if="!llaveStore.cargando"
        ref="barraScroll"
        class="barra-horizontal"
        @scroll="sincronizarDesdeBarra"
      >
        <div
          class="barra-contenido"
          :style="{ width: `${anchoTablero}px` }"
        ></div>
      </div>

      <section
        v-if="llaveStore.campeon"
        class="campeon-container"
      >
        <h2>Campeón predicho</h2>

        <img
          :src="llaveStore.campeon.bandera"
          :alt="`Bandera de ${llaveStore.campeon.nombre}`"
          class="campeon-bandera"
        />

        <p>{{ llaveStore.campeon.nombre }}</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref
} from 'vue'

import Sidebar from '@/components/Sidebar.vue'
import RondaLlave from '@/components/RondaLlave.vue'
import { useLlaveEliminacionStore } from '@/stores/storeLlaveEliminacion'

const llaveStore = useLlaveEliminacionStore()

const llaveScroll = ref(null)
const llaveTablero = ref(null)
const barraScroll = ref(null)

const anchoTablero = ref(0)

let sincronizando = false

const actualizarAnchoTablero = () => {
  if (!llaveTablero.value) {
    return
  }

  anchoTablero.value =
    llaveTablero.value.scrollWidth
}

const sincronizarDesdeLlave = () => {
  if (
    sincronizando ||
    !llaveScroll.value ||
    !barraScroll.value
  ) {
    return
  }

  sincronizando = true

  barraScroll.value.scrollLeft =
    llaveScroll.value.scrollLeft

  requestAnimationFrame(() => {
    sincronizando = false
  })
}

const sincronizarDesdeBarra = () => {
  if (
    sincronizando ||
    !llaveScroll.value ||
    !barraScroll.value
  ) {
    return
  }

  sincronizando = true

  llaveScroll.value.scrollLeft =
    barraScroll.value.scrollLeft

  requestAnimationFrame(() => {
    sincronizando = false
  })
}

onMounted(async () => {
  await llaveStore.inicializarLlave()

  await nextTick()

  actualizarAnchoTablero()

  window.addEventListener(
    'resize',
    actualizarAnchoTablero
  )
})

onUnmounted(() => {
  window.removeEventListener(
    'resize',
    actualizarAnchoTablero
  )
})
</script>

<style scoped>
.llave-container {
  min-height: 100vh;
  width: 100%;
  background-color: #707070;
}

.llave-content {
  min-width: 0;
  width: calc(100vw - 250px);
  min-height: 100vh;
  margin-left: 250px;
  padding: 32px 40px;
  box-sizing: border-box;
}

.llave-header {
  max-width: 650px;
  margin-bottom: 28px;
  padding: 20px;
  border-radius: 12px;
  background-color: #1f1f1f;
  color: white;
}

.llave-header h1 {
  margin: 0;
}

.llave-header p {
  margin: 8px 0 0;
  color: #ccc;
}

.mensaje-estado {
  margin: 20px 0;
  color: white;
  font-weight: 700;
}

.mensaje-error {
  max-width: 650px;
  margin: 20px 0;
  padding: 12px;
  border-radius: 8px;
  background-color: #4b1818;
  color: #ffb3b3;
  font-weight: 700;
}

.llave-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  box-sizing: border-box;

  scrollbar-width: none;
}

.llave-scroll::-webkit-scrollbar {
  display: none;
}

.llave-tablero {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  width: max-content;
  min-width: 1800px;
}

.barra-horizontal {
  position: sticky;
  bottom: 0;
  z-index: 50;

  width: 100%;
  height: 20px;

  overflow-x: auto;
  overflow-y: hidden;

  background-color: #707070;
}

.barra-contenido {
  height: 1px;
}

.campeon-container {
  width: 280px;
  margin-top: 30px;
  padding: 20px;
  border-radius: 12px;
  background-color: #1f1f1f;
  color: white;
  text-align: center;
}

.campeon-container h2 {
  margin-top: 0;
}

.campeon-bandera {
  width: 70px;
  height: 46px;
  object-fit: cover;
  border-radius: 5px;
}

.campeon-container p {
  margin-bottom: 0;
  font-size: 1.2rem;
  font-weight: 800;
}
</style>