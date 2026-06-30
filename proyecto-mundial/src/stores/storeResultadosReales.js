import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { resultadosRealesAPI } from '@/services/resultadosRealesAPI'
import { resultadosLlaveRealesAPI } from '@/services/resultadosLlaveRealesAPI'
import { prediccionesLlaveAPI } from '@/services/prediccionesLlaveAPI'
import { useDatosProdeStore } from '@/stores/storeDataProde'
import { usePrediccionesStore } from '@/stores/storePredicciones'
import { useStoreUsuario } from '@/stores/storeUsuario'
import { calcularPuntosPartidoLlave } from '@/utils/puntosUtils'

const GRUPOS = [
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

export const useResultadosRealesStore = defineStore(
  'resultadosReales',
  () => {
    const resultados = ref([])
    const resultadosLlave = ref([])
    const prediccionesLlave = ref({})

    const cargando = ref(false)
    const cargandoPuntajeLlave = ref(false)

    const error = ref(null)
    const errorPuntajeLlave = ref(null)

    const dataProdeStore =
      useDatosProdeStore()

    const prediccionesStore =
      usePrediccionesStore()

    const storeUsuario =
      useStoreUsuario()

    const usuarioPuntajeLlaveCargado =
      ref('')

    const inicializar = async () => {
      await dataProdeStore.inicializar()

      if (resultados.value.length === 0) {
        cargando.value = true
        error.value = null

        try {
          const datos =
            await resultadosRealesAPI.obtenerResultados()

          resultados.value = Array.isArray(datos)
            ? datos
            : []
        } catch (err) {
          console.error(
            'Error al cargar resultados reales:',
            err
          )

          error.value = err.message
          resultados.value = []
        } finally {
          cargando.value = false
        }
      }

      await inicializarPuntajeLlave()
    }

    const inicializarPuntajeLlave =
      async () => {
        const usuarioActivoId =
          storeUsuario.usuarioActualId || 'usuario1'

        if (
          resultadosLlave.value.length > 0 &&
          usuarioPuntajeLlaveCargado.value ===
            usuarioActivoId
        ) {
          return
        }

        cargandoPuntajeLlave.value = true
        errorPuntajeLlave.value = null

        try {
          const [
            resultadosRealesLlave,
            prediccionesUsuario
          ] = await Promise.all([
            resultadosLlaveRealesAPI
              .obtenerResultados(),

            prediccionesLlaveAPI
              .obtenerPorUsuario(
                usuarioActivoId
              )
          ])

          resultadosLlave.value =
            resultadosRealesLlave

          prediccionesLlave.value = {}

          prediccionesUsuario.forEach(
            (prediccion) => {
              prediccionesLlave.value[
                prediccion.partidoId
              ] = prediccion
            }
          )

          usuarioPuntajeLlaveCargado.value =
            usuarioActivoId
        } catch (err) {
          console.error(
            'Error al cargar el puntaje de la llave:',
            err
          )

          errorPuntajeLlave.value =
            err.message
        } finally {
          cargandoPuntajeLlave.value = false
        }
      }

    const registrarPrediccionLlave = (
      prediccion
    ) => {
      if (!prediccion?.partidoId) {
        return
      }

      prediccionesLlave.value[
        prediccion.partidoId
      ] = prediccion
    }

    const quitarPrediccionLlave = (
      partidoId
    ) => {
      delete prediccionesLlave.value[
        partidoId
      ]
    }

    const compararEquipos = (
      equipoA,
      equipoB
    ) => {
      if (equipoB.pts !== equipoA.pts) {
        return equipoB.pts - equipoA.pts
      }

      if (equipoB.dg !== equipoA.dg) {
        return equipoB.dg - equipoA.dg
      }

      if (equipoB.gf !== equipoA.gf) {
        return equipoB.gf - equipoA.gf
      }

      return equipoA.nombre.localeCompare(
        equipoB.nombre
      )
    }

    const calcularTablaGrupo = (grupo) => {
      const equiposDelGrupo =
        dataProdeStore.paises.filter(
          (pais) =>
            pais &&
            pais.grupo === grupo
        )

      const tabla = {}

      equiposDelGrupo.forEach((equipo) => {
        tabla[equipo.id] = {
          id: equipo.id,
          nombre: equipo.nombre,
          bandera: equipo.bandera,
          grupo: equipo.grupo,

          pj: 0,
          pg: 0,
          pe: 0,
          pp: 0,

          gf: 0,
          gc: 0,
          dg: 0,
          pts: 0
        }
      })

      const resultadosDelGrupo =
        resultados.value.filter(
          (resultado) =>
            resultado &&
            resultado.grupo === grupo
        )

      resultadosDelGrupo.forEach(
        (partido) => {
          const equipoLocal =
            tabla[partido.local]

          const equipoVisitante =
            tabla[partido.visitante]

          if (
            !equipoLocal ||
            !equipoVisitante
          ) {
            return
          }

          if (
            partido.golesLocal === null ||
            partido.golesLocal === undefined ||
            partido.golesVisitante === null ||
            partido.golesVisitante === undefined
          ) {
            return
          }

          const golesLocal =
            Number(partido.golesLocal)

          const golesVisitante =
            Number(partido.golesVisitante)

          if (
            Number.isNaN(golesLocal) ||
            Number.isNaN(golesVisitante)
          ) {
            return
          }

          equipoLocal.pj += 1
          equipoVisitante.pj += 1

          equipoLocal.gf += golesLocal
          equipoLocal.gc += golesVisitante

          equipoVisitante.gf +=
            golesVisitante

          equipoVisitante.gc +=
            golesLocal

          if (golesLocal > golesVisitante) {
            equipoLocal.pg += 1
            equipoVisitante.pp += 1
            equipoLocal.pts += 3
          } else if (
            golesLocal < golesVisitante
          ) {
            equipoVisitante.pg += 1
            equipoLocal.pp += 1
            equipoVisitante.pts += 3
          } else {
            equipoLocal.pe += 1
            equipoVisitante.pe += 1

            equipoLocal.pts += 1
            equipoVisitante.pts += 1
          }

          equipoLocal.dg =
            equipoLocal.gf -
            equipoLocal.gc

          equipoVisitante.dg =
            equipoVisitante.gf -
            equipoVisitante.gc
        }
      )

      return Object
        .values(tabla)
        .sort(compararEquipos)
    }

    const obtenerTablasReales = () => {
      const tablas = {}

      GRUPOS.forEach((grupo) => {
        tablas[grupo] =
          calcularTablaGrupo(grupo)
      })

      return tablas
    }

    const gruposCompletos = () => {
      return GRUPOS.every((grupo) => {
        const resultadosGrupo =
          resultados.value.filter(
            (resultado) =>
              resultado &&
              resultado.grupo === grupo
          )

        return resultadosGrupo.length >= 6
      })
    }

    const obtenerClasificados = () => {
      const tablas =
        obtenerTablasReales()

      const primeros = {}
      const segundos = {}
      const terceros = []

      GRUPOS.forEach((grupo) => {
        const tabla = tablas[grupo]

        if (!tabla || tabla.length < 3) {
          return
        }

        primeros[grupo] = tabla[0]
        segundos[grupo] = tabla[1]

        terceros.push({
          ...tabla[2],
          grupo
        })
      })

      const mejoresTerceros = [
        ...terceros
      ]
        .sort(compararEquipos)
        .slice(0, 8)

      return {
        primeros,
        segundos,
        terceros,
        mejoresTerceros
      }
    }

    const puntajeFaseGrupos =
      computed(() => {
        let puntosAcumulados = 0

        if (
          !resultados.value ||
          resultados.value.length === 0
        ) {
          return 0
        }

        resultados.value.forEach(
          (partidoReal) => {
            if (!partidoReal) {
              return
            }

            const prediccionUsuario =
              prediccionesStore.predicciones[
                partidoReal.partidoId
              ]

            puntosAcumulados +=
              calcularPuntosPartido(
                prediccionUsuario,
                partidoReal
              )
          }
        )

        return puntosAcumulados
      })

    const puntajeLlaveEliminacion =
      computed(() => {
        return resultadosLlave.value.reduce(
          (puntosAcumulados, resultadoReal) => {
            const prediccion =
              prediccionesLlave.value[
                resultadoReal.partidoId
              ]

            return (
              puntosAcumulados +
              calcularPuntosPartidoLlave(
                prediccion,
                resultadoReal
              )
            )
          },
          0
        )
      })

    const puntajeTotalUsuario =
      computed(() => {
        return (
          puntajeFaseGrupos.value +
          puntajeLlaveEliminacion.value
        )
      })

    return {
      resultados,
      resultadosLlave,
      prediccionesLlave,

      cargando,
      cargandoPuntajeLlave,

      error,
      errorPuntajeLlave,

      inicializar,
      inicializarPuntajeLlave,
      registrarPrediccionLlave,
      quitarPrediccionLlave,

      calcularTablaGrupo,
      obtenerTablasReales,
      obtenerClasificados,
      gruposCompletos,
      compararEquipos,

      puntajeFaseGrupos,
      puntajeLlaveEliminacion,
      puntajeTotalUsuario
    }
  }
)

function calcularPuntosPartido(
  prediccion,
  resultadoReal
) {
  if (!prediccion || !resultadoReal) {
    return 0
  }

  if (
    resultadoReal.golesLocal === null ||
    resultadoReal.golesLocal === undefined ||
    resultadoReal.golesVisitante === null ||
    resultadoReal.golesVisitante === undefined
  ) {
    return 0
  }

  if (
    prediccion.golesLocal === null ||
    prediccion.golesLocal === undefined ||
    prediccion.golesVisitante === null ||
    prediccion.golesVisitante === undefined
  ) {
    return 0
  }

  const golesLocalPredichos =
    Number(prediccion.golesLocal)

  const golesVisitantePredichos =
    Number(prediccion.golesVisitante)

  const golesLocalReales =
    Number(resultadoReal.golesLocal)

  const golesVisitanteReales =
    Number(resultadoReal.golesVisitante)

  if (
    Number.isNaN(golesLocalPredichos) ||
    Number.isNaN(golesVisitantePredichos) ||
    Number.isNaN(golesLocalReales) ||
    Number.isNaN(golesVisitanteReales)
  ) {
    return 0
  }

  if (
    golesLocalPredichos ===
      golesLocalReales &&
    golesVisitantePredichos ===
      golesVisitanteReales
  ) {
    return 6
  }

  const tendenciaPredicha =
    Math.sign(
      golesLocalPredichos -
      golesVisitantePredichos
    )

  const tendenciaReal =
    Math.sign(
      golesLocalReales -
      golesVisitanteReales
    )

  if (
    tendenciaPredicha === tendenciaReal
  ) {
    return 3
  }

  return 0
}
