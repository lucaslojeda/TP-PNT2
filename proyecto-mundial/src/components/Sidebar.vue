<script setup>
import { RouterLink } from 'vue-router'
import logo from '@/assets/logo.png';
</script>

<template>

<aside>
   <div class="logo">

        <img :src="logo" alt="Logo" class="logo-img">

        <div>
            <h1>PRODE</h1>
            <h2>MUNDIAL</h2>
        </div>

    </div>

    <nav>
        <RouterLink to="/home">
            Home
        </RouterLink>

        <RouterLink to="/infoSelecciones">
            Selecciones
        </RouterLink>

        <RouterLink to="/fase-grupos">
            Fase de grupos
        </RouterLink>

        <RouterLink to="/llave-eliminacion">
            Llave de eliminación directa
        </RouterLink>

        <RouterLink to="/ranking">
            Ranking global
        </RouterLink>

        <RouterLink to="/perfil">
            Perfil
        </RouterLink>
    </nav>

</aside>

</template>

<style scoped>

aside {
  position: fixed;
  left: 0;
  top: 0;

  width: 250px;
  height: 100vh;

  background-color: #111;
  padding: 20px;
}

.logo {
  margin-bottom: 50px;
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

</style>