<template>
  <div class="llave-container" :class="{ 'efecto-campeon-activo': transicionCampeon }" :style="estilosDinamicos">
    <Sidebar />

    <main class="llave-content">
      <header class="llave-header">
        <h1>Llave de eliminación directa</h1>
        <p>Realizá tus predicciones desde dieciseisavos hasta elegir al campeón.</p>
      </header>

      <p v-if="llaveStore.cargando" class="mensaje-estado">Cargando llave...</p>
      <p v-if="llaveStore.error" class="mensaje-error">{{ llaveStore.error }}</p>

      <div ref="llaveScroll" class="llave-scroll" @scroll="sincronizarDesdeLlave">
        <section v-if="!llaveStore.cargando" ref="llaveTablero" class="llave-tablero">

          <!-- LADO IZQUIERDO -->
          <RondaLlave titulo="Dieciseisavos" :partidos="llaveStore.partidosDieciseisavos.slice(0, 8)" :nivel="0"
            lado="izquierdo" @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <RondaLlave titulo="Octavos" :partidos="llaveStore.partidosOctavos.slice(0, 4)" :nivel="1" lado="izquierdo"
            @guardar-prediccion="llaveStore.guardarPrediccion" @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <RondaLlave titulo="Cuartos" :partidos="llaveStore.partidosCuartos.slice(0, 2)" :nivel="2" lado="izquierdo"
            @guardar-prediccion="llaveStore.guardarPrediccion" @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <RondaLlave titulo="Semifinales" :partidos="llaveStore.partidosSemifinales.slice(0, 1)" :nivel="3"
            lado="izquierdo" @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <!-- CENTRO - FINAL -->
          <RondaLlave titulo="Final" :partidos="llaveStore.partidosFinal" :nivel="4" :es-final="true" lado="centro"
            @guardar-prediccion="llaveStore.guardarPrediccion" @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <!-- LADO DERECHO -->
          <RondaLlave titulo="Semifinales" :partidos="llaveStore.partidosSemifinales.slice(1, 2)" :nivel="3"
            lado="derecho" @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <RondaLlave titulo="Cuartos" :partidos="llaveStore.partidosCuartos.slice(2, 4)" :nivel="2" lado="derecho"
            @guardar-prediccion="llaveStore.guardarPrediccion" @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <RondaLlave titulo="Octavos" :partidos="llaveStore.partidosOctavos.slice(4, 8)" :nivel="1" lado="derecho"
            @guardar-prediccion="llaveStore.guardarPrediccion" @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

          <RondaLlave titulo="Dieciseisavos" :partidos="llaveStore.partidosDieciseisavos.slice(8, 16)" :nivel="0"
            lado="derecho" @guardar-prediccion="llaveStore.guardarPrediccion"
            @reiniciar-prediccion="llaveStore.reiniciarPrediccion" />

        </section>
      </div>

      <div v-if="!llaveStore.cargando" ref="barraScroll" class="barra-horizontal" @scroll="sincronizarDesdeBarra">
        <div class="barra-contenido" :style="{ width: `${anchoTablero}px` }"></div>
      </div>

      <section v-if="llaveStore.campeon" class="campeon-container">
        <div class="campeon-card card-premium-vidrio">
          <div class="trofeo-real-wrapper">
            <img :src="urlTrofeoReal" alt="Copa del Mundo" class="trofeo-real-imagen" />
          </div>
          <h2>Campeón predicho</h2>
          <div class="bandera-wrapper">
            <img :src="llaveStore.campeon.bandera" :alt="`Bandera de ${llaveStore.campeon.nombre}`"
              class="campeon-bandera" />
          </div>
          <p>{{ llaveStore.campeon.nombre }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed
} from 'vue'

import Sidebar from '@/components/Sidebar.vue'
import RondaLlave from '@/components/RondaLlave.vue'
import { useLlaveEliminacionStore } from '@/stores/storeLlaveEliminacion'
import urlTrofeoReal from '@/assets/logo.png'

