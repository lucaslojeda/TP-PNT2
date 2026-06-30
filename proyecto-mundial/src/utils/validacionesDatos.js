/**
 * ============================================================
 * NOTA DE ESTUDIO - validacionesDatos.js
 * ============================================================
 * Archivo de "guard clauses": valida que los datos que llegan
 * de las APIs mock (Mockachino/localStorage) tengan la forma
 * esperada ANTES de que el resto de la app intente usarlos.
 * Es una práctica de defensa importante porque, al venir de un
 * mock editable a mano (vos mismo pegaste el JSON en
 * Mockachino), un typo o un campo faltante podría romper
 * silenciosamente toda la app más adelante; mejor explotar acá
 * con un error claro ("Datos inválidos en X: ...") que tener un
 * bug fantasma en un componente.
 *
 * Helpers genéricos reutilizados en todo el archivo:
 * - crearError(origen, detalle): arma un Error con mensaje
 *   estandarizado, indicando en qué función/origen falló.
 * - esObjeto / validarObjeto / validarArray / validarTexto /
 *   esEnteroNoNegativo / validarGoles: chequeos de tipo básicos
 *   (¿es objeto?, ¿es array?, ¿es texto no vacío?, ¿es un
 *   entero >= 0 como deben ser los goles?).
 *
 * Funciones exportadas (una por tipo de dato del dominio):
 * - validarDatosProde: países + fixture de partidos.
 * - validarResultadosFaseGrupos: resultados reales de grupos.
 * - validarRanking: lista de competidores del ranking.
 * - validarPrediccionGrupo / validarPrediccionesGrupo:
 *   una predicción de fase de grupos / la colección completa.
 * - validarPartidoLlave / validarPartidosLlave: un partido del
 *   bracket / todos los partidos de la llave.
 * - validarPrediccionLlave / validarPrediccionesLlave:
 *   ídem para predicciones de la llave eliminatoria.
 *
 * Todas siguen el mismo patrón: revisan estructura general
 * (objeto/array), después campo por campo con los helpers de
 * arriba, y tiran un Error específico apenas algo no cumple,
 * para frenar el flujo lo antes posible (fail-fast).
 * ============================================================
 */
const FASES_LLAVE = [
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semifinales',
  'final'
]

const crearError = (
  origen,
  detalle
) => {
  return new Error(
    `Datos inválidos en ${origen}: ${detalle}`
  )
}

const esObjeto = (valor) => {
  return (
    valor !== null &&
    typeof valor === 'object' &&
    !Array.isArray(valor)
  )
}

const validarObjeto = (
  valor,
  origen
) => {
  if (!esObjeto(valor)) {
    throw crearError(
      origen,
      'se esperaba un objeto.'
    )
  }
}

const validarArray = (
  valor,
  origen
) => {
  if (!Array.isArray(valor)) {
    throw crearError(
      origen,
      'se esperaba una lista.'
    )
  }
}

const validarTexto = (
  valor,
  origen,
  campo
) => {
  if (
    typeof valor !== 'string' ||
    valor.trim() === ''
  ) {
    throw crearError(
      origen,
      `"${campo}" debe ser un texto no vacío.`
    )
  }
}

const esEnteroNoNegativo = (
  valor
) => {
  const numero = Number(valor)

  return (
    Number.isInteger(numero) &&
    numero >= 0
  )
}

const validarGoles = (
  valor,
  origen,
  campo,
  permiteNull = false
) => {
  if (
    permiteNull &&
    (
      valor === null ||
      valor === undefined
    )
  ) {
    return
  }

  if (!esEnteroNoNegativo(valor)) {
    throw crearError(
      origen,
      `"${campo}" debe ser un entero mayor o igual a cero.`
    )
  }
}

