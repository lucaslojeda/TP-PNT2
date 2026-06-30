<script setup>
// NOTA DE ESTUDIO: componente de presentación pura, sin lógica
// (no toca stores). RouterLink de vue-router agrega
// automáticamente la clase "router-link-active" en el link de
// la ruta activa, que se usa en el <style> para resaltarlo.
import { RouterLink } from 'vue-router'
import logo from '@/assets/logo.png';
</script>

<template>
<aside class="sidebar">
   <div class="hamburger">☰</div>
   
   <div class="logo">
        <img :src="logo" alt="Logo" class="logo-img">
        <div>
            <h1>PRODE</h1>
            <h2>MUNDIAL</h2>
        </div>
    </div>

    <nav>
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/infoSelecciones">Selecciones</RouterLink>
        <RouterLink to="/fase-grupos">Fase de grupos</RouterLink>
        <RouterLink to="/llave-eliminacion">Llave de eliminación directa</RouterLink>
        <RouterLink to="/ranking">Ranking global</RouterLink>
        <RouterLink to="/estadisticas">Estadisticas</RouterLink>
        <RouterLink to="/perfil">Perfil</RouterLink>
    </nav>
</aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background-color: #111;
  padding: 20px;
  transform: translateX(-250px);
  transition: transform 0.3s ease;
  z-index: 100;
}

.sidebar:hover {
  transform: translateX(0);
}

.logo {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 25px;
}

.logo-img {
  width: 40px;
  height: auto;
}

h1 {
  color: white;
  margin: 0;
}

h2 {
  color: #00c853;
  margin: 0;
}

a {
  display: block;
  color: white;
  text-decoration: none;
  margin-bottom: 20px;
}

.hamburger {
  position: absolute;
  right: -35px;
  top: 20px;
  width: 30px;
  height: 30px;
  background-color: #111;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 6px 6px 0;
  font-size: 1.2rem;
  cursor: pointer;
}
</style>
