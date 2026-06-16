import { defineStore } from 'pinia'
import { ref } from 'vue'
import { resultadosRealesAPI } from '@/services/resultadosRealesAPI'
import datosProde from '@/dataProde.json'

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
    const cargando = ref(false)
    const error = ref(null)

    /*
      Trae los resultados reales desde Mockachino.

      Si ya fueron cargados anteriormente, no vuelve
      a hacer la petición.
    */
    const inicializar = async () => {
      if (resultados.value.length > 0) {
        return
      }

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

    /*
      Criterios que actualmente usa el proyecto
      para ordenar equipos.

      1. Puntos
      2. Diferencia de gol
      3. Goles a favor
      4. Nombre
    */
    const compararEquipos = (equipoA, equipoB) => {
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

    /*
      Calcula la tabla de posiciones de un grupo.
    */
    const calcularTablaGrupo = (grupo) => {
      const equiposDelGrupo =
        datosProde.paises.filter(
          (pais) => pais.grupo === grupo
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
          (resultado) => resultado.grupo === grupo
        )

      resultadosDelGrupo.forEach((partido) => {
        const equipoLocal =
          tabla[partido.local]

        const equipoVisitante =
          tabla[partido.visitante]

        if (!equipoLocal || !equipoVisitante) {
          return
        }

        const golesLocal =
          Number(partido.golesLocal)

        const golesVisitante =
          Number(partido.golesVisitante)

        /*
          Evita calcular partidos que todavía
          no tengan un resultado válido.
        */
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

        equipoVisitante.gf += golesVisitante
        equipoVisitante.gc += golesLocal

        if (golesLocal > golesVisitante) {
          equipoLocal.pg += 1
          equipoVisitante.pp += 1
          equipoLocal.pts += 3
        } else if (golesLocal < golesVisitante) {
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
          equipoLocal.gf - equipoLocal.gc

        equipoVisitante.dg =
          equipoVisitante.gf -
          equipoVisitante.gc
      })

      return Object
        .values(tabla)
        .sort(compararEquipos)
    }

    /*
      Calcula las tablas de los 12 grupos.
    */
    const obtenerTablasReales = () => {
      const tablas = {}

      GRUPOS.forEach((grupo) => {
        tablas[grupo] =
          calcularTablaGrupo(grupo)
      })

      return tablas
    }

    /*
      Determina si todos los partidos de grupos
      tienen resultados cargados.

      En el Mundial hay 6 partidos por grupo.
    */
    const gruposCompletos = () => {
      return GRUPOS.every((grupo) => {
        const resultadosGrupo =
          resultados.value.filter(
            (resultado) =>
              resultado.grupo === grupo
          )

        return resultadosGrupo.length >= 6
      })
    }

    /*
      Obtiene:

      - los 12 primeros;
      - los 12 segundos;
      - los 8 mejores terceros.
    */
    const obtenerClasificados = () => {
      const tablas = obtenerTablasReales()

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

      const mejoresTerceros = terceros
        .sort(compararEquipos)
        .slice(0, 8)

      return {
        primeros,
        segundos,
        terceros,
        mejoresTerceros
      }
    }

    return {
      resultados,
      cargando,
      error,

      inicializar,
      calcularTablaGrupo,
      obtenerTablasReales,
      obtenerClasificados,
      gruposCompletos,
      compararEquipos
    }
  }
)