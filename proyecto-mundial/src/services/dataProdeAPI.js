// NOTA DE ESTUDIO: este servicio consume Mockachino (un mock
// de solo LECTURA: siempre devuelve el mismo JSON fijo que vos
// configuraste a mano). Trae países + fixture de partidos.
// Antes de devolver los datos, los pasa por validarDatosProde
// para garantizar que tengan la forma esperada (fail-fast).
import { validarDatosProde } from '@/utils/validacionesDatos'

const API_URL =
  'https://www.mockachino.com/890df2f4-2cb8-4a/dataProde'

export const dataProdeAPI = {
  obtenerDatos: async () => {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(
        'Error al obtener los datos del Mundial.'
      )
    }

    const datos = await response.json()

    return validarDatosProde(datos)
  }
}
