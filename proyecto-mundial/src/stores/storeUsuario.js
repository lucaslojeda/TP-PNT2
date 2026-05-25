import { defineStore }  from 'pinia'
import { ref, computed } from 'vue'

export const useStoreUsuario = defineStore('storeUsuario', () => {

const nombreUsuario = ref("");
const estaLogueado = ref(false);
const puntosTotales = ref(0);

function iniciarSesion(usuarioIngresado, contrasenaIngresada) {
    if (usuarioIngresado === 'admin' && contrasenaIngresada === 'admin123') {
        estaLogueado.value = true;
        nombreUsuario.value = usuarioIngresado;

        const usuarioData = {
            nombre: usuarioIngresado,
            foto: null,
            puntos: 0
        };
        localStorage.setItem('usuarioProde', JSON.stringify(usuarioData));
        
        return true;
    } else {
        estaLogueado.value = false;
        return false;
    }
}

return { 
nombreUsuario, estaLogueado, puntosTotales, iniciarSesion
}
})


