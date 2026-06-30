/**
 * ============================================================
 * NOTA DE ESTUDIO - storePredicciones.js
 * ============================================================
 * Maneja el CRUD de las predicciones de FASE DE GRUPOS del
 * usuario (el equivalente de storeLlaveEliminacion pero para
 * los partidos de grupos en vez del bracket).
 *
 * predicciones es un objeto (no array) indexado por partidoId
 * -> { [partidoId]: prediccion }. Esto es una decisión de
 * diseño importante: usar un objeto en vez de un array permite
 * acceso O(1) a la predicción de un partido puntual
 * (obtenerPrediccion) sin tener que recorrer/buscar con find().
 *
 * Todas las operaciones (guardar/actualizar/reiniciar/limpiar)
 * siguen el mismo patrón: arman el objeto `prediccion`, llaman
 * a mockPrediccionesAPI (que simula un backend persistiendo en
 * localStorage) y, si la llamada fue exitosa, recién ahí
 * actualizan el estado reactivo local. Si la API falla, el
 * catch guarda el mensaje en `error` y relanza el error (throw)
 * para que el componente que llamó también pueda reaccionar
 * (por ejemplo, mostrar un mensaje al usuario).
 *
 * guardarPrediccion y actualizarPrediccion están duplicadas
 * casi textual porque mockPrediccionesAPI.guardarPrediccion
 * hace upsert (crea o actualiza según exista o no); podrían
 * unificarse en una sola función, pero se mantienen separadas
 * por claridad semántica en el resto del código (saber si se
 * está creando o editando).
 * ============================================================
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockPrediccionesAPI } from '@/services/mockPrediccionesAPI'
import { useStoreUsuario } from '@/stores/storeUsuario'

export const usePrediccionesStore = defineStore('predicciones', () => {
  const predicciones = ref({})
  const cargando = ref(false)
  const error = ref(null)
  const storeUsuario = useStoreUsuario()

  const obtenerUsuarioActivoId = () => {
    return storeUsuario.usuarioActualId || 'usuario1'
  }

  const cargarPredicciones = async () => {
    cargando.value = true
    error.value = null

    try {
      const datos =
        await mockPrediccionesAPI
          .obtenerPredicciones(
            obtenerUsuarioActivoId()
          )

      predicciones.value = {}

      Object.values(datos).forEach(
        (prediccion) => {
          predicciones.value[
            prediccion.partidoId
          ] = prediccion
        }
      )
    } catch (err) {
      console.error('Error al cargar predicciones:', err)
      error.value = err.message
    } finally {
      cargando.value = false
    }
  }

  const guardarPrediccion = async (partido, golesLocal, golesVisitante) => {
    const prediccion = {
      userId: obtenerUsuarioActivoId(),
      partidoId: partido.id,
      local: partido.local,
      visitante: partido.visitante,
      grupo: partido.grupo,
      fechaGrupo: partido.fechaGrupo,
      fecha: partido.fecha,
      hora: partido.hora,
      golesLocal: Number(golesLocal),
      golesVisitante: Number(golesVisitante)
    }

    error.value = null

    try {
      const prediccionGuardada = await mockPrediccionesAPI.guardarPrediccion(prediccion)

      predicciones.value[partido.id] = prediccionGuardada

      return prediccionGuardada
    } catch (err) {
      console.error('Error al guardar predicción:', err)
      error.value = err.message
      throw err
    }
  }

  const actualizarPrediccion = async (partido, golesLocal, golesVisitante) => {
    const prediccion = {
      userId: obtenerUsuarioActivoId(),
      partidoId: partido.id,
      local: partido.local,
      visitante: partido.visitante,
      grupo: partido.grupo,
      fechaGrupo: partido.fechaGrupo,
      fecha: partido.fecha,
      hora: partido.hora,
      golesLocal: Number(golesLocal),
      golesVisitante: Number(golesVisitante)
    }

    error.value = null

    try {
      const prediccionActualizada =
        await mockPrediccionesAPI
          .guardarPrediccion(
            prediccion
          )

      predicciones.value[partido.id] =
        prediccionActualizada

      return prediccionActualizada
    } catch (err) {
      console.error('Error al actualizar predicción:', err)
      error.value = err.message
      throw err
    }
  }

  const reiniciarPrediccion = async (partidoId) => {
    error.value = null

    try {
      await mockPrediccionesAPI
        .eliminarPrediccion(
          obtenerUsuarioActivoId(),
          partidoId
        )

      delete predicciones.value[partidoId]

      return true
    } catch (err) {
      console.error('Error al eliminar predicción:', err)
      error.value = err.message
      throw err
    }
  }

  const obtenerPrediccion = (partidoId) => {
    return predicciones.value[partidoId]
  }

  const obtenerTodasLasPredicciones = () => {
    return Object.values(predicciones.value)
  }

  const limpiarTodas = async () => {
    error.value = null

    try {
      await mockPrediccionesAPI
        .limpiarTodas(obtenerUsuarioActivoId())

      predicciones.value = {}

      return true
    } catch (err) {
      console.error('Error al limpiar predicciones:', err)
      error.value = err.message
      throw err
    }
  }

  return {
    predicciones,
    cargando,
    error,
    cargarPredicciones,
    guardarPrediccion,
    actualizarPrediccion,
    reiniciarPrediccion,
    obtenerPrediccion,
    obtenerTodasLasPredicciones,
    limpiarTodas
  }
})
