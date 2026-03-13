<template>
  <div class="app-wrapper" :class="[{ 'sidebar-collapsed': isSidebarCollapsed }, theme]">
    <div class="hover-area" @mouseenter="expandSidebar"></div>

    <aside class="sidebar" @mouseenter="expandSidebar" @mouseleave="collapseSidebar">

      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">M</div>
          <span v-if="!isSidebarCollapsed" class="app-name">Manuva'a</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in filteredMenuItems" :key="item.path">
            <router-link
              :to="item.path"
              :class="{ active: isActive(item.path) }"
              :title="item.name"
              @click="isMobile ? closeMobileSidebar() : handleNavigation()"
            >
              <span class="menu-icon" v-html="item.icon"></span>
              <span v-if="!isSidebarCollapsed" class="menu-text">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="footer-divider"></div>
        <button class="logout-button" @click="logout" :title="isSidebarCollapsed ? 'Cerrar sesión' : ''">
          <span class="logout-icon">⏻</span>
          <span v-if="!isSidebarCollapsed" class="logout-text">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <div v-if="isMobile && !isSidebarCollapsed" class="sidebar-overlay" @click="closeMobileSidebar"></div>

    <div class="main-content">
      <header class="top-header">
        <button v-if="isMobile" class="menu-button" @click="expandSidebar" aria-label="Abrir menú">
          ☰
        </button>
        <div class="header-left">
          <div class="header-accent"></div>
          <span class="page-title">{{ currentRouteName }}</span>
        </div>
        <div class="header-right">
          <span class="header-date">{{ currentDate }}</span>

          <!-- Toggle de tema -->
          <div class="theme-toggle">
            <button
              class="theme-btn"
              :class="{ active: !isDark }"
              @click="setTheme('light')"
              title="Modo claro"
            >☀️</button>
            <button
              class="theme-btn"
              :class="{ active: isDark }"
              @click="setTheme('dark')"
              title="Modo oscuro"
            >🌙</button>
          </div>

          
        </div>
      </header>

      <main class="content-wrapper">
        <slot></slot>
      </main>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'AppLayout',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    // ── Sidebar ───────────────────────────────────────────
    const isSidebarCollapsed = ref(true)
    const autoCollapseEnabled = ref(true)
    const isMobile = ref(false)
    let collapseTimer = null

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
      autoCollapseEnabled.value = !isMobile.value
    }

    const closeMobileSidebar = () => {
      if (isMobile.value) isSidebarCollapsed.value = true
    }

    const expandSidebar = () => {
      clearTimeout(collapseTimer)
      isSidebarCollapsed.value = false
    }

    const collapseSidebar = () => {
      if (autoCollapseEnabled.value && !isMobile.value) {
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => { isSidebarCollapsed.value = true }, 300)
      }
    }

    const handleNavigation = () => {
      if (autoCollapseEnabled.value && !isMobile.value) {
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => { isSidebarCollapsed.value = true }, 2000)
      }
    }

    // ── Tema ──────────────────────────────────────────────
    const isDark = computed(() => store.getters['theme/isDark'])
    const theme  = computed(() => store.getters['theme/theme'])
    const setTheme = (value) => store.dispatch('theme/setTheme', value)

    // ── Usuario ───────────────────────────────────────────
    const currentUser  = computed(() => store.getters['auth/currentUser'])
    const userRoles    = computed(() => store.getters['auth/userRoles'] || [])
    const userInitials = computed(() => {
      if (!currentUser.value) return '?'
      return (currentUser.value.email || '').charAt(0).toUpperCase()
    })

    const currentRouteName = computed(() => route.meta.title || route.name || 'Dashboard')

    const currentDate = computed(() =>
      new Date().toLocaleDateString('es-CL', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
      })
    )

    // ── Menú ──────────────────────────────────────────────
    const menuItems = [
      { name: 'Dashboard',      path: '/dashboard', icon: '📊' },
      { name: 'Agendar salida', path: '/agenda', icon: '🛶' },
      { name: 'Mi perfil',      path: '/perfil', icon: '👤' },
    ]

    const filteredMenuItems = computed(() =>
      menuItems.filter(item => {
        if (!item.roles?.length) return true
        if (!userRoles.value?.length) return false
        return item.roles.some(r => userRoles.value.includes(r))
      })
    )

    const isActive = (path) => route.path === path || route.path.startsWith(`${path}/`)

    const logout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/')
      } catch (e) {
        console.error('Error al cerrar sesión:', e)
      }
    }

    // ── Lifecycle ─────────────────────────────────────────
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)

      const savedState = localStorage.getItem('sidebarState')
      if (savedState) isSidebarCollapsed.value = savedState === 'collapsed'

      if (autoCollapseEnabled.value && !isMobile.value) {
        collapseTimer = setTimeout(() => { isSidebarCollapsed.value = true }, 2000)
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(collapseTimer)
    })

    watch(() => route.path, () => {
      if (isMobile.value) {
        isSidebarCollapsed.value = true
      } else if (autoCollapseEnabled.value) {
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => { isSidebarCollapsed.value = true }, 2000)
      }
    })

    watch(() => isSidebarCollapsed.value, (val) => {
      localStorage.setItem('sidebarState', val ? 'collapsed' : 'expanded')
    })

    return {
      isSidebarCollapsed, isMobile,
      currentUser, userRoles, userInitials,
      currentRouteName, currentDate,
      filteredMenuItems,
      isDark, theme, setTheme,
      expandSidebar, collapseSidebar, handleNavigation,
      isActive, logout, closeMobileSidebar,
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

/* ═══════════════════════════════════════════════════════
   VARIABLES DE TEMA
   El sidebar siempre es oscuro en ambos modos.
   Solo cambian header y área de contenido.
═══════════════════════════════════════════════════════ */

.app-wrapper.dark {
  --header-bg:      #0f1117;
  --header-border:  #1e2433;
  --header-text:    #e2e8f0;
  --header-muted:   #475569;
  --content-bg:     #0c0e14;
  --surface-bg:     #141820;
  --surface-border: #1e2433;
  --text-primary:   #e2e8f0;
  --text-secondary: #64748b;
  --toggle-bg:      #1e2433;
  --toggle-active:  #0f1117;
}

.app-wrapper.light {
  --header-bg:      #ffffff;
  --header-border:  #e2e8f0;
  --header-text:    #0f172a;
  --header-muted:   #94a3b8;
  --content-bg:     #f8fafc;
  --surface-bg:     #ffffff;
  --surface-border: #e2e8f0;
  --text-primary:   #0f172a;
  --text-secondary: #64748b;
  --toggle-bg:      #f1f5f9;
  --toggle-active:  #ffffff;
}

/* ─── Layout base ─────────────────────────────────────── */
.app-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--content-bg);
  position: relative;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.25s ease;
}

