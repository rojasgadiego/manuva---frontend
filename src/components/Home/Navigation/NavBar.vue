<template>
  <div>
    <!-- Barra superior decorativa con shimmer -->
    <!-- <div class="nav-top-bar"></div> -->

    <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
      <div class="nav-container">

        <!-- Logo -->
        <div class="nav-logo">
          <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="11" cy="11" rx="9" ry="5.5" fill="rgba(29,120,80,0.15)" stroke="#1d7850" stroke-width="1.5" transform="rotate(-45 11 11)"/>
            <line x1="16" y1="16" x2="32" y2="32" stroke="#1d7850" stroke-width="2" stroke-linecap="round"/>
            <circle cx="33" cy="33" r="2.5" fill="#0d4a5c" opacity="0.6"/>
          </svg>
          <div class="logo-text">
            <h2>Club Manuva'a</h2>
            <span>Canotaje · Coquimbo · Chile</span>
          </div>
        </div>

        <!-- Menú de navegación -->
        <ul class="nav-menu" :class="{ active: isMenuOpen }">
          <li class="nav-item" v-for="(item, index) in menuItems" :key="index">
            <a
              :href="'#' + item.id"
              class="nav-link"
              :class="{ active: activeSection === item.id }"
              @click="scrollToSection(item.id)"
            >
              {{ item.name }}
            </a>
          </li>

          <!-- Botón Área Socios -->
          <li class="nav-item login-item">
            <button class="login-btn" @click="handleLogin">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Área Socios
            </button>
          </li>
        </ul>

        <!-- Botón hamburguesa -->
        <div class="nav-toggle" :class="{ active: isMenuOpen }" @click="toggleMenu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>

      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isMenuOpen: false,
      isScrolled: false,
      activeSection: '',
      menuItems: [
        { id: 'inicio',    name: 'Inicio' },
        { id: 'nosotros',  name: 'Nosotros' },
        { id: 'catalogo',  name: 'Catálogo' },
        { id: 'galeria',   name: 'Galería' },
        { id: 'contacto',  name: 'Contacto' },
      ]
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId)
      if (element) {
        const offsetTop = element.offsetTop - 90
        this.activeSection = sectionId
        window.scrollTo({ top: offsetTop, behavior: 'smooth' })
      }
      this.isMenuOpen = false
    },
    handleLogin() {
      this.$router.push('/login')
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 50

      // Detectar sección activa
      for (let i = this.menuItems.length - 1; i >= 0; i--) {
        const section = document.getElementById(this.menuItems[i].id)
        if (section) {
          const rect = section.getBoundingClientRect()
          if (rect.top <= 150) {
            this.activeSection = this.menuItems[i].id
            break
          }
        }
      }
    }
  },
  mounted() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar') && !e.target.closest('.nav-top-bar')) {
        this.isMenuOpen = false
      }
    })
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Barra superior decorativa ── */
.nav-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  z-index: 1001;
  background: linear-gradient(90deg, #1a5c3a 0%, #0d4a5c 100%);
  overflow: hidden;
}

.nav-top-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0%, transparent 40%,
    rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.3) 50%,
    transparent 50%, transparent 100%
  );
  background-size: 60px 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0%   { background-position: 0 0; }
  100% { background-position: 180px 0; }
}

/* ── Navbar principal ── */
.navbar {
  position: fixed;
  top: 4px; /* justo debajo de la barra decorativa */
  left: 0;
  width: 100%;
  z-index: 1000;
  background: linear-gradient(180deg, #f0f9f4 0%, #e8f5f0 100%);
  border-bottom: 1px solid rgba(29, 120, 80, 0.12);
  transition: all 0.35s ease;
}

.navbar-scrolled {
  background: rgba(240, 249, 244, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(29, 120, 80, 0.1);
}

/* ── Contenedor ── */
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
}

/* ── Logo ── */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.nav-logo:hover .logo-icon {
  transform: rotate(-8deg) scale(1.05);
}

.logo-text h2 {
  font-family: 'Cinzel', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a3d2b;
  letter-spacing: 1.5px;
  line-height: 1.1;
}

.logo-text span {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.5rem;
  color: #5a8a72;
  letter-spacing: 3.5px;
  font-weight: 300;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ── Menú ── */
.nav-menu {
  display: flex;
  list-style: none;
  gap: 0.2rem;
  align-items: center;
  margin: 0;
  padding: 0;
}

/* ── Links ── */
.nav-link {
  text-decoration: none;
  color: #2d5a3d;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.83rem;
  font-weight: 400;
  letter-spacing: 0.3px;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  display: block;
  transition: all 0.25s ease;
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(29,120,80,0.08), rgba(13,74,92,0.06));
  opacity: 0;
  transition: opacity 0.25s;
}

.nav-link:hover {
  color: #1d7850;
}

.nav-link:hover::before {
  opacity: 1;
}

.nav-link.active {
  color: #1d7850;
  font-weight: 500;
}

.nav-link.active::before {
  opacity: 1;
}

/* Indicador activo — punto inferior */
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1d7850;
}

/* ── Botón Área Socios ── */
.login-item {
  margin-left: 0.8rem;
}

.login-btn {
  background: linear-gradient(135deg, #1d7850, #0d4a5c);
  border: none;
  color: #fff;
  padding: 0.55rem 1.3rem;
  border-radius: 30px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(29, 120, 80, 0.25);
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(29, 120, 80, 0.35);
}

.login-btn:active {
  transform: translateY(0);
}

/* ── Hamburguesa ── */
.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
  padding: 4px;
}

.bar {
  width: 24px;
  height: 2px;
  background: #1a3d2b;
  border-radius: 2px;
  transition: all 0.3s ease;
  display: block;
}

.nav-toggle.active .bar:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.nav-toggle.active .bar:nth-child(2) {
  opacity: 0;
  transform: translateX(-8px);
}

.nav-toggle.active .bar:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    left: -100%;
    top: 76px; /* 4px barra + 72px navbar */
    flex-direction: column;
    background: rgba(240, 249, 244, 0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    width: 100%;
    text-align: center;
    transition: left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    padding: 1.5rem 0 2rem;
    gap: 0.3rem;
    border-bottom: 2px solid rgba(29,120,80,0.1);
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-toggle {
    display: flex;
  }

  .login-item {
    margin-left: 0;
    margin-top: 0.8rem;
  }

  .login-btn {
    padding: 0.75rem 2rem;
    font-size: 0.9rem;
  }

  .nav-link {
    font-size: 0.95rem;
    padding: 0.65rem 2rem;
  }
}
</style>