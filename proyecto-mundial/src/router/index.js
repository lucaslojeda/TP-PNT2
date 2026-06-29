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
