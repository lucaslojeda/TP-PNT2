/**
 * ============================================================
 * NOTA DE ESTUDIO - storeLlaveEliminacion.js
 * ============================================================
 * Este store maneja TODA la lógica del bracket de eliminación
 * directa: 16avos -> octavos -> cuartos -> semifinales -> final.
 *
 * ESTRUCTURA DE DATOS:
 * Hay 5 arrays reactivos (uno por fase). Cada partido es un
 * objeto con equipo1, equipo2, goles, penales y ganadorId.
 * Los 5 arrays están "linkeados": el ganador de un partido de
 * una fase pasa a ocupar un lugar en un partido de la fase
 * siguiente.
 *
 * LA FUNCIÓN CLAVE ES avanzarGanador(partido):
 * Calcula matemáticamente a qué partido de la fase siguiente
 * tiene que ir el ganador. Si el partido actual está en la
 * posición `indiceActual` de su fase, el partido que le
 * corresponde en la fase siguiente es Math.floor(indiceActual/2)
 * (cada 2 partidos se reducen a 1). Si indiceActual es par, el
 * ganador entra como equipo1; si es impar, entra como equipo2.
 * Así funciona cualquier bracket de eliminación: partidos 0 y 1
 * alimentan al partido 0 siguiente, 2 y 3 al partido 1, etc.
 *
 * guardarPrediccion(): valida partido y equipos -> arma la
 * predicción (detecta empate para pedir penales) -> la persiste
 * vía la API mock -> actualiza el partido local -> llama a
 * avanzarGanador para propagar el resultado al bracket.
 *
 * limpiarDescendencia() es RECURSIVA: si reiniciás una
 * predicción de, por ejemplo, octavos, hay que deshacer también
 * el efecto dominó que ya armó cuartos, semis y final con ese
 * ganador. Por eso se llama a sí misma fase por fase hasta
 * llegar a la final, evitando que quede un equipo "fantasma" en
 * una ronda avanzada.
 *
 * cargarPredicciones() / aplicarPrediccionGuardada(): al entrar
 * a la vista, trae las predicciones guardadas, las ORDENA por
 * fase con ORDEN_FASES (importante: si no se ordenan, se podría
 * intentar aplicar una predicción de cuartos antes de que ese
 * partido tenga sus dos equipos definidos por octavos) y las
 * reaplica una por una, disparando avanzarGanador para
 * reconstruir el estado completo del bracket.
 * ============================================================
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useResultadosRealesStore } from '@/stores/storeResultadosReales'
import { useStoreUsuario } from '@/stores/storeUsuario'
import { prediccionesLlaveAPI } from '@/services/prediccionesLlaveAPI'

import {
  ORDEN_FASES,
  crearRondas,
  generarCrucesDieciseisavos,
  obtenerFaseSiguiente,
  obtenerGanador,
  limpiarPrediccionPartido
} from '@/utils/llaveUtils'

export const useLlaveEliminacionStore =
  defineStore('llaveEliminacion', () => {
    const resultadosRealesStore =
      useResultadosRealesStore()

    const storeUsuario =
      useStoreUsuario()

    const partidosDieciseisavos = ref([])
    const partidosOctavos = ref([])
    const partidosCuartos = ref([])
    const partidosSemifinales = ref([])
    const partidosFinal = ref([])

    const cargando = ref(false)
    const error = ref(null)

    const obtenerUsuarioActivoId = () => {
      return storeUsuario.usuarioActualId || 'usuario1'
    }

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

    // NOTA: acá pasa la magia del bracket. Dado un partido ya
    // resuelto, calcula su "hermano" en la fase siguiente usando
    // indiceActual/2 (división entera) y lo ubica como equipo1
    // o equipo2 según si el índice era par o impar.
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
          userId: obtenerUsuarioActivoId(),
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

        const prediccionGuardada =
          await prediccionesLlaveAPI
            .guardarPrediccion(prediccion)

        resultadosRealesStore
          .registrarPrediccionLlave(
            prediccionGuardada
          )

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

    // NOTA: función RECURSIVA. Al reiniciar un partido hay que
    // "deshacer" el efecto dominó en todas las fases siguientes
    // que ya usaban a ese ganador. Por eso se llama a sí misma
    // (más abajo) avanzando fase por fase hasta llegar a la final.
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
            obtenerUsuarioActivoId(),
            partidoSiguiente.id
          )

        resultadosRealesStore
          .quitarPrediccionLlave(
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
            obtenerUsuarioActivoId(),
            partido.id
          )

        resultadosRealesStore
          .quitarPrediccionLlave(
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
              obtenerUsuarioActivoId()
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
            resultadosRealesStore
              .registrarPrediccionLlave(
                prediccion
              )

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