const validarIdsUnicos = (
  elementos,
  obtenerId,
  origen
) => {
  const ids = new Set()

  elementos.forEach(
    (elemento, indice) => {
      const id = obtenerId(elemento)

      if (ids.has(id)) {
        throw crearError(
          origen,
          `el identificador "${id}" está duplicado en el registro ${indice}.`
        )
      }

      ids.add(id)
    }
  )
}

export const validarDatosProde = (
  datos
) => {
  const origen = 'dataProde'

  validarObjeto(datos, origen)
  validarArray(datos.paises, `${origen}.paises`)
  validarArray(datos.partidos, `${origen}.partidos`)

  datos.paises.forEach(
    (pais, indice) => {
      const registro =
        `${origen}.paises[${indice}]`

      validarObjeto(pais, registro)
      validarTexto(pais.id, registro, 'id')
      validarTexto(
        pais.nombre,
        registro,
        'nombre'
      )
      validarTexto(
        pais.grupo,
        registro,
        'grupo'
      )

      if (
        !/^[A-L]$/.test(pais.grupo)
      ) {
        throw crearError(
          registro,
          '"grupo" debe ser una letra entre A y L.'
        )
      }
      validarTexto(
        pais.bandera,
        registro,
        'bandera'
      )
    }
  )

  validarIdsUnicos(
    datos.paises,
    (pais) => pais.id,
    `${origen}.paises`
  )

  const paisesPorId = new Map(
    datos.paises.map(
      (pais) => [pais.id, pais]
    )
  )

  datos.partidos.forEach(
    (partido, indice) => {
      const registro =
        `${origen}.partidos[${indice}]`

      validarObjeto(partido, registro)
      validarTexto(
        partido.id,
        registro,
        'id'
      )
      validarTexto(
        partido.local,
        registro,
        'local'
      )
      validarTexto(
        partido.visitante,
        registro,
        'visitante'
      )
      validarTexto(
        partido.grupo,
        registro,
        'grupo'
      )
      validarTexto(
        partido.fecha,
        registro,
        'fecha'
      )
      validarTexto(
        partido.hora,
        registro,
        'hora'
      )

      if (
        ![1, 2, 3].includes(
          Number(partido.fechaGrupo)
        )
      ) {
        throw crearError(
          registro,
          '"fechaGrupo" debe ser 1, 2 o 3.'
        )
      }

      if (
        partido.local ===
        partido.visitante
      ) {
        throw crearError(
          registro,
          'un equipo no puede jugar contra sí mismo.'
        )
      }

      const local =
        paisesPorId.get(partido.local)

      const visitante =
        paisesPorId.get(
          partido.visitante
        )

      if (!local || !visitante) {
        throw crearError(
          registro,
          'alguno de los equipos no existe.'
        )
      }

      if (
        local.grupo !== partido.grupo ||
        visitante.grupo !==
          partido.grupo
      ) {
        throw crearError(
          registro,
          'los equipos no pertenecen al grupo indicado.'
        )
      }
    }
  )

  validarIdsUnicos(
    datos.partidos,
    (partido) => partido.id,
    `${origen}.partidos`
  )

  return datos
}

export const validarResultadosFaseGrupos = (
  resultados
) => {
  const origen = 'resultadosReales'

  validarArray(resultados, origen)

  resultados.forEach(
    (resultado, indice) => {
      const registro =
        `${origen}[${indice}]`

      validarObjeto(resultado, registro)
      validarTexto(
        resultado.partidoId,
        registro,
        'partidoId'
      )
      validarTexto(
        resultado.local,
        registro,
        'local'
      )
      validarTexto(
        resultado.visitante,
        registro,
        'visitante'
      )
      validarTexto(
        resultado.grupo,
        registro,
        'grupo'
      )

      if (
        resultado.local ===
        resultado.visitante
      ) {
        throw crearError(
          registro,
          'un equipo no puede jugar contra sí mismo.'
        )
      }
      validarGoles(
        resultado.golesLocal,
        registro,
        'golesLocal',
        true
      )
      validarGoles(
        resultado.golesVisitante,
        registro,
        'golesVisitante',
        true
      )

      const faltaUnResultado =
        (
          resultado.golesLocal ===
            null ||
          resultado.golesLocal ===
            undefined
        ) !==
        (
          resultado.golesVisitante ===
            null ||
          resultado.golesVisitante ===
            undefined
        )

      if (faltaUnResultado) {
        throw crearError(
          registro,
          'los dos goles deben estar cargados o pendientes.'
        )
      }
    }
  )

  validarIdsUnicos(
    resultados,
    (resultado) =>
      resultado.partidoId,
    origen
  )

  return resultados
}

