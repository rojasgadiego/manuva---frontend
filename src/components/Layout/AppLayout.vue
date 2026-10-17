<template>
  <div class="app-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed, 'is-mobile': isMobile }">
    <a href="#contenido" class="skip-link">Saltar al contenido</a>

    <div v-if="!isMobile" class="hover-area" @mouseenter="expandSidebar"></div>

    <aside
      class="sidebar"
      :aria-hidden="isMobile && isSidebarCollapsed ? 'true' : null"
      @mouseenter="expandSidebar"
      @mouseleave="collapseSidebar"
    >
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon" aria-hidden="true">M</div>
          <span v-if="!isSidebarCollapsed" class="app-name">Manuva'a</span>
        </div>
        <button v-if="isMobile" class="icon-btn close-btn" aria-label="Cerrar menú" @click="closeMobileSidebar">
          <X :size="18" />
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Navegación principal">
        <template v-for="grupo in gruposMenu" :key="grupo.nombre">
          <p v-if="grupo.nombre && !isSidebarCollapsed" class="nav-group">{{ grupo.nombre }}</p>
          <div v-else-if="grupo.nombre" class="nav-divider" aria-hidden="true"></div>
          <ul>
            <li v-for="item in grupo.items" :key="item.path">
              <router-link
                :to="item.path"
                :class="{ active: isActive(item.path) }"
                :title="isSidebarCollapsed ? item.name : null"
                :aria-current="isActive(item.path) ? 'page' : null"
                @click="isMobile ? closeMobileSidebar() : handleNavigation()"
              >
                <component :is="item.icon" class="menu-icon" :size="18" aria-hidden="true" />
                <span v-if="!isSidebarCollapsed" class="menu-text">{{ item.name }}</span>
                <span v-else class="sr-only">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div v-if="!isSidebarCollapsed && currentUser" class="user-card">
          <span class="user-avatar" aria-hidden="true">{{ userInitials }}</span>
          <div class="user-info">
            <span class="user-name">{{ currentUser.nombreCompleto }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
        <button class="logout-button" :title="isSidebarCollapsed ? 'Cerrar sesión' : null" @click="logout">
          <LogOut :size="17" aria-hidden="true" />
          <span v-if="!isSidebarCollapsed" class="logout-text">Cerrar sesión</span>
          <span v-else class="sr-only">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <div v-if="isMobile && !isSidebarCollapsed" class="sidebar-overlay" @click="closeMobileSidebar"></div>

    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <div class="header-accent" aria-hidden="true"></div>
          <span class="page-title">{{ currentRouteName }}</span>
        </div>
        <div class="header-right">
          <span class="header-date">{{ currentDate }}</span>

          <div class="theme-toggle" role="group" aria-label="Tema de color">
            <button class="theme-btn" :class="{ active: !isDark }" :aria-pressed="!isDark" title="Modo claro" @click="setTheme('light')">
              <Sun :size="15" aria-hidden="true" /><span class="sr-only">Modo claro</span>
            </button>
            <button class="theme-btn" :class="{ active: isDark }" :aria-pressed="isDark" title="Modo oscuro" @click="setTheme('dark')">
              <Moon :size="15" aria-hidden="true" /><span class="sr-only">Modo oscuro</span>
            </button>
          </div>
        </div>
      </header>

      <main id="contenido" class="content-wrapper" tabindex="-1">
        <slot></slot>
      </main>

      <!-- Navegación inferior en celular: accesos principales + "Más" abre el menú completo -->
      <nav v-if="isMobile" class="bottom-nav" aria-label="Accesos rápidos">
        <router-link
          v-for="item in accesosMovil" :key="item.path" :to="item.path"
          class="bottom-item" :class="{ active: isActive(item.path) }"
          :aria-current="isActive(item.path) ? 'page' : null"
        >
          <component :is="item.icon" :size="20" aria-hidden="true" />
          <span>{{ item.corto || item.name }}</span>
        </router-link>
        <button class="bottom-item" :aria-expanded="!isSidebarCollapsed" @click="expandSidebar">
          <MoreHorizontal :size="20" aria-hidden="true" />
          <span>Más</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, CalendarDays, Trophy, History, CreditCard, UserRound,
  Anchor, Users, ReceiptText, Wrench, LogOut, Sun, Moon, MoreHorizontal, X,
} from 'lucide-vue-next'

const MENU = [
  { name: 'Inicio',     path: '/dashboard',      icon: LayoutDashboard },
  { name: 'Agenda',     path: '/agenda',         icon: CalendarDays },
  { name: 'Eventos',    path: '/eventos',        icon: Trophy },
  { name: 'Historial',  path: '/historial',      icon: History },
  { name: 'Membresía',  path: '/membresia',      icon: CreditCard, corto: 'Cuotas' },
  { name: 'Mi perfil',  path: '/perfil',         icon: UserRound },
  { name: 'Muelle',     path: '/muelle',         icon: Anchor,      grupo: 'Gestión', roles: ['Administrador', 'Entrenador'] },
  { name: 'Socios',     path: '/admin/socios',   icon: Users,       grupo: 'Gestión', roles: ['Administrador', 'Directiva'] },
  { name: 'Cobranza',   path: '/admin/cobranza', icon: ReceiptText, grupo: 'Gestión', roles: ['Administrador', 'Directiva'] },
  { name: 'Flota',      path: '/admin/flota',    icon: Wrench,      grupo: 'Gestión', roles: ['Administrador', 'Entrenador'] },
]
const ACCESOS_MOVIL = ['/dashboard', '/agenda', '/eventos', '/membresia']