const llaveStore = useLlaveEliminacionStore()

const llaveScroll = ref(null)
const llaveTablero = ref(null)
const barraScroll = ref(null)
const anchoTablero = ref(0)
let sincronizando = false

const transicionCampeon = ref(false)

const baseConfigBanderas = {
  'Argentina': { bg: '/imagenes/argentina.png', tarjetaBg: 'rgba(24, 43, 64, 0.45)', borde: '#74acdf', texto: '#f6b426' },
  'Portugal': { bg: '/imagenes/portugal.png', tarjetaBg: 'rgba(25, 15, 15, 0.45)', borde: '#da121a', texto: '#046a38' },
  'Corea del Sur': { bg: '/imagenes/corea.png', tarjetaBg: 'rgba(10, 17, 40, 0.45)', borde: '#0047a0', texto: '#cd2e3a' },
  'Marruecos': { bg: '/imagenes/marruecos.png', tarjetaBg: 'rgba(20, 35, 25, 0.45)', borde: '#c1272d', texto: '#006233' },
  'México': { bg: 'https://flagcdn.com/w1280/mx.png', tarjetaBg: 'rgba(2, 44, 22, 0.35)', borde: '#14a552', texto: '#ce1126' },
  'Suecia': { bg: 'https://flagcdn.com/w1280/se.png', tarjetaBg: 'rgba(0, 47, 95, 0.35)', borde: '#006aa7', texto: '#fecc00' },
  'Bosnia y He...': { bg: 'https://flagcdn.com/w1280/ba.png', tarjetaBg: 'rgba(0, 30, 98, 0.35)', borde: '#002f6c', texto: '#ffcc00' },
  'Haití': { bg: 'https://flagcdn.com/w1280/ht.png', tarjetaBg: 'rgba(26, 26, 46, 0.35)', borde: '#00209f', texto: '#d21034' },
  'Túnez': { bg: 'https://flagcdn.com/w1280/tn.png', tarjetaBg: 'rgba(74, 14, 23, 0.35)', borde: '#e41b13', texto: '#ffffff' },
  'Irán': { bg: 'https://flagcdn.com/w1280/ir.png', tarjetaBg: 'rgba(28, 58, 39, 0.35)', borde: '#239e46', texto: '#da251d' }
}

const urlBanderaFondo = ref('/imagenes/logo2026.png')
const colorTarjetaBg = ref('rgba(31, 31, 31, 0.9)')
const colorBordeLlave = ref('rgba(255, 255, 255, 0.1)')
const colorTextoRonda = ref('#00d26a')

const estilosDinamicos = computed(() => ({
  '--bg-bandera': urlBanderaFondo.value ? `url(${urlBanderaFondo.value})` : 'none',
  '--tarjeta-bg': colorTarjetaBg.value,
  '--borde-llave': colorBordeLlave.value,
  '--color-acento': colorTextoRonda.value
}))

watch(() => llaveStore.campeon, (nuevoCampeon) => {
  if (nuevoCampeon) {
    transicionCampeon.value = true
    colorTarjetaBg.value = 'rgba(44, 34, 5, 0.9)'
    colorBordeLlave.value = '#ffd700'
    colorTextoRonda.value = '#fff3a3'

    setTimeout(() => {
      const config = baseConfigBanderas[nuevoCampeon.nombre] || {
        bg: '', tarjetaBg: 'rgba(31, 31, 31, 0.9)', borde: '#00d26a', texto: '#00d26a'
      }
      urlBanderaFondo.value = config.bg
      colorTarjetaBg.value = config.tarjetaBg
      colorBordeLlave.value = config.borde
      colorTextoRonda.value = config.texto
    }, 700)

    setTimeout(() => {
      transicionCampeon.value = false
    }, 1600)
  } else {
    urlBanderaFondo.value = '/imagenes/logo2026.png'
    colorTarjetaBg.value = 'rgba(31, 31, 31, 0.9)'
    colorBordeLlave.value = 'rgba(255, 255, 255, 0.1)'
    colorTextoRonda.value = '#00d26a'
  }
}, { deep: true })

