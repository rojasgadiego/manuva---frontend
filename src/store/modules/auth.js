import authService from '@/services/auth.service'
import router from '@/router'

// Estado inicial, verificando localStorage para persistencia
const initialState = {
  // Token de autenticación
  token: localStorage.getItem('token') || null,
  // Datos del usuario
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  // Roles del usuario
  roles: JSON.parse(localStorage.getItem('roles') || '[]'),
  // Estado de autenticación
  isAuthenticated: !!localStorage.getItem('token'),
  // Estado de carga
  loading: false,
  // Información de error
  error: null
}

const auth = {
  namespaced: true,
  
  state: () => ({ ...initialState }),
  
  getters: {
    // Comprobar si el usuario está autenticado
    isAuthenticated: state => !!state.token,
    
    // Obtener usuario actual
    currentUser: state => state.user,
    
    // Obtener roles del usuario
    userRoles: state => Array.isArray(state.roles) ? state.roles : [state.roles],
    
    // Comprobar si el usuario tiene un rol específico
    hasRole: state => role => {
      if (!state.roles) return false;
      if (Array.isArray(state.roles)) {
        return state.roles.includes(role)
      }
      return state.roles === role;
    },
    
    // Comprobar si el usuario tiene algún rol de una lista
    hasAnyRole: state => roleList => {
      if (!state.roles) return false;
      if (Array.isArray(state.roles)) {
        return state.roles.some(role => roleList.includes(role))
      }
      return roleList.includes(state.roles);
    },
    
    // Obtener token
    token: state => state.token,
    
    // Estado de carga
    isLoading: state => state.loading,
    
    // Información de error
    authError: state => state.error
  },
  
  mutations: {
    // Establecer estado de carga
    SET_LOADING(state, status) {
      state.loading = status
    },
    
    // Establecer error
    SET_ERROR(state, error) {
      state.error = error
    },
    
    // Establecer token
    SET_TOKEN(state, token) {
      state.token = token
      state.isAuthenticated = true
      localStorage.setItem('token', token)
    },
    
    // Establecer datos de autenticación completos
    SET_AUTH(state, { token, user, roles }) {
      state.token = token
      state.user = user
      state.roles = roles
      state.isAuthenticated = true
      state.error = null
      
      // Persistir en localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('roles', JSON.stringify(roles))
    },
    
    // Actualizar datos del usuario sin cambiar el token
    UPDATE_USER(state, { user, roles }) {
      state.user = user
      if (roles) {
        state.roles = roles
        localStorage.setItem('roles', JSON.stringify(roles))
      }
      localStorage.setItem('user', JSON.stringify(user))
    },
    
    // Limpiar estado de autenticación
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
      state.roles = []
      state.isAuthenticated = false
      state.error = null
      
      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('roles')
    },
    
    // Reiniciar estado desde localStorage
    RESTORE_AUTH(state) {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const roles = JSON.parse(localStorage.getItem('roles') || '[]')
      
      if (token) {
        state.token = token
        state.user = user
        state.roles = roles
        state.isAuthenticated = true
      }
    }
  },
  
  actions: {
    // Iniciar sesión - Flujo completo
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // 1. Login para obtener token
        const loginResponse = await authService.login(credentials)
        
        // Verificar estructura de respuesta
        if (loginResponse.data.status === 'success' && loginResponse.data.data?.token) {
          const token = loginResponse.data.data.token
          
          // Guardar token en store y localStorage
          commit('SET_TOKEN', token)
          
          // 2. Validar token para obtener rol
          try {
            const validateResponse = await authService.validateToken(token)
            
            if (validateResponse.data.status === 'success' && validateResponse.data.data) {
              const { userId, rol } = validateResponse.data.data
              
              // 3. Obtener información completa del usuario
              try {
                const userResponse = await authService.getUserInfo(userId)
                
                if (userResponse.data.status === 'success' && userResponse.data.data?.user) {
                  const user = userResponse.data.data.user
                  
                  // Si el rol vino en la respuesta de validación, lo usamos
                  // Si no, intentamos obtenerlo del objeto usuario
                  const roles = rol || user.rol || []
                  
                  // Guardar información completa
                  commit('SET_AUTH', {
                    token,
                    user,
                    roles
                  })
                  
                  // Si hay una ruta a la que redirigir después del login
                  const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
                  router.push(redirectPath)
                  
                  return userResponse.data
                }
              } catch (userError) {
                // Si falla al obtener datos del usuario, usamos la info básica que ya tenemos
                commit('SET_AUTH', {
                  token,
                  user: { id: userId },
                  roles: rol ? (Array.isArray(rol) ? rol : [rol]) : []
                })
              }
            }
          } catch (validateError) {
            console.error('Error al validar token:', validateError)
            // Si falla la validación, limpiamos autenticación
            commit('CLEAR_AUTH')
            throw new Error('El token no pudo ser validado')
          }
          
          return loginResponse.data
        } else {
          throw new Error(loginResponse.data.message || 'Error en la respuesta del servidor')
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error de autenticación'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Cerrar sesión
    async logout({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        // Intenta llamar al endpoint de logout si existe
        await authService.logout().catch(() => {
          // Si falla, simplemente continuamos con el logout local
          console.warn('No se pudo notificar al servidor sobre el logout')
        })
      } finally {
        // Siempre limpiar estado local independientemente del resultado del API
        commit('CLEAR_AUTH')
        commit('SET_LOADING', false)
        
        // Redirigir al home
        router.push('/')
      }
    },
    
    // Verificar el estado de autenticación al cargar la aplicación
    async checkAuth({ commit, state }) {
      // Si no hay token, no estamos autenticados
      if (!state.token) {
        // Asegurarse de que el estado esté sincronizado con localStorage
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
          commit('RESTORE_AUTH')
          // Seguimos verificando que el token sea válido
        } else {
          commit('CLEAR_AUTH')
          return false
        }
      }
      
      commit('SET_LOADING', true)
      
      try {
        // Validar el token actual mediante POST
        const validateResponse = await authService.validateToken(state.token)
        
        if (validateResponse.data.status === 'success' && validateResponse.data.data) {
          const { rol } = validateResponse.data.data
          
          // Actualizar rol si es diferente
          if (rol && JSON.stringify(state.roles) !== JSON.stringify(rol)) {
            commit('UPDATE_USER', { 
              user: state.user,
              roles: rol
            })
          }
          
          commit('SET_LOADING', false)
          return true
        } else {
          // Token inválido
          commit('CLEAR_AUTH')
          commit('SET_LOADING', false)
          return false
        }
      } catch (error) {
        console.error('Error al verificar token:', error)
        
        // En producción, deberías descomentar esta línea para limpiar autenticación
        // commit('CLEAR_AUTH')
        
        commit('SET_LOADING', false)
        return state.isAuthenticated // En desarrollo, mantenemos el estado
      }
    },
    
    // Inicializar estado de autenticación y verificar validez
    async initAuth({ commit, dispatch }) {
      // Restaurar desde localStorage
      commit('RESTORE_AUTH')
      
      // Si hay token, verificar validez
      if (localStorage.getItem('token')) {
        return dispatch('checkAuth')
      }
      
      return false
    }
  }
}

export default auth