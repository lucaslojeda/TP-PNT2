// NOTA DE ESTUDIO - main.js
// Punto de entrada de la app. Acá se "instalan" los dos plugins
// clave: Pinia (app.use(pinia), habilita los stores en toda la
// app) y Vue Router (app.use(router), habilita la navegación).
// El orden de app.use() no importa funcionalmente acá, pero
// ambos deben registrarse ANTES de app.mount('#app').
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import { createPinia } from 'pinia' 

const app = createApp(App)
const pinia = createPinia() 

app.use(pinia) 
app.use(router) 
app.mount('#app')
    