export default {
  name: 'AppLayout',
  components: { LogOut, Sun, Moon, MoreHorizontal, X },

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    // ── Sidebar ───────────────────────────────────────────
    const isSidebarCollapsed = ref(true)
    const isMobile = ref(false)
    let collapseTimer = null

    const checkMobile = () => {
      const eraMovil = isMobile.value
      isMobile.value = window.innerWidth <= 768
      if (isMobile.value && !eraMovil) isSidebarCollapsed.value = true
    }

    const closeMobileSidebar = () => { if (isMobile.value) isSidebarCollapsed.value = true }

    const expandSidebar = () => {
      clearTimeout(collapseTimer)
      isSidebarCollapsed.value = false
    }

    const collapseSidebar = () => {
      if (isMobile.value) return
      clearTimeout(collapseTimer)
      collapseTimer = setTimeout(() => { isSidebarCollapsed.value = true }, 300)
    }

    const handleNavigation = () => {
      if (isMobile.value) return
      clearTimeout(collapseTimer)
      collapseTimer = setTimeout(() => { isSidebarCollapsed.value = true }, 2000)
    }

    const onKeydown = (e) => { if (e.key === 'Escape') closeMobileSidebar() }

    // ── Tema ──────────────────────────────────────────────
    const isDark = computed(() => store.getters['theme/isDark'])
    const setTheme = (value) => store.dispatch('theme/setTheme', value)

    // ── Usuario ───────────────────────────────────────────
    const currentUser  = computed(() => store.getters['auth/currentUser'])
    const userRole     = computed(() => store.getters['auth/userRole'])
    const userInitials = computed(() => {
      const nombre = currentUser.value?.nombreCompleto || currentUser.value?.username || ''
      return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
    })

    const currentRouteName = computed(() => route.meta.title || route.name || 'Inicio')
    const currentDate = computed(() =>
      new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }))

    // ── Menú (item.roles: solo esos roles lo ven) ─────────
    const visibles = computed(() => MENU.filter(i => !i.roles?.length || i.roles.includes(userRole.value)))
    const gruposMenu = computed(() => {
      const grupos = []
      for (const item of visibles.value) {
        const nombre = item.grupo ?? ''
        let g = grupos.find(x => x.nombre === nombre)
        if (!g) grupos.push(g = { nombre, items: [] })
        g.items.push(item)
      }
      return grupos
    })
    const accesosMovil = computed(() => ACCESOS_MOVIL.map(p => MENU.find(i => i.path === p)))

    const isActive = (path) => route.path === path || route.path.startsWith(`${path}/`)

    const logout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/')
      } catch (e) {
        console.error('Error al cerrar sesión:', e)
      }
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
      window.addEventListener('keydown', onKeydown)
      if (!isMobile.value) collapseTimer = setTimeout(() => { isSidebarCollapsed.value = true }, 2000)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('keydown', onKeydown)
      clearTimeout(collapseTimer)
    })

    watch(() => route.path, () => {
      if (isMobile.value) isSidebarCollapsed.value = true
      else handleNavigation()
    })

    return {
      isSidebarCollapsed, isMobile,
      currentUser, userRole, userInitials,
      currentRouteName, currentDate,
      gruposMenu, accesosMovil,
      isDark, setTheme,
      expandSidebar, collapseSidebar, handleNavigation,
      isActive, logout, closeMobileSidebar,
    }
  },
}
</script>

<style scoped>
/* ─── Layout base ─────────────────────────────────────── */
.app-wrapper {
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: var(--content-bg);
  position: relative;
  font-family: var(--font-body);
}

.hover-area {
  position: absolute;
  top: 0; left: 0;
  width: 20px; height: 100%;
  z-index: 15;
}

/* ─── Sidebar (siempre oscuro) ────────────────────────── */
.sidebar {
  background-color: var(--sidebar-bg);
  width: 210px;
  transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex; flex-direction: column;
  z-index: 20; height: 100%; overflow: hidden;
}
.sidebar-collapsed .sidebar { width: 64px; }

.sidebar-header {
  height: 58px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 0.5px solid var(--sidebar-border);
}
.sidebar-collapsed .sidebar-header { padding: 0; justify-content: center; }

.logo-container { display: flex; align-items: center; gap: 10px; overflow: hidden; }

.logo-icon {
  width: 34px; height: 34px; min-width: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 700; font-size: 15px;
}

.app-name {
  font-family: var(--font-display);
  font-size: 1.05rem; font-weight: 600;
  white-space: nowrap; color: #e2e8f0;
}

