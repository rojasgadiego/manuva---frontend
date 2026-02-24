<template>
  <section class="hero" id="inicio">

    <!-- Carrusel de fondo -->
    <div class="carousel">
      <div
        class="carousel-slide"
        v-for="(slide, index) in slides"
        :key="index"
        :class="{ active: currentSlide === index, exiting: exitingSlide === index }"
        :style="{ backgroundImage: `url(${slide.image})` }"
      ></div>

      <!-- Overlay gradiente encima de la foto -->
      <div class="carousel-overlay"></div>
    </div>

    <!-- Contenido principal -->
    <div class="hero-content" :class="{ 'animate-in': isVisible }">

      <!-- Badge evento actual -->
      <div class="event-badge" v-if="slides[currentSlide].badge">
        <span class="badge-dot"></span>
        {{ slides[currentSlide].badge }}
      </div>

      <h1 class="hero-title">{{ slides[currentSlide].title }}</h1>
      <p class="hero-subtitle">{{ slides[currentSlide].subtitle }}</p>

      <div class="hero-actions">
        <button class="cta-primary" @click="scrollToSection('catalogo')">
          Ver Catálogo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <button class="cta-secondary" @click="scrollToSection('nosotros')">
          Conócenos
        </button>
      </div>
    </div>

    <!-- Indicadores y controles del carrusel -->
    <div class="carousel-controls">
      <button class="carousel-arrow left" @click="prevSlide" aria-label="Anterior">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <div class="carousel-dots">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          class="dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
          :aria-label="`Ir a slide ${index + 1}`"
        ></button>
      </div>

      <button class="carousel-arrow right" @click="nextSlide" aria-label="Siguiente">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- Barra de progreso del slide -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ animationDuration: `${slideDuration}ms` }" :key="currentSlide"></div>
    </div>

    <!-- Decoración olas inferior -->
    <div class="hero-wave">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z" fill="#f0f9f4"/>
        <path d="M0,55 C200,20 400,70 600,50 C800,30 1000,65 1200,45 C1320,35 1390,55 1440,55 L1440,80 L0,80 Z" fill="#e8f5f0" opacity="0.7"/>
      </svg>
    </div>

  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  data() {
    return {
      isVisible: false,
      currentSlide: 0,
      exitingSlide: null,
      slideDuration: 6000,
      autoplayTimer: null,
      slides: [
        {
          // Reemplaza image con la URL o ruta real de tu foto
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=80',
          badge: '🏆 Próximo evento',
          title: 'Campeonato Regional de Canotaje 2025',
          subtitle: 'Coquimbo · 15 de marzo · Inscripciones abiertas',
        },
        {
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
          badge: '🌊 Clases disponibles',
          title: 'Aprende a remar con los mejores',
          subtitle: 'Cursos para principiantes y competidores todos los fines de semana',
        },
        {
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
          badge: null,
          title: 'Club Manuva\'a',
          subtitle: 'Unidos por el agua · Coquimbo, Chile',
        },
      ]
    }
  },
  methods: {
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId)
      if (element) {
        window.scrollTo({ top: element.offsetTop - 90, behavior: 'smooth' })
      }
    },
    goToSlide(index) {
      if (index === this.currentSlide) return
      this.exitingSlide = this.currentSlide
      this.currentSlide = index
      setTimeout(() => { this.exitingSlide = null }, 800)
      this.resetAutoplay()
    },
    nextSlide() {
      this.goToSlide((this.currentSlide + 1) % this.slides.length)
    },
    prevSlide() {
      this.goToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length)
    },
    startAutoplay() {
      this.autoplayTimer = setInterval(this.nextSlide, this.slideDuration)
    },
    resetAutoplay() {
      clearInterval(this.autoplayTimer)
      this.startAutoplay()
    }
  },
  mounted() {
    setTimeout(() => { this.isVisible = true }, 300)
    this.startAutoplay()
  },
  beforeUnmount() {
    clearInterval(this.autoplayTimer)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Sección ── */
.hero {
  position: relative;
  height: calc(100vh - 76px); /* viewport menos navbar (72px) + barra top (4px) */
  min-height: 500px;
  overflow: hidden;
  margin-top: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Carrusel ── */
.carousel {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.05);
  transition: opacity 0.9s ease, transform 6s ease;
}

.carousel-slide.active {
  opacity: 1;
  transform: scale(1);
  z-index: 1;
}

.carousel-slide.exiting {
  opacity: 0;
  z-index: 2;
  transform: scale(1.02);
}

.carousel-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: linear-gradient(
    to bottom,
    rgba(10, 30, 20, 0.45) 0%,
    rgba(10, 30, 20, 0.55) 50%,
    rgba(10, 30, 20, 0.75) 100%
  );
}

/* ── Contenido ── */
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 780px;
  padding: 0 2rem;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.hero-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Badge */
.event-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 400;
  letter-spacing: 1px;
  padding: 0.4rem 1rem;
  border-radius: 30px;
  margin-bottom: 1.4rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #74e8a0;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

/* Título */
.hero-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  text-shadow: 0 2px 20px rgba(0,0,0,0.3);
}

/* Subtítulo */
.hero-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(0.95rem, 1.8vw, 1.15rem);
  color: rgba(255,255,255,0.8);
  font-weight: 300;
  letter-spacing: 0.5px;
  max-width: 560px;
  margin: 0 auto 2.2rem;
  line-height: 1.6;
}

/* Botones */
.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary {
  background: linear-gradient(135deg, #1d7850, #0d4a5c);
  color: #fff;
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 30px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(29,120,80,0.4);
  letter-spacing: 0.3px;
}

.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(29,120,80,0.5);
}

.cta-primary svg {
  transition: transform 0.3s ease;
}

.cta-primary:hover svg {
  transform: translateX(4px);
}

.cta-secondary {
  background: transparent;
  color: rgba(255,255,255,0.85);
  border: 1.5px solid rgba(255,255,255,0.4);
  padding: 0.8rem 1.8rem;
  border-radius: 30px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  letter-spacing: 0.3px;
}

.cta-secondary:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.7);
  color: #fff;
  transform: translateY(-3px);
}

/* ── Controles ── */
.carousel-controls {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.carousel-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot.active {
  background: #fff;
  transform: scale(1.3);
}

.carousel-arrow {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.8);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(4px);
}

.carousel-arrow:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
  transform: scale(1.08);
}

/* ── Barra de progreso ── */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255,255,255,0.15);
  z-index: 10;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #74e8a0, #1d7850);
  animation: progress linear forwards;
  width: 0%;
}

@keyframes progress {
  from { width: 0%; }
  to   { width: 100%; }
}

/* ── Ola inferior ── */
.hero-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  z-index: 10;
  line-height: 0;
}

.hero-wave svg {
  width: 100%;
  height: 80px;
  display: block;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero {
    min-height: 500px;
    max-height: 100vh;
  }

  .hero-title {
    font-size: 1.7rem;
  }

  .cta-primary,
  .cta-secondary {
    padding: 0.75rem 1.4rem;
    font-size: 0.85rem;
  }

  .carousel-controls {
    bottom: 100px;
  }
}
</style>