/**
 * ============================================================
 * NOTA DE ESTUDIO - storeDataProde.js
 * ============================================================
 * Store "base": trae países y el fixture de partidos desde la
 * API mock (Mockachino) y los cachea en memoria. La guarda al
 * inicio de inicializar() (if paises.length > 0 && partidos.
 * length > 0 return) evita pedirlos de nuevo si ya están
 * cargados — patrón típico de "cargar una sola vez por sesión".
 * Casi todos los demás stores dependen de este (lo usan como
 * fuente de los países/equipos y partidos del fixture).
 * obtenerPaisPorId acepta tanto `id` como `codigo` por si el
 * dato llega con cualquiera de las dos claves (ver
 * normalizarEquipo en llaveUtils.js, mismo criterio).
 * ============================================================
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { dataProdeAPI } from '@/services/dataProdeAPI'

export const useDatosProdeStore = defineStore(
  'dataProde',
  () => {
    const paises = ref([])
    const partidos = ref([])

    const cargando = ref(false)
    const error = ref(null)

    const inicializar = async () => {
      if (
        paises.value.length > 0 &&
        partidos.value.length > 0
      ) {
        return
      }

      cargando.value = true
      error.value = null

      try {
        const datos =
          await dataProdeAPI.obtenerDatos()

        paises.value = datos.paises
        partidos.value = datos.partidos
      } catch (err) {
        console.error(
          'Error al cargar los datos del Mundial:',
          err
        )

        error.value = err.message
        paises.value = []
        partidos.value = []
      } finally {
        cargando.value = false
      }
    }

    const obtenerPaisPorId = (idPais) => {
      return (
        paises.value.find(
          (pais) =>
            pais.id === idPais ||
            pais.codigo === idPais
        ) || null
      )
    }

    const obtenerPartidoPorId = (
      partidoId
    ) => {
      return (
        partidos.value.find(
          (partido) =>
            partido.id === partidoId
        ) || null
      )
    }

    return {
      paises,
      partidos,
      cargando,
      error,

      inicializar,
      obtenerPaisPorId,
      obtenerPartidoPorId
    }
  }
)