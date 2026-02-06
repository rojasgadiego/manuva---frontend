import { facturaService } from '@/services/index.service';

const state = {
  facturas: [],
  facturaActual: null,
  cargando: false,
  error: null,
  paginacion: {
    paginaActual: 1,
    itemsPorPagina: 10,
    totalItems: 0,
    totalPaginas: 1
  }
};

const getters = {
  facturasPorEstado: state => estado => {
    if (!Array.isArray(state.facturas)) return [];
    return state.facturas.filter(f => f.estado === estado);
  },
  
  facturasPendientesPago: state => {
    if (!Array.isArray(state.facturas)) return [];
    return state.facturas.filter(f => f.tipo === 'recibida' && f.estado === 'pendiente');
  },
  
  facturasPendientesCobro: state => {
    if (!Array.isArray(state.facturas)) return [];
    return state.facturas.filter(f => f.tipo === 'emitida' && f.estado === 'pendiente');
  },
  
  facturasVencidas: state => {
    if (!Array.isArray(state.facturas)) return [];
    return state.facturas.filter(f => f.estado === 'vencida');
  },
  
  totalFacturas: state => {
    if (!Array.isArray(state.facturas)) return 0;
    return state.facturas.length;
  }
};

const mutations = {
  SET_FACTURAS(state, facturas) {
    state.facturas = Array.isArray(facturas) ? facturas : [];
  },
  
  SET_FACTURA_ACTUAL(state, factura) {
    state.facturaActual = factura;
  },
  
  SET_CARGANDO(state, valor) {
    state.cargando = valor;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  SET_PAGINACION(state, paginacion) {
    state.paginacion = paginacion;
  },
  
  ACTUALIZAR_FACTURA(state, facturaActualizada) {
    if (!Array.isArray(state.facturas)) {
      state.facturas = [];
      return;
    }
    
    const index = state.facturas.findIndex(f => f.id === facturaActualizada.id);
    if (index !== -1) {
      state.facturas.splice(index, 1, facturaActualizada);
    }
  },
  
  AGREGAR_FACTURA(state, nuevaFactura) {
    if (!Array.isArray(state.facturas)) {
      state.facturas = [];
    }
    state.facturas.unshift(nuevaFactura); // Agregar al inicio
  }
};

const actions = {
  async cargarFacturas({ commit }, filtros = {}) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      // Añadir página y límite a los filtros
      const params = {
        page: filtros.page || 1,
        limit: filtros.limit || 10,
        ...filtros
      };
      
      const response = await facturaService.getPaginated(params);
      
      // La estructura es diferente: response.data.items contiene las facturas
      if (response && response.status === 'success' && response.data) {
        const items = response.data.items || [];
        
        // Actualizar facturas
        commit('SET_FACTURAS', items);
        
        // Actualizar paginación
        commit('SET_PAGINACION', {
          paginaActual: response.data.page || 1,
          itemsPorPagina: response.data.limit || 10,
          totalItems: response.data.total || 0,
          totalPaginas: response.data.totalPages || 1
        });
        
        return { 
          items, 
          paginacion: {
            paginaActual: response.data.page,
            itemsPorPagina: response.data.limit,
            totalItems: response.data.total,
            totalPaginas: response.data.totalPages
          } 
        };
      } else {
        // No hay datos o la estructura es inesperada
        commit('SET_FACTURAS', []);
        commit('SET_PAGINACION', {
          paginaActual: 1,
          itemsPorPagina: 10,
          totalItems: 0,
          totalPaginas: 1
        });
        
        return { items: [], paginacion: { paginaActual: 1, itemsPorPagina: 10, totalItems: 0, totalPaginas: 1 } };
      }
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar las facturas');
      console.error('Error en cargarFacturas:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async obtenerFactura({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const factura = await facturaService.getById(id);
      commit('SET_FACTURA_ACTUAL', factura);
      return factura;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener la factura ${id}`);
      console.error('Error en obtenerFactura:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async crearFactura({ commit }, facturaData) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const nuevaFactura = await facturaService.create(facturaData);
      
      if (nuevaFactura) {
        commit('AGREGAR_FACTURA', nuevaFactura);
      }
      
      return nuevaFactura;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al crear la factura');
      console.error('Error en crearFactura:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async actualizarFactura({ commit }, { id, facturaData }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const facturaActualizada = await facturaService.update(id, facturaData);
      
      if (facturaActualizada) {
        commit('ACTUALIZAR_FACTURA', facturaActualizada);
      }
      
      return facturaActualizada;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al actualizar la factura ${id}`);
      console.error('Error en actualizarFactura:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async pagarFactura({ commit }, { id, pagoData }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const facturaPagada = await facturaService.pagar(id, pagoData);
      
      if (facturaPagada) {
        commit('ACTUALIZAR_FACTURA', facturaPagada);
      }
      
      return facturaPagada;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al pagar la factura ${id}`);
      console.error('Error en pagarFactura:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async anularFactura({ commit }, { id, anulacionData }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const facturaAnulada = await facturaService.anular(id, anulacionData);
      
      if (facturaAnulada) {
        commit('ACTUALIZAR_FACTURA', facturaAnulada);
      }
      
      return facturaAnulada;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al anular la factura ${id}`);
      console.error('Error en anularFactura:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async marcarFacturaVencida({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const facturaVencida = await facturaService.marcarVencida(id);
      
      if (facturaVencida) {
        commit('ACTUALIZAR_FACTURA', facturaVencida);
      }
      
      return facturaVencida;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al marcar como vencida la factura ${id}`);
      console.error('Error en marcarFacturaVencida:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async actualizarFacturasVencidas({ commit, dispatch }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const resultado = await facturaService.actualizarVencidas();
      
      // Si se actualizaron facturas, recargar la lista
      if (resultado && resultado.actualizadas > 0) {
        await dispatch('cargarFacturas');
      }
      
      return resultado;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al actualizar facturas vencidas');
      console.error('Error en actualizarFacturasVencidas:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async generarNumeroFactura({ commit }, tipo) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const resultado = await facturaService.generarNumero(tipo);
      return resultado && resultado.numero ? resultado.numero : '';
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al generar número de factura');
      console.error('Error en generarNumeroFactura:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async generarReporteFacturas({ commit }, { inicio, fin, tipo }) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const reporte = await facturaService.generarReporte(inicio, fin, tipo);
      return reporte;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al generar reporte de facturas');
      console.error('Error en generarReporteFacturas:', error);
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