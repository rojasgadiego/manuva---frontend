<template>
  <section class="hero">
    <div class="hero-content" :class="{ 'animate-in': isVisible }">
      <h1 class="hero-title">{{ title }}</h1>
      <p class="hero-subtitle">{{ subtitle }}</p>
      <button class="cta-button" @click="scrollToSection('catalogo')">
        <span class="button-text">{{ buttonText }}</span>
        <span class="button-arrow">→</span>
      </button>
    </div>
    <div class="hero-decoration">
      <div class="floating-flower flower-1">🌸</div>
      <div class="floating-flower flower-2">🌺</div>
      <div class="floating-flower flower-3">🌷</div>
    </div>

  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  data() {
    return {
      title: 'Flores Frescas para Cada Ocasión',
      subtitle: 'Creamos arreglos florales únicos que expresan tus sentimientos más profundos',
      buttonText: 'Ver Catálogo',
      isVisible: false
    }
  },
  methods: {
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId)
      if (element) {
        const offsetTop = element.offsetTop - 100
        
        // Agregar animación al botón
        const button = document.querySelector('.cta-button')
        if (button) {
          button.classList.add('button-clicked')
          setTimeout(() => {
            button.classList.remove('button-clicked')
          }, 300)
        }
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
        
        // Resaltar sección destino
        setTimeout(() => {
          element.classList.add('section-highlight')
          setTimeout(() => {
            element.classList.remove('section-highlight')
          }, 1000)
        }, 500)
      }
    }
  },
  mounted() {
    // Activar animación después de un pequeño delay
    setTimeout(() => {
      this.isVisible = true
    }, 300)
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #74c69d, #52b788);
  color: white;
  padding: 150px 2rem 100px;
  text-align: center;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  opacity: 0;
  transform: translateY(50px);
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.hero-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: fadeInUp 1s ease 0.2s both;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 1s ease 0.4s both;
}

.cta-button {
  background: white;
  color: #2d6a4f;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  animation: fadeInUp 1s ease 0.6s both;
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.cta-button:hover::before {
  left: 100%;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.3);
}

.cta-button:active,
.cta-button.button-clicked {
  transform: translateY(-1px) scale(0.98);
  animation: buttonPulse 0.3s ease;
}

@keyframes buttonPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.button-arrow {
  transition: transform 0.3s ease;
}

.cta-button:hover .button-arrow {
  transform: translateX(5px);
}

/* Decoraciones flotantes */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.floating-flower {
  position: absolute;
  font-size: 2rem;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.flower-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.flower-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.flower-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .cta-button {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
  
  .floating-flower {
    font-size: 1.5rem;
  }
}
</style>