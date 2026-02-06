// store/modules/clientes.js
import clienteService from '@/services/cliente.service';

const state = {
  clientes: [],
  clienteActual: null,
  loading: false,
  error: null,
  filtro: '',
  estadisticas: {
    total: 0,
    activos: 0,
    nuevos: 0
  },
  lastUpdated: null
};

const mutations = {
  SET_CLIENTES(state, clientes) {
    state.clientes = Array.isArray(clientes) ? clientes : [];
    state.lastUpdated = new Date().toISOString();
  },
  
  SET_CLIENTE_ACTUAL(state, cliente) {
    state.clienteActual = cliente;
  },
  
  ADD_CLIENTE(state, cliente) {
    if (cliente && cliente.id) {
      state.clientes.push(cliente);
    }
  },
  
  UPDATE_CLIENTE(state, clienteActualizado) {
    const index = state.clientes.findIndex(c => c.id === clienteActualizado.id);
    if (index !== -1) {
      state.clientes.splice(index, 1, clienteActualizado);
    }
  },
  
  REMOVE_CLIENTE(state, clienteId) {
    const index = state.clientes.findIndex(c => c.id === clienteId);
    if (index !== -1) {
      state.clientes.splice(index, 1);
    }
  },
  
  SET_FILTRO(state, filtro) {
    state.filtro = filtro || '';
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  RESET_ERROR(state) {
    state.error = null;
  },
  
  SET_ESTADISTICAS(state, estadisticas) {
    state.estadisticas = { ...state.estadisticas, ...estadisticas };
  }
};

const getters = {
  totalClientes: (state) => state.clientes.length,
  
  clientesActivos: (state) => state.clientes.filter(c => c.activo !== false),
  
  clientesInactivos: (state) => state.clientes.filter(c => c.activo === false),
  
  clientesFiltrados: (state) => {
    if (!state.filtro.trim()) return state.clientes;
    
    const filtroLower = state.filtro.toLowerCase();
    return state.clientes.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(filtroLower) ||
      cliente.apellido?.toLowerCase().includes(filtroLower) ||
      cliente.email?.toLowerCase().includes(filtroLower) ||
      cliente.telefono?.includes(filtroLower)
    );
  },
  
  clientesNuevos: (state) => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);
    
    return state.clientes.filter(cliente => {
      const fechaCreacion = new Date(
        cliente.createdAt || 
        cliente.created_at || 
        cliente.fecha_creacion
      );
      return !isNaN(fechaCreacion.getTime()) && fechaCreacion >= fechaLimite;
    });
  },
  
  obtenerClientePorId: (state) => (id) => {
    return state.clientes.find(c => c.id === id);
  },
  
  isLoading: (state) => state.loading,
  hasError: (state) => !!state.error,
  errorMessage: (state) => state.error,
  lastUpdated: (state) => state.lastUpdated,
  
  estadisticasCompletas: (state, getters) => ({
    total: getters.totalClientes,
    activos: getters.clientesActivos.length,
    inactivos: getters.clientesInactivos.length,
    nuevos: getters.clientesNuevos.length
  })
};

const actions = {
  // ✅ ACCIÓN PRINCIPAL: Cargar todos los clientes
  async cargarClientes({ commit, state }, filtro = null) {
    // Usar filtro pasado como parámetro o el del estado
    const filtroFinal = filtro !== null ? filtro : state.filtro;
    
    commit('SET_LOADING', true);
    commit('RESET_ERROR');
    
    try {
      const clientes = await clienteService.getAll(filtroFinal);
      
      commit('SET_CLIENTES', clientes);
      commit('SET_FILTRO', filtroFinal);
      
      // Actualizar estadísticas automáticamente
      const estadisticas = {
        total: clientes.length,
        activos: clientes.filter(c => c.activo !== false).length,
        nuevos: clientes.filter(c => {
          const fechaLimite = new Date();
          fechaLimite.setDate(fechaLimite.getDate() - 30);
          const fechaCreacion = new Date(c.createdAt || c.created_at || c.fecha_creacion);
          return !isNaN(fechaCreacion.getTime()) && fechaCreacion >= fechaLimite;
        }).length
      };
      
      commit('SET_ESTADISTICAS', estadisticas);
      
      return clientes;
      
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar clientes');
      
      // En caso de error, asegurar que el array esté vacío pero definido
      commit('SET_CLIENTES', []);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // ✅ Obtener cliente específico por ID
  async obtenerCliente({ commit, getters }, id) {
    // Primero verificar si ya lo tenemos en el estado
    const clienteExistente = getters.obtenerClientePorId(id);
    if (clienteExistente) {
      commit('SET_CLIENTE_ACTUAL', clienteExistente);
      return clienteExistente;
    }

    commit('SET_LOADING', true);
    commit('RESET_ERROR');
    
    try {
      const cliente = await clienteService.obtenerPorId(id);
      commit('SET_CLIENTE_ACTUAL', cliente);
      
      // También agregarlo al array si no está
      if (!getters.obtenerClientePorId(id)) {
        commit('ADD_CLIENTE', cliente);
      }
      
      return cliente;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // ✅ Crear nuevo cliente
  async crearCliente({ commit }, clienteData) {
    commit('SET_LOADING', true);
    commit('RESET_ERROR');
    
    try {
      const nuevoCliente = await clienteService.crear(clienteData);
      commit('ADD_CLIENTE', nuevoCliente);
      
      return nuevoCliente;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // ✅ Actualizar cliente existente
  async actualizarCliente({ commit }, { id, clienteData }) {
    commit('SET_LOADING', true);
    commit('RESET_ERROR');
    
    try {
      const clienteActualizado = await clienteService.actualizar(id, clienteData);
      commit('UPDATE_CLIENTE', clienteActualizado);
      
      return clienteActualizado;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // ✅ Eliminar cliente
  async eliminarCliente({ commit }, id) {
    commit('SET_LOADING', true);
    commit('RESET_ERROR');
    
    try {
      await clienteService.eliminar(id);
      commit('REMOVE_CLIENTE', id);
      
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // ✅ Buscar clientes con filtro
  async buscarClientes({ dispatch }, filtro) {
    return await dispatch('cargarClientes', filtro);
  },

  // ✅ Aplicar filtro sin recargar desde API
  aplicarFiltro({ commit }, filtro) {
    commit('SET_FILTRO', filtro);
  },

  // ✅ Limpiar filtro
  limpiarFiltro({ commit, dispatch }) {
    commit('SET_FILTRO', '');
    return dispatch('cargarClientes', '');
  },

  // ✅ Recargar datos
  async recargarClientes({ dispatch, state }) {
    return await dispatch('cargarClientes', state.filtro);
  },

  // ✅ Obtener estadísticas específicas
  async cargarEstadisticas({ commit }) {
    try {
      const estadisticas = await clienteService.obtenerEstadisticas();
      commit('SET_ESTADISTICAS', estadisticas);
      return estadisticas;
    } catch (error) {
      return null;
    }
  },

  // ✅ Limpiar estado
  limpiarEstado({ commit }) {
    commit('SET_CLIENTES', []);
    commit('SET_CLIENTE_ACTUAL', null);
    commit('SET_FILTRO', '');
    commit('RESET_ERROR');
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};