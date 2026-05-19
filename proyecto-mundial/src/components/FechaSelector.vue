<template>
  <div class="fecha-selector">
    <label for="fecha-select">Fecha</label>

    <select
      id="fecha-select"
      :value="modelValue"
      class="fecha-select"
      @change="cambiarFecha"
    >
      <option :value="1">Fecha 1</option>
      <option :value="2">Fecha 2</option>
      <option :value="3">Fecha 3</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const cambiarFecha = (event) => {
  emit('update:modelValue', Number(event.target.value))
}
</script>

<style scoped>
.fecha-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.fecha-selector label {
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
}

.fecha-select {
  background-color: #1f1f1f;
  color: #ffffff;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.fecha-select:focus {
  outline: none;
  border-color: #00c853;
}
</style>