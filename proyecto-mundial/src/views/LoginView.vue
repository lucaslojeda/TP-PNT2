<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="iniciarSesion()">
      <h2>Iniciar Sesion</h2>
      <input type="text" v-model="usuario" placeholder="Usuario">
      <input type="password" v-model="contrasena" placeholder="Contraseña">
      <span class="error-msg" v-if="isError">Credenciales incorrectas</span>
      <button type="submit" :disabled="credencialesIncompletas">Iniciar Sesion</button>
    </form>
  </div>
</template>

<script setup>
// NOTA DE ESTUDIO: vista simple de login. Delega toda la
// validación de credenciales a storeUsuario.iniciarSesion (ahí
// vive la lógica real). Si la sesión arranca bien, usa
// router.push leyendo query.redirect — esto es lo que permite
// que, si entraste a una ruta protegida sin loguearte, el
// router te mande primero al login y DESPUÉS te devuelva
// exactamente a la página que querías ver (ver router/index.js
// y su guard de navegación).

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStoreUsuario } from '@/stores/storeUsuario';

const usuario = ref('');
const contrasena = ref('');
const isError = ref(false);
const router = useRouter();
const storeUsuario = useStoreUsuario();
const credencialesIncompletas = computed(() => {
  return usuario.value === '' || contrasena.value === '';
});

function iniciarSesion() {
  const ingresoExitoso = storeUsuario.iniciarSesion(usuario.value, contrasena.value);

  if (ingresoExitoso) {
    isError.value = false;
    router.push(router.currentRoute.value.query.redirect || '/home');
  } else {
    isError.value = true;
  }
  }

</script>

<style scoped>
/* Contenedor principal: Ocupa toda la pantalla y centra el contenido */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* 100% del alto de la ventana */
  background-color: #1a1a1a; /* El gris oscuro del fondo de tu menú */
  font-family: sans-serif;
}

/* La tarjeta del formulario */
.login-form {
  background-color: #242424; /* Un gris apenas más claro para que resalte */
  padding: 40px;
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); /* Sombra sutil */
  display: flex;
  flex-direction: column;
  gap: 20px; /* Separación automática entre los inputs y el botón */
  width: 320px;
  border: 1px solid #333; /* Borde muy sutil para separar del fondo */
}

/* El título */
.login-form h2 {
  color: #ffffff;
  text-align: center;
  margin: 0 0 10px 0;
  font-weight: 600;
  letter-spacing: 1px;
}

/* Las cajas de texto */
.login-form input {
  background-color: #1a1a1a; /* Fondo oscuro para el input */
  border: 1px solid #444;
  color: #ffffff;
  padding: 12px;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
}

/* Efecto cuando el usuario hace clic en el input para escribir */
.login-form input:focus {
  border-color: #00d26a; /* El verde flúo de tu diseño */
}

/* El botón estilo "Ver Jugadores" */
.login-form button {
  background-color: transparent;
  color: #00d26a;
  border: 1px solid #00d26a;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.3s;
}

/* Efecto cuando pasás el mouse por el botón (se invierten los colores) */
.login-form button:hover:not(:disabled) {
  background-color: #00d26a;
  color: #1a1a1a;
}

/* Efecto visual cuando el botón está bloqueado (formulario incompleto) */
.login-form button:disabled {
  border-color: #555;
  color: #555;
  cursor: not-allowed;
}

/* El mensaje de error rojo */
.error-msg {
  color: #ff4c4c;
  font-size: 14px;
  text-align: center;
  margin: 0;
}
</style>
