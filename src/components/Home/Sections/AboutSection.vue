<template>
  <section id="nosotros" class="about-section">
    <div class="container">

      <!-- Título -->
      <div class="section-header">
        <span class="section-tag">Quiénes Somos</span>
        <h2>Apasionados por el agua<br>y el trabajo en equipo</h2>
      </div>

      <div class="about-grid">

        <!-- Lado izquierdo: texto -->
        <div class="about-text" :class="{ 'animate-in': isVisible }">
          <p class="lead">
            Somos el <strong>Club Manuva'a</strong>, un club de canotaje nacido en la
            Región de Coquimbo, unidos por el amor al mar, los ríos y el deporte en equipo.
          </p>
          <p>
            Formamos remeros de todas las edades y niveles, desde quienes dan sus primeras
            paladas hasta deportistas que compiten a nivel regional y nacional. Creemos que
            el canotaje enseña mucho más que técnica: enseña disciplina, compañerismo
            y respeto por el entorno natural.
          </p>

          <!-- Stats pequeños -->
          <div class="stats-row">
            <div class="stat" v-for="stat in stats" :key="stat.label">
              <span class="stat-number">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Lado derecho: carrusel de imágenes -->
        <div class="about-carousel" :class="{ 'animate-in': isVisible }">
          <div class="carousel-track">
            <div
              class="carousel-img"
              v-for="(img, index) in images"
              :key="index"
              :class="{ active: currentImg === index, prev: prevImg === index }"
            >
              <!-- Si no hay imagen real, muestra placeholder -->
              <img v-if="img.src" :src="img.src" :alt="img.caption" />
              <div v-else class="img-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>{{ img.caption }}</span>
              </div>
            </div>
          </div>

          <!-- Caption -->
          <div class="img-caption">{{ images[currentImg].caption }}</div>

          <!-- Controles -->
          <div class="img-controls">
            <button
              v-for="(img, index) in images"
              :key="index"
              class="img-dot"
              :class="{ active: currentImg === index }"
              @click="goTo(index)"
            ></button>
          </div>

          <!-- Flechas -->
          <button class="img-arrow left" @click="prev">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="img-arrow right" @click="next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AboutSection',
  data() {
    return {
      isVisible: false,
      currentImg: 0,
      prevImg: null,
      autoplayTimer: null,
      stats: [
        { value: '+50',  label: 'Socios activos' },
        { value: '+10',  label: 'Años de historia' },
        { value: 'CQB',  label: 'Región de Coquimbo' },
      ],
      images: [
        // Reemplaza src con la ruta real de tus fotos, ej: require('@/assets/foto1.jpg')
        // Si src es null o '', se muestra el placeholder con el caption
        { src: '', caption: 'Entrenamiento matutino' },
        { src: '', caption: 'Competencia regional 2024' },
        { src: '', caption: 'El equipo en acción' },
        { src: '', caption: 'Nuestras aguas, nuestro hogar' },
      ]
    }
  },
  methods: {
    goTo(index) {
      this.prevImg = this.currentImg
      this.currentImg = index
      setTimeout(() => { this.prevImg = null }, 600)
      this.resetAutoplay()
    },
    next() { this.goTo((this.currentImg + 1) % this.images.length) },
    prev() { this.goTo((this.currentImg - 1 + this.images.length) % this.images.length) },
    startAutoplay() { this.autoplayTimer = setInterval(this.next, 4000) },
    resetAutoplay() { clearInterval(this.autoplayTimer); this.startAutoplay() },
    onScroll() {
      const el = this.$el
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.85) {
        this.isVisible = true
        window.removeEventListener('scroll', this.onScroll)
      }
    }
  },
  mounted() {
    this.startAutoplay()
    window.addEventListener('scroll', this.onScroll)
    this.onScroll() // checar si ya es visible al cargar
  },
  beforeUnmount() {
    clearInterval(this.autoplayTimer)
    window.removeEventListener('scroll', this.onScroll)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

.about-section {
  background: linear-gradient(180deg, #e8f5f0 0%, #f5fbf7 100%);
  padding: 100px 0 110px;
  position: relative;
  overflow: hidden;
}

/* Decoración de fondo sutil */
.about-section::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -80px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(29,120,80,0.05) 0%, transparent 70%);
  pointer-events: none;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2.5rem;
}

/* ── Header ── */
.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-tag {
  display: inline-block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #1d7850;
  margin-bottom: 12px;
  position: relative;
  padding: 0 16px;
}

.section-tag::before,
.section-tag::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30px;
  height: 1px;
  background: #1d7850;
  opacity: 0.4;
}
.section-tag::before { right: 100%; }
.section-tag::after  { left:  100%; }

.section-header h2 {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 600;
  color: #1a3d2b;
  line-height: 1.3;
  letter-spacing: 0.5px;
}

/* ── Grid ── */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}

/* ── Texto ── */
.about-text {
  opacity: 0;
  transform: translateX(-24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.about-text.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.lead {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.1rem;
  color: #1a3d2b;
  line-height: 1.7;
  margin-bottom: 1.2rem;
  font-weight: 400;
}

.lead strong {
  font-weight: 600;
  color: #1d7850;
}

.about-text p:not(.lead) {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: #4a6e58;
  line-height: 1.75;
  font-weight: 300;
  margin-bottom: 2rem;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(29, 120, 80, 0.15);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d7850;
  line-height: 1;
}

.stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  color: #5a8a72;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 400;
}

/* ── Carrusel ── */
.about-carousel {
  position: relative;
  opacity: 0;
  transform: translateX(24px);
  transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
}

.about-carousel.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.carousel-track {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(10, 40, 20, 0.15);
  background: #d4eddf;
}

.carousel-img {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.carousel-img.active {
  opacity: 1;
  z-index: 2;
}

.carousel-img.prev {
  opacity: 0;
  z-index: 1;
}

.carousel-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Placeholder cuando no hay imagen */
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #d4eddf, #c2e4d0);
  color: #5a8a72;
}

.img-placeholder span {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1px;
  opacity: 0.6;
}

/* Caption */
.img-caption {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #5a8a72;
  letter-spacing: 0.5px;
  text-align: center;
  margin-top: 14px;
  min-height: 18px;
  transition: opacity 0.3s;
}

/* Dots */
.img-controls {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
}

.img-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(29, 120, 80, 0.25);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.img-dot.active {
  background: #1d7850;
  transform: scale(1.3);
}

/* Flechas */
.img-arrow {
  position: absolute;
  top: calc(50% - 24px); /* centrado en la imagen, no en todo el bloque */
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(4px);
  color: #1a3d2b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  z-index: 5;
}

.img-arrow.left  { left: 10px; }
.img-arrow.right { right: 10px; }

.img-arrow:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .about-text {
    transform: translateY(20px);
  }

  .about-text.animate-in {
    transform: translateY(0);
  }

  .about-carousel {
    transform: translateY(20px);
  }

  .about-carousel.animate-in {
    transform: translateY(0);
  }

  .stats-row {
    gap: 1.5rem;
  }
}
</style>