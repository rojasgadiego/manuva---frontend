<template>
  <footer class="footer">

    <!-- Ola superior que conecta con la sección anterior -->
    <div class="footer-wave">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z" fill="#f5fbf7"/>
        <path d="M0,40 C300,10 600,55 900,35 C1100,22 1280,45 1440,38 L1440,0 L0,0 Z" fill="#e8f5f0" opacity="0.5"/>
      </svg>
    </div>

    <div class="footer-body">
      <div class="container">
        <div class="footer-grid">

          <!-- Columna 1: Logo + tagline -->
          <div class="footer-col footer-brand">
            <div class="footer-logo">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="11" cy="11" rx="9" ry="5.5" fill="rgba(116,232,160,0.15)" stroke="#74e8a0" stroke-width="1.5" transform="rotate(-45 11 11)"/>
                <line x1="16" y1="16" x2="32" y2="32" stroke="#74e8a0" stroke-width="2" stroke-linecap="round"/>
                <circle cx="33" cy="33" r="2.5" fill="#4ac9a0" opacity="0.7"/>
              </svg>
              <span>Club Manuva'a</span>
            </div>
            <p class="footer-tagline">Apasionados por el agua y el trabajo en equipo. Coquimbo, Chile.</p>
            <!-- Redes sociales -->
            <div class="social-links">
              <a href="#" class="social-btn" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" class="social-btn" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" class="social-btn" aria-label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Columna 2: Navegación -->
          <div class="footer-col">
            <h4>Navegación</h4>
            <ul class="footer-links">
              <li v-for="item in navLinks" :key="item.id">
                <a :href="'#' + item.id" @click.prevent="scrollTo(item.id)">{{ item.name }}</a>
              </li>
            </ul>
          </div>

          <!-- Columna 3: Contacto -->
          <div class="footer-col">
            <h4>Contacto</h4>
            <ul class="contact-list">
              <li v-for="item in contactItems" :key="item.label">
                <span class="contact-icon" v-html="item.icon"></span>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </div>

          <!-- Columna 4: Horarios -->
          <div class="footer-col">
            <h4>Horarios</h4>
            <ul class="schedule-list">
              <li v-for="item in schedules" :key="item.days">
                <span class="schedule-days">{{ item.days }}</span>
                <span class="schedule-time">{{ item.time }}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <!-- Barra inferior -->
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <span>© {{ currentYear }} Club Manuva'a · Coquimbo, Chile</span>
        <span class="footer-made">Hecho con 🌊 por el equipo</span>
      </div>
    </div>

  </footer>
</template>

<script>
export default {
  name: 'FooterSection',
  data() {
    return {
      currentYear: new Date().getFullYear(),
      navLinks: [
        { id: 'inicio',   name: 'Inicio' },
        { id: 'nosotros', name: 'Nosotros' },
        { id: 'catalogo', name: 'Catálogo' },
        { id: 'galeria',  name: 'Galería' },
        { id: 'contacto', name: 'Contacto' },
      ],
      contactItems: [
        {
          label: 'phone',
          icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
          value: '+56 9 1234 5678'
        },
        {
          label: 'email',
          icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
          value: 'contacto@manuva-a.cl'
        },
        {
          label: 'location',
          icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
          value: 'Coquimbo, Región de Coquimbo'
        },
      ],
      schedules: [
        { days: 'Lunes – Viernes', time: '07:00 – 20:00' },
        { days: 'Sábado',         time: '08:00 – 18:00' },
        { days: 'Domingo',        time: '08:00 – 13:00' },
      ]
    }
  },
  methods: {
    scrollTo(sectionId) {
      const el = document.getElementById(sectionId)
      if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Ola superior ── */
.footer-wave {
  background: #f5fbf7; /* mismo color de la sección anterior */
  line-height: 0;
}
.footer-wave svg {
  width: 100%;
  height: 60px;
  display: block;
}

/* ── Cuerpo ── */
.footer-body {
  background: linear-gradient(160deg, #0d2b1c 0%, #0d3340 100%);
  padding: 64px 0 48px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2.5rem;
}

/* ── Grid ── */
.footer-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr 1.2fr 1.2fr;
  gap: 3rem;
}

/* ── Columnas ── */
.footer-col h4 {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 1.2rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

/* ── Brand ── */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.footer-logo span {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.footer-tagline {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.65;
  font-weight: 300;
  margin-bottom: 1.5rem;
  max-width: 220px;
}

/* Redes */
.social-links {
  display: flex;
  gap: 8px;
}

.social-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.25s ease;
}

.social-btn:hover {
  background: rgba(116, 232, 160, 0.15);
  border-color: rgba(116, 232, 160, 0.4);
  color: #74e8a0;
  transform: translateY(-2px);
}

/* ── Nav links ── */
.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.footer-links a {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  font-weight: 300;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.footer-links a::before {
  content: '';
  width: 0;
  height: 1px;
  background: #74e8a0;
  transition: width 0.2s ease;
  display: inline-block;
}

.footer-links a:hover {
  color: #74e8a0;
  padding-left: 4px;
}

.footer-links a:hover::before {
  width: 10px;
}

/* ── Contacto ── */
.contact-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.contact-icon {
  color: #74e8a0;
  opacity: 0.8;
  flex-shrink: 0;
  margin-top: 2px;
}

.contact-list span:last-child {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.83rem;
  color: rgba(255,255,255,0.5);
  font-weight: 300;
  line-height: 1.5;
}

/* ── Horarios ── */
.schedule-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.schedule-list li {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.schedule-days {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  font-weight: 400;
}

.schedule-time {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: #74e8a0;
  font-weight: 300;
  opacity: 0.85;
}

/* ── Bottom bar ── */
.footer-bottom {
  background: rgba(0,0,0,0.25);
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 16px 0;
}

.footer-bottom-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom span {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.25);
  font-weight: 300;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
}

@media (max-width: 560px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-tagline { max-width: 100%; }

  .footer-bottom-inner {
    flex-direction: column;
    gap: 6px;
    text-align: center;
  }
}
</style>