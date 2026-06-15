// import { defineStore } from 'pinia'
// import { ref } from 'vue'
// import { resultadosRealesAPI } from '@/services/resultadosRealesAPI'
// import datosProde from '@/dataProde.json'

// export const useResultadosRealesStore = defineStore('resultadosReales', () => {
//   const resultados = ref([])
//   const cargando = ref(false)

//   const generarGolesAleatorios = () => Math.floor(Math.random() * 5)

//   const inicializar = async () => {
//     cargando.value = true
//     try {
//       const datos = await resultadosRealesAPI.obtenerResultados()

//       if (datos.length > 0) {
//         resultados.value = datos
//       } else {
//         await generarYGuardarResultados()
//       }
//     } catch (error) {
//       console.error('Error al inicializar resultados reales:', error)
//     } finally {
//       cargando.value = false
//     }
//   }

//   const generarYGuardarResultados = async () => {
//     const nuevosResultados = []

//     for (const partido of datosProde.partidos) {
//       const resultado = {
//         partidoId: partido.id,
//         local: partido.local,
//         visitante: partido.visitante,
//         golesLocal: generarGolesAleatorios(),
//         golesVisitante: generarGolesAleatorios(),
//         grupo: partido.grupo
//       }

//       try {
//         const guardado = await resultadosRealesAPI.guardarResultado(resultado)
//         nuevosResultados.push(guardado)
//       } catch (error) {
//         console.error(`Error al guardar partido ${partido.id}:`, error)
//       }
//     }

//     resultados.value = nuevosResultados
//   }

//   const calcularTablaGrupo = (grupo) => {
//     const equiposDelGrupo = datosProde.paises.filter(pais => pais.grupo === grupo)

//     const tabla = {}
//     equiposDelGrupo.forEach(equipo => {
//       tabla[equipo.id] = {
//         id: equipo.id,
//         nombre: equipo.nombre,
//         bandera: equipo.bandera,
//         grupo: equipo.grupo,
//         pj: 0, pg: 0, pe: 0, pp: 0,
//         gf: 0, gc: 0, dg: 0, pts: 0
//       }
//     })

//     const resultadosDelGrupo = resultados.value.filter(r => r.grupo === grupo)

//     resultadosDelGrupo.forEach(partido => {
//       const equipoLocal = tabla[partido.local]
//       const equipoVisitante = tabla[partido.visitante]

//       if (!equipoLocal || !equipoVisitante) return

//       equipoLocal.pj++
//       equipoVisitante.pj++
//       equipoLocal.gf += Number(partido.golesLocal)
//       equipoLocal.gc += Number(partido.golesVisitante)
//       equipoVisitante.gf += Number(partido.golesVisitante)
//       equipoVisitante.gc += Number(partido.golesLocal)

//       if (partido.golesLocal > partido.golesVisitante) {
//         equipoLocal.pg++
//         equipoVisitante.pp++
//         equipoLocal.pts += 3
//       } else if (partido.golesLocal < partido.golesVisitante) {
//         equipoVisitante.pg++
//         equipoLocal.pp++
//         equipoVisitante.pts += 3
//       } else {
//         equipoLocal.pe++
//         equipoVisitante.pe++
//         equipoLocal.pts += 1
//         equipoVisitante.pts += 1
//       }

//       equipoLocal.dg = equipoLocal.gf - equipoLocal.gc
//       equipoVisitante.dg = equipoVisitante.gf - equipoVisitante.gc
//     })

//     return Object.values(tabla).sort((a, b) => {
//       if (b.pts !== a.pts) return b.pts - a.pts
//       if (b.dg !== a.dg) return b.dg - a.dg
//       if (b.gf !== a.gf) return b.gf - a.gf
//       return a.nombre.localeCompare(b.nombre)
//     })
//   }

//   return {
//     resultados,
//     cargando,
//     inicializar,
//     calcularTablaGrupo
//   }
// })

//ULTIMA ACTUALIZACION

/*

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { resultadosRealesAPI } from '@/services/resultadosRealesAPI'
import datosProde from '@/dataProde.json'

export const useResultadosRealesStore = defineStore('resultadosReales', () => {
  const resultados = ref([])
  const cargando = ref(false)

  const inicializar = async () => {
    if (resultados.value.length > 0) return
    cargando.value = true
    try {
      resultados.value = await resultadosRealesAPI.obtenerResultados()
    } catch (error) {
      console.error('Error al cargar resultados reales:', error)
    } finally {
      cargando.value = false
    }
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

  return { resultados, cargando, inicializar, calcularTablaGrupo }
})

*/

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { resultadosRealesAPI } from '@/services/resultadosRealesAPI'
import { usePrediccionesStore } from './storePredicciones' // ¡Arreglado el nombre del export!
import datosProde from '@/dataProde.json'

