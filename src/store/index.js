
import { createStore } from 'vuex'
import auth from './modules/auth'
import clientes from './modules/cliente'
import dashboard from './modules/dashboard'
import proveedores from './modules/proveedores'
import usuarios from './modules/usuarios'
import facturas from './modules/facturas'
import productos from './modules/productos'
import movimientos from './modules/movimientos';
import inventario from './modules/inventario';
import ramos from './modules/ramos'
import venta from './modules/venta'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  },
  mutations: {
    SET_AUTH(state, { token, user }) {
      state.token = token
      state.user = user
      state.isAuthenticated = !!token

      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_AUTH', { token, user })
    },
    logout({ commit }) {
      commit('SET_AUTH', { token: null, user: null })
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user
  },
  modules: {
    auth,
    clientes,
    dashboard,
    proveedores,
    usuarios,
    facturas,
    productos,
    movimientos,
    inventario,
    ramos,
    venta
  }
})