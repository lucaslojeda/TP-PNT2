import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RankingGlobalView from '../views/RankingGlobalView.vue'
import FaseDeGrupo from '../views/FaseDeGrupo.vue'
import LlaveDeEliminacion from '../views/LlaveDeEliminacion.vue'
import PerfilView from '../views/PerfilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: RankingGlobalView
    },
    {
      path: '/fase-grupos',
      name: 'fase-grupos',
      component: FaseDeGrupo
    },
    {
      path: '/llave-eliminacion',
      name: 'llave-eliminacion',
      component: LlaveDeEliminacion
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView
    }
  ]
})

export default router