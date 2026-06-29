<template>
  <div class="copa-mundial-fondo" aria-hidden="true"></div>
</template>

<style>
html,
body,
#app {
  min-height: 100vh;
}

body {
  margin: 0;
  background-color: #1a1a1a !important;
  overflow-x: hidden;
}

#app {
  position: relative;
  background-color: #1a1a1a !important;
  isolation: isolate;
}

.app-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.copa-mundial-fondo {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(rgba(20, 20, 20, 0.62), rgba(20, 20, 20, 0.86)),
    url('/imagenes/logo2026.png') no-repeat center center;
  background-size: min(78vw, 980px) auto;
}

:where(
  .home-container,
  .home-content,
  .fase-grupos-container,
  .fase-grupos-content,
  .page-container,
  .main-content,
  .ranking-container,
  .ranking-content,
  .perfil-container,
  .perfil-content,
  .estadisticas-container,
  .estadisticas-content,
  .login-container
) {
  background-color: transparent !important;
  background-image: none !important;
}

:where(
  .group-card,
  .table-container,
  .grupo-tabla,
  .match-card,
  .home-header,
  .top-ranking,
  .home-summary,
  .fase-grupos-header,
  .ranking-header,
  .metric-card,
  .panel,
  .perfil-header,
  .puntos-section,
  .login-card,
  .modal-content,
  .ronda-llave,
  .partido-llave,
  .campeon-card
) {
  background-color: rgba(31, 31, 31, 0.74) !important;
  background-image: none !important;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

:where(
  .group-card-header,
  .positions-table th,
  .ranking-table th,
  .tabla-posiciones th,
  .modal-header
) {
  background-color: rgba(17, 17, 17, 0.54) !important;
}

:where(
  .positions-table td,
  .ranking-table td,
  .tabla-posiciones td
) {
  background-color: rgba(31, 31, 31, 0.36) !important;
}

:where(
  .positions-table tr,
  .ranking-table tr,
  .tabla-posiciones tr
) {
  background-color: transparent !important;
}

@media (max-width: 700px) {
  .copa-mundial-fondo {
    background-position: center center;
    background-size: 112vw auto;
  }
}
</style>
