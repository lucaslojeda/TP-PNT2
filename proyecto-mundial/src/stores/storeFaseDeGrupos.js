/**
 * ============================================================
 * NOTA DE ESTUDIO - storeFaseDeGrupos.js
 * ============================================================
 * OJO: este store es el "gemelo" de calcularTablaGrupo() en
 * storeResultadosReales.js, pero con una diferencia clave:
 *
 * - storeResultadosReales.calcularTablaGrupo() arma la tabla
 *   con los RESULTADOS REALES (resultados.value), o sea la
 *   tabla de posiciones real del Mundial.
 * - storeFaseDeGrupos.calcularTablaGrupo() arma la tabla con
 *   las PREDICCIONES del usuario (prediccionesStore.predicciones
 *   filtradas por grupo), o sea "cómo quedaría la tabla si se
 *   cumplieran tus pronósticos".
 *
 * La lógica interna (sumar PJ/PG/PE/PP/GF/GC/DG/PTS y ordenar
 * por el mismo criterio de desempate: puntos -> diferencia de
 * gol -> goles a favor -> nombre) es prácticamente idéntica a
 * propósito, para que la tabla "predicha" se vea y compare
 * igual que la tabla "real". Esto es lo que probablemente uses
 * en la vista de fase de grupos para mostrarle al usuario cómo
 * va quedando su pronóstico antes de que termine la fase.
 * ============================================================
 */
import { defineStore } from 'pinia'

import { useDatosProdeStore } from '@/stores/storeDataProde'
import { usePrediccionesStore } from '@/stores/storePredicciones'

export const useFaseGruposStore = defineStore(
  'faseGrupos',
  () => {
    const dataProdeStore = useDatosProdeStore()
    const prediccionesStore = usePrediccionesStore()

    const calcularTablaGrupo = (grupo) => {
      const equiposDelGrupo =
        dataProdeStore.paises.filter((pais) => {
          return pais.grupo === grupo
        })

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

      const prediccionesDelGrupo = Object.values(
        prediccionesStore.predicciones
      ).filter((prediccion) => {
        return prediccion.grupo === grupo
      })

      prediccionesDelGrupo.forEach((prediccion) => {
        const equipoLocal =
          tabla[prediccion.local]

        const equipoVisitante =
          tabla[prediccion.visitante]

        if (!equipoLocal || !equipoVisitante) {
          return
        }

        const golesLocal =
          Number(prediccion.golesLocal)

        const golesVisitante =
          Number(prediccion.golesVisitante)

        equipoLocal.pj++
        equipoVisitante.pj++

        equipoLocal.gf += golesLocal
        equipoLocal.gc += golesVisitante

        equipoVisitante.gf += golesVisitante
        equipoVisitante.gc += golesLocal

        if (golesLocal > golesVisitante) {
          equipoLocal.pg++
          equipoVisitante.pp++

          equipoLocal.pts += 3
        } else if (
          golesLocal < golesVisitante
        ) {
          equipoVisitante.pg++
          equipoLocal.pp++

          equipoVisitante.pts += 3
        } else {
          equipoLocal.pe++
          equipoVisitante.pe++

          equipoLocal.pts += 1
          equipoVisitante.pts += 1
        }

        equipoLocal.dg =
          equipoLocal.gf - equipoLocal.gc

        equipoVisitante.dg =
          equipoVisitante.gf -
          equipoVisitante.gc
      })

      return Object.values(tabla).sort(
        (equipoA, equipoB) => {
          if (
            equipoB.pts !== equipoA.pts
          ) {
            return (
              equipoB.pts - equipoA.pts
            )
          }

          if (
            equipoB.dg !== equipoA.dg
          ) {
            return equipoB.dg - equipoA.dg
          }

          if (
            equipoB.gf !== equipoA.gf
          ) {
            return equipoB.gf - equipoA.gf
          }

          return equipoA.nombre.localeCompare(
            equipoB.nombre
          )
        }
      )
    }

    return {
      calcularTablaGrupo
    }
  }
)