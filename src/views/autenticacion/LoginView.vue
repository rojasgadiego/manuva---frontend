<template>
  <div class="login-container">

    <!-- Card -->
    <div class="login-card" :class="{ 'card-in': isVisible }">

      <!-- Marca -->
      <header class="brand">
        <div class="logo-mark">
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="11" cy="11" rx="9" ry="5.5" fill="rgba(116,232,160,0.15)" stroke="#74e8a0" stroke-width="1.5" transform="rotate(-45 11 11)"/>
            <line x1="16" y1="16" x2="32" y2="32" stroke="#74e8a0" stroke-width="2" stroke-linecap="round"/>
            <circle cx="33" cy="33" r="2.5" fill="#4ac9a0" opacity="0.7"/>
          </svg>
        </div>
        <h1>Club Manuva'a</h1>
        <p>Área de Socios</p>
      </header>

      <!-- Formulario — componente externo -->
      <LoginForm @forgot="handleForgot" />

      <!-- Volver al inicio -->
      <footer class="links">
        <router-link to="/" class="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver al inicio
        </router-link>
      </footer>

      <!-- Marca de agua polinesio sutil -->
      <div class="tribal-watermark"></div>

    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/auth/LoginForm.vue'

export default {
  name: 'LoginView',
  components: { LoginForm },
  data() {
    return { isVisible: false }
  },
  methods: {
    handleForgot() {
      // this.$router.push('/recuperar-password')
      alert('Funcionalidad por implementar')
    }
  },
  mounted() {
    setTimeout(() => { this.isVisible = true }, 100)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Contenedor ── */
.login-container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, #0a2a3d 0%, #0d3d52 40%, #0a2a3a 75%, #071e2e 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* ── Orbs ── */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
}
.orb-1 {
  width: 500px; height: 500px;
  top: -100px; left: -100px;
  background: radial-gradient(circle, rgba(0,140,180,0.2) 0%, transparent 70%);
}
.orb-2 {
  width: 400px; height: 400px;
  bottom: -80px; right: -80px;
  background: radial-gradient(circle, rgba(13,100,140,0.25) 0%, transparent 70%);
}
.orb-3 {
  width: 300px; height: 300px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0,180,220,0.06) 0%, transparent 70%);
}

/* ── Olas ── */
.ocean-bg {
  position: absolute;
  bottom: 0; left: 0;
  width: 100%;
  pointer-events: none;
}
.wave-svg {
  position: absolute;
  bottom: 0; width: 100%; height: 120px;
}
/* .wave-1 { animation: waveSlide 8s ease-in-out infinite alternate; }
.wave-2 { animation: waveSlide 12s ease-in-out infinite alternate-reverse; } */

@keyframes waveSlide {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-3%); }
}

/* ── Card ── */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 48px 44px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  position: relative;
  z-index: 2;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.login-card.card-in {
  opacity: 1;
  transform: translateY(0);
}

/* ── Marca ── */
.brand {
  text-align: center;
  margin-bottom: 36px;
}

.logo-mark {
  width: 64px; height: 64px;
  margin: 0 auto 16px;
  background: rgba(116,232,160,0.08);
  border: 1px solid rgba(116,232,160,0.2);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { box-shadow: 0 0 0 0 rgba(116,232,160,0.15); }
  50%       { box-shadow: 0 0 0 10px rgba(116,232,160,0); }
}

.brand h1 {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1.5px;
  margin: 0 0 4px;
}

.brand p {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 3px;
  text-transform: uppercase;
  font-weight: 300;
  margin: 0;
}

/* ── Footer links ── */
.links {
  text-align: center;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
  text-decoration: none;
  font-weight: 300;
  transition: color 0.2s;
}

.back-link:hover { color: rgba(255,255,255,0.6); }

/* ── Marca de agua polinesio ── */
.tribal-watermark {
  position: absolute;
  inset: auto 0 0 0;
  height: 70px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Cpath d='M0,30 L10,20 L20,30 L30,20 L40,30 L50,20 L60,30 L70,20 L80,30 L90,20 L100,30 L110,20 L120,30 L130,20 L140,30 L150,20 L160,30 L170,20 L180,30 L190,20 L200,30' stroke='%2374e8a0' stroke-width='1.5' fill='none' opacity='0.06'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .login-card { padding: 36px 28px; }
  .brand h1   { font-size: 1.3rem; }
}
</style>