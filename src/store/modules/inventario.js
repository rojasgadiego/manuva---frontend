// src/store/modules/inventario.js
import axiosInstance from '@/plugins/axios'
import inventarioService from '@/services/inventario.service'

const state = {
  // Estados de carga
  cargandoEstadisticas: false,
  cargandoProductosBajoStock: false,
  cargandoLotesCriticos: false,
  cargando: false,
  
  // Datos principales
  estadisticas: {
    valor_inventario: 0,
    stock_critico: 0,
    proximos_vencer: {
      cantidad: 0,
      valor_expuesto: 0
    },
    tasa_merma: {
      porcentaje: 0,
      valor_perdido: 0
    },
    cantidad_productos: 0,
    cantidad_ramos: 0,
    periodo: {
      fechaInicio: null,
      fechaFin: null
    }
  },
  
  productosBajoStock: [],
  lotesCriticos: [],
  
  // Contexto y configuración
  esAdministrador: false,
  periodoActivo: 'dia',
  error: null,
  lastUpdated: null
}

// ✅ Función helper para normalizar estadísticas
const normalizarEstadisticas = (estadisticas) => {
  if (!estadisticas) return state.estadisticas
  
  try {
    return {
      valor_inventario: parseFloat(estadisticas.valor_inventario) || 0,
      stock_critico: parseInt(estadisticas.stock_critico) || 0,
      proximos_vencer: {
        cantidad: parseInt(estadisticas.proximos_vencer?.cantidad) || 0,
        valor_expuesto: parseFloat(estadisticas.proximos_vencer?.valor_expuesto) || 0
      },
      tasa_merma: {
        porcentaje: parseFloat(estadisticas.tasa_merma?.porcentaje) || 0,
        valor_perdido: parseFloat(estadisticas.tasa_merma?.valor_perdido) || 0
      },
      cantidad_productos: parseInt(estadisticas.cantidad_productos) || 0,
      cantidad_ramos: parseInt(estadisticas.cantidad_ramos) || 0,
      periodo: {
        fechaInicio: estadisticas.periodo?.fechaInicio || null,
        fechaFin: estadisticas.periodo?.fechaFin || null
      }
    }
  } catch (error) {
    console.warn('⚠️ Error normalizando estadísticas:', error, estadisticas)
    return state.estadisticas
  }
}

const getters = {
  // Estados de carga
  cargandoAlgunDato: state => state.cargandoEstadisticas || state.cargandoProductosBajoStock || state.cargandoLotesCriticos,
  isLoading: state => state.cargando || state.cargandoEstadisticas || state.cargandoProductosBajoStock || state.cargandoLotesCriticos,
  hasError: state => !!state.error,
  errorMessage: state => state.error,
  
  // Estados de carga específicos
  cargandoEstadisticas: state => state.cargandoEstadisticas,
  cargandoProductosBajoStock: state => state.cargandoProductosBajoStock,
  cargandoLotesCriticos: state => state.cargandoLotesCriticos,
  
  // Datos básicos
  esAdministrador: state => state.esAdministrador,
  periodoActivo: state => state.periodoActivo,
  estadisticas: state => state.estadisticas,
  productosBajoStock: state => state.productosBajoStock,
  lotesCriticos: state => state.lotesCriticos,
  
  // Estadísticas formateadas
  estadisticasFormateadas: state => ({
    valorInventario: {
      valor: state.estadisticas.valor_inventario,
      formatoMoneda: new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(state.estadisticas.valor_inventario)
    },
    stockCritico: state.estadisticas.stock_critico,
    proximosVencer: {
      ...state.estadisticas.proximos_vencer,
      porcentaje: state.estadisticas.cantidad_productos > 0
        ? ((state.estadisticas.proximos_vencer.cantidad / state.estadisticas.cantidad_productos) * 100).toFixed(1)
        : 0
    },
    tasaMerma: state.estadisticas.tasa_merma,
    cantidadProductos: state.estadisticas.cantidad_productos,
    cantidadRamos: state.estadisticas.cantidad_ramos,
    periodo: {
      ...state.estadisticas.periodo,
      tipo: state.periodoActivo
    }
  }),
  
  // Estadísticas para componentes (compatibilidad con tu vista actual)
  estadisticasInventario: (state, getters) => ({
    valorInventario: getters.estadisticasFormateadas.valorInventario,
    cantidadProductos: state.estadisticas.cantidad_productos,
    cantidadRamos: state.estadisticas.cantidad_ramos,
    stockCritico: getters.estadisticasFormateadas.stockCritico,
    proximosVencer: getters.estadisticasFormateadas.proximosVencer,
    tasaMerma: state.estadisticas.tasa_merma,
    periodo: getters.estadisticasFormateadas.periodo,
    
    // Métricas adicionales
    metricas: {
      densidadInventario: state.estadisticas.cantidad_productos > 0
        ? (state.estadisticas.valor_inventario / state.estadisticas.cantidad_productos).toFixed(0)
        : 0,
      
      nivelRiesgo: (() => {
        if (state.estadisticas.cantidad_productos === 0) return 'bajo'
        const porcentajeRiesgo = ((state.estadisticas.stock_critico.cantidad + state.estadisticas.proximos_vencer.cantidad) / state.estadisticas.cantidad_productos) * 100
        if (porcentajeRiesgo >= 30) return 'alto'
        if (porcentajeRiesgo >= 15) return 'medio'
        return 'bajo'
      })(),
      
      tendencia: 'neutral' // TODO: Calcular basado en datos históricos
    }
  }),
  
  // Getters específicos para dashboard
  totalProductos: state => state.estadisticas.cantidad_productos,
  valorInventario: state => state.estadisticas.valor_inventario,
  productosProximosVencer: state => state.lotesCriticos,
  
  // Validación de datos
  datosValidos: state => {
    return state.estadisticas.cantidad_productos >= 0 &&
           Array.isArray(state.productosBajoStock) &&
           Array.isArray(state.lotesCriticos)
  },
  
  lastUpdated: state => state.lastUpdated
}

