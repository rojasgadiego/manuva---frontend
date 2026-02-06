// src/store/modules/ventas.js
import { ventaService } from '@/services/index.service';

const state = {
  ventas: [],
  ventaActual: null,
  cargando: false,
  error: null,
  paginacion: {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0
  }
};

const getters = {
  ventasCompletadas: state => state.ventas.filter(v => v.estado === 'Completada'),
  ventasPendientes: state => state.ventas.filter(v => v.estado === 'Pendiente'),
  ventasCanceladas: state => state.ventas.filter(v => v.estado === 'Cancelada'),
  totalVentas: state => state.ventas.length,
  
  ventasPorCliente: state => clienteId => {
    return state.ventas.filter(v => v.cliente_id === clienteId);
  },
  
  ventasPorUsuario: state => usuarioId => {
    return state.ventas.filter(v => v.usuario_id === usuarioId);
  },
  
  ventasFacturadas: state => {
    return state.ventas.filter(v => v.facturada === true);
  },
  
  ventasNoFacturadas: state => {
    return state.ventas.filter(v => v.facturada === false);
  },
  
  totalVentasHoy: state => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return state.ventas.filter(v => {
      const fechaVenta = new Date(v.fecha);
      fechaVenta.setHours(0, 0, 0, 0);
      return fechaVenta.getTime() === hoy.getTime() && v.estado === 'Completada';
    }).length;
  },
  
  ingresosTotalesPeriodo: state => (fechaInicio, fechaFin) => {
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;
    
    return state.ventas
      .filter(v => {
        if (v.estado !== 'Completada') return false;
        
        const fechaVenta = new Date(v.fecha);
        let cumpleFiltros = true;
        
        if (inicio) cumpleFiltros = cumpleFiltros && fechaVenta >= inicio;
        if (fin) cumpleFiltros = cumpleFiltros && fechaVenta <= fin;
        
        return cumpleFiltros;
      })
      .reduce((total, venta) => total + venta.total, 0);
  }
};

const mutations = {
  SET_VENTAS(state, { ventas, paginacion }) {
    state.ventas = ventas;
    if (paginacion) {
      state.paginacion = paginacion;
    }
  },
  SET_VENTA_ACTUAL(state, venta) {
    state.ventaActual = venta;
  },
  SET_CARGANDO(state, valor) {
    state.cargando = valor;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  ACTUALIZAR_VENTA(state, ventaActualizada) {
    const index = state.ventas.findIndex(v => v.id === ventaActualizada.id);
    if (index !== -1) {
      state.ventas.splice(index, 1, ventaActualizada);
    }
  },
  AGREGAR_VENTA(state, nuevaVenta) {
    state.ventas.push(nuevaVenta);
    state.paginacion.total += 1;
  },
  SET_PAGINA(state, pagina) {
    state.paginacion.page = pagina;
  },
  SET_LIMITE(state, limite) {
    state.paginacion.limit = limite;
  }
};

const actions = {
  async cargarVentas({ commit, state }, filtros = {}) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      // Usar la página y límite del estado si no se proporcionan en los filtros
      const page = filtros.page || state.paginacion.page;
      const limit = filtros.limit || state.paginacion.limit;
      
      const response = await ventaService.getAll({
        ...filtros,
        page,
        limit
      });
      
      const ventas = response.data || [];
      const paginacion = {
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 15,
        totalPages: response.totalPages || 0
      };
      
      commit('SET_VENTAS', { ventas, paginacion });
      commit('SET_PAGINA', page);
      commit('SET_LIMITE', limit);
      
      return { ventas, paginacion };
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar las ventas');
      console.error('Error en cargarVentas:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async cargarVentasPorUsuario({ commit, state }, { usuarioId, filtros = {} }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      // Usar la página y límite del estado si no se proporcionan en los filtros
      const page = filtros.page || state.paginacion.page;
      const limit = filtros.limit || state.paginacion.limit;
      
      const response = await ventaService.getByUsuario(usuarioId, {
        ...filtros,
        page,
        limit
      });
      
      const ventas = response.data || [];
      const paginacion = {
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 15,
        totalPages: response.totalPages || 0
      };
      
      commit('SET_VENTAS', { ventas, paginacion });
      commit('SET_PAGINA', page);
      commit('SET_LIMITE', limit);
      
      return { ventas, paginacion };
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al cargar las ventas del usuario ${usuarioId}`);
      console.error('Error en cargarVentasPorUsuario:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async obtenerVenta({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ventaService.getById(id);
      const venta = response.data || null;
      commit('SET_VENTA_ACTUAL', venta);
      return venta;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener la venta ${id}`);
      console.error('Error en obtenerVenta:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async crearVenta({ commit }, ventaData) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ventaService.create(ventaData);
      const nuevaVenta = response.data || null;
      if (nuevaVenta) {
        commit('AGREGAR_VENTA', nuevaVenta);
      }
      return nuevaVenta;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al crear la venta');
      console.error('Error en crearVenta:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async actualizarVenta({ commit }, { id, ventaData }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ventaService.update(id, ventaData);
      const ventaActualizada = response.data || null;
      if (ventaActualizada) {
        commit('ACTUALIZAR_VENTA', ventaActualizada);
      }
      return ventaActualizada;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al actualizar la venta ${id}`);
      console.error('Error en actualizarVenta:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async cancelarVenta({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ventaService.cancelar(id);
      const ventaCancelada = response.data || null;
      if (ventaCancelada) {
        commit('ACTUALIZAR_VENTA', ventaCancelada);
      }
      return ventaCancelada;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al cancelar la venta ${id}`);
      console.error('Error en cancelarVenta:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async devolverItems({ commit }, { ventaId, items }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await ventaService.devolverItems(ventaId, items);
      const ventaActualizada = response.data || null;
      if (ventaActualizada) {
        commit('ACTUALIZAR_VENTA', ventaActualizada);
      }
      return ventaActualizada;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al procesar devoluciones en la venta ${ventaId}`);
      console.error('Error en devolverItems:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async cambiarPagina({ dispatch, state }, pagina) {
    return dispatch('cargarVentas', {
      page: pagina,
      limit: state.paginacion.limit
    });
  },
  
  async cambiarLimite({ dispatch }, limite) {
    return dispatch('cargarVentas', {
      page: 1,
      limit: limite
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};