const actualizarAnchoTablero = () => {
  if (!llaveTablero.value) return
  anchoTablero.value = llaveTablero.value.scrollWidth
}

const sincronizarDesdeLlave = () => {
  if (sincronizando || !llaveScroll.value || !barraScroll.value) return
  sincronizando = true
  barraScroll.value.scrollLeft = llaveScroll.value.scrollLeft
  requestAnimationFrame(() => { sincronizando = false })
}

const sincronizarDesdeBarra = () => {
  if (sincronizando || !llaveScroll.value || !barraScroll.value) return
  sincronizando = true
  llaveScroll.value.scrollLeft = barraScroll.value.scrollLeft
  requestAnimationFrame(() => { sincronizando = false })
}

onMounted(async () => {
  await llaveStore.inicializarLlave()
  await nextTick()
  actualizarAnchoTablero()
  window.addEventListener('resize', actualizarAnchoTablero)
})

onUnmounted(() => {
  window.removeEventListener('resize', actualizarAnchoTablero)
})
</script>

<style scoped>
.llave-container {
  min-height: 100vh;
  width: 100%;
  background-color: #1a1a1a;
  background-image: var(--bg-bandera);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  transition: background-image 0.8s ease-in-out;
}

.llave-container::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(rgba(20, 20, 20, 0.65), rgba(20, 20, 20, 0.85)),
    url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1280') no-repeat right 10% center;
  background-size: contain;
  opacity: 0.45;
  pointer-events: none;
  z-index: 1;
}

.llave-container::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.85) 0%, rgba(0, 0, 0, 0) 70%);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
}

.llave-container.efecto-campeon-activo::after {
  animation: flashDorado 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes flashDorado {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}

.llave-content {
  position: relative;
  z-index: 2;
  min-width: 0;
  width: calc(100vw - 40px);
  min-height: 100vh;
  margin-left: 40px;
  padding: 32px 40px;
  box-sizing: border-box;
}

.llave-header {
  max-width: 650px;
  margin-bottom: 28px;
  padding: 20px;
  border-radius: 12px;
  background-color: rgba(30, 30, 30, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
}

.llave-header h1 {
  margin: 0;
  font-size: 2rem;
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
  gap: 8px;
  width: max-content;
  padding: 20px 0;
}

:deep(.ronda-llave) {
  background: rgba(20, 20, 20, 0.75);
  border: 2px solid var(--borde-llave);
  border-radius: 14px;
  padding: 20px;
  margin-top: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
  transition: background 0.8s ease, border-color 0.8s ease;
}

.barra-horizontal {
  position: sticky;
  bottom: 0;
  z-index: 50;
  width: 100%;
  height: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: rgba(0, 0, 0, 0.3);
}

.barra-contenido {
  height: 1px;
}

.campeon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 50px;
  animation: slideUp 0.6s ease-out forwards;
  position: relative;
  z-index: 15;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.card-premium-vidrio {
  background: rgba(20, 20, 20, 0.8) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.campeon-card {
  width: 420px;
  padding: 30px;
  border: 3px solid var(--borde-llave);
  color: white;
  text-align: center;
  position: relative;
  transition: border-color 0.8s ease, background 0.8s ease !important;
}

.trofeo-real-wrapper {
  position: absolute;
  top: -75px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 130px;
  pointer-events: none;
}

.trofeo-real-imagen {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: pulsoCopaPro 2.5s infinite ease-in-out;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6));
}

@keyframes pulsoCopaPro {
  0% { transform: scale(1) translateY(0); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6)); }
  50% { transform: scale(1.08) translateY(-6px); filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.35)); }
  100% { transform: scale(1) translateY(0); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6)); }
}

.campeon-card h2 {
  margin: 40px 0 20px 0;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #ddd;
}

.bandera-wrapper {
  display: inline-block;
  padding: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 15px;
}

.campeon-bandera {
  width: 130px;
  height: 85px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

.campeon-card p {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
</style>