export const validarRanking = (
  usuarios
) => {
  const origen = 'ranking'

  validarArray(usuarios, origen)

  usuarios.forEach(
    (usuario, indice) => {
      const registro =
        `${origen}[${indice}]`

      validarObjeto(usuario, registro)
      validarTexto(
        usuario.id,
        registro,
        'id'
      )
      validarTexto(
        usuario.nombre,
        registro,
        'nombre'
      )

      if (
        !Number.isFinite(
          Number(usuario.puntos)
        ) ||
        Number(usuario.puntos) < 0
      ) {
        throw crearError(
          registro,
          '"puntos" debe ser un número mayor o igual a cero.'
        )
      }
    }
  )

  validarIdsUnicos(
    usuarios,
    (usuario) => usuario.id,
    origen
  )

  return usuarios
}

export const validarPrediccionGrupo = (
  prediccion,
  origen = 'prediccion',
  requiereIdentificador = false
) => {
  validarObjeto(prediccion, origen)
  validarTexto(
    prediccion.userId,
    origen,
    'userId'
  )
  validarTexto(
    prediccion.partidoId,
    origen,
    'partidoId'
  )
  validarTexto(
    prediccion.local,
    origen,
    'local'
  )
  validarTexto(
    prediccion.visitante,
    origen,
    'visitante'
  )
  validarTexto(
    prediccion.grupo,
    origen,
    'grupo'
  )
  validarTexto(
    prediccion.fecha,
    origen,
    'fecha'
  )
  validarTexto(
    prediccion.hora,
    origen,
    'hora'
  )

  if (
    ![1, 2, 3].includes(
      Number(prediccion.fechaGrupo)
    )
  ) {
    throw crearError(
      origen,
      '"fechaGrupo" debe ser 1, 2 o 3.'
    )
  }

  if (
    prediccion.local ===
    prediccion.visitante
  ) {
    throw crearError(
      origen,
      'un equipo no puede jugar contra sí mismo.'
    )
  }
  validarGoles(
    prediccion.golesLocal,
    origen,
    'golesLocal'
  )
  validarGoles(
    prediccion.golesVisitante,
    origen,
    'golesVisitante'
  )

  if (
    requiereIdentificador &&
    !(
      prediccion.usuarioId ??
      prediccion.id
    )
  ) {
    throw crearError(
      origen,
      'falta el identificador del registro.'
    )
  }

  if (
    prediccion.fechaGuardado &&
    Number.isNaN(
      Date.parse(
        prediccion.fechaGuardado
      )
    )
  ) {
    throw crearError(
      origen,
      '"fechaGuardado" no es una fecha válida.'
    )
  }

  return prediccion
}

export const validarPrediccionesGrupo = (
  predicciones
) => {
  const origen = 'predicciones'

  validarArray(predicciones, origen)

  predicciones.forEach(
    (prediccion, indice) => {
      validarPrediccionGrupo(
        prediccion,
        `${origen}[${indice}]`,
        true
      )
    }
  )

  validarIdsUnicos(
    predicciones,
    (prediccion) =>
      `${prediccion.userId}::${prediccion.partidoId}`,
    origen
  )

  return predicciones
}

