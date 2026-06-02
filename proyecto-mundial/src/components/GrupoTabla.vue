<template>
  <section class="grupo-tabla">
    <h2>Grupo {{ grupo }}</h2>

    <table class="tabla-posiciones">
      <thead>
        <tr>
          <th>Equipo</th>
          <th>PJ</th>
          <th>PG</th>
          <th>PE</th>
          <th>PP</th>
          <th>GF</th>
          <th>GC</th>
          <th>DG</th>
          <th>PTS</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="equipo in tablaGrupo" :key="equipo.id">
          <td class="equipo">
            <img
              :src="equipo.bandera"
              :alt="'Bandera de ' + equipo.nombre"
              class="bandera"
            />
            <span>{{ equipo.nombre }}</span>
          </td>

          <td>{{ equipo.pj }}</td>
          <td>{{ equipo.pg }}</td>
          <td>{{ equipo.pe }}</td>
          <td>{{ equipo.pp }}</td>
          <td>{{ equipo.gf }}</td>
          <td>{{ equipo.gc }}</td>
          <td>{{ equipo.dg }}</td>
          <td class="puntos">{{ equipo.pts }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useFaseGruposStore } from '@/stores/storeFaseDeGrupos'
import { useResultadosRealesStore } from '@/stores/storeResultadosReales'

const props = defineProps({
  grupo: {
    type: String,
    required: true
  },
  modo: {
    type: String,
    default: 'predicciones'
  }
})

const faseGruposStore = useFaseGruposStore()
const resultadosRealesStore = useResultadosRealesStore()

const tablaGrupo = computed(() => {
  if (props.modo === 'real') {
    return resultadosRealesStore.calcularTablaGrupo(props.grupo)
  }
  return faseGruposStore.calcularTablaGrupo(props.grupo)
})
</script>

<style scoped>
.grupo-tabla {
  background-color: #1f1f1f;
  color: white;
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.grupo-tabla h2 {
  margin-top: 0;
  margin-bottom: 16px;
}

.tabla-posiciones {
  width: 100%;
  border-collapse: collapse;
}

.tabla-posiciones th,
.tabla-posiciones td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #333;
}

.tabla-posiciones th {
  color: #b5b5b5;
  font-size: 0.8rem;
  font-weight: 700;
}

.equipo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  font-weight: 700;
}

.bandera {
  width: 32px;
  height: 22px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #444;
}

.puntos {
  font-weight: 900;
  color: #00c853;
}
</style>