const API_URL =
  'https://6a29a9d0f59cb8f65f1d75f5.mockapi.io/prediccionesLlaveEliminacion'

export const prediccionesLlaveAPI = {
  obtenerTodas: async () => {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(
        `Error al obtener predicciones de la llave. Código: ${response.status}`
      )
    }

    const datos = await response.json()

    return Array.isArray(datos) ? datos : []
  },

  obtenerPorUsuario: async (userId) => {
    const predicciones =
      await prediccionesLlaveAPI.obtenerTodas()

    return predicciones.filter(
      (prediccion) => prediccion.userId === userId
    )
  },

  buscarPrediccion: async (userId, partidoId) => {
    const predicciones =
      await prediccionesLlaveAPI.obtenerTodas()

    return predicciones.find((prediccion) => {
      return (
        prediccion.userId === userId &&
        prediccion.partidoId === partidoId
      )
    })
  },

  guardarPrediccion: async (prediccion) => {
    const prediccionExistente =
      await prediccionesLlaveAPI.buscarPrediccion(
        prediccion.userId,
        prediccion.partidoId
      )

    const url = prediccionExistente
      ? `${API_URL}/${prediccionExistente.id}`
      : API_URL

    const metodo = prediccionExistente
      ? 'PUT'
      : 'POST'

    const response = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prediccion)
    })

    if (!response.ok) {
      throw new Error(
        'Error al guardar la predicción de la llave.'
      )
    }

    return await response.json()
  },

  eliminarPrediccion: async (userId, partidoId) => {
    const prediccionExistente =
      await prediccionesLlaveAPI.buscarPrediccion(
        userId,
        partidoId
      )

    if (!prediccionExistente) {
      return
    }

    const response = await fetch(
      `${API_URL}/${prediccionExistente.id}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      throw new Error(
        'Error al eliminar la predicción de la llave.'
      )
    }
  }
}