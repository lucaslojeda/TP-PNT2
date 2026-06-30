/**
 * ============================================================
 * NOTA DE ESTUDIO - llaveUtils.js
 * ============================================================
 * Acá vive el algoritmo más "pesado" de todo el proyecto: un
 * BACKTRACKING para asignar los 8 "mejores terceros" del
 * Mundial a los 8 lugares del bracket que les corresponden,
 * respetando las restricciones oficiales de la FIFA (qué grupos
 * puede enfrentar cada lugar).
 *
 * EL PROBLEMA:
 * Tenés 8 terceros clasificados (de grupos que varían partido a
 * partido) y 8 "lugares" en el bracket, cada uno con su propia
 * lista de grupos permitidos (ver LUGARES_PARA_TERCEROS). No es
 * trivial asignarlos en un solo paso: una asignación temprana
 * puede dejar sin opciones válidas a un lugar posterior.
 *
 * asignarMejoresTerceros() resuelve esto con backtracking
 * clásico (mismo patrón que sudoku o N-reinas):
 *   1. Para el lugar actual (indiceLugar), prueba cada tercero
 *      disponible.
 *   2. Si el grupo del tercero está permitido en ese lugar, lo
 *      asigna PROVISORIAMENTE y se llama a sí misma para
 *      resolver el siguiente lugar con los terceros restantes.
 *   3. Si la recursión llega hasta el final sin trabarse,
 *      devuelve true y la asignación queda confirmada.
 *   4. Si se traba (ningún tercero sirve para un lugar
 *      posterior), hace `delete asignaciones[lugar.clave]`:
 *      ESE es el "backtrack", deshace lo hecho y prueba la
 *      siguiente opción para el lugar actual.
 *
 * generarCrucesDieciseisavos() valida que estén todos los
 * clasificados, resuelve los terceros con el backtracking de
 * arriba, y arma el array fijo de 16 cruces siguiendo el
 * reglamento real del Mundial (la tabla oficial de la FIFA
 * llevada a código).
 *
 * El resto son helpers simples:
 * - crearPartido/normalizarEquipo: fábrica de un partido vacío.
 * - crearRondas: arma los 5 arrays de partidos (16avos ya
 *   completos, el resto vacíos, listos para llenarse vía
 *   avanzarGanador en el store).
 * - obtenerFaseSiguiente: siguiente elemento en ORDEN_FASES.
 * - obtenerGanador: dado ganadorId, devuelve el objeto equipo.
 * - limpiarPrediccionPartido: resetea un partido a su estado
 *   inicial (usado por limpiarDescendencia en el store).
 * ============================================================
 */
export const ORDEN_FASES = [
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semifinales',
  'final'
]

export const GRUPOS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L'
]

const LUGARES_PARA_TERCEROS = [
  {
    clave: 'partido-74',
    gruposPermitidos: [
      'A',
      'B',
      'C',
      'D',
      'F'
    ]
  },
  {
    clave: 'partido-77',
    gruposPermitidos: [
      'C',
      'D',
      'F',
      'G',
      'H'
    ]
  },
  {
    clave: 'partido-79',
    gruposPermitidos: [
      'C',
      'E',
      'F',
      'H',
      'I'
    ]
  },
  {
    clave: 'partido-80',
    gruposPermitidos: [
      'E',
      'H',
      'I',
      'J',
      'K'
    ]
  },
  {
    clave: 'partido-81',
    gruposPermitidos: [
      'B',
      'E',
      'F',
      'I',
      'J'
    ]
  },
  {
    clave: 'partido-82',
    gruposPermitidos: [
      'A',
      'E',
      'H',
      'I',
      'J'
    ]
  },
  {
    clave: 'partido-85',
    gruposPermitidos: [
      'E',
      'F',
      'G',
      'I',
      'J'
    ]
  },
  {
    clave: 'partido-87',
    gruposPermitidos: [
      'D',
      'E',
      'I',
      'J',
      'L'
    ]
  }
]

export const normalizarEquipo = (
  equipo
) => {
  if (!equipo) {
    return null
  }

  return {
    ...equipo,
    id: equipo.id ?? equipo.codigo
  }
}

export const crearPartido = (
  id,
  fase,
  equipo1 = null,
  equipo2 = null
) => {
  return {
    id,
    fase,

    equipo1:
      normalizarEquipo(equipo1),

    equipo2:
      normalizarEquipo(equipo2),

    golesEquipo1: null,
    golesEquipo2: null,

    penalesEquipo1: null,
    penalesEquipo2: null,

    ganadorId: null,
    prediccionGuardada: false
  }
}

export const crearRondas = (
  crucesDieciseisavos
) => {
  const partidosDieciseisavos =
    crucesDieciseisavos.map(
      (cruce, indice) => {
        return crearPartido(
          `dieciseisavos-${indice + 1}`,
          'dieciseisavos',
          cruce.equipo1,
          cruce.equipo2
        )
      }
    )

  const partidosOctavos =
    Array.from(
      { length: 8 },
      (_, indice) => {
        return crearPartido(
          `octavos-${indice + 1}`,
          'octavos'
        )
      }
    )

  const partidosCuartos =
    Array.from(
      { length: 4 },
      (_, indice) => {
        return crearPartido(
          `cuartos-${indice + 1}`,
          'cuartos'
        )
      }
    )

  const partidosSemifinales =
    Array.from(
      { length: 2 },
      (_, indice) => {
        return crearPartido(
          `semifinales-${indice + 1}`,
          'semifinales'
        )
      }
    )

  const partidosFinal = [
    crearPartido(
      'final-1',
      'final'
    )
  ]

  return {
    partidosDieciseisavos,
    partidosOctavos,
    partidosCuartos,
    partidosSemifinales,
    partidosFinal
  }
}