export const validarPartidoLlave = (
  partido,
  origen = 'partidoLlave'
) => {
  validarObjeto(partido, origen)
  validarTexto(
    partido.partidoId,
    origen,
    'partidoId'
  )
  validarTexto(
    partido.fase,
    origen,
    'fase'
  )
  validarTexto(
    partido.equipo1Id,
    origen,
    'equipo1Id'
  )
  validarTexto(
    partido.equipo2Id,
    origen,
    'equipo2Id'
  )
  validarTexto(
    partido.ganadorId,
    origen,
    'ganadorId'
  )
  validarGoles(
    partido.golesEquipo1,
    origen,
    'golesEquipo1'
  )

  if (
    partido.equipo1Id ===
    partido.equipo2Id
  ) {
    throw crearError(
      origen,
      'un equipo no puede jugar contra sí mismo.'
    )
  }
  validarGoles(
    partido.golesEquipo2,
    origen,
    'golesEquipo2'
  )

  if (
    !FASES_LLAVE.includes(
      partido.fase
    )
  ) {
    throw crearError(
      origen,
      `"fase" debe ser una fase válida.`
    )
  }

  const golesEquipo1 =
    Number(partido.golesEquipo1)

  const golesEquipo2 =
    Number(partido.golesEquipo2)

  const hayEmpate =
    golesEquipo1 === golesEquipo2

  let ganadorCalculado = null

  if (hayEmpate) {
    validarGoles(
      partido.penalesEquipo1,
      origen,
      'penalesEquipo1'
    )
    validarGoles(
      partido.penalesEquipo2,
      origen,
      'penalesEquipo2'
    )

    const penalesEquipo1 =
      Number(partido.penalesEquipo1)

    const penalesEquipo2 =
      Number(partido.penalesEquipo2)

    if (
      penalesEquipo1 ===
      penalesEquipo2
    ) {
      throw crearError(
        origen,
        'la tanda de penales no puede terminar empatada.'
      )
    }

    ganadorCalculado =
      penalesEquipo1 >
      penalesEquipo2
        ? partido.equipo1Id
        : partido.equipo2Id
  } else {
    ganadorCalculado =
      golesEquipo1 > golesEquipo2
        ? partido.equipo1Id
        : partido.equipo2Id
  }

  if (
    partido.ganadorId !==
    ganadorCalculado
  ) {
    throw crearError(
      origen,
      '"ganadorId" no coincide con el resultado.'
    )
  }

  return partido
}

export const validarPartidosLlave = (
  partidos,
  origen = 'partidosLlave'
) => {
  validarArray(partidos, origen)

  partidos.forEach(
    (partido, indice) => {
      validarPartidoLlave(
        partido,
        `${origen}[${indice}]`
      )
    }
  )

  validarIdsUnicos(
    partidos,
    (partido) =>
      `${partido.userId ?? 'real'}::${partido.partidoId}`,
    origen
  )

  return partidos
}

export const validarPrediccionLlave = (
  prediccion,
  origen = 'prediccionLlave',
  requiereIdentificador = false
) => {
  validarPartidoLlave(
    prediccion,
    origen
  )

  validarTexto(
    prediccion.userId,
    origen,
    'userId'
  )

  if (
    requiereIdentificador &&
    !(
      prediccion.id ??
      prediccion.usuarioId
    )
  ) {
    throw crearError(
      origen,
      'falta el identificador del registro.'
    )
  }

  return prediccion
}

export const validarPrediccionesLlave = (
  predicciones
) => {
  const origen =
    'prediccionesLlave'

  validarArray(predicciones, origen)

  predicciones.forEach(
    (prediccion, indice) => {
      validarPrediccionLlave(
        prediccion,
        `${origen}[${indice}]`,
        true
      )
    }
  )

  validarIdsUnicos(
    predicciones,
    (prediccion) =>
      `${prediccion.userId}::${prediccion.partidoId}`,
    origen
  )

  return predicciones
}
