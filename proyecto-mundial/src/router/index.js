import { createRouter, createWebHistory } from 'vue-router'

// Acá vas a ir importando tus componentes/vistas a medida que los crees
// import Home from '../components/Home.vue'
// import Login from '../components/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /* Ejemplo de cómo van a quedar tus rutas:
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
    */
  ]
})

export default router