const asignarMejoresTerceros = (
  mejoresTerceros
) => {
  const asignaciones = {}

  const buscarAsignacion = (
    indiceLugar,
    tercerosDisponibles
  ) => {
    if (
      indiceLugar ===
      LUGARES_PARA_TERCEROS.length
    ) {
      return true
    }

    const lugar =
      LUGARES_PARA_TERCEROS[
        indiceLugar
      ]

    for (
      let indiceTercero = 0;
      indiceTercero <
      tercerosDisponibles.length;
      indiceTercero++
    ) {
      const tercero =
        tercerosDisponibles[
          indiceTercero
        ]

      const grupoPermitido =
        lugar.gruposPermitidos.includes(
          tercero.grupo
        )

      if (!grupoPermitido) {
        continue
      }

      asignaciones[lugar.clave] =
        tercero

      const tercerosRestantes =
        tercerosDisponibles.filter(
          (_, indice) =>
            indice !== indiceTercero
        )

      const asignacionCompleta =
        buscarAsignacion(
          indiceLugar + 1,
          tercerosRestantes
        )

      if (asignacionCompleta) {
        return true
      }

      delete asignaciones[
        lugar.clave
      ]
    }

    return false
  }

  const pudoAsignar =
    buscarAsignacion(
      0,
      mejoresTerceros
    )

  if (!pudoAsignar) {
    throw new Error(
      'No fue posible asignar los mejores terceros a los cruces.'
    )
  }

  return asignaciones
}

export const generarCrucesDieciseisavos = (
  clasificados
) => {
  const {
    primeros,
    segundos,
    mejoresTerceros
  } = clasificados

  const faltanClasificados =
    GRUPOS.some((grupo) => {
      return (
        !primeros[grupo] ||
        !segundos[grupo]
      )
    })

  if (faltanClasificados) {
    throw new Error(
      'No están definidos los primeros y segundos de todos los grupos.'
    )
  }

  if (
    !Array.isArray(
      mejoresTerceros
    ) ||
    mejoresTerceros.length < 8
  ) {
    throw new Error(
      'No hay suficientes mejores terceros para formar los dieciseisavos.'
    )
  }

  const tercerosAsignados =
    asignarMejoresTerceros(
      mejoresTerceros
    )

  return [
    {
      equipo1: segundos.A,
      equipo2: segundos.B
    },
    {
      equipo1: primeros.E,
      equipo2:
        tercerosAsignados[
          'partido-74'
        ]
    },

    {
      equipo1: primeros.F,
      equipo2: segundos.C
    },
    {
      equipo1: primeros.C,
      equipo2: segundos.F
    },

    {
      equipo1: primeros.I,
      equipo2:
        tercerosAsignados[
          'partido-77'
        ]
    },
    {
      equipo1: segundos.E,
      equipo2: segundos.I
    },

    {
      equipo1: primeros.A,
      equipo2:
        tercerosAsignados[
          'partido-79'
        ]
    },
    {
      equipo1: primeros.L,
      equipo2:
        tercerosAsignados[
          'partido-80'
        ]
    },

    {
      equipo1: primeros.D,
      equipo2:
        tercerosAsignados[
          'partido-81'
        ]
    },
    {
      equipo1: primeros.G,
      equipo2:
        tercerosAsignados[
          'partido-82'
        ]
    },

    {
      equipo1: segundos.K,
      equipo2: segundos.L
    },
    {
      equipo1: primeros.H,
      equipo2: segundos.J
    },

    {
      equipo1: primeros.B,
      equipo2:
        tercerosAsignados[
          'partido-85'
        ]
    },
    {
      equipo1: primeros.J,
      equipo2: segundos.H
    },

    {
      equipo1: primeros.K,
      equipo2:
        tercerosAsignados[
          'partido-87'
        ]
    },
    {
      equipo1: segundos.D,
      equipo2: segundos.G
    }
  ]
}

export const obtenerFaseSiguiente = (
  fase
) => {
  const indiceFase =
    ORDEN_FASES.indexOf(fase)

  if (
    indiceFase === -1 ||
    indiceFase ===
      ORDEN_FASES.length - 1
  ) {
    return null
  }

  return ORDEN_FASES[
    indiceFase + 1
  ]
}

export const obtenerGanador = (
  partido
) => {
  if (!partido?.ganadorId) {
    return null
  }

  if (
    partido.equipo1?.id ===
    partido.ganadorId
  ) {
    return partido.equipo1
  }

  if (
    partido.equipo2?.id ===
    partido.ganadorId
  ) {
    return partido.equipo2
  }

  return null
}

export const limpiarPrediccionPartido = (
  partido
) => {
  partido.golesEquipo1 = null
  partido.golesEquipo2 = null

  partido.penalesEquipo1 = null
  partido.penalesEquipo2 = null

  partido.ganadorId = null
  partido.prediccionGuardada = false
}