export const useResultadosRealesStore = defineStore('resultadosReales', () => {
  const resultados = ref([])
  const cargando = ref(false)

  // Instanciamos el store de predicciones con su nombre real
  const storePredicciones = usePrediccionesStore()

  const inicializar = async () => {
    if (resultados.value && resultados.value.length > 0) return
    cargando.value = true
    try {
      resultados.value = await resultadosRealesAPI.obtenerResultados() || []
    } catch (error) {
      console.error('Error al cargar resultados reales:', error)
      resultados.value = []
    } finally {
      cargando.value = false
    }
  }

  // ==========================================
  // LÓGICA REPARADA: PUNTAJE COMPUTADO EN VIVO
  // ==========================================
  const puntajeTotalUsuario = computed(() => {
    let puntosAcumulados = 0

    // Si todavía no se cargaron resultados de la API, devolvemos 0
    if (!resultados.value || resultados.value.length === 0) return 0

    resultados.value.forEach((partidoReal) => {
      if (!partidoReal) return

      // ¡FIX CLAVE!: Como 'storePredicciones.predicciones' es un objeto {}, 
      // accedemos directo con la clave [partidoReal.partidoId] en vez de usar .find()
      const prediccionUsuario = storePredicciones.predicciones[partidoReal.partidoId]

      // Ejecutamos el calculador y sumamos los puntos correspondientes
      puntosAcumulados += calcularPuntosPartido(prediccionUsuario, partidoReal)
    })

    return puntosAcumulados
  })

  // ==========================================
  // MÉTODO PARA GENERAR LA TABLA DE POSICIONES
  // ==========================================
  const calcularTablaGrupo = (grupo) => {
    const equiposDelGrupo = datosProde.paises.filter(pais => pais && pais.grupo === grupo)

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

    const listaResultados = resultados.value || []
    const resultadosDelGrupo = listaResultados.filter(r => r && r.grupo === grupo)

    resultadosDelGrupo.forEach(partido => {
      const equipoLocal = tabla[partido.local]
      const equipoVisitante = tabla[partido.visitante]

      if (!equipoLocal || !equipoVisitante) return

      equipoLocal.pj++
      equipoVisitante.pj++
      equipoLocal.gf += Number(partido.golesLocal || 0)
      equipoLocal.gc += Number(partido.golesVisitante || 0)
      equipoVisitante.gf += Number(partido.golesVisitante || 0)
      equipoVisitante.gc += Number(partido.golesLocal || 0)

      const gL = Number(partido.golesLocal || 0)
      const gV = Number(partido.golesVisitante || 0)

      if (gL > gV) {
        equipoLocal.pg++
        equipoVisitante.pp++
        equipoLocal.pts += 3
      } else if (gL < gV) {
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

  return { resultados, cargando, inicializar, calcularTablaGrupo, puntajeTotalUsuario }
})

// ==========================================
// FUNCIÓN AUXILIAR: El cerebro del cálculo
// ==========================================
function calcularPuntosPartido(prediccion, resultadoReal) {
  if (!prediccion || !resultadoReal) return 0
  if (resultadoReal.golesLocal === null || resultadoReal.golesVisitante === null) return 0
  if (prediccion.golesLocal === null || prediccion.golesVisitante === null) return 0

  const pGolesL = parseInt(prediccion.golesLocal)
  const pGolesV = parseInt(prediccion.golesVisitante)
  const rGolesL = parseInt(resultadoReal.golesLocal)
  const rGolesV = parseInt(resultadoReal.golesVisitante)

  if (isNaN(pGolesL) || isNaN(pGolesV) || isNaN(rGolesL) || isNaN(rGolesV)) return 0

  // 1. Acierto exacto -> 6 puntos
  if (pGolesL === rGolesL && pGolesV === rGolesV) return 6

  const predijoGanaLocal = pGolesL > pGolesV
  const predijoGanaVisitante = pGolesV > pGolesL
  const predijoEmpate = pGolesL === pGolesV

  const realGanaLocal = rGolesL > rGolesV
  const realGanaVisitante = rGolesV > rGolesL
  const realEmpate = rGolesL === rGolesV

  // 2. Acierto de tendencia -> 3 puntos
  if (
    (predijoGanaLocal && realGanaLocal) ||
    (predijoGanaVisitante && realGanaVisitante) ||
    (predijoEmpate && realEmpate)
  ) {
    return 3
  }

  return 0
}