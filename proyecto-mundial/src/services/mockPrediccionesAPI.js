// MOCK API para predicciones
// Guarda las predicciones en MockAPI

import {
  validarPrediccionGrupo,
  validarPrediccionesGrupo
} from '@/utils/validacionesDatos'

const API_URL =
  'https://6a29a9d0f59cb8f65f1d75f5.mockapi.io/predicciones'

const obtenerIdRegistro = (prediccion) => {
  return prediccion.usuarioId ?? prediccion.id
}

const obtenerValorFecha = (prediccion) => {
  const fecha = Date.parse(
    prediccion.fechaGuardado
  )

  if (!Number.isNaN(fecha)) {
    return fecha
  }

  return Number(
    obtenerIdRegistro(prediccion)
  ) || 0
}

const obtenerTodas = async () => {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error(
      `Error al obtener predicciones. Código: ${response.status}`
    )
  }

  const datos = await response.json()

  return validarPrediccionesGrupo(
    datos
  )
}

const eliminarRegistro = async (
  prediccion
) => {
  const registroId =
    obtenerIdRegistro(prediccion)

  if (!registroId) {
    throw new Error(
      'La predicción no tiene un identificador válido.'
    )
  }

  const response = await fetch(
    `${API_URL}/${registroId}`,
    {
      method: 'DELETE'
    }
  )

  if (!response.ok) {
    throw new Error(
      `Error al eliminar la predicción. Código: ${response.status}`
    )
  }
}

export const mockPrediccionesAPI = {
  obtenerPredicciones: async (
    userId
  ) => {
    const predicciones =
      await obtenerTodas()

    const prediccionesPorPartido = {}

    predicciones
      .filter((prediccion) => {
        return prediccion.userId === userId
      })
      .forEach((prediccion) => {
        const prediccionActual =
          prediccionesPorPartido[
            prediccion.partidoId
          ]

        if (
          !prediccionActual ||
          obtenerValorFecha(prediccion) >
            obtenerValorFecha(
              prediccionActual
            )
        ) {
          prediccionesPorPartido[
            prediccion.partidoId
          ] = prediccion
        }
      })

    return prediccionesPorPartido
  },

  buscarPrediccion: async (
    userId,
    partidoId
  ) => {
    const predicciones =
      await mockPrediccionesAPI
        .obtenerPredicciones(userId)

    return (
      predicciones[partidoId] ||
      null
    )
  },

  guardarPrediccion: async (
    prediccion
  ) => {
    validarPrediccionGrupo(
      prediccion,
      'prediccionParaGuardar'
    )

    const prediccionExistente =
      await mockPrediccionesAPI
        .buscarPrediccion(
          prediccion.userId,
          prediccion.partidoId
        )

    const prediccionConFecha = {
      ...prediccion,
      fechaGuardado:
        new Date().toISOString()
    }

    if (prediccionExistente) {
      const registroId =
        obtenerIdRegistro(
          prediccionExistente
        )

      return await mockPrediccionesAPI
        .actualizarPrediccion(
          registroId,
          prediccionConFecha
        )
    }

    const response = await fetch(
      API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify(
          prediccionConFecha
        )
      }
    )

    if (!response.ok) {
      throw new Error(
        `Error al guardar la predicción. Código: ${response.status}`
      )
    }

    const prediccionGuardada =
      await response.json()

    return validarPrediccionGrupo(
      prediccionGuardada,
      'respuestaPrediccionGuardada',
      true
    )
  },

  actualizarPrediccion: async (
    registroId,
    prediccion
  ) => {
    if (!registroId) {
      throw new Error(
        'No se encontró el identificador de la predicción.'
      )
    }

    const prediccionConFecha = {
      ...prediccion,
      fechaGuardado:
        new Date().toISOString()
    }

    validarPrediccionGrupo(
      prediccionConFecha,
      'prediccionParaActualizar'
    )

    const response = await fetch(
      `${API_URL}/${registroId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify(
          prediccionConFecha
        )
      }
    )

    if (!response.ok) {
      throw new Error(
        `Error al actualizar la predicción. Código: ${response.status}`
      )
    }

    const prediccionActualizada =
      await response.json()

    return validarPrediccionGrupo(
      prediccionActualizada,
      'respuestaPrediccionActualizada',
      true
    )
  },

  eliminarPrediccion: async (
    userId,
    partidoId
  ) => {
    const predicciones =
      await obtenerTodas()

    const coincidencias =
      predicciones.filter(
        (prediccion) => {
          return (
            prediccion.userId === userId &&
            prediccion.partidoId ===
              partidoId
          )
        }
      )

    for (
      const prediccion of coincidencias
    ) {
      await eliminarRegistro(prediccion)
    }
  },

  limpiarTodas: async (userId) => {
    const predicciones =
      await obtenerTodas()

    const prediccionesDelUsuario =
      predicciones.filter(
        (prediccion) => {
          return (
            prediccion.userId === userId
          )
        }
      )

    for (
      const prediccion
      of prediccionesDelUsuario
    ) {
      await eliminarRegistro(prediccion)
    }
  }
}
