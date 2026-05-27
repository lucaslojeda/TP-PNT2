// MOCK API para predicciones
// Simula un servidor guardando datos en localStorage

const STORAGE_KEY = 'prediccionesProde'

export const mockPrediccionesAPI = {
  // Obtener todas las predicciones del usuario
  obtenerPredicciones: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const datos = localStorage.getItem(STORAGE_KEY)
        resolve(datos ? JSON.parse(datos) : {})
      }, 100) // Simular latencia de red
    })
  },

  // Guardar una predicción
  guardarPrediccion: (prediccion) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const predicciones = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
          predicciones[prediccion.partidoId] = {
            ...prediccion,
            fechaGuardado: new Date().toISOString()
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(predicciones))
          resolve(prediccion)
        } catch (error) {
          reject(error)
        }
      }, 100)
    })
  },

  // Eliminar una predicción
  eliminarPrediccion: (partidoId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const predicciones = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        delete predicciones[partidoId]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(predicciones))
        resolve()
      }, 100)
    })
  },

  // Actualizar una predicción existente
  actualizarPrediccion: (prediccion) => {
    return mockPrediccionesAPI.guardarPrediccion(prediccion)
  },

  // Limpiar todas las predicciones
  limpiarTodas: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY)
        resolve()
      }, 100)
    })
  }
}