.hover-area {
  position: absolute;
  top: 0; left: 0;
  width: 20px; height: 100%;
  z-index: 15;
}

/* ─── Sidebar (siempre oscuro) ────────────────────────── */
.sidebar {
  background-color: #0f1117;
  width: 240px;
  transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex; flex-direction: column;
  z-index: 10; height: 100vh; overflow: hidden;
}

.sidebar-collapsed .sidebar { width: 64px; }

.sidebar-header {
  padding: 20px 14px;
  display: flex; align-items: center;
  flex-shrink: 0;
  border-bottom: 0.5px solid #1e2433;
}

.sidebar-collapsed .sidebar-header {
  padding: 20px 0;
  justify-content: center;
}

.logo-container {
  display: flex; align-items: center;
  gap: 10px; overflow: hidden;
}

.logo-icon {
  width: 34px; height: 34px; min-width: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700; font-size: 15px; letter-spacing: -0.5px;
}

.app-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem; font-weight: 600;
  white-space: nowrap; color: #e2e8f0; letter-spacing: -0.2px;
}

/* ─── Nav ─────────────────────────────────────────────── */
.sidebar-nav {
  flex: 1; overflow-y: auto;
  padding: 12px 8px; scrollbar-width: none;
}

.sidebar-nav::-webkit-scrollbar { display: none; }

.sidebar-collapsed .sidebar-nav {
  padding: 12px 0;
  display: flex; flex-direction: column; align-items: center;
}

.sidebar-nav ul {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 2px;
}

.sidebar-collapsed .sidebar-nav ul { align-items: center; }

