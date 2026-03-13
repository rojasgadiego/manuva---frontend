import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Importar vistas
import Home from '@/views/HomeView.vue'
import Login from '@/views/autenticacion/LoginView.vue'
//import Register from '@/views/autenticacion/RegisterView.vue'
import NotFound from '@/views/NotFoundView.vue'
import Forbidden from '@/views/ForbiddenView.vue'
import DashboardView from '@/views/Private/DashboardView.vue'
import AgendaView from '@/views/Private/AgendaView.vue'
import PerfilUsuario from '@/views/Private/PerfilUsuario.vue'

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
  // {
  //   path: '/register',
  //   name: 'Register',
  //   component: Register,
  //   meta: { 
  //     requiresAuth: false,
  //     title: 'Registro'
  //   }
  // },
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

  next()

})


export default router