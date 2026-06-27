import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockPrediccionesAPI } from '@/services/mockPrediccionesAPI'

const USUARIO_ID = 'usuario1'

export const usePrediccionesStore = defineStore('predicciones', () => {
  const predicciones = ref({})
  const cargando = ref(false)
  const error = ref(null)

  const cargarPredicciones = async () => {
    cargando.value = true
    error.value = null

    try {
      const datos =
        await mockPrediccionesAPI
          .obtenerPredicciones(
            USUARIO_ID
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
      userId: USUARIO_ID,
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
      userId: USUARIO_ID,
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
          USUARIO_ID,
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
        .limpiarTodas(USUARIO_ID)

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
