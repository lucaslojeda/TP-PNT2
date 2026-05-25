import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePrediccionesStore = defineStore('predicciones', () => {
  const predicciones = ref({})

  const guardarPrediccion = (partido, golesLocal, golesVisitante) => {
    predicciones.value[partido.id] = {
      partidoId: partido.id,
      local: partido.local,
      visitante: partido.visitante,
      grupo: partido.grupo,
      fechaGrupo: partido.fechaGrupo,
      golesLocal: Number(golesLocal),
      golesVisitante: Number(golesVisitante)
    }
  }

  const reiniciarPrediccion = (partidoId) => {
    delete predicciones.value[partidoId]
  }

  const obtenerPrediccion = (partidoId) => {
    return predicciones.value[partidoId]
  }

  return {
    predicciones,
    guardarPrediccion,
    reiniciarPrediccion,
    obtenerPrediccion
  }
})