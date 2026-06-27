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
