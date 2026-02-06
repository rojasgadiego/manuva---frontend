// src/store/modules/usuarios.js
import { usuarioService } from '@/services/index.service'

const state = {
  usuarios: [],
  usuarioActual: null,
  cargando: false,
  error: null
}

const getters = {
  usuariosAdmin: state => state.usuarios.filter(u => u.rol === 'admin').length,
  usuariosRegulares: state => state.usuarios.filter(u => u.rol === 'usuario').length,
  totalUsuarios: state => state.usuarios.length,
  
  usuariosNuevos: state => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30); // Usuarios nuevos en los últimos 30 días
    
    return state.usuarios.filter(usuario => {
      const fechaCreacion = new Date(usuario.created);
      return fechaCreacion >= fechaLimite;
    }).length;
  },
  
  rolesDisponibles: () => ['admin', 'usuario']
}

const mutations = {
  SET_USUARIOS(state, usuarios) {
    state.usuarios = usuarios
  },
  SET_USUARIO_ACTUAL(state, usuario) {
    state.usuarioActual = usuario
  },
  SET_CARGANDO(state, valor) {
    state.cargando = valor
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ACTUALIZAR_USUARIO(state, usuarioActualizado) {
    const index = state.usuarios.findIndex(u => u.id === usuarioActualizado.id)
    if (index !== -1) {
      state.usuarios.splice(index, 1, usuarioActualizado)
    }
  },
  AGREGAR_USUARIO(state, nuevoUsuario) {
    state.usuarios.push(nuevoUsuario)
  }
}

const actions = {
  async cargarUsuarios({ commit }) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await usuarioService.getAll()
      // Extraer los datos de usuarios de la respuesta
      const usuarios = response.data || []
      commit('SET_USUARIOS', usuarios)
      return usuarios
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar los usuarios')
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async obtenerUsuario({ commit }, id) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await usuarioService.getById(id)
      const usuario = response.data || null
      commit('SET_USUARIO_ACTUAL', usuario)
      return usuario
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener el usuario ${id}`)
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async crearUsuario({ commit }, usuarioData) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await usuarioService.create(usuarioData)
      const nuevoUsuario = response.data || null
      if (nuevoUsuario) {
        commit('AGREGAR_USUARIO', nuevoUsuario)
      }
      return nuevoUsuario
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al crear el usuario')
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async actualizarUsuario({ commit }, { id, usuarioData }) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await usuarioService.update(id, usuarioData)
      const usuarioActualizado = response.data || null
      if (usuarioActualizado) {
        commit('ACTUALIZAR_USUARIO', usuarioActualizado)
      }
      return usuarioActualizado
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al actualizar el usuario ${id}`)
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async cambiarPassword({ commit }, { id, passwordData }) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await usuarioService.changePassword(id, passwordData)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al cambiar la contraseña del usuario ${id}`)
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}