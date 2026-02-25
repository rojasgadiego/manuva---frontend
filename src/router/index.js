import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Importar vistas
import Home from '@/views/HomeView.vue'
import Login from '@/views/autenticacion/LoginView.vue'
import Register from '@/views/autenticacion/RegisterView.vue'
import NotFound from '@/views/NotFoundView.vue'
import Forbidden from '@/views/ForbiddenView.vue'
import DashboardView from '@/views/Private/DashboardView.vue'

// Definir rutas
const routes = [
    {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Panel Principal'
    }
  },
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
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      requiresAuth: false,
      title: 'Registro'
    }
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
  // // Ruta para configuración (solo admin)
  // {
  //   path: '/settings',
  //   name: 'Settings',
  //   component: () => import('@/views/Settings.vue'),
  //   meta: {
  //     requiresAuth: true,
  //     roles: ['admin'],
  //     title: 'Configuración del Sistema'
  //   }
  // },
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
  // Actualizar título de la página
  document.title = to.meta.title ? `${to.meta.title} | Manuva` : 'Manuva'

  if (to.name === 'Login' && store.getters['auth/isAuthenticated']) {
    next({ name: 'Dashboard' })
    return
  }
  
  // Verificar si la ruta requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    // Verificar autenticación usando el store
    const isAuthenticated = store.getters['auth/isAuthenticated']
    
    if (!isAuthenticated) {
      // Si no está autenticado según el store, verificar si hay token en localStorage
      const token = localStorage.getItem('token')
      
      if (token) {
        // Si hay token pero no está en el store, restaurar estado
        await store.dispatch('auth/initAuth')
        
        // Después de restaurar, verificar nuevamente
        if (store.getters['auth/isAuthenticated']) {
          // Verificar roles si es necesario
          return checkRolesAndProceed(to, next)
        }
      }
      
      // No hay token o no es válido, redirigir a login
      next({
        path: '/login',  // Cambio de '/' a '/login'
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Si está autenticado, verificar roles
    return checkRolesAndProceed(to, next)
  } else {
    // Para rutas públicas, simplemente permitir acceso
    next()
  }
})

// Función auxiliar para verificar roles y proceder
function checkRolesAndProceed(to, next) {
  // Verificar roles requeridos
  const requiredRoles = to.matched.reduce((roles, record) => {
    if (record.meta.roles) {
      return [...roles, ...record.meta.roles]
    }
    return roles
  }, [])
  
  // Si la ruta requiere roles específicos
  if (requiredRoles.length > 0) {
    // Obtener roles del usuario
    const userRoles = store.getters['auth/userRoles']
    
    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
    
    if (!hasRequiredRole) {
      // Redirigir a página de acceso denegado
      next({ name: 'Forbidden' })
      return
    }
  }
  
  // Usuario autenticado y con los roles adecuados
  next()
}

export default router