import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { rankingAPI } from '@/services/resultadosRealesAPI'
import { useResultadosRealesStore } from './storeResultadosReales'

export const useStoreRanking = defineStore('ranking', () => {
  const competidoresRaw = ref([])
  const cargando = ref(false)
  
  // Consumimos el store que tiene tus puntos en tiempo real
  const storeResultados = useResultadosRealesStore()

  const cargarRanking = async () => {
    if (competidoresRaw.value.length > 0) return
    cargando.value = true
    try {
      competidoresRaw.value = await rankingAPI.obtenerRanking()
    } catch (error) {
      console.error('Error al inicializar el ranking:', error)
    } finally {
      cargando.value = false
    }
  }

  // Mezcla tus puntos calculados en la lista de la API y los ordena de mayor a menor
  const rankingOrdenado = computed(() => {
    // 1. Obtenemos de forma segura el usuario logueado en LocalStorage
    const datosSesion = localStorage.getItem('usuarioProde')
    const usuarioLogueado = datosSesion ? JSON.parse(datosSesion) : null
    const nombreLogueado = usuarioLogueado?.nombre || 'admin'

    // 2. Mapeamos los datos que bajan de Mockachino
    const listaProcesada = competidoresRaw.value.map(usuario => {
      // Buscamos EXCLUSIVAMENTE la fila comodín del usuario que está usando la app
      if (usuario.id === 'actual_user_id') {
        return {
          ...usuario,
          nombre: nombreLogueado, // Va a mostrar 'admin' o el nombre que tengas en tu perfil
          puntos: storeResultados.puntajeTotalUsuario // Le inyecta tus puntos reales del store (los 18 pts)
        }
      }
      // A todos los demás competidores de la API (incluido el Nacho de 65) los deja intactos
      return usuario
    })

    // 3. Ordenamos de mayor a menor estrictamente por el valor numérico de puntos
    return [...listaProcesada].sort((a, b) => b.puntos - a.puntos)
  })

  // Devuelve los 3 usuarios con más puntos para la Home
  const top3Ranking = computed(() => {
    return rankingOrdenado.value.slice(0, 3)
  })

  return {
    competidoresRaw,
    cargando,
    cargarRanking,
    rankingOrdenado,
    top3Ranking
  }
})