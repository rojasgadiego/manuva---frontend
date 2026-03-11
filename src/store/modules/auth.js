import authService from '@/services/auth.service'
import router from '@/router'

const auth = {
  namespaced: true,

  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('user'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser:     state => state.user,
    isLoading:       state => state.loading,
    authError:       state => state.error,
    userRole:        state => state.user?.rol || null,
    hasRole:         state => role => state.user?.rol === role,
    hasAnyRole:      state => roleList => roleList.includes(state.user?.rol)
  },

  mutations: {
    SET_LOADING(state, status) {
      state.loading = status
    },

    SET_ERROR(state, error) {
      state.error = error
    },

    SET_AUTH(state, { user }) {
      state.user = user
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem('user', JSON.stringify(user))
    },

    CLEAR_AUTH(state) {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('user')
    }
  },

  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const response = await authService.login(credentials)
        const data = response.data?.data

        if (!data) throw new Error('Respuesta inválida del servidor')

        const user = {
          username:       data.username,
          nombreCompleto: data.nombreCompleto,
          rol:            data.rol
        }

        commit('SET_AUTH', { user })

        const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
        router.push(redirectPath)

        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error de autenticación')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      try {
        await authService.logout().catch(() => {
          console.warn('No se pudo notificar al servidor sobre el logout')
        })
      } finally {
        commit('CLEAR_AUTH')
        router.push('/')
      }
    },

    initAuth({ commit }) {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user) {
        commit('SET_AUTH', { user })
        return true
      }
      commit('CLEAR_AUTH')
      return false
    }
  }
}

export default auth