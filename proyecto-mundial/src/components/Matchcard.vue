<template>
  <div class="match-card">
    <div class="match-info">
      <p>20 NOV - 13:00HS</p>

      <div class="teams">
        <h3>Argentina</h3>
        <span class="vs">VS</span>
        <h3>Arabia Saudita</h3>
      </div>
    </div>

    <div class="prediction">
      <input type="number" min="0">
      <span class="score-separator">-</span>
      <input type="number" min="0">
    </div>

    <p class="match-status">Predicción pendiente</p>

    <button>Guardar</button>
  </div>
</template>

<script setup>

</script>

<style scoped>
.match-card {
  background-color: #1f1f1f;
  border-radius: 12px;
  padding: 30px;
  margin: 0;
  color: white;
  width: 500px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.match-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 8px 18px rgba(0, 0, 0, 0.6);
}

.match-info {
  margin-bottom: 30px;
  text-align: center;
}

.teams {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

h3 {
  margin: 0;
  text-align: center;
  font-size: 28px;
}

.vs {
  font-weight: bold;
  color: #00c853;
  font-size: 22px;
}

.prediction {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

input {
  width: 90px;
  height: 60px;
  text-align: center;
  font-size: 32px;
  border: none;
  border-radius: 10px;
  background-color: #2c2c2c;
  color: white;
}

.score-separator {
  font-size: 32px;
  font-weight: bold;
}

.match-status {
  text-align: center;
  color: #ccc;
  margin-bottom: 20px;
}

button {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  background-color: #00c853;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background-color: #00a843;
}
</style>