/* ─── Nav ─────────────────────────────────────────────── */
.sidebar-nav {
  flex: 1; overflow-y: auto;
  padding: 12px 8px; scrollbar-width: none;
}
.sidebar-nav::-webkit-scrollbar { display: none; }
.sidebar-collapsed .sidebar-nav { padding: 12px 0; }

.sidebar-nav ul {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.sidebar-collapsed .sidebar-nav ul { align-items: center; }

.nav-group {
  font-family: var(--font-display);
  font-size: 0.66rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #64748b;
  padding: 16px 12px 6px;
}
.nav-divider { height: 0.5px; background: var(--sidebar-border); margin: 12px 14px; }

.sidebar-nav a {
  display: flex; align-items: center; gap: 11px;
  min-height: 40px;
  padding: 0 12px;
  text-decoration: none; color: var(--sidebar-text);
  border-radius: 8px; border-left: 2px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap; overflow: hidden;
  font-family: var(--font-display);
}
.sidebar-collapsed .sidebar-nav a { justify-content: center; padding: 0; width: 42px; border-left: none; }

.sidebar-nav a:hover { background-color: rgba(255, 255, 255, 0.06); color: var(--sidebar-text-hover); }
.sidebar-nav a.active { background-color: rgba(56, 189, 248, 0.12); color: #38bdf8; border-left-color: #38bdf8; }
.sidebar-nav a:focus-visible { outline: 2px solid #38bdf8; outline-offset: -2px; }

.menu-icon { flex-shrink: 0; }
.menu-text { font-size: 0.875rem; font-weight: 500; }

/* ─── Footer sidebar ──────────────────────────────────── */
.sidebar-footer {
  padding: 10px 8px 16px;
  flex-shrink: 0;
  border-top: 0.5px solid var(--sidebar-border);
  display: flex; flex-direction: column; gap: 6px;
}
.sidebar-collapsed .sidebar-footer { align-items: center; padding: 10px 0 16px; }

.user-card { display: flex; align-items: center; gap: 10px; padding: 6px 8px; }
.user-avatar {
  width: 32px; height: 32px; min-width: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: #fff; font-family: var(--font-display); font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.user-info { display: flex; flex-direction: column; min-width: 0; }
.user-name { color: #e2e8f0; font-size: 0.82rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { color: #64748b; font-size: 0.72rem; }

.logout-button {
  display: flex; align-items: center; gap: 10px;
  min-height: 40px; padding: 0 12px;
  background: transparent; border: none; border-radius: 8px;
  cursor: pointer; color: var(--sidebar-text); width: 100%;
  font-family: var(--font-display); font-size: 0.875rem; font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.sidebar-collapsed .logout-button { width: 42px; padding: 0; justify-content: center; }
.logout-button:hover { background-color: rgba(239, 68, 68, 0.1); color: #f87171; }

.icon-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 8px;
  color: var(--sidebar-text); cursor: pointer;
}

/* ─── Overlay móvil ───────────────────────────────────── */
.sidebar-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.55); z-index: 15; }

/* ─── Main content ────────────────────────────────────── */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

.top-header {
  height: 58px;
  background-color: var(--header-bg);
  padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 0.5px solid var(--header-border);
  flex-shrink: 0; gap: 16px;
}

.header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.header-accent { width: 2.5px; height: 16px; border-radius: 2px; background: var(--ui-cyan); flex-shrink: 0; }
.page-title {
  font-family: var(--font-display);
  font-size: 14px; font-weight: 600;
  color: var(--header-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.header-right { display: flex; align-items: center; gap: 14px; }
.header-date { font-size: 12px; color: var(--header-muted); white-space: nowrap; }

.theme-toggle { display: flex; align-items: center; background: var(--toggle-bg); border-radius: 8px; padding: 3px; gap: 2px; }
.theme-btn {
  width: 30px; height: 28px;
  border: none; border-radius: 6px;
  background: transparent; cursor: pointer;
  color: var(--header-muted);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}
.theme-btn.active { background: var(--toggle-active); color: var(--header-text); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); }
.theme-btn:not(.active):hover { color: var(--header-text); }

.content-wrapper {
  flex: 1; padding: 24px; overflow: auto;
  display: flex; flex-direction: column;
  background-color: var(--content-bg);
  color: var(--text-primary);
}
.content-wrapper:focus { outline: none; }

/* ─── Navegación inferior (celular) ───────────────────── */
.bottom-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  flex-shrink: 0;
  background: var(--header-bg);
  border-top: 0.5px solid var(--header-border);
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-item {
  min-height: 58px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  background: none; border: none; cursor: pointer;
  color: var(--text-secondary);
  font-family: var(--font-display); font-size: 0.66rem; font-weight: 600;
  text-decoration: none;
}
.bottom-item.active { color: var(--ui-cyan); }

/* ─── Móviles ─────────────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .sidebar-collapsed .sidebar { width: 260px; }
  .app-wrapper:not(.sidebar-collapsed) .sidebar { transform: translateX(0); }

  .content-wrapper { padding: 16px; }
  .top-header { padding: 0 16px; }
  .header-date { display: none; }
}
</style>
