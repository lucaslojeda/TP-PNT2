/**
 * ============================================================
 * NOTA DE ESTUDIO - router/index.js
 * ============================================================
 * Define las rutas de la app y, lo más importante, un GUARD DE
 * NAVEGACIÓN GLOBAL (router.beforeEach) que protege las rutas
 * privadas.
 *
 * Cada ruta tiene un `meta`:
 * - requiereAuth: true -> solo accesible si hay sesión activa.
 * - soloInvitados: true -> solo accesible SI NO hay sesión
 *   (caso del login: si ya estás logueado, no tiene sentido
 *   que veas la pantalla de login de nuevo).
 *
 * router.beforeEach(to) se ejecuta ANTES de cada cambio de
 * ruta. Primero resuelve si hay sesión activa: usa el estado en
 * memoria (storeUsuario.estaLogueado) o, si no lo hay (por
 * ejemplo recién recargaste la página con F5 y Pinia perdió el
 * estado), intenta reconstruirla desde localStorage con
 * cargarSesionGuardada().
 *
 * Después aplica dos reglas:
 * 1. Si la ruta requiere auth y NO hay sesión -> redirige a
 *    login, pero guardando la ruta original en
 *    query.redirect, para poder volver ahí después de loguear
 *    (ver LoginView.vue, que lee justamente ese query param).
 * 2. Si la ruta es "solo invitados" y SÍ hay sesión -> redirige
 *    a home (evita ver el login estando ya logueado).
 *
 * Si ninguna regla aplica, `return true` deja pasar la
 * navegación normalmente.
 * ============================================================
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useStoreUsuario } from '@/stores/storeUsuario'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RankingGlobalView from '../views/RankingGlobalView.vue'
import FaseDeGrupo from '../views/FaseDeGrupo.vue'
import LlaveDeEliminacion from '../views/LlaveDeEliminacion.vue'
import PerfilView from '../views/PerfilView.vue'
import EstadisticasView from '../views/EstadisticasView.vue'
import InfoSelecciones from '@/views/InfoSelecciones.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: {
        soloInvitados: true
      }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiereAuth: true
      }
    },
    {
      path: '/infoSelecciones',
      name: 'infoSelecciones',
      component: InfoSelecciones,
      meta: {
        requiereAuth: true
      }
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: RankingGlobalView,
      meta: {
        requiereAuth: true
      }
    },
    {
      path: '/fase-grupos',
      name: 'fase-grupos',
      component: FaseDeGrupo,
      meta: {
        requiereAuth: true
      }
    },
    {
      path: '/llave-eliminacion',
      name: 'llave-eliminacion',
      component: LlaveDeEliminacion,
      meta: {
        requiereAuth: true
      }
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView,
      meta: {
        requiereAuth: true
      }
    },
    {
      path: '/estadisticas',
      name: 'estadisticas',
      component: EstadisticasView,
      meta: {
        requiereAuth: true
      }
    }
  ]
})

router.beforeEach((to) => {
  const storeUsuario = useStoreUsuario()
  const sesionActiva = storeUsuario.estaLogueado || storeUsuario.cargarSesionGuardada()

  if (to.meta.requiereAuth && !sesionActiva) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.meta.soloInvitados && sesionActiva) {
    return {
      name: 'home'
    }
  }

  return true
})

export default router
