import { defineStore } from 'pinia'
import { ref } from 'vue'
import { resultadosRealesAPI } from '@/services/resultadosRealesAPI'
import datosProde from '@/dataProde.json'

export const useResultadosRealesStore = defineStore('resultadosReales', () => {
  const resultados = ref([])
  const cargando = ref(false)

  const generarGolesAleatorios = () => Math.floor(Math.random() * 5)

  const inicializar = async () => {
    cargando.value = true
    try {
      const datos = await resultadosRealesAPI.obtenerResultados()

      if (datos.length > 0) {
        resultados.value = datos
      } else {
        await generarYGuardarResultados()
      }
    } catch (error) {
      console.error('Error al inicializar resultados reales:', error)
    } finally {
      cargando.value = false
    }
  }

  const generarYGuardarResultados = async () => {
    const nuevosResultados = []

    for (const partido of datosProde.partidos) {
      const resultado = {
        partidoId: partido.id,
        local: partido.local,
        visitante: partido.visitante,
        golesLocal: generarGolesAleatorios(),
        golesVisitante: generarGolesAleatorios(),
        grupo: partido.grupo
      }

      try {
        const guardado = await resultadosRealesAPI.guardarResultado(resultado)
        nuevosResultados.push(guardado)
      } catch (error) {
        console.error(`Error al guardar partido ${partido.id}:`, error)
      }
    }

    resultados.value = nuevosResultados
  }

  const calcularTablaGrupo = (grupo) => {
    const equiposDelGrupo = datosProde.paises.filter(pais => pais.grupo === grupo)

    const tabla = {}
    equiposDelGrupo.forEach(equipo => {
      tabla[equipo.id] = {
        id: equipo.id,
        nombre: equipo.nombre,
        bandera: equipo.bandera,
        grupo: equipo.grupo,
        pj: 0, pg: 0, pe: 0, pp: 0,
        gf: 0, gc: 0, dg: 0, pts: 0
      }
    })

    const resultadosDelGrupo = resultados.value.filter(r => r.grupo === grupo)

    resultadosDelGrupo.forEach(partido => {
      const equipoLocal = tabla[partido.local]
      const equipoVisitante = tabla[partido.visitante]

      if (!equipoLocal || !equipoVisitante) return

      equipoLocal.pj++
      equipoVisitante.pj++
      equipoLocal.gf += Number(partido.golesLocal)
      equipoLocal.gc += Number(partido.golesVisitante)
      equipoVisitante.gf += Number(partido.golesVisitante)
      equipoVisitante.gc += Number(partido.golesLocal)

      if (partido.golesLocal > partido.golesVisitante) {
        equipoLocal.pg++
        equipoVisitante.pp++
        equipoLocal.pts += 3
      } else if (partido.golesLocal < partido.golesVisitante) {
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
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.dg !== a.dg) return b.dg - a.dg
      if (b.gf !== a.gf) return b.gf - a.gf
      return a.nombre.localeCompare(b.nombre)
    })
  }

  return {
    resultados,
    cargando,
    inicializar,
    calcularTablaGrupo
  }
})