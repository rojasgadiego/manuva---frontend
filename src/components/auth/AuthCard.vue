<template>
  <div class="auth-container">
    <div class="auth-card" :class="{ 'card-in': visible, 'auth-card--ancha': ancha }">
      <header class="brand">
        <div class="logo-mark">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <ellipse cx="11" cy="11" rx="9" ry="5.5" fill="rgba(116,232,160,0.15)" stroke="#74e8a0" stroke-width="1.5" transform="rotate(-45 11 11)"/>
            <line x1="16" y1="16" x2="32" y2="32" stroke="#74e8a0" stroke-width="2" stroke-linecap="round"/>
            <circle cx="33" cy="33" r="2.5" fill="#4ac9a0" opacity="0.7"/>
          </svg>
        </div>
        <h1>{{ titulo }}</h1>
        <p>{{ subtitulo }}</p>
      </header>

      <slot />

      <footer class="links">
        <slot name="pie">
          <router-link to="/login" class="back-link">‹ Volver a iniciar sesión</router-link>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthCard',
  props: {
    titulo:    { type: String, default: 'Club Canotaje' },
    subtitulo: { type: String, default: 'Área de socios' },
    ancha:     { type: Boolean, default: false },
  },
  data: () => ({ visible: false }),
  mounted() { setTimeout(() => { this.visible = true }, 60) },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

.auth-container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, #0a2a3d 0%, #0d3d52 40%, #0a2a3a 75%, #071e2e 100%);
  padding: 24px 16px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 40px 28px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.auth-card--ancha { max-width: 560px; }
.auth-card.card-in { opacity: 1; transform: translateY(0); }

.brand { text-align: center; margin-bottom: 28px; }
.logo-mark {
  width: 58px; height: 58px;
  margin: 0 auto 14px;
  background: rgba(116, 232, 160, 0.08);
  border: 1px solid rgba(116, 232, 160, 0.2);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
}
.brand h1 {
  font-family: 'Cinzel', serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1.2px;
  margin: 0 0 4px;
}
.brand p {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0;
}

.links {
  text-align: center;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.45);
}
.links :deep(a) { color: rgba(116, 232, 160, 0.8); text-decoration: none; }
.links :deep(a:hover) { color: #74e8a0; }
.back-link { color: rgba(255, 255, 255, 0.4) !important; }

@media (max-width: 480px) {
  .auth-card { padding: 32px 22px 24px; }
}
</style>