const mutations = {
  // Estados de carga
  SET_CARGANDO_ESTADISTICAS(state, valor) {
    state.cargandoEstadisticas = valor
  },
  
  SET_CARGANDO_PRODUCTOS_BAJO_STOCK(state, valor) {
    state.cargandoProductosBajoStock = valor
  },
  
  SET_CARGANDO_LOTES_CRITICOS(state, valor) {
    state.cargandoLotesCriticos = valor
  },
  
  SET_CARGANDO(state, valor) {
    state.cargando = valor
  },
  
  // Datos principales
  SET_ESTADISTICAS(state, estadisticas) {
    state.estadisticas = normalizarEstadisticas(estadisticas)
    state.lastUpdated = new Date().toISOString()
  },
  
  SET_PRODUCTOS_BAJO_STOCK(state, productos) {
    state.productosBajoStock = Array.isArray(productos) ? productos : []
  },
  
  SET_LOTES_CRITICOS(state, lotes) {
    state.lotesCriticos = Array.isArray(lotes) ? lotes : []
  },
  
  // Contexto
  SET_ES_ADMINISTRADOR(state, valor) {
    state.esAdministrador = valor
  },
  
  SET_PERIODO_ACTIVO(state, periodo) {
    state.periodoActivo = periodo
  },
  
  // Manejo de errores
  SET_ERROR(state, error) {
    state.error = error
  },
  
  RESET_ERROR(state) {
    state.error = null
  },
  
  // Reset completo
  RESET_ESTADO(state) {
    state.estadisticas = {
      valor_inventario: 0,
      stock_critico: 0,
      proximos_vencer: { cantidad: 0, valor_expuesto: 0 },
      tasa_merma: { porcentaje: 0, valor_perdido: 0 },
      cantidad_productos: 0,
      cantidad_ramos: 0,
      periodo: { fechaInicio: null, fechaFin: null }
    }
    state.productosBajoStock = []
    state.lotesCriticos = []
    state.error = null
  }
}

const actions = {
  // ==================== UTILIDADES DE FECHA ====================
  obtenerRangoFechas(context, periodo = 'dia') {
    const ahora = new Date()
    let fechaInicio, fechaFin
    
    switch (periodo) {
      case 'dia':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
        fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaFin.getDate() + 1)
        fechaFin.setMilliseconds(-1)
        break
        
      case 'semana': {
        const diasHastaLunes = (ahora.getDay() + 6) % 7
        fechaInicio = new Date(ahora)
        fechaInicio.setDate(ahora.getDate() - diasHastaLunes)
        fechaInicio.setHours(0, 0, 0, 0)
        fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaFin.getDate() + 6)
        fechaFin.setHours(23, 59, 59, 999)
        break
      }
        
      case 'mes':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
        fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999)
        break
        
      case 'trimestre': {
        const mesActual = ahora.getMonth()
        const primerMesTrimestre = Math.floor(mesActual / 3) * 3
        fechaInicio = new Date(ahora.getFullYear(), primerMesTrimestre, 1)
        fechaFin = new Date(ahora.getFullYear(), primerMesTrimestre + 3, 0, 23, 59, 59, 999)
        break
      }
        
      case 'año':
        fechaInicio = new Date(ahora.getFullYear(), 0, 1)
        fechaFin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59, 999)
        break
        
      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
        fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaFin.getDate() + 1)
        fechaFin.setMilliseconds(-1)
    }
    
    return {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    }
  },
  
  // ==================== ACCIONES PRINCIPALES ====================
  
  async obtenerEstadisticas({ commit, dispatch, state }, periodo = null) {
    if (state.cargandoEstadisticas) return
    
    commit('SET_CARGANDO_ESTADISTICAS', true)
    commit('RESET_ERROR')
    
    try {
      const periodoBuscar = periodo || state.periodoActivo
      const { fechaInicio, fechaFin } = await dispatch('obtenerRangoFechas', periodoBuscar)
      
      const response = await axiosInstance.get('/inventario/estadisticas', {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }
      })
      
      if (response.data?.status === 'success' && response.data?.data?.success) {
        commit('SET_ESTADISTICAS', response.data.data.estadisticas)
        commit('SET_ES_ADMINISTRADOR', response.data.data.contexto?.esAdmin || false)
        return response.data.data.estadisticas
      } else {
        throw new Error('Formato de respuesta inválido')
      }
      
    } catch (error) {
      const mensaje = error.message || 'Error al obtener estadísticas'
      commit('SET_ERROR', mensaje)
      throw error
    } finally {
      commit('SET_CARGANDO_ESTADISTICAS', false)
    }
  },
  
  // 2. Obtener productos con bajo stock
  async obtenerProductosBajoStock({ commit, state }) {
    if (state.cargandoProductosBajoStock) return
    
    commit('SET_CARGANDO_PRODUCTOS_BAJO_STOCK', true)
    commit('RESET_ERROR')
    
    try {
      // Usar el service
      const response = await inventarioService.ProductosBajoStock()
      
      if (response?.status === 'success') {
        const productos = response.data || []
        commit('SET_PRODUCTOS_BAJO_STOCK', productos)
        return productos
      } else {
        throw new Error('Formato de respuesta inválido')
      }
      
    } catch (error) {
      const mensaje = error.message || 'Error al obtener productos con bajo stock'
      commit('SET_ERROR', mensaje)
      commit('SET_PRODUCTOS_BAJO_STOCK', []) // Array vacío en caso de error
      throw error
    } finally {
      commit('SET_CARGANDO_PRODUCTOS_BAJO_STOCK', false)
    }
  },
  
  // 3. Obtener lotes críticos (próximos a vencer)
  async obtenerLotesCriticos({ commit, state }) {
    if (state.cargandoLotesCriticos) return
    
    commit('SET_CARGANDO_LOTES_CRITICOS', true)
    commit('RESET_ERROR')
    
    try {
      // Usar el service
      const response = await inventarioService.LotesProximosVencer()
      
      if (response?.status === 'success') {
        const lotes = response.data || []
        commit('SET_LOTES_CRITICOS', lotes)
        return lotes
      } else {
        throw new Error('Formato de respuesta inválido')
      }
      
    } catch (error) {
      const mensaje = error.message || 'Error al obtener lotes críticos'
      commit('SET_ERROR', mensaje)
      commit('SET_LOTES_CRITICOS', []) // Array vacío en caso de error
      console.error('❌ Error en obtenerLotesCriticos:', error)
      throw error
    } finally {
      commit('SET_CARGANDO_LOTES_CRITICOS', false)
    }
  },
  
  // ==================== ACCIONES COMBINADAS ====================
  
  // Cambiar período y recargar estadísticas
  async cambiarPeriodo({ commit, dispatch, state }, nuevoPeriodo) {
    if (state.periodoActivo === nuevoPeriodo) return
    
    commit('SET_PERIODO_ACTIVO', nuevoPeriodo)
    
    // Solo recargar estadísticas, no productos ni lotes
    await dispatch('obtenerEstadisticas', nuevoPeriodo)
  },
  
  // Forzar actualización completa
  async forzarActualizacion({ dispatch }) {
    await dispatch('cargarDatosDashboard', true)
  },
  
  // ==================== ACCIONES DE UTILIDAD ====================
  
  // Limpiar datos
  limpiarDatos({ commit }) {
    commit('RESET_ESTADO')
  },
  
  // Limpiar error
  limpiarError({ commit }) {
    commit('RESET_ERROR')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}