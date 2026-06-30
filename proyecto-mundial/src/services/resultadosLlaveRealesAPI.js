// NOTA DE ESTUDIO: Mockachino de solo lectura con los
// RESULTADOS REALES de la llave (a diferencia de
// prediccionesLlaveAPI.js, que guarda lo que predijo el
// usuario). Esto es lo que consume storeResultadosReales para
// calcular el puntaje de la fase eliminatoria.
import { validarPartidosLlave } from '@/utils/validacionesDatos'

const API_URL =
  'https://www.mockachino.com/ca8b64f7-a4e6-42/prediccionesLlaveEliminacion'

export const resultadosLlaveRealesAPI = {
  obtenerResultados: async () => {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(
        'Error al obtener los resultados reales de la llave.'
      )
    }

    const datos = await response.json()

    return validarPartidosLlave(
      datos.resultados,
      'resultadosLlaveReales'
    )
  }
}
