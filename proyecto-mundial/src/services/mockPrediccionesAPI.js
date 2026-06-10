// MOCK API para predicciones
// Guarda las predicciones en MockAPI

const API_URL = 'https://6a29a9d0f59cb8f65f1d75f5.mockapi.io/predicciones'

export const mockPrediccionesAPI = {
  // Obtener todas las predicciones del usuario
  obtenerPredicciones: async () => {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error('Error al obtener predicciones')
    }

    const predicciones = await response.json()

    const prediccionesPorPartido = {}

    predicciones.forEach((prediccion) => {
      prediccionesPorPartido[prediccion.partidoId] = prediccion
    })

    return prediccionesPorPartido
  },

  // Guardar una predicción
  guardarPrediccion: async (prediccion) => {
    const predicciones = await mockPrediccionesAPI.obtenerPredicciones()
    const prediccionExistente = predicciones[prediccion.partidoId]

    const prediccionConFecha = {
      ...prediccion,
      fechaGuardado: new Date().toISOString()
    }

    // Si ya existe una predicción para ese partido, la actualizamos
    if (prediccionExistente?.id) {
      return await mockPrediccionesAPI.actualizarPrediccion(
        prediccionExistente.id,
        prediccionConFecha
      )
    }

    // Si no existe, creamos una nueva
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediccionConFecha)
    })

    if (!response.ok) {
      throw new Error('Error al guardar predicción')
    }

    return await response.json()
  },

  // Actualizar una predicción existente
  actualizarPrediccion: async (id, prediccion) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediccion)
    })

    if (!response.ok) {
      throw new Error('Error al actualizar predicción')
    }

    return await response.json()
  },

  // Eliminar una predicción
  eliminarPrediccion: async (partidoId) => {
    const predicciones = await mockPrediccionesAPI.obtenerPredicciones()
    const prediccionExistente = predicciones[partidoId]

    if (!prediccionExistente?.id) {
      return
    }

    const response = await fetch(`${API_URL}/${prediccionExistente.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Error al eliminar predicción')
    }
  },

  // Limpiar todas las predicciones
  limpiarTodas: async () => {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error('Error al obtener predicciones')
    }

    const predicciones = await response.json()

    for (const prediccion of predicciones) {
      await fetch(`${API_URL}/${prediccion.id}`, {
        method: 'DELETE'
      })
    }
  }
}