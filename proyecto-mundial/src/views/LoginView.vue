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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
  font-family: sans-serif;
}

.login-form {
  background-color: #242424;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 320px;
  border: 1px solid #333;
}

.login-form h2 {
  color: #ffffff;
  text-align: center;
  margin: 0 0 10px 0;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-form input {
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #ffffff;
  padding: 12px;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
}

.login-form input:focus {
  border-color: #00d26a;
}

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

.login-form button:hover:not(:disabled) {
  background-color: #00d26a;
  color: #1a1a1a;
}

.login-form button:disabled {
  border-color: #555;
  color: #555;
  cursor: not-allowed;
}

.error-msg {
  color: #ff4c4c;
  font-size: 14px;
  text-align: center;
  margin: 0;
}
</style>
