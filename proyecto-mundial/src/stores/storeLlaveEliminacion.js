import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useResultadosRealesStore } from '@/stores/storeResultadosReales'
import { prediccionesLlaveAPI } from '@/services/prediccionesLlaveAPI'

import {
  ORDEN_FASES,
  crearRondas,
  generarCrucesDieciseisavos,
  obtenerFaseSiguiente,
  obtenerGanador,
  limpiarPrediccionPartido
} from '@/utils/llaveUtils'

const USUARIO_ID = 'usuario1'

export const useLlaveEliminacionStore =
  defineStore('llaveEliminacion', () => {
    const resultadosRealesStore =
      useResultadosRealesStore()

    const partidosDieciseisavos = ref([])
    const partidosOctavos = ref([])
    const partidosCuartos = ref([])
    const partidosSemifinales = ref([])
    const partidosFinal = ref([])

    const cargando = ref(false)
    const error = ref(null)

    const asignarRondas = (rondas) => {
      partidosDieciseisavos.value =
        rondas.partidosDieciseisavos

      partidosOctavos.value =
        rondas.partidosOctavos

      partidosCuartos.value =
        rondas.partidosCuartos

      partidosSemifinales.value =
        rondas.partidosSemifinales

      partidosFinal.value =
        rondas.partidosFinal
    }

    const obtenerPartidosPorFase = (
      fase
    ) => {
      if (fase === 'dieciseisavos') {
        return partidosDieciseisavos.value
      }

      if (fase === 'octavos') {
        return partidosOctavos.value
      }

      if (fase === 'cuartos') {
        return partidosCuartos.value
      }

      if (fase === 'semifinales') {
        return partidosSemifinales.value
      }

      if (fase === 'final') {
        return partidosFinal.value
      }

      return []
    }

    const buscarPartido = (
      fase,
      partidoId
    ) => {
      return obtenerPartidosPorFase(
        fase
      ).find((partido) => {
        return partido.id === partidoId
      })
    }

    const avanzarGanador = (partido) => {
      const ganador =
        obtenerGanador(partido)

      const faseSiguiente =
        obtenerFaseSiguiente(
          partido.fase
        )

      if (!ganador || !faseSiguiente) {
        return
      }

      const partidosActuales =
        obtenerPartidosPorFase(
          partido.fase
        )

      const partidosSiguientes =
        obtenerPartidosPorFase(
          faseSiguiente
        )

      const indiceActual =
        partidosActuales.findIndex(
          (partidoActual) => {
            return (
              partidoActual.id ===
              partido.id
            )
          }
        )

      if (indiceActual === -1) {
        return
      }

      const indiceSiguiente =
        Math.floor(indiceActual / 2)

      const partidoSiguiente =
        partidosSiguientes[
          indiceSiguiente
        ]

      if (!partidoSiguiente) {
        return
      }

      if (indiceActual % 2 === 0) {
        partidoSiguiente.equipo1 =
          ganador
      } else {
        partidoSiguiente.equipo2 =
          ganador
      }
    }

    const guardarPrediccion = async (
      datosPrediccion
    ) => {
      error.value = null

      const partido = buscarPartido(
        datosPrediccion.fase,
        datosPrediccion.partidoId
      )

      if (!partido) {
        error.value =
          'No se encontró el partido.'

        return
      }

      if (
        !partido.equipo1 ||
        !partido.equipo2
      ) {
        error.value =
          'Todavía no están definidos los dos equipos.'

        return
      }

      try {
        const hayEmpate =
          Number(
            datosPrediccion.golesEquipo1
          ) ===
          Number(
            datosPrediccion.golesEquipo2
          )

        const prediccion = {
          userId: USUARIO_ID,
          partidoId: partido.id,
          fase: partido.fase,

          equipo1Id:
            partido.equipo1.id,

          equipo2Id:
            partido.equipo2.id,

          golesEquipo1: Number(
            datosPrediccion.golesEquipo1
          ),

          golesEquipo2: Number(
            datosPrediccion.golesEquipo2
          ),

          penalesEquipo1: hayEmpate
            ? Number(
                datosPrediccion.penalesEquipo1
              )
            : null,

          penalesEquipo2: hayEmpate
            ? Number(
                datosPrediccion.penalesEquipo2
              )
            : null,

          ganadorId:
            datosPrediccion.ganadorId
        }

        await prediccionesLlaveAPI
          .guardarPrediccion(prediccion)

        partido.golesEquipo1 =
          prediccion.golesEquipo1

        partido.golesEquipo2 =
          prediccion.golesEquipo2

        partido.penalesEquipo1 =
          prediccion.penalesEquipo1

        partido.penalesEquipo2 =
          prediccion.penalesEquipo2

        partido.ganadorId =
          prediccion.ganadorId

        partido.prediccionGuardada =
          true

        avanzarGanador(partido)
      } catch (err) {
        console.error(
          'Error al guardar predicción:',
          err
        )

        error.value = err.message
      }
    }

    const limpiarDescendencia = async (
      fase,
      indicePartido
    ) => {
      const faseSiguiente =
        obtenerFaseSiguiente(fase)

      if (!faseSiguiente) {
        return
      }

      const indiceSiguiente =
        Math.floor(indicePartido / 2)

      const partidoSiguiente =
        obtenerPartidosPorFase(
          faseSiguiente
        )[indiceSiguiente]

      if (!partidoSiguiente) {
        return
      }

      if (indicePartido % 2 === 0) {
        partidoSiguiente.equipo1 = null
      } else {
        partidoSiguiente.equipo2 = null
      }

      if (
        partidoSiguiente.prediccionGuardada
      ) {
        await prediccionesLlaveAPI
          .eliminarPrediccion(
            USUARIO_ID,
            partidoSiguiente.id
          )
      }

      limpiarPrediccionPartido(
        partidoSiguiente
      )

      await limpiarDescendencia(
        faseSiguiente,
        indiceSiguiente
      )
    }

    const reiniciarPrediccion = async (
      datosPrediccion
    ) => {
      error.value = null

      const partidos =
        obtenerPartidosPorFase(
          datosPrediccion.fase
        )

      const indicePartido =
        partidos.findIndex(
          (partido) => {
            return (
              partido.id ===
              datosPrediccion.partidoId
            )
          }
        )

      if (indicePartido === -1) {
        error.value =
          'No se encontró el partido.'

        return
      }

      const partido =
        partidos[indicePartido]

      try {
        await prediccionesLlaveAPI
          .eliminarPrediccion(
            USUARIO_ID,
            partido.id
          )

        limpiarPrediccionPartido(
          partido
        )

        await limpiarDescendencia(
          partido.fase,
          indicePartido
        )
      } catch (err) {
        console.error(
          'Error al reiniciar predicción:',
          err
        )

        error.value = err.message
      }
    }

    const aplicarPrediccionGuardada = (
      prediccion
    ) => {
      const partido = buscarPartido(
        prediccion.fase,
        prediccion.partidoId
      )

      if (
        !partido ||
        !partido.equipo1 ||
        !partido.equipo2
      ) {
        return
      }

      const coincidenEquipos =
        partido.equipo1.id ===
          prediccion.equipo1Id &&
        partido.equipo2.id ===
          prediccion.equipo2Id

      if (!coincidenEquipos) {
        return
      }

      partido.golesEquipo1 =
        Number(
          prediccion.golesEquipo1
        )

      partido.golesEquipo2 =
        Number(
          prediccion.golesEquipo2
        )

      partido.penalesEquipo1 =
        prediccion.penalesEquipo1 === null ||
        prediccion.penalesEquipo1 === undefined ||
        prediccion.penalesEquipo1 === ''
          ? null
          : Number(
              prediccion.penalesEquipo1
            )

      partido.penalesEquipo2 =
        prediccion.penalesEquipo2 === null ||
        prediccion.penalesEquipo2 === undefined ||
        prediccion.penalesEquipo2 === ''
          ? null
          : Number(
              prediccion.penalesEquipo2
            )

      partido.ganadorId =
        prediccion.ganadorId

      partido.prediccionGuardada =
        true

      avanzarGanador(partido)
    }

    const cargarPredicciones =
      async () => {
        const predicciones =
          await prediccionesLlaveAPI
            .obtenerPorUsuario(
              USUARIO_ID
            )

        predicciones.sort(
          (
            prediccionA,
            prediccionB
          ) => {
            return (
              ORDEN_FASES.indexOf(
                prediccionA.fase
              ) -
              ORDEN_FASES.indexOf(
                prediccionB.fase
              )
            )
          }
        )

        predicciones.forEach(
          (prediccion) => {
            aplicarPrediccionGuardada(
              prediccion
            )
          }
        )
      }

    const inicializarLlave = async () => {
      cargando.value = true
      error.value = null

      try {
        await resultadosRealesStore
          .inicializar()

        if (
          resultadosRealesStore.error
        ) {
          throw new Error(
            resultadosRealesStore.error
          )
        }

        const clasificados =
          resultadosRealesStore
            .obtenerClasificados()

        const cruces =
          generarCrucesDieciseisavos(
            clasificados
          )

        const rondas =
          crearRondas(cruces)

        asignarRondas(rondas)

        await cargarPredicciones()
      } catch (err) {
        console.error(
          'Error al inicializar la llave:',
          err
        )

        error.value = err.message
      } finally {
        cargando.value = false
      }
    }

    const campeon = computed(() => {
      const final =
        partidosFinal.value[0]

      if (
        !final ||
        !final.prediccionGuardada
      ) {
        return null
      }

      return obtenerGanador(final)
    })

    return {
      partidosDieciseisavos,
      partidosOctavos,
      partidosCuartos,
      partidosSemifinales,
      partidosFinal,

      cargando,
      error,
      campeon,

      inicializarLlave,
      guardarPrediccion,
      reiniciarPrediccion
    }
  })