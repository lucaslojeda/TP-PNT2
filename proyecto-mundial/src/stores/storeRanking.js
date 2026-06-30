/**
 * ============================================================
 * NOTA DE ESTUDIO - storeRanking.js
 * ============================================================
 * Arma el ranking global mezclando dos fuentes de datos:
 *
 * 1. "Usuarios fijos": los usuarios mock locales (storeUsuario.
 *    usuarios), donde al usuario actualmente logueado se le
 *    pisa el puntaje guardado por el puntaje EN VIVO calculado
 *    en storeResultadosReales.puntajeTotalUsuario (así el
 *    ranking siempre refleja tus predicciones actualizadas, no
 *    un valor viejo guardado).
 * 2. "Ranking externo": competidores que vienen de la API mock
 *    (rankingAPI) y que NO están entre los usuarios fijos
 *    (se filtran por id con un Set para evitar duplicados).
 *
 * watch(): observa puntajeTotalUsuario y, cada vez que cambia
 * (por ejemplo guardás una nueva predicción), llama a
 * sincronizarPuntajeActual() para persistir ese puntaje en el
 * store de usuario. Esto es lo que hace que el ranking se
 * actualice "solo" sin que el componente tenga que pedirlo.
 *
 * rankingOrdenado (computed): junta ambas listas y ordena de
 * mayor a menor puntaje. top3Ranking es simplemente el podio
 * (los primeros 3 de esa lista ya ordenada).
 * ============================================================
 */
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { rankingAPI } from '@/services/resultadosRealesAPI'
import { useResultadosRealesStore } from './storeResultadosReales'
import { useStoreUsuario } from './storeUsuario'

export const useStoreRanking = defineStore('ranking', () => {
  const competidoresRaw = ref([])
  const cargando = ref(false)

  const storeResultados = useResultadosRealesStore()
  const storeUsuario = useStoreUsuario()

  const sincronizarPuntajeActual = () => {
    if (!storeUsuario.estaLogueado || !storeUsuario.usuarioActualId) {
      return
    }

    storeUsuario.actualizarPuntosUsuario(
      storeUsuario.usuarioActualId,
      storeResultados.puntajeTotalUsuario
    )
  }

  watch(
    () => storeResultados.puntajeTotalUsuario,
    () => {
      sincronizarPuntajeActual()
    }
  )

  const cargarRanking = async () => {
    sincronizarPuntajeActual()

    if (competidoresRaw.value.length > 0) {
      return
    }

    cargando.value = true

    try {
      competidoresRaw.value = await rankingAPI.obtenerRanking()
    } catch (error) {
      console.error('Error al inicializar el ranking:', error)
    } finally {
      cargando.value = false
    }
  }

  const rankingOrdenado = computed(() => {
    const idsUsuariosMock = new Set(
      storeUsuario.usuarios.map((usuario) => usuario.id)
    )

    const rankingUsuariosFijos = storeUsuario.usuarios.map((usuario) => {
      const esUsuarioActivo =
        usuario.id === storeUsuario.usuarioActualId

      return {
        id: usuario.id,
        nombre: usuario.nombre,
        avatar: usuario.foto || usuario.avatar,
        puntos: esUsuarioActivo
          ? storeResultados.puntajeTotalUsuario
          : usuario.puntos,
        esUsuarioActivo
      }
    })

    const rankingExterno = competidoresRaw.value
      .filter((usuario) => {
        return (
          usuario.id !== 'actual_user_id' &&
          !idsUsuariosMock.has(usuario.id)
        )
      })
      .map((usuario) => {
        return {
          ...usuario,
          esUsuarioActivo: false
        }
      })

    return [
      ...rankingUsuariosFijos,
      ...rankingExterno
    ].sort((usuarioA, usuarioB) => {
      return Number(usuarioB.puntos) - Number(usuarioA.puntos)
    })
  })

  const top3Ranking = computed(() => {
    return rankingOrdenado.value.slice(0, 3)
  })

  return {
    competidoresRaw,
    cargando,
    cargarRanking,
    rankingOrdenado,
    top3Ranking,
    sincronizarPuntajeActual
  }
})
