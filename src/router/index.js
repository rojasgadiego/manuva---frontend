import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Importar vistas
import Home from '@/views/HomeView.vue'
import Login from '@/views/autenticacion/LoginView.vue'
import NotFound from '@/views/NotFoundView.vue'
import Forbidden from '@/views/ForbiddenView.vue'
import DashboardView from '@/views/Private/DashboardView.vue'
import AgendaView from '@/views/Private/AgendaView.vue'
import PerfilUsuario from '@/views/Private/PerfilUsuario.vue'
import HistorialView from '@/views/Private/HistorialSalidas.vue'

// Definir rutas
const routes = [
  // Rutas públicas (no requieren autenticación)
  // TODO: crear una vista pubica la cual contendra contenido (Quienes somos, Servicio, Catalogo y galeria)
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { 
      requiresAuth: false,
      title: 'Home'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresAuth: false,
      title: 'Iniciar Sesión'
    }
  },
  {
    path: '/registro',
    name: 'Register',
    component: () => import('@/views/autenticacion/RegisterView.vue'),
    meta: { requiresAuth: false, title: 'Registro' }
  },
  {
    path: '/recuperar-password',
    name: 'RecuperarPassword',
    component: () => import('@/views/autenticacion/RecuperarPasswordView.vue'),
    meta: { requiresAuth: false, title: 'Recuperar contraseña' }
  },
  // Rutas autenticadas (requieren login)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Panel Principal'
    }
  },
  {
    path: '/agenda',
    name: 'Agenda',
    component: AgendaView,
    meta: {
      requiresAuth: true,
      title: 'Salidas'
    }
  },
  {
    path: '/salidas/:id(\\d+)',
    name: 'SalidaDetalle',
    component: () => import('@/views/Private/SalidaDetalleView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Detalle de salida'
    }
  },
  {
    path: '/eventos',
    name: 'Eventos',
    component: () => import('@/views/Private/EventosView.vue'),
    meta: { requiresAuth: true, title: 'Eventos' }
  },
  {
    path: '/eventos/:id(\\d+)',
    name: 'EventoDetalle',
    component: () => import('@/views/Private/EventoDetalleView.vue'),
    meta: { requiresAuth: true, title: 'Evento' }
  },
  {
    path: '/membresia',
    name: 'Membresia',
    component: () => import('@/views/Private/MembresiaView.vue'),
    meta: { requiresAuth: true, title: 'Mi membresía' }
  },
  // Gestión: meta.roles restringe el acceso (el guard redirige a /forbidden)
  {
    path: '/muelle',
    name: 'Muelle',
    component: () => import('@/views/Admin/MuelleView.vue'),
    meta: { requiresAuth: true, title: 'Muelle', roles: ['Administrador', 'Entrenador'] }
  },
  {
    path: '/admin/socios',
    name: 'AdminSocios',
    component: () => import('@/views/Admin/AdminSociosView.vue'),
    meta: { requiresAuth: true, title: 'Socios', roles: ['Administrador', 'Directiva'] }
  },
  {
    path: '/admin/cobranza',
    name: 'AdminCobranza',
    component: () => import('@/views/Admin/AdminCobranzaView.vue'),
    meta: { requiresAuth: true, title: 'Cobranza', roles: ['Administrador', 'Directiva'] }
  },
  {
    path: '/admin/flota',
    name: 'AdminFlota',
    component: () => import('@/views/Admin/AdminFlotaView.vue'),
    meta: { requiresAuth: true, title: 'Flota', roles: ['Administrador', 'Entrenador'] }
  },
  {
    path: '/historial',
    name: 'Historial',
    component: HistorialView,
    meta: {
      requiresAuth: true,
      title: 'Historial de Salidas'
    }
  },
  // Ruta para configuración (solo admin)
  {
    path: '/perfil',
    name: 'Perfil',
    component: PerfilUsuario,
    meta: {
      requiresAuth: true,
      title: 'Mi Perfil'
    }
  },
  // Rutas de error
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: Forbidden,
    meta: {
      requiresAuth: false,
      title: 'Acceso Denegado'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      requiresAuth: false,
      title: 'Página No Encontrada'
    }
  }
]

// Crear el router
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guard de navegación global para protección de rutas
router.beforeEach(async (to, from, next) => {

  document.title = to.meta.title
    ? `${to.meta.title} | Manuva`
    : 'Manuva'

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  const isAuthenticated = store.getters['auth/isAuthenticated']

  if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  if (requiresAuth && !isAuthenticated) {

    try {

      await store.dispatch('auth/initAuth')

      if (store.getters['auth/isAuthenticated']) {
        next()
        return
      }

    } catch (error) {
      console.warn('Auth init error', error)
    }

    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })

    return
  }

  // Rutas de gestión: la API también valida el rol; esto evita mostrar pantallas inútiles
  const roles = to.matched.flatMap(record => record.meta.roles ?? [])
  if (roles.length && !roles.includes(store.getters['auth/userRole'])) {
    next({ name: 'Forbidden' })
    return
  }

  next()

})


export default router