import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useStoreUsuario = defineStore('storeUsuario', () => {
  const STORAGE_KEY = 'usuarioProde'
  const USERS_STORAGE_KEY = 'usuariosProde'

  const USUARIOS_FIJOS = [
    {
      id: 'usuario1',
      usuario: 'admin',
      contrasena: 'admin123',
      nombre: 'admin1',
      avatar: 'https://ui-avatars.com/api/?name=Admin+1&background=00d26a&color=111'
    },
    {
      id: 'admin2',
      usuario: 'admin2',
      contrasena: 'admin2',
      nombre: 'admin2',
      avatar: 'https://ui-avatars.com/api/?name=Admin+2&background=3b82f6&color=fff'
    },
    {
      id: 'admin3',
      usuario: 'admin3',
      contrasena: 'admin3',
      nombre: 'admin3',
      avatar: 'https://ui-avatars.com/api/?name=Admin+3&background=f59e0b&color=111'
    }
  ]

  const nombreUsuario = ref('')
  const usuarioActualId = ref('')
  const estaLogueado = ref(false)
  const puntosTotales = ref(0)
  const usuarios = ref([])

  const usuarioActual = computed(() => {
    return usuarios.value.find((usuario) => {
      return usuario.id === usuarioActualId.value
    })
  })

  function crearPerfilBase(usuarioFijo) {
    return {
      id: usuarioFijo.id,
      usuario: usuarioFijo.usuario,
      nombre: usuarioFijo.nombre,
      foto: null,
      avatar: usuarioFijo.avatar,
      puntos: 0,
      ingresos: 0,
      ultimoIngreso: null
    }
  }

  function guardarUsuarios() {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(usuarios.value)
    )
  }

  function inicializarUsuarios() {
    let usuariosGuardados = []

    try {
      usuariosGuardados = JSON.parse(
        localStorage.getItem(USERS_STORAGE_KEY) || '[]'
      )
    } catch {
      usuariosGuardados = []
    }

    usuarios.value = USUARIOS_FIJOS.map((usuarioFijo) => {
      const usuarioPersistido = usuariosGuardados.find((usuario) => {
        return usuario.id === usuarioFijo.id
      })

      return {
        ...crearPerfilBase(usuarioFijo),
        ...usuarioPersistido,
        id: usuarioFijo.id,
        usuario: usuarioFijo.usuario,
        avatar: usuarioPersistido?.avatar || usuarioFijo.avatar
      }
    })

    guardarUsuarios()
  }

  function guardarSesionActiva(usuario) {
    const usuarioData = {
      ...usuario,
      autenticado: true
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioData))
  }

  function sincronizarSesion(usuario) {
    estaLogueado.value = true
    usuarioActualId.value = usuario.id
    nombreUsuario.value = usuario.nombre
    puntosTotales.value = usuario.puntos ?? 0
    guardarSesionActiva(usuario)
  }

  function cargarSesionGuardada() {
    inicializarUsuarios()

    const usuarioGuardado = localStorage.getItem(STORAGE_KEY)

    if (!usuarioGuardado) {
      estaLogueado.value = false
      nombreUsuario.value = ''
      usuarioActualId.value = ''
      return false
    }

    try {
      const usuarioData = JSON.parse(usuarioGuardado)
      const idNormalizado = usuarioData.id || 'usuario1'

      if (!usuarioData?.autenticado || !usuarioData?.nombre) {
        cerrarSesion()
        return false
      }

      const usuarioPersistido = usuarios.value.find((usuario) => {
        return usuario.id === idNormalizado
      })

      if (!usuarioPersistido) {
        cerrarSesion()
        return false
      }

      sincronizarSesion({
        ...usuarioPersistido,
        ...usuarioData,
        id: idNormalizado
      })

      return true
    } catch {
      cerrarSesion()
      return false
    }
  }

  function iniciarSesion(usuarioIngresado, contrasenaIngresada) {
    inicializarUsuarios()

    const credenciales = USUARIOS_FIJOS.find((usuario) => {
      return (
        usuario.usuario === usuarioIngresado &&
        usuario.contrasena === contrasenaIngresada
      )
    })

    if (!credenciales) {
      cerrarSesion()
      return false
    }

    const perfil = usuarios.value.find((usuario) => {
      return usuario.id === credenciales.id
    })

    const perfilConIngreso = {
      ...perfil,
      ingresos: (Number(perfil.ingresos) || 0) + 1,
      ultimoIngreso: new Date().toISOString()
    }

    usuarios.value = usuarios.value.map((usuario) => {
      if (usuario.id !== perfilConIngreso.id) {
        return usuario
      }

      return perfilConIngreso
    })

    guardarUsuarios()
    sincronizarSesion(perfilConIngreso)

    return true
  }

  function actualizarPerfilActual(datosPerfil) {
    if (!usuarioActualId.value) {
      return
    }

    const datosPermitidos = {
      nombre: datosPerfil.nombre,
      foto: datosPerfil.foto,
      avatar: datosPerfil.avatar,
      puntos: datosPerfil.puntos
    }

    usuarios.value = usuarios.value.map((usuario) => {
      if (usuario.id !== usuarioActualId.value) {
        return usuario
      }

      return {
        ...usuario,
        ...datosPermitidos,
        id: usuario.id,
        usuario: usuario.usuario
      }
    })

    const perfilActualizado = usuarios.value.find((usuario) => {
      return usuario.id === usuarioActualId.value
    })

    guardarUsuarios()
    sincronizarSesion(perfilActualizado)
  }

  function actualizarPuntosUsuario(idUsuario, puntos) {
    const puntosNormalizados = Number(puntos) || 0

    usuarios.value = usuarios.value.map((usuario) => {
      if (usuario.id !== idUsuario) {
        return usuario
      }

      return {
        ...usuario,
        puntos: puntosNormalizados
      }
    })

    guardarUsuarios()

    if (usuarioActualId.value === idUsuario) {
      puntosTotales.value = puntosNormalizados

      const perfilActualizado = usuarios.value.find((usuario) => {
        return usuario.id === idUsuario
      })

      guardarSesionActiva(perfilActualizado)
    }
  }

  function cerrarSesion() {
    estaLogueado.value = false
    nombreUsuario.value = ''
    usuarioActualId.value = ''
    puntosTotales.value = 0
    localStorage.removeItem(STORAGE_KEY)
  }

  inicializarUsuarios()

  return {
    nombreUsuario,
    usuarioActualId,
    usuarioActual,
    estaLogueado,
    puntosTotales,
    usuarios,
    iniciarSesion,
    cargarSesionGuardada,
    actualizarPerfilActual,
    actualizarPuntosUsuario,
    cerrarSesion
  }
})


