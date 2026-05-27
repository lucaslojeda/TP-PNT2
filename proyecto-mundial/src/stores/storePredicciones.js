import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockPrediccionesAPI } from '@/services/mockPrediccionesAPI'

export const usePrediccionesStore = defineStore('predicciones', () => {
  const predicciones = ref({})
  const cargando = ref(false)

  // Cargar predicciones desde la MOCK API
  const cargarPredicciones = async () => {
    cargando.value = true
    try {
      const datos = await mockPrediccionesAPI.obtenerPredicciones()
      predicciones.value = datos
    } catch (error) {
      console.error('Error al cargar predicciones:', error)
    } finally {
      cargando.value = false
    }
  }

  const guardarPrediccion = async (partido, golesLocal, golesVisitante) => {
    const prediccion = {
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
    
    try {
      await mockPrediccionesAPI.guardarPrediccion(prediccion)
      predicciones.value[partido.id] = prediccion
    } catch (error) {
      console.error('Error al guardar predicción:', error)
    }
  }

  const actualizarPrediccion = async (partido, golesLocal, golesVisitante) => {
    const prediccion = {
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
    
    try {
      await mockPrediccionesAPI.actualizarPrediccion(prediccion)
      predicciones.value[partido.id] = prediccion
    } catch (error) {
      console.error('Error al actualizar predicción:', error)
    }
  }

  const reiniciarPrediccion = async (partidoId) => {
    try {
      await mockPrediccionesAPI.eliminarPrediccion(partidoId)
      delete predicciones.value[partidoId]
    } catch (error) {
      console.error('Error al eliminar predicción:', error)
    }
  }

  const obtenerPrediccion = (partidoId) => {
    return predicciones.value[partidoId]
  }

  const obtenerTodasLasPredicciones = () => {
    return Object.values(predicciones.value)
  }

  const limpiarTodas = async () => {
    try {
      await mockPrediccionesAPI.limpiarTodas()
      predicciones.value = {}
    } catch (error) {
      console.error('Error al limpiar predicciones:', error)
    }
  }

  return {
    predicciones,
    cargando,
    cargarPredicciones,
    guardarPrediccion,
    actualizarPrediccion,
    reiniciarPrediccion,
    obtenerPrediccion,
    obtenerTodasLasPredicciones,
    limpiarTodas
  }
})