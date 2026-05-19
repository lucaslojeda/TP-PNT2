<template>
  <div class="perfil-container">
    <Sidebar />
    <div class="perfil-content">
      <h1>Perfil</h1>
      
      <!-- Sección de foto y nombre -->
      <div class="perfil-header">
        <div class="foto-container">
          <img 
            v-if="usuarioData.foto" 
            :src="usuarioData.foto" 
            :alt="usuarioData.nombre"
            class="foto-perfil"
          >
          <div v-else class="foto-perfil placeholder">
            <span>{{ usuarioData.nombre.charAt(0).toUpperCase() }}</span>
          </div>
          <label class="upload-foto">
            <input 
              type="file" 
              accept="image/*" 
              @change="actualizarFoto"
              class="file-input"
            >
            📷 Cambiar foto
          </label>
        </div>
        
        <div class="info-basica">
          <div v-if="!editandoNombre" class="info-display">
            <h2>{{ usuarioData.nombre }}</h2>
            <button @click="editandoNombre = true" class="btn-editar">
              ✏️ Editar nombre
            </button>
          </div>
          
          <div v-else class="info-edit">
            <input 
              v-model="nuevoNombre" 
              type="text" 
              placeholder="Nuevo nombre"
              class="input-nombre"
              @keyup.enter="guardarNombre"
            >
            <div class="btn-grupo">
              <button @click="guardarNombre" class="btn-guardar">
                ✓ Guardar
              </button>
              <button @click="cancelarEdicion" class="btn-cancelar">
                ✗ Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de puntos -->
      <div class="puntos-section">
        <div class="puntos-card">
          <h3>Puntos Acumulados</h3>
          <p class="puntos-valor">{{ usuarioData.puntos }}</p>
          <p class="puntos-label">Puntos en total</p>
        </div>
        <div class="puntos-info">
          <p>Ganas puntos cuando aciertas en tus predicciones del Prode. ¡Sigue apostando para acumular más puntos!</p>
        </div>
      </div>

      <!-- Sección de acciones -->
      <div class="acciones">
        <button @click="desloguearse" class="btn-desloguear">
          🚪 Desloguear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';

const router = useRouter();

const usuarioData = ref({
  nombre: 'admin',
  foto: null,
  puntos: 0
});

const editandoNombre = ref(false);
const nuevoNombre = ref('');

// Cargar datos del usuario desde localStorage
onMounted(() => {
  const datosGuardados = localStorage.getItem('usuarioProde');
  if (datosGuardados) {
    usuarioData.value = JSON.parse(datosGuardados);
  } else {
    // Si no hay datos guardados, inicializar con valores por defecto
    guardarDatos();
  }
});

// Guardar datos en localStorage
function guardarDatos() {
  localStorage.setItem('usuarioProde', JSON.stringify(usuarioData.value));
}

// Editar nombre
function guardarNombre() {
  if (nuevoNombre.value.trim() !== '') {
    usuarioData.value.nombre = nuevoNombre.value.trim();
    guardarDatos();
    editandoNombre.value = false;
    nuevoNombre.value = '';
  }
}

function cancelarEdicion() {
  editandoNombre.value = false;
  nuevoNombre.value = '';
}

// Cambiar foto
function actualizarFoto(event) {
  const archivo = event.target.files[0];
  if (archivo) {
    const lector = new FileReader();
    lector.onload = (e) => {
      usuarioData.value.foto = e.target.result;
      guardarDatos();
    };
    lector.readAsDataURL(archivo);
  }
}

// Desloguear
function desloguearse() {
  localStorage.removeItem('usuarioProde');
  router.push('/');
}

// Función para agregar puntos (la usarás desde otras vistas)
// ejemplo: addPuntos(10)
window.addPuntosUsuario = (cantidad) => {
  usuarioData.value.puntos += cantidad;
  guardarDatos();
};

</script>

<style scoped>
.perfil-container {
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
}

.perfil-content {
  flex: 1;
  padding: 40px;
  margin-left: 0;
}

h1 {
  font-size: 32px;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #00d26a;
}

/* Sección header del perfil */
.perfil-header {
  display: flex;
  gap: 40px;
  margin-bottom: 50px;
  background-color: #242424;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #333;
}

.foto-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.foto-perfil {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #00d26a;
}

.foto-perfil.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00d26a, #00a84f);
  font-size: 48px;
  font-weight: bold;
  color: #1a1a1a;
}

.upload-foto {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: #00d26a;
  border: 1px solid #00d26a;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s;
}

.upload-foto:hover {
  background-color: #00d26a;
  color: #1a1a1a;
}

.file-input {
  display: none;
}

.info-basica {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.info-display h2 {
  font-size: 28px;
  margin: 0 0 20px 0;
  color: #ffffff;
}

.info-display,
.info-edit {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-editar {
  background-color: transparent;
  color: #00d26a;
  border: 1px solid #00d26a;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  width: fit-content;
}

.btn-editar:hover {
  background-color: #00d26a;
  color: #1a1a1a;
}

.input-nombre {
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #ffffff;
  padding: 12px;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
  font-size: 16px;
}

.input-nombre:focus {
  border-color: #00d26a;
}

.btn-grupo {
  display: flex;
  gap: 10px;
}

.btn-guardar,
.btn-cancelar {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  border: 1px solid;
}

.btn-guardar {
  background-color: #00d26a;
  color: #1a1a1a;
  border-color: #00d26a;
}

.btn-guardar:hover {
  background-color: #00a84f;
  border-color: #00a84f;
}

.btn-cancelar {
  background-color: transparent;
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.btn-cancelar:hover {
  background-color: #ff6b6b;
  color: #1a1a1a;
}

/* Sección de puntos */
.puntos-section {
  background-color: #242424;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #333;
  margin-bottom: 40px;
}

.puntos-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  text-align: center;
  margin-bottom: 20px;
}

.puntos-card h3 {
  font-size: 20px;
  color: #00d26a;
  margin: 0;
}

.puntos-valor {
  font-size: 48px;
  font-weight: bold;
  color: #00d26a;
  margin: 0;
}

.puntos-label {
  font-size: 14px;
  color: #aaa;
  margin: 0;
}

.puntos-info {
  background-color: #1a1a1a;
  padding: 15px;
  border-radius: 4px;
  border-left: 3px solid #00d26a;
}

.puntos-info p {
  margin: 0;
  font-size: 14px;
  color: #ccc;
}

/* Sección de acciones */
.acciones {
  display: flex;
  gap: 15px;
}

.btn-desloguear {
  background-color: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  padding: 12px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-desloguear:hover {
  background-color: #ff6b6b;
  color: #1a1a1a;
}

/* Responsive */
@media (max-width: 768px) {
  .perfil-content {
    padding: 20px;
  }

  .perfil-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  h1 {
    font-size: 24px;
  }

  .foto-perfil {
    width: 120px;
    height: 120px;
  }
}
</style>