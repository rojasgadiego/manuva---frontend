// src/store/modules/ramos.js
import { ramoService } from '@/services/index.service';

const state = {
  ramos: [],
  ramoActual: null,
  componentesRamoActual: [],
  cargando: false,
  error: null
};

const getters = {
  ramosDisponibles: state => state.ramos.filter(r => r.disponible_catalogo),
  ramosPersonalizados: state => state.ramos.filter(r => r.personalizado),
  totalRamos: state => state.ramos.length,
  
  ramosPorUsuario: state => usuarioId => {
    return state.ramos.filter(r => r.usuario_id === usuarioId);
  },
  
  ramosCatalogo: state => {
    return state.ramos.filter(r => r.disponible_catalogo && !r.deletedAt);
  }
};

const mutations = {
  SET_RAMOS(state, ramos) {
    state.ramos = ramos;
  },
  SET_RAMO_ACTUAL(state, ramo) {
    state.ramoActual = ramo;
  },
  SET_COMPONENTES_RAMO_ACTUAL(state, componentes) {
    state.componentesRamoActual = componentes;
  },
  SET_CARGANDO(state, valor) {
    state.cargando = valor;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  ACTUALIZAR_RAMO(state, ramoActualizado) {
    const index = state.ramos.findIndex(r => r.id === ramoActualizado.id);
    if (index !== -1) {
      state.ramos.splice(index, 1, ramoActualizado);
    }
  },
  AGREGAR_RAMO(state, nuevoRamo) {
    state.ramos.push(nuevoRamo);
  }
};

const actions = {
  async cargarRamos({ commit }, filtros = {}) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.getAll(filtros);
      const ramos = response.data || [];
      commit('SET_RAMOS', ramos);
      return ramos;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar los ramos');
      console.error('Error en cargarRamos:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async obtenerRamo({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.getById(id);
      const ramo = response.data || null;
      commit('SET_RAMO_ACTUAL', ramo);
      return ramo;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener el ramo ${id}`);
      console.error('Error en obtenerRamo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async obtenerComponentesRamo({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.getComponentes(id);
      const componentes = response.data || [];
      commit('SET_COMPONENTES_RAMO_ACTUAL', componentes);
      return componentes;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener componentes del ramo ${id}`);
      console.error('Error en obtenerComponentesRamo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async crearRamo({ commit }, ramoData) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.create(ramoData);
      const nuevoRamo = response.data || null;
      if (nuevoRamo) {
        commit('AGREGAR_RAMO', nuevoRamo);
      }
      return nuevoRamo;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al crear el ramo');
      console.error('Error en crearRamo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async actualizarRamo({ commit }, { id, ramoData }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.update(id, ramoData);
      const ramoActualizado = response.data || null;
      if (ramoActualizado) {
        commit('ACTUALIZAR_RAMO', ramoActualizado);
      }
      return ramoActualizado;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al actualizar el ramo ${id}`);
      console.error('Error en actualizarRamo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async eliminarRamo({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      await ramoService.remove(id);
      
      // Actualizar localmente el ramo
      const ramo = state.ramos.find(r => r.id === id);
      if (ramo) {
        const ramoActualizado = {
          ...ramo,
          deletedAt: new Date(),
          updatedAt: new Date()
        };
        commit('ACTUALIZAR_RAMO', ramoActualizado);
      }
      
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al eliminar el ramo ${id}`);
      console.error('Error en eliminarRamo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async restaurarRamo({ commit, state }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.restore(id);
      const ramoRestaurado = response.data || null;
      
      // Si tenemos respuesta de la API, usamos esa data
      if (ramoRestaurado) {
        commit('ACTUALIZAR_RAMO', ramoRestaurado);
        return ramoRestaurado;
      }
      
      // Si no, actualizamos localmente
      const ramo = state.ramos.find(r => r.id === id);
      if (ramo) {
        const ramoActualizado = {
          ...ramo, 
          deletedAt: null,
          updatedAt: new Date()
        };
        commit('ACTUALIZAR_RAMO', ramoActualizado);
        return ramoActualizado;
      }
      
      return null;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al restaurar el ramo ${id}`);
      console.error('Error en restaurarRamo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async duplicarRamo({ commit }, { id, usuarioId, personalizado }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.duplicar(id, usuarioId, personalizado);
      const nuevoDuplicado = response.data || null;
      if (nuevoDuplicado) {
        commit('AGREGAR_RAMO', nuevoDuplicado);
      }
      return nuevoDuplicado;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al duplicar el ramo ${id}`);
      console.error('Error en duplicarRamo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async cargarRamosCatalogo({ commit }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ramoService.getRamosCatalogo();
      const ramosCatalogo = response.data || [];
      // Puedes decidir si guardarlos en state.ramos o en otra propiedad específica
      commit('SET_RAMOS', ramosCatalogo);
      return ramosCatalogo;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar los ramos del catálogo');
      console.error('Error en cargarRamosCatalogo:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};