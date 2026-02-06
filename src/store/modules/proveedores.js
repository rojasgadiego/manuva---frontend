// src/store/modules/proveedores.js
import { proveedorService } from '@/services/index.service'

const state = {
  proveedores: [],
  proveedorActual: null,
  cargando: false,
  error: null
}

const getters = {
  proveedoresActivos: state => state.proveedores.filter(p => p.activo).length,
  proveedoresInactivos: state => state.proveedores.filter(p => !p.activo).length,
  totalProveedores: state => state.proveedores.length,
  
  proveedoresNuevos: state => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30); // Proveedores nuevos en los últimos 30 días
    
    return state.proveedores.filter(proveedor => {
      const fechaCreacion = new Date(proveedor.createdAt);
      return fechaCreacion >= fechaLimite;
    }).length;
  }
}

const mutations = {
  SET_PROVEEDORES(state, proveedores) {
    state.proveedores = proveedores
  },
  SET_PROVEEDOR_ACTUAL(state, proveedor) {
    state.proveedorActual = proveedor
  },
  SET_CARGANDO(state, valor) {
    state.cargando = valor
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ACTUALIZAR_PROVEEDOR(state, proveedorActualizado) {
    const index = state.proveedores.findIndex(p => p.id === proveedorActualizado.id)
    if (index !== -1) {
      state.proveedores.splice(index, 1, proveedorActualizado)
    }
  },
  AGREGAR_PROVEEDOR(state, nuevoProveedor) {
    state.proveedores.push(nuevoProveedor)
  }
}

const actions = {
  async cargarProveedores({ commit }) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await proveedorService.getAll()
      // Extraer los datos de proveedores de la respuesta
      const proveedores = response.data || []
      commit('SET_PROVEEDORES', proveedores)
      return proveedores
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar los proveedores')
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async obtenerProveedor({ commit }, id) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await proveedorService.getById(id)
      const proveedor = response.data || null
      commit('SET_PROVEEDOR_ACTUAL', proveedor)
      return proveedor
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener el proveedor ${id}`)
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async crearProveedor({ commit }, proveedorData) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await proveedorService.create(proveedorData)
      const nuevoProveedor = response.data || null
      if (nuevoProveedor) {
        commit('AGREGAR_PROVEEDOR', nuevoProveedor)
      }
      return nuevoProveedor
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al crear el proveedor')
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async actualizarProveedor({ commit }, { id, proveedorData }) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await proveedorService.update(id, proveedorData)
      const proveedorActualizado = response.data || null
      if (proveedorActualizado) {
        commit('ACTUALIZAR_PROVEEDOR', proveedorActualizado)
      }
      return proveedorActualizado
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al actualizar el proveedor ${id}`)
      console.error('Error en actualizarProveedor:', error)
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async desactivarProveedor({ commit, state }, id) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      await proveedorService.remove(id)
      
      // Actualizar localmente el proveedor
      const proveedor = state.proveedores.find(p => p.id === id)
      if (proveedor) {
        const proveedorActualizado = {
          ...proveedor,
          activo: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        }
        commit('ACTUALIZAR_PROVEEDOR', proveedorActualizado)
      }
      
      return true
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al desactivar el proveedor ${id}`)
      console.error('Error en desactivarProveedor:', error)
      throw error
    } finally {
      commit('SET_CARGANDO', false)
    }
  },
  
  async reactivarProveedor({ commit, state }, id) {
    commit('SET_CARGANDO', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await proveedorService.restore(id)
      const proveedorReactivado = response.data || null
      
      // Si tenemos respuesta de la API, usamos esa data
      if (proveedorReactivado) {
        commit('ACTUALIZAR_PROVEEDOR', proveedorReactivado)
        return proveedorReactivado
      }
      
      // Si no, actualizamos localmente
      const proveedor = state.proveedores.find(p => p.id === id)
      if (proveedor) {
        const proveedorActualizado = {
          ...proveedor, 
          activo: true,
          deletedAt: null,
          updatedAt: new Date()
        }
        commit('ACTUALIZAR_PROVEEDOR', proveedorActualizado)
        return proveedorActualizado
      }
      
      return null
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al reactivar el proveedor ${id}`)
      console.error('Error en reactivarProveedor:', error)
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