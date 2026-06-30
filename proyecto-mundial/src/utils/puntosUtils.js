/**
 * ============================================================
 * NOTA DE ESTUDIO - puntosUtils.js
 * ============================================================
 * Calcula el puntaje de UN partido de la llave (fase
 * eliminatoria). A diferencia de la fase de grupos, acá no
 * existe el empate como resultado final (siempre hay un
 * ganador, eventualmente por penales), entonces la lógica de
 * puntaje es distinta:
 *
 * 1. Si los equipos de la predicción no coinciden con los del
 *    resultado real (coincidenEquipos), 0 puntos: el usuario
 *    predijo un cruce que no se dio.
 * 2. Si el ganador que predijiste NO coincide con el ganador
 *    real, 0 puntos, sin importar el marcador.
 * 3. Si acertaste el ganador:
 *    - marcador exacto (en los 90 min, sin contar penales) -> 6
 *    - ganador correcto pero marcador distinto -> 3
 * Notar que el resultado de la TANDA DE PENALES nunca se
 * compara número a número, solo importa quién avanza. Por eso
 * esta función no toca penalesEquipo1/penalesEquipo2 en ningún
 * momento, solo ganadorId.
 * ============================================================
 */
export const calcularPuntosPartidoLlave = (
  prediccion,
  resultadoReal
) => {
  if (!prediccion || !resultadoReal) {
    return 0
  }

  const coincidenEquipos =
    prediccion.equipo1Id ===
      resultadoReal.equipo1Id &&
    prediccion.equipo2Id ===
      resultadoReal.equipo2Id

  if (!coincidenEquipos) {
    return 0
  }

  if (
    !prediccion.ganadorId ||
    !resultadoReal.ganadorId ||
    prediccion.ganadorId !==
      resultadoReal.ganadorId
  ) {
    return 0
  }

  const golesEquipo1Predichos =
    Number(prediccion.golesEquipo1)

  const golesEquipo2Predichos =
    Number(prediccion.golesEquipo2)

  const golesEquipo1Reales =
    Number(resultadoReal.golesEquipo1)

  const golesEquipo2Reales =
    Number(resultadoReal.golesEquipo2)

  if (
    Number.isNaN(golesEquipo1Predichos) ||
    Number.isNaN(golesEquipo2Predichos) ||
    Number.isNaN(golesEquipo1Reales) ||
    Number.isNaN(golesEquipo2Reales)
  ) {
    return 0
  }

  const marcadorExacto =
    golesEquipo1Predichos ===
      golesEquipo1Reales &&
    golesEquipo2Predichos ===
      golesEquipo2Reales

  return marcadorExacto ? 6 : 3
}
