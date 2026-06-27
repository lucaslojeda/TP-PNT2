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
