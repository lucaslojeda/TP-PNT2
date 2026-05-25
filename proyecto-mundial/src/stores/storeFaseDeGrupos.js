import { defineStore } from 'pinia'
import datosProde from '@/dataProde.json'
import { usePrediccionesStore } from '@/stores/storePredicciones'

export const useFaseGruposStore = defineStore('faseGrupos', () => {
  const calcularTablaGrupo = (grupo) => {
    const prediccionesStore = usePrediccionesStore()

    const equiposDelGrupo = datosProde.paises.filter(pais => pais.grupo === grupo)

    const tabla = {}

    equiposDelGrupo.forEach(equipo => {
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

    const prediccionesDelGrupo = Object.values(prediccionesStore.predicciones)
      .filter(prediccion => prediccion.grupo === grupo)

    prediccionesDelGrupo.forEach(prediccion => {
      const equipoLocal = tabla[prediccion.local]
      const equipoVisitante = tabla[prediccion.visitante]

      if (!equipoLocal || !equipoVisitante) {
        return
      }

      const golesLocal = prediccion.golesLocal
      const golesVisitante = prediccion.golesVisitante

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
      } else if (golesLocal < golesVisitante) {
        equipoVisitante.pg++
        equipoLocal.pp++

        equipoVisitante.pts += 3
      } else {
        equipoLocal.pe++
        equipoVisitante.pe++

        equipoLocal.pts += 1
        equipoVisitante.pts += 1
      }

      equipoLocal.dg = equipoLocal.gf - equipoLocal.gc
      equipoVisitante.dg = equipoVisitante.gf - equipoVisitante.gc
    })

    return Object.values(tabla).sort((a, b) => {
      if (b.pts !== a.pts) {
        return b.pts - a.pts
      }

      if (b.dg !== a.dg) {
        return b.dg - a.dg
      }

      if (b.gf !== a.gf) {
        return b.gf - a.gf
      }

      return a.nombre.localeCompare(b.nombre)
    })
  }

  return {
    calcularTablaGrupo
  }
})