.sidebar-nav a {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 12px;
  text-decoration: none; color: #4a5568;
  border-radius: 7px; border-left: 2px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap; overflow: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.sidebar-collapsed .sidebar-nav a {
  justify-content: center; padding: 10px 0;
  width: 42px; border-left: none;
}

.sidebar-nav a:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.sidebar-nav a.active {
  background-color: rgba(56, 189, 248, 0.1);
  color: #38bdf8; border-left-color: #38bdf8;
}

.sidebar-collapsed .sidebar-nav a.active {
  border-left: none;
  background-color: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
}

.menu-icon {
  display: flex; align-items: center; justify-content: center;
  width: 18px; min-width: 18px; font-size: 15px;
}

.menu-text { font-size: 0.875rem; font-weight: 500; color: inherit; }

/* ─── Footer sidebar ──────────────────────────────────── */
.sidebar-footer { padding: 0 8px 18px; flex-shrink: 0; }

.sidebar-collapsed .sidebar-footer {
  padding: 0 0 18px;
  display: flex; flex-direction: column; align-items: center;
}

.footer-divider {
  height: 0.5px; background: #1e2433; margin: 0 4px 12px;
}

.logout-button {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: transparent; border: none;
  border-radius: 7px; cursor: pointer; color: #4a5568; width: 100%;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap; overflow: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.sidebar-collapsed .logout-button {
  width: 42px; height: 42px; padding: 0; justify-content: center;
}

.logout-button:hover {
  background-color: rgba(239, 68, 68, 0.08); color: #f87171;
}

.logout-icon { font-size: 13px; min-width: 18px; display: flex; justify-content: center; }
.logout-text { font-size: 0.875rem; font-weight: 500; }

/* ─── Overlay móvil ───────────────────────────────────── */
.sidebar-overlay {
  position: fixed; inset: 0;
  background-color: rgba(0, 0, 0, 0.55); z-index: 5;
}

/* ─── Main content ────────────────────────────────────── */
.main-content {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; height: 100vh;
}

/* ─── Top header ──────────────────────────────────────── */
.top-header {
  height: 58px;
  background-color: var(--header-bg);
  padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 0.5px solid var(--header-border);
  flex-shrink: 0; gap: 16px;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.menu-button {
  background: none; border: none; font-size: 18px;
  margin-right: 4px; padding: 8px; cursor: pointer;
  color: #94a3b8; display: none; border-radius: 7px;
  flex-shrink: 0; line-height: 1;
}

.menu-button:hover { background-color: rgba(255, 255, 255, 0.06); }

.header-left { display: flex; align-items: center; gap: 10px; }

.header-accent {
  width: 2.5px; height: 16px;
  border-radius: 2px; background: #38bdf8; flex-shrink: 0;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; font-weight: 600;
  color: var(--header-text);
  white-space: nowrap; letter-spacing: -0.1px;
  transition: color 0.25s ease;
}

.header-right { display: flex; align-items: center; gap: 14px; }

.header-date {
  font-family: 'Inter', sans-serif;
  font-size: 12px; font-weight: 400;
  color: var(--header-muted); white-space: nowrap;
  transition: color 0.25s ease;
}

/* ─── Toggle de tema ──────────────────────────────────── */
.theme-toggle {
  display: flex; align-items: center;
  background: var(--toggle-bg);
  border-radius: 8px; padding: 3px; gap: 2px;
  transition: background 0.25s ease;
}

.theme-btn {
  width: 28px; height: 28px;
  border: none; border-radius: 6px;
  background: transparent; cursor: pointer;
  font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, opacity 0.15s ease;
  opacity: 0.4;
}

.theme-btn.active {
  background: var(--toggle-active);
  opacity: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.theme-btn:not(.active):hover { opacity: 0.7; }

/* ─── Avatar ──────────────────────────────────────────── */
.user-avatar {
  width: 30px; height: 30px; min-width: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px; font-weight: 600;
  cursor: default; user-select: none;
}

/* ─── Content wrapper ─────────────────────────────────── */
.content-wrapper {
  flex: 1; padding: 24px; overflow: auto;
  display: flex; flex-direction: column;
  background-color: var(--content-bg);
  font-family: 'Inter', sans-serif;
  color: var(--text-primary);
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* ─── Móviles ─────────────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed; height: 100%;
    transform: translateX(-100%); width: 240px;
    transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .sidebar-collapsed .sidebar { transform: translateX(-100%); }
  .app-wrapper:not(.sidebar-collapsed) .sidebar { transform: translateX(0); }

  .menu-button { display: flex; }
  .hover-area { display: none; }
  .content-wrapper { padding: 16px; }
  .top-header { padding: 0 16px; }
  .header-date { display: none; }
}
</style>