<template>
  <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="nav-container">
      <!-- Logo -->
      <div class="nav-logo">
        <h2>🌸 Florería Colibrí</h2>
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
        <li class="nav-item login-item">
          <button class="login-btn" @click="handleLogin">
            <span class="login-icon">👤</span>
          </button>
        </li>
      </ul>
      
      <!-- Botón hamburguesa para móvil -->
      <div class="nav-toggle" :class="{ active: isMenuOpen }" @click="toggleMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </div>
  </nav>
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
        { id: 'quienes-somos', name: 'Quiénes Somos' },
        { id: 'servicios', name: 'Servicios' },
        { id: 'catalogo', name: 'Catálogo' },
        { id: 'galeria', name: 'Galería' },
        { id: 'ubicacion', name: 'Ubicación' }
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
        // Animación suave personalizada con offset para la navbar fija
        const offsetTop = element.offsetTop - 100
        
        this.activeSection = sectionId
        
        // Scroll suave con animación personalizada
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
        
        // Agregar clase de animación temporal al enlace
        const navLink = document.querySelector(`a[href="#${sectionId}"]`)
        if (navLink) {
          navLink.classList.add('clicking')
          setTimeout(() => {
            navLink.classList.remove('clicking')
          }, 600)
        }
        
        // Agregar animación a la sección destino
        setTimeout(() => {
          element.classList.add('section-highlight')
          setTimeout(() => {
            element.classList.remove('section-highlight')
          }, 1000)
        }, 500)
      }
      this.isMenuOpen = false // Cerrar menú móvil después de hacer clic
    },
    handleLogin() {
      // Aquí puedes agregar la lógica de login o redirección
      this.$router.push('/login')
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 50
      
      // Detectar sección activa basada en scroll
      const sections = this.menuItems.map(item => item.id)
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section) {
          const rect = section.getBoundingClientRect()
          if (rect.top <= 150) {
            this.activeSection = sections[i]
            break
          }
        }
      }
    }
  },
  mounted() {
    // Cerrar menú móvil al hacer clic fuera de él
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        this.isMenuOpen = false
      }
    })
    
    // Escuchar scroll para efectos
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
  padding: 1rem 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.navbar-scrolled {
  background: rgba(232, 245, 232, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.5rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo h2 {
  color: #2d6a4f;
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.nav-logo h2:hover {
  transform: scale(1.05);
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #2d6a4f;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 25px;
}

.nav-link:hover {
  color: #40916c;
  background: rgba(116, 198, 157, 0.1);
  transform: translateY(-2px);
}

.nav-link.active {
  color: #52b788;
  background: rgba(116, 198, 157, 0.2);
  font-weight: 600;
}

.nav-link.clicking {
  animation: clickPulse 0.6s ease;
}

@keyframes clickPulse {
  0% { transform: scale(1) translateY(-2px); }
  25% { transform: scale(1.1) translateY(-4px); }
  50% { transform: scale(1.05) translateY(-3px); }
  100% { transform: scale(1) translateY(-2px); }
}

/* Botón de Login */
.login-item {
  margin-left: 1rem;
}

.login-btn {
  /* background: linear-gradient(135deg, #52b788, #40916c); */
  color: white;
  border: none;
  padding: 0.7rem 0.7rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  /* box-shadow: 0 4px 15px rgba(82, 183, 136, 0.3); */
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(177, 177, 177, 0.4);
  background: linear-gradient(135deg, #c5c5c5, #d6d6d6);
}

.login-btn:active {
  transform: translateY(0);
}

.login-icon {
  font-size: 1.1rem;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.bar {
  width: 25px;
  height: 3px;
  background: #2d6a4f;
  margin: 3px 0;
  transition: 0.3s;
}

/* Animación del menú hamburguesa */
.nav-toggle.active .bar:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.nav-toggle.active .bar:nth-child(2) {
  opacity: 0;
}

.nav-toggle.active .bar:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* Efectos adicionales de hover */
.nav-link::before {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  width: 0;
  height: 2px;
  background: #52b788;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::before,
.nav-link.active::before {
  width: 80%;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    left: -100%;
    top: 80px;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    width: 100%;
    text-align: center;
    transition: 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 10px 27px rgba(0,0,0,0.05);
    padding: 2rem 0;
    gap: 1rem;
  }

  .nav-menu.active {
    left: 0;
    animation: slideInLeft 0.3s ease;
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .nav-toggle {
    display: flex;
  }

  .login-item {
    margin-left: 0;
    margin-top: 1rem;
  }

  .login-btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
}
</style>