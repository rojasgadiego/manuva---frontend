// src/store/modules/movimientos.js - VERSIÓN LIMPIA Y ACTUALIZADA
import movimientoService, { TipoMovimiento, TIPOS_ENTRADA, TIPOS_SALIDA } from '@/services/movimiento.service';

const state = {
  // Datos de la grilla
  movimientos: [],
  movimientoActual: null,
  cargando: false,
  error: null,
  paginacion: {
    paginaActual: 1,
    itemsPorPagina: 10,
    totalItems: 0,
    totalPaginas: 1
  },
  
  // Filtros independientes para la grilla
  filtrosGrilla: {
    busqueda: '',
    tipoMovimiento: '',
    fechaInicio: null,
    fechaFin: null
  },
  
  // Estado separado para estadísticas
  estadisticas: {
    cargandoEstadisticas: false,
    periodoActual: 'dia',
    datos: {
      totalMovimientos: 0,
      totalEntradas: 0,
      totalSalidas: 0,
      valorInventario: 0,
      valorTotal: 0,
      tendenciaTotal: { valor: '0.0', tipo: 'positive', icono: '↑' },
      tendenciaEntradas: { valor: '0.0', tipo: 'positive', icono: '↑' },
      tendenciaSalidas: { valor: '0.0', tipo: 'neutral', icono: '↔' },
      tendenciaValor: { valor: '0.0', tipo: 'positive', icono: '↑' }
    }
  },
  
  // Cache de movimientos para estadísticas por período
  movimientosPorPeriodo: {
    dia: [],
    semana: [],
    mes: []
  }
};

const getters = {
  // Getters para movimientos de la grilla
  totalMovimientos: state => Array.isArray(state.movimientos) ? state.movimientos.length : 0,
  
  movimientosPorTipo: state => tipo => {
    if (!Array.isArray(state.movimientos)) return [];
    return state.movimientos.filter(m => m.tipo === tipo);
  },
  
  // Getters mejorados con el nuevo enum
  entradasGrilla: state => {
    if (!Array.isArray(state.movimientos)) return [];
    return state.movimientos.filter(m => {
      if (m.tipo === TipoMovimiento.AJUSTE) {
        return m.cantidad > 0;
      }
      return TIPOS_ENTRADA.includes(m.tipo);
    });
  },
  
  salidasGrilla: state => {
    if (!Array.isArray(state.movimientos)) return [];
    return state.movimientos.filter(m => {
      if (m.tipo === TipoMovimiento.AJUSTE) {
        return m.cantidad < 0;
      }
      return TIPOS_SALIDA.includes(m.tipo);
    });
  },
  
  ajustesGrilla: state => {
    if (!Array.isArray(state.movimientos)) return [];
    return state.movimientos.filter(m => m.tipo === TipoMovimiento.AJUSTE);
  },
  
  // Movimientos recientes (últimos 7 días)
  movimientosRecientes: state => {
    if (!Array.isArray(state.movimientos)) return [];
    
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    
    return state.movimientos.filter(movimiento => {
      const fechaMovimiento = new Date(movimiento.fecha);
      return fechaMovimiento >= fechaLimite;
    });
  },
  
  // Getter para movimientos del período actual de estadísticas
  movimientosPeriodoActual: state => {
    const periodo = state.estadisticas.periodoActual;
    return state.movimientosPorPeriodo[periodo] || [];
  },
  
  // Getters para estadísticas
  estadisticasActuales: state => state.estadisticas.datos,
  periodoEstadisticas: state => state.estadisticas.periodoActual,
  cargandoEstadisticas: state => state.estadisticas.cargandoEstadisticas,
  
  // Getter para obtener las fechas del período de estadísticas
  fechasPeriodoEstadisticas: state => {
    const hoy = new Date();
    let fechaInicio = new Date(hoy);
    let fechaFin = new Date(hoy);
    
    if (state.estadisticas.periodoActual === 'dia') {
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);
    } else if (state.estadisticas.periodoActual === 'semana') {
      fechaInicio.setDate(hoy.getDate() - 6);
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);
    } else if (state.estadisticas.periodoActual === 'mes') {
      fechaInicio.setDate(hoy.getDate() - 29);
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);
    }
    
    return {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0],
      fechaInicioCompleta: fechaInicio.toISOString(),
      fechaFinCompleta: fechaFin.toISOString()
    };
  },
  
  // Funciones auxiliares para verificar tipos
  esEntrada: () => tipo => {
    if (tipo === TipoMovimiento.AJUSTE) return true;
    return TIPOS_ENTRADA.includes(tipo);
  },
  
  esSalida: () => tipo => {
    if (tipo === TipoMovimiento.AJUSTE) return true;
    return TIPOS_SALIDA.includes(tipo);
  }
};

const mutations = {
  // Mutaciones para movimientos de la grilla
  SET_MOVIMIENTOS(state, movimientos) {
    state.movimientos = Array.isArray(movimientos) ? movimientos : [];
  },
  
  SET_MOVIMIENTO_ACTUAL(state, movimiento) {
    state.movimientoActual = movimiento;
  },
  
  SET_CARGANDO(state, valor) {
    state.cargando = valor;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  SET_PAGINACION(state, paginacion) {
    state.paginacion = { ...state.paginacion, ...paginacion };
  },
  
  AGREGAR_MOVIMIENTO(state, movimiento) {
    if (!Array.isArray(state.movimientos)) {
      state.movimientos = [];
    }
    state.movimientos.unshift(movimiento);
  },
  
  // Mutaciones para filtros de la grilla
  SET_FILTROS_GRILLA(state, filtros) {
    state.filtrosGrilla = { ...state.filtrosGrilla, ...filtros };
  },
  
  LIMPIAR_FILTROS_GRILLA(state) {
    state.filtrosGrilla = {
      busqueda: '',
      tipoMovimiento: '',
      fechaInicio: null,
      fechaFin: null
    };
  },
  
  // Mutaciones para estadísticas
  SET_CARGANDO_ESTADISTICAS(state, valor) {
    state.estadisticas.cargandoEstadisticas = valor;
  },
  
  SET_PERIODO_ESTADISTICAS(state, periodo) {
    state.estadisticas.periodoActual = periodo;
  },
  
  SET_ESTADISTICAS(state, estadisticas) {
    state.estadisticas.datos = { 
      ...state.estadisticas.datos, 
      ...estadisticas,
      totalMovimientos: Number(estadisticas.totalMovimientos) || 0,
      totalEntradas: Number(estadisticas.totalEntradas) || 0,
      totalSalidas: Number(estadisticas.totalSalidas) || 0,
      valorInventario: Number(estadisticas.valorInventario) || 0,
      valorTotal: Number(estadisticas.valorTotal) || 0
    };
  },
  
  // Mutación para guardar movimientos por período
  SET_MOVIMIENTOS_PERIODO(state, { periodo, movimientos }) {
    state.movimientosPorPeriodo[periodo] = Array.isArray(movimientos) ? movimientos : [];
  }
};

const actions = {
  // Cargar datos del dashboard
  async cargarDatosDashboard({ dispatch }) {
    try {
      await dispatch('cargarEstadisticas');      
    } catch (error) {
      console.error('Error al cargar estadísticas:');
      throw error;
    }
  },

  // Cargar estadísticas con manejo correcto de la API
  async cargarEstadisticas({ commit, getters }) {
    commit('SET_CARGANDO_ESTADISTICAS', true);
    
    try {
      const fechas = getters.fechasPeriodoEstadisticas;
      let estadisticasData = {};
      
      // Intentar usar endpoint específico de estadísticas
      if (typeof movimientoService.getEstadisticas === 'function') {
        try {
          const response = await movimientoService.getEstadisticas(
            fechas.fechaInicio,
            fechas.fechaFin
          );
                    
          // Manejar la nueva estructura de respuesta completa
          if (response && response.data && response.data.success && response.data.estadisticas) {
            const stats = response.data.estadisticas;
            
            // Mapear la respuesta real a nuestro formato
            estadisticasData = {
              totalMovimientos: stats.totalMovimientos || 0,
              totalEntradas: stats.entradas?.cantidad || 0,
              valorTotalEntradas: stats.entradas?.valorTotal || 0,
              totalSalidas: stats.salidas?.cantidad || 0,
              valorTotalSalidas: stats.salidas?.valorTotal || 0,
              totalVentas: stats.ventas?.cantidad || 0,
              productoMayorMovimiento: stats.productoMayorMovimiento || null,
              tendencias: stats.tendencias || generarTendenciasDefault(),
              periodo: stats.periodo || {},
              contexto: response.data.contexto || {}
            };
            
          } else {
            estadisticasData = generarEstadisticasDefault();
          }
        } catch (endpointError) {
          estadisticasData = generarEstadisticasDefault();
        }
      } else {
        estadisticasData = calcularEstadisticasDesdeGrilla(getters);
      }
      
      // Crear objeto final de estadísticas adaptado a la nueva respuesta
      const estadisticasFinales = {
        totalMovimientos: estadisticasData.totalMovimientos || 0,
        totalEntradas: estadisticasData.totalEntradas || 0,
        valorTotalEntradas: estadisticasData.valorTotalEntradas || 0,
        totalSalidas: estadisticasData.totalSalidas || 0,
        valorTotalSalidas: estadisticasData.valorTotalSalidas || 0,
        totalVentas: estadisticasData.totalVentas || 0,
        productoMayorMovimiento: estadisticasData.productoMayorMovimiento || null,
        periodo: estadisticasData.periodo || {},
        contexto: estadisticasData.contexto || {},
        // Usar tendencias de la respuesta
        tendenciaTotal: estadisticasData.tendencias?.totalMovimientos || { valor: '0.0', tipo: 'positive', icono: '↑' },
        tendenciaEntradas: estadisticasData.tendencias?.totalEntradas || { valor: '0.0', tipo: 'positive', icono: '↑' },
        tendenciaSalidas: estadisticasData.tendencias?.totalSalidas || { valor: '0.0', tipo: 'neutral', icono: '↔' },
        tendenciaValor: estadisticasData.tendencias?.valorTotal || { valor: '0.0', tipo: 'positive', icono: '↑' }
      };

      
      commit('SET_ESTADISTICAS', estadisticasFinales);
      return estadisticasFinales;
      
    } catch (error) {
      
      const estadisticasDefault = generarEstadisticasDefault();
      commit('SET_ESTADISTICAS', estadisticasDefault);
      throw error;
    } finally {
      commit('SET_CARGANDO_ESTADISTICAS', false);
    }
  },

  // Implementación completa de cargarMovimientosGrilla en el store
  // Reemplazar esta función en el store de movimientos
async cargarMovimientosGrilla({ commit, state }, { page = 1, limit = 10, filtros = {} } = {}) {
  commit('SET_CARGANDO', true);
  commit('SET_ERROR', null);
  
  try {
    console.log('Cargando movimientos para la grilla...', { page, limit, filtros });
    
    // Preparar filtros combinando los del estado con los nuevos
    const filtrosCompletos = {
      ...state.filtrosGrilla,
      ...filtros
    };
    
    // Mapear filtros internos a formato de API
    const filtrosAPI = {
      busqueda: filtrosCompletos.busqueda || '',
      tipo: filtrosCompletos.tipoMovimiento || '',
      fecha_inicio: filtrosCompletos.fechaInicio || null,
      fecha_fin: filtrosCompletos.fechaFin || null
    };
    
    // Limpiar filtros vacíos
    Object.keys(filtrosAPI).forEach(key => {
      if (!filtrosAPI[key]) {
        delete filtrosAPI[key];
      }
    });
    
    console.log('Filtros para API:', filtrosAPI);
    
    // Llamar al servicio
    const response = await movimientoService.getPaginated(page, limit, filtrosAPI);
    
    console.log('Respuesta de la API:', response);
    
    // Procesar respuesta específica de tu API
    let movimientos = [];
    let paginacionData = {
      paginaActual: page,
      itemsPorPagina: limit,
      totalItems: 0,
      totalPaginas: 1
    };
    
    // Tu API devuelve: { status: "success", data: { items: [...], total, page, limit, totalPages } }
    if (response && response.status === "success" && response.data) {
      // Extraer movimientos del array items
      movimientos = Array.isArray(response.data.items) ? response.data.items : [];
      
      // Extraer información de paginación
      paginacionData = {
        paginaActual: response.data.page || page,
        itemsPorPagina: response.data.limit || limit,
        totalItems: response.data.total || 0,
        totalPaginas: response.data.totalPages || Math.ceil((response.data.total || 0) / limit)
      };
    }
    // Fallback para otras estructuras posibles
    else if (response && response.data && response.data.items) {
      movimientos = Array.isArray(response.data.items) ? response.data.items : [];
      paginacionData = {
        paginaActual: response.data.page || page,
        itemsPorPagina: response.data.limit || limit,
        totalItems: response.data.total || 0,
        totalPaginas: response.data.totalPages || Math.ceil((response.data.total || 0) / limit)
      };
    }
    // Si no encuentra la estructura esperada
    else {
      console.warn('Estructura de respuesta no esperada:', response);
      movimientos = [];
    }
    
    console.log('Movimientos procesados:', {
      cantidad: movimientos.length,
      paginacion: paginacionData,
      primerMovimiento: movimientos[0] || null
    });
    
    // Actualizar estado
    commit('SET_MOVIMIENTOS', movimientos);
    commit('SET_PAGINACION', paginacionData);
    
    return {
      movimientos,
      paginacion: paginacionData
    };
    
  } catch (error) {
    console.error('Error en cargarMovimientosGrilla:', error);
    
    // Determinar mensaje de error más específico
    let mensajeError = 'Error al cargar movimientos para la grilla';
    if (error.response) {
      if (error.response.status === 404) {
        mensajeError = 'No se encontraron movimientos';
      } else if (error.response.status === 403) {
        mensajeError = 'No tienes permisos para ver los movimientos';
      } else if (error.response.status === 500) {
        mensajeError = 'Error interno del servidor';
      } else if (error.response.data && error.response.data.message) {
        mensajeError = error.response.data.message;
      }
    } else if (error.message) {
      mensajeError = error.message;
    }
    
    commit('SET_ERROR', mensajeError);
    
    // Resetear estado a valores vacíos
    commit('SET_MOVIMIENTOS', []);
    commit('SET_PAGINACION', {
      paginaActual: 1,
      itemsPorPagina: limit,
      totalItems: 0,
      totalPaginas: 1
    });
    
    throw error;
  } finally {
    commit('SET_CARGANDO', false);
  }
},

  // Acción auxiliar para aplicar filtros y recargar
  async aplicarFiltrosGrilla({ commit, dispatch, state }, filtros) {
    // Actualizar filtros en el estado
    commit('SET_FILTROS_GRILLA', filtros);
    
    // Resetear a página 1 cuando se aplican filtros
    await dispatch('cargarMovimientosGrilla', { 
      page: 1, 
      limit: state.paginacion.itemsPorPagina,
      filtros 
    });
  },

  // Acción para limpiar filtros
  async limpiarFiltrosGrilla({ commit, dispatch, state }) {
    commit('LIMPIAR_FILTROS_GRILLA');
    
    // Recargar con filtros limpios
    await dispatch('cargarMovimientosGrilla', { 
      page: 1, 
      limit: state.paginacion.itemsPorPagina 
    });
  },

  // Acción para cambiar página
  async cambiarPaginaGrilla({ dispatch, state }, nuevaPagina) {
    await dispatch('cargarMovimientosGrilla', {
      page: nuevaPagina,
      limit: state.paginacion.itemsPorPagina
    });
  },
  
  // Cambiar período de estadísticas
  async cambiarPeriodoEstadisticas({ commit, dispatch, state }, periodo) {
    if (state.estadisticas.periodoActual === periodo) {
      return;
    }
    
    commit('SET_PERIODO_ESTADISTICAS', periodo);
    await dispatch('cargarEstadisticas');
  },
  
  // Cargar todos los movimientos
  async cargarTodosMovimientos({ commit }, filtros = {}) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await movimientoService.getAll(filtros);
      
      let movimientos = [];
      if (Array.isArray(response)) {
        movimientos = response;
      } else if (response && Array.isArray(response.data)) {
        movimientos = response.data;
      }
      
      commit('SET_MOVIMIENTOS', movimientos);
      return movimientos;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al cargar todos los movimientos');
      console.error('Error en cargarTodosMovimientos:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  // Obtener un movimiento específico
  async obtenerMovimiento({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await movimientoService.getById(id);
      const movimiento = response && response.data ? response.data : null;
      commit('SET_MOVIMIENTO_ACTUAL', movimiento);
      return movimiento;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener el movimiento ${id}`);
      console.error('Error en obtenerMovimiento:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  // Crear un movimiento
  async crearMovimiento({ commit, dispatch }, movimientoData) {
    commit('SET_CARGANDO', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await movimientoService.create(movimientoData);
      const nuevoMovimiento = response && response.data ? response.data : null;
      
      if (nuevoMovimiento) {
        commit('AGREGAR_MOVIMIENTO', nuevoMovimiento);
        
        if (nuevoMovimiento.producto_id) {
          await dispatch('productos/obtenerProducto', nuevoMovimiento.producto_id, { root: true });
        }
        
        await dispatch('cargarEstadisticas');
      }
      
      return nuevoMovimiento;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al crear el movimiento');
      console.error('Error en crearMovimiento:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  }
};

// ===== FUNCIONES AUXILIARES =====

function generarEstadisticasDefault() {
  return {
    totalMovimientos: 0,
    totalEntradas: 0,
    valorTotalEntradas: 0,
    totalSalidas: 0,
    valorTotalSalidas: 0,
    totalVentas: 0,
    productoMayorMovimiento: null,
    periodo: {},
    contexto: {},
    tendencias: generarTendenciasDefault()
  };
}

function generarTendenciasDefault() {
  return {
    totalMovimientos: { valor: '0.0', tipo: 'positive', icono: '↑' },
    totalEntradas: { valor: '0.0', tipo: 'positive', icono: '↑' },
    totalSalidas: { valor: '0.0', tipo: 'neutral', icono: '↔' },
    valorTotal: { valor: '0.0', tipo: 'positive', icono: '↑' }
  };
}

function calcularEstadisticasDesdeGrilla(getters) {
  const movimientosGrilla = getters.entradasGrilla.concat(getters.salidasGrilla, getters.ajustesGrilla);
  
  if (movimientosGrilla.length === 0) {
    console.log('⚠️ No hay movimientos en la grilla para calcular estadísticas');
    return generarEstadisticasDefault();
  }
  
  const fechas = getters.fechasPeriodoEstadisticas;
  const fechaInicio = new Date(fechas.fechaInicioCompleta);
  const fechaFin = new Date(fechas.fechaFinCompleta);
  
  const movimientosFiltrados = movimientosGrilla.filter(m => {
    const fechaMovimiento = new Date(m.fecha);
    return fechaMovimiento >= fechaInicio && fechaMovimiento <= fechaFin;
  });
  
  return calcularEstadisticasDesdeMovimientos(movimientosFiltrados);
}

function calcularEstadisticasDesdeMovimientos(movimientos) {
  if (!Array.isArray(movimientos)) {
    console.warn('calcularEstadisticasDesdeMovimientos: movimientos no es un array');
    return generarEstadisticasDefault();
  }
  
  let totalEntradas = 0;
  let totalSalidas = 0;
  const movimientosPorTipo = {};
  
  movimientos.forEach(m => {
    const tipo = m.tipo || 'sin_tipo';
    movimientosPorTipo[tipo] = (movimientosPorTipo[tipo] || 0) + 1;
    
    if (m.tipo === TipoMovimiento.AJUSTE) {
      if (m.cantidad > 0) {
        totalEntradas += Math.abs(m.cantidad);
      } else {
        totalSalidas += Math.abs(m.cantidad);
      }
    } else if (TIPOS_ENTRADA.includes(m.tipo)) {
      totalEntradas += Math.abs(m.cantidad || 0);
    } else if (TIPOS_SALIDA.includes(m.tipo)) {
      totalSalidas += Math.abs(m.cantidad || 0);
    }
  });
  
  return {
    totalMovimientos: movimientos.length,
    totalEntradas: Math.round(totalEntradas),
    totalSalidas: Math.round(totalSalidas),
    valorTotal: 0,
    movimientosPorTipo,
    tendencias: calcularTendenciasSimuladas()
  };
}

function calcularTendenciasSimuladas() {
  const variacionTotal = (Math.random() * 20 - 10);
  const variacionEntradas = (Math.random() * 15 - 5);
  const variacionSalidas = (Math.random() * 10 - 15);
  const variacionValor = (Math.random() * 8 - 2);
  
  return {
    totalMovimientos: {
      valor: Math.abs(variacionTotal).toFixed(1),
      tipo: variacionTotal >= 0 ? 'positive' : 'negative',
      icono: variacionTotal >= 0 ? '↑' : '↓'
    },
    totalEntradas: {
      valor: Math.abs(variacionEntradas).toFixed(1),
      tipo: variacionEntradas >= 0 ? 'positive' : 'negative',
      icono: variacionEntradas >= 0 ? '↑' : '↓'
    },
    totalSalidas: {
      valor: Math.abs(variacionSalidas).toFixed(1),
      tipo: variacionSalidas >= 0 ? 'negative' : 'positive',
      icono: variacionSalidas >= 0 ? '↑' : '↓'
    },
    valorTotal: {
      valor: Math.abs(variacionValor).toFixed(1),
      tipo: variacionValor >= 0 ? 'positive' : 'negative',
      icono: variacionValor >= 0 ? '↑' : '↓'
    }
  };
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};