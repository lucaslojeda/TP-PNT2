<template>
  <div class="home-container">
    <Sidebar />

    <main class="home-content">

      <section class="home-main">

        <div class="home-left">

          <header class="home-header">
            <h1>Bienvenido, Usuario</h1>
            <p>Completá tus predicciones por fecha y seguí tu progreso.</p>
          </header>

          <section class="home-filters">
            <h2>Fecha 1</h2>
            <p>Acá después va el selector de fecha.</p>
          </section>

          <section class="matches-section">
            <Matchcard />
          </section>

        </div>

        <div class="home-right">

          <aside class="top-ranking">
            <h2>Top 3 Ranking</h2>
            <p>1° Usuario - 0 pts</p>
            <p>2° Usuario - 0 pts</p>
            <p>3° Usuario - 0 pts</p>
          </aside>

          <aside class="home-summary">
            <h2>Resumen</h2>
            <p>Puntos actuales: 0</p>
            <p>Predicciones guardadas: 0</p>
            <p>Fecha límite: a definir</p>
          </aside>

        </div>

      </section>

    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Matchcard from '@/components/Matchcard.vue'
</script>

<style scoped>
.home-container {
  background-color: grey;
  min-height: 100vh;
  width: 100vw;
}

.home-content {
  margin-left: 220px;
  padding: 24px 8px;
}

.home-main {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.home-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.home-right {
  display: flex;
  flex-direction: column;
  gap: 20px;

  margin-left: 550px;
}

.home-header {
  background-color: #1f1f1f;

  color: white;

  padding: 20px;

  border-radius: 12px;

  margin-bottom: 20px;
  margin-top: -10px;

  width: 500px;
}

.home-header h1 {
  margin: 0;

  line-height: 1.1;
}

.home-header p {
  margin-top: 8px;

  color: #ccc;
}

.home-filters {
  margin-bottom: 20px;
}

.matches-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.top-ranking,
.home-summary {
  width: 280px;
  background-color: #1f1f1f;
  color: white;
  padding: 20px;
  border-radius: 12px;
}

.top-ranking h2,
.home-summary h2 {
  margin-bottom: 10px;
}
</style>