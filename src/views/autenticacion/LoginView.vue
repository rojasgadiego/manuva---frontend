<template>
  <div class="login-container">
    <!-- Olas decorativas -->
    <!-- <div class="ocean-waves">
      <div class="wave wave-back"></div>
      <div class="wave wave-front"></div>
    </div> -->

    <!-- Card -->
    <div class="login-card">
      <!-- Marca -->
      <header class="brand">
        <div class="logo"></div>
        <h1>Club Manuva'a</h1>
      </header>

      <!-- Formulario -->
      <LoginForm />

      <!-- Links -->
      <footer class="links">
        <router-link to="/">← Volver al inicio</router-link>
      </footer>

      <!-- Patrón polinesio ultra sutil -->
      <div class="tribal-watermark"></div>
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/auth/LoginForm.vue';


export default {
  name: 'LoginView',
  components: {
    LoginForm
  }
}
</script>

<style scoped>
/* ===== CONTENEDOR ===== */
.login-container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(
    circle at top,
    #4a9fd8 0%,
    #1b6ca8 45%,
    #0f4c75 100%
  );
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* ===== OCEAN WAVES ===== */
.ocean-waves {
  position: absolute;
  bottom: -10%;
  left: 0;
  width: 100%;
  height: 65%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.ocean-waves::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.25),
    rgba(255, 255, 255, 0)
  );
  z-index: -1;
}

.wave {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  background-size: cover;
}

/* Ola trasera (más suave) */
.wave-back {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.12' d='M0,160L80,170C160,181,320,203,480,208C640,213,800,203,960,186C1120,170,1280,149,1360,138L1440,128L1440,320L0,320Z'/%3E%3C/svg%3E");
  animation: waveBackMove 60s linear infinite;
}

/* Ola frontal (más marcada) */
.wave-front {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.18' d='M0,224L60,213C120,203,240,181,360,186C480,192,600,224,720,229C840,235,960,224,1080,213C1200,203,1320,181,1380,170L1440,160L1440,320L0,320Z'/%3E%3C/svg%3E");
  animation: waveFrontMove 40s linear infinite;
  filter: blur(1px);
}

/* Animaciones */
@keyframes waveBackMove {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes waveFrontMove {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* ===== CARD ===== */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 48px 42px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  border-radius: 22px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 2;
  overflow: hidden;
}

/* ===== MARCA ===== */
.brand {
  text-align: center;
  margin-bottom: 34px;
}

.logo {
  width: 92px;
  height: 92px;
  margin: 0 auto 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Cpath d='M10,35 Q25,20 60,30 T110,35 L105,42 Q60,36 30,40 Z' fill='%23955640'/%3E%3Cline x1='60' y1='8' x2='60' y2='35' stroke='%23775A3B' stroke-width='2.5'/%3E%3Cpolygon points='60,8 55,18 60,23' fill='%23E53935'/%3E%3Cpath d='M5,42 Q15,48 30,42 T50,42 T70,42 T90,42 T110,42' stroke='%23429FF3' stroke-width='2' fill='none' opacity='0.7'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  animation: breathe 4s ease-in-out infinite alternate;
  transform-origin: center;
}

@keyframes breathe {
  0%   { transform: translateY(0) scale(1); }
  50%  { transform: translateY(-5px) scale(1.05); }
  100% { transform: translateY(0) scale(1); }
}

.brand h1 {
  margin: 0;
  font-size: 2.3rem;
  color: #0f4c75;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* ===== LINKS ===== */
.links {
  margin-top: 28px;
  text-align: center;
}

.links a {
  color: #0f4c75;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.links a:hover {
  opacity: 0.7;
}

/* ===== PATRÓN POLINESIO ===== */
.tribal-watermark {
  position: absolute;
  inset: auto 0 0 0;
  height: 70px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Cpath d='M0,30 L10,20 L20,30 L30,20 L40,30 L50,20 L60,30 L70,20 L80,30 L90,20 L100,30 L110,20 L120,30 L130,20 L140,30 L150,20 L160,30 L170,20 L180,30 L190,20 L200,30' stroke='%230f4c75' stroke-width='2' fill='none' opacity='0.08'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  pointer-events: none;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .login-card {
    padding: 36px 28px;
  }

  .brand h1 {
    font-size: 2rem;
  }

  .ocean-waves {
    height: 75%;
    bottom: -15%;
  }
}
</style>
