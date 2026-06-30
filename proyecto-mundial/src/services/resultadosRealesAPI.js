// ============================================================
// NOTA DE ESTUDIO - resultadosRealesAPI.js
// ============================================================
// Dos Mockachinos de solo lectura en un mismo archivo:
// - resultadosRealesAPI: resultados reales de la FASE DE
//   GRUPOS (alimenta storeResultadosReales).
// - rankingAPI: lista de competidores externos del ranking
//   global (alimenta storeRanking).
// Ambos siguen el mismo patrón: fetch -> chequear response.ok
// -> parsear JSON -> validar la forma de los datos antes de
// devolverlos al store que los pidió.
import {
  validarRanking,
  validarResultadosFaseGrupos
} from '@/utils/validacionesDatos'

const API_URL = 'https://www.mockachino.com/5a5f72ee-1053-44/resultadosReales'

export const resultadosRealesAPI = {
  obtenerResultados: async () => {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Error al obtener resultados')
    const data = await response.json()

    return validarResultadosFaseGrupos(
      data.resultados
    )
  }
}

export const rankingAPI = {
  obtenerRanking: async () => {
    const URL_RANKING = 'https://www.mockachino.com/00c355dc-b07e-42/ranking' 
    
    const response = await fetch(URL_RANKING)
    if (!response.ok) throw new Error('Error al obtener el ranking global')
    const data = await response.json()

    return validarRanking(
      data.usuarios
    )
  }
}
