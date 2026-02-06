// src/services/movimiento.service.js
import axios from '@/plugins/axios'

/**
 * Enum de tipos de movimiento
 */
export const TipoMovimiento = {
  ENTRADA: 'entrada',
  SALIDA: 'salida',
  COMPRA: 'compra',
  VENTA_PRODUCTO: 'venta_producto',
  VENTA_COMPONENTE_RAMO: 'venta_componente_ramo',
  DEVOLUCION_PRODUCTO: 'devolucion_producto',
  DEVOLUCION_COMPONENTE_RAMO: 'devolucion_componente_ramo',
  MERMA: 'merma',
  AJUSTE: 'ajuste',
  DEVOLUCION_A_PROVEEDOR: 'devolucion_a_proveedor'
}

/**
 * Configuración de tipos (qué es entrada vs salida)
 */
export const TIPOS_ENTRADA = [
  TipoMovimiento.ENTRADA,
  TipoMovimiento.COMPRA,
  TipoMovimiento.DEVOLUCION_PRODUCTO,
  TipoMovimiento.DEVOLUCION_COMPONENTE_RAMO
]

export const TIPOS_SALIDA = [
  TipoMovimiento.SALIDA,
  TipoMovimiento.VENTA_PRODUCTO,
  TipoMovimiento.VENTA_COMPONENTE_RAMO,
  TipoMovimiento.MERMA,
  TipoMovimiento.DEVOLUCION_A_PROVEEDOR
]

/**
 * Funciones auxiliares para movimientos
 */
export const movimientoHelpers = {
  /**
   * Verificar si un tipo de movimiento es entrada
   */
  esEntrada(tipo) {
    if (tipo === TipoMovimiento.AJUSTE) {
      return true; // Los ajustes pueden ser entrada o salida según cantidad
    }
    return TIPOS_ENTRADA.includes(tipo);
  },

  /**
   * Verificar si un tipo de movimiento es salida
   */
  esSalida(tipo) {
    if (tipo === TipoMovimiento.AJUSTE) {
      return true; // Los ajustes pueden ser entrada o salida según cantidad
    }
    return TIPOS_SALIDA.includes(tipo);
  },

  /**
   * Formatear tipo de movimiento para mostrar
   */
  formatearTipo(tipo) {
    const tipos = {
      [TipoMovimiento.ENTRADA]: 'Entrada Manual',
      [TipoMovimiento.SALIDA]: 'Salida Manual',
      [TipoMovimiento.COMPRA]: 'Compra a Proveedor',
      [TipoMovimiento.VENTA_PRODUCTO]: 'Venta de Producto',
      [TipoMovimiento.VENTA_COMPONENTE_RAMO]: 'Venta de Ramo',
      [TipoMovimiento.DEVOLUCION_PRODUCTO]: 'Devolución de Producto',
      [TipoMovimiento.DEVOLUCION_COMPONENTE_RAMO]: 'Devolución de Ramo',
      [TipoMovimiento.MERMA]: 'Merma/Pérdida',
      [TipoMovimiento.AJUSTE]: 'Ajuste de Inventario',
      [TipoMovimiento.DEVOLUCION_A_PROVEEDOR]: 'Devolución a Proveedor'
    };
    return tipos[tipo] || tipo;
  },

  /**
   * Obtener clase CSS para el tipo de movimiento
   */
  getTipoClase(tipo) {
    if (this.esEntrada(tipo)) return 'entrada';
    if (this.esSalida(tipo)) return 'salida';
    return 'ajuste';
  },

  /**
   * Formatear cantidad con signo correcto
   */
  formatearCantidad(cantidad, tipo) {
    // Para ajustes, mostrar el signo real
    if (tipo === TipoMovimiento.AJUSTE) {
      return cantidad > 0 ? `+${cantidad}` : `${cantidad}`;
    }
    
    // Para otros tipos, mostrar según sea entrada o salida
    if (this.esEntrada(tipo)) {
      return `+${Math.abs(cantidad)}`;
    } else {
      return `-${Math.abs(cantidad)}`;
    }
  }
};

/**
 * Servicio para operaciones relacionadas con movimientos de inventario
 */
const movimientoService = {
  /**
   * Obtener movimientos con paginación y filtros
   * @param {Number} page - Número de página
   * @param {Number} limit - Elementos por página
   * @param {Object} filtros - Filtros para la consulta
   * @returns {Promise} - Respuesta de la API con lista paginada de movimientos
   */
  async getPaginated(page = 1, limit = 10, filtros = {}) {
    let queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Agregar filtros a la query con validación
    if (filtros.producto_id) queryParams.append('producto_id', filtros.producto_id);
    if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
    if (filtros.venta_id) queryParams.append('venta_id', filtros.venta_id);
    if (filtros.compra_id) queryParams.append('compra_id', filtros.compra_id);
    if (filtros.usuario_id) queryParams.append('usuario_id', filtros.usuario_id);
    if (filtros.fecha_inicio) queryParams.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) queryParams.append('fecha_fin', filtros.fecha_fin);
    if (filtros.lote) queryParams.append('lote', filtros.lote);
    if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
    
    try {
      console.log('Enviando request a API:', `/inventario/movimientos?${queryParams.toString()}`);
      
      const response = await axios.get(`/inventario/movimientos?${queryParams.toString()}`);
      
      console.log('Respuesta completa de la API:', response);
      
      // La respuesta puede venir en diferentes formatos dependiendo del backend
      if (response.data) {
        return response.data;
      }
      
      return response;
      
    } catch (error) {
      console.error("Error detallado al obtener movimientos paginados:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `/inventario/movimientos?${queryParams.toString()}`
      });
      throw error;
    }
  },

  /**
   * Obtener todos los movimientos sin paginar (comentado hasta implementar)
   * @param {Object} filtros - Filtros para la consulta
   * @returns {Promise} - Respuesta de la API con lista de movimientos
   */
  // async getAll(filtros = {}) {
  //   let queryParams = new URLSearchParams();
    
  //   // Agregar filtros a la query
  //   if (filtros.producto_id) queryParams.append('producto_id', filtros.producto_id);
  //   if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
  //   if (filtros.venta_id) queryParams.append('venta_id', filtros.venta_id);
  //   if (filtros.compra_id) queryParams.append('compra_id', filtros.compra_id);
  //   if (filtros.usuario_id) queryParams.append('usuario_id', filtros.usuario_id);
  //   if (filtros.fecha_inicio) queryParams.append('fecha_inicio', filtros.fecha_inicio);
  //   if (filtros.fecha_fin) queryParams.append('fecha_fin', filtros.fecha_fin);
  //   if (filtros.lote) queryParams.append('lote', filtros.lote);
  //   if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
    
  //   try {
  //     const response = await axios.get(`/inventario/movimientos/todos?${queryParams.toString()}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error al obtener todos los movimientos:", error);
  //     throw error;
  //   }
  // },

  /**
   * Obtener estadísticas de movimientos
   * @param {String} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {String} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @param {String} usuarioId - ID del usuario (opcional, solo para admins)
   * @returns {Promise} - Respuesta de la API con estadísticas agregadas
   */
  async getEstadisticas(fechaInicio, fechaFin, usuarioId = null) {
    if (!fechaInicio || !fechaFin) {
      return Promise.reject(new Error('fechaInicio y fechaFin son requeridos'));
    }

    let queryParams = new URLSearchParams();
    queryParams.append('fecha_inicio', fechaInicio);
    queryParams.append('fecha_fin', fechaFin);
    
    // Solo agregar usuario_id si se proporciona (para admins)
    if (usuarioId) {
      queryParams.append('usuario_id', usuarioId);
    }
    
    try {
      console.log('Cargando estadísticas desde:', `/inventario/movimientos/estadisticas?${queryParams.toString()}`);
      
      const response = await axios.get(`/inventario/movimientos/estadisticas?${queryParams.toString()}`);
      
      console.log('Estadísticas recibidas:', response);
      
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas de movimientos:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  /**
   * Obtener un movimiento específico por ID
   * @param {String} id - ID del movimiento
   * @returns {Promise} - Respuesta de la API con los datos del movimiento
   */
  async getById(id) {
    if (!id) return Promise.reject(new Error('ID de movimiento requerido'));
    
    try {
      const response = await axios.get(`/inventario/movimientos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener movimiento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo movimiento de inventario
   * @param {Object} movimientoData - Datos del movimiento a crear
   * @returns {Promise} - Respuesta de la API con el movimiento creado
   */
  async create(movimientoData) {
    try {
      console.log('Creando movimiento:', movimientoData);
      
      const response = await axios.post('/inventario/movimientos', movimientoData);
      
      console.log('Movimiento creado:', response);
      
      return response.data;
    } catch (error) {
      console.error("Error al crear movimiento:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        movimientoData
      });
      throw error;
    }
  },

  /**
   * Actualizar un movimiento existente
   * @param {String} id - ID del movimiento
   * @param {Object} movimientoData - Datos actualizados del movimiento
   * @returns {Promise} - Respuesta de la API con el movimiento actualizado
   */
  async update(id, movimientoData) {
    if (!id) return Promise.reject(new Error('ID de movimiento requerido'));
    
    try {
      console.log('Actualizando movimiento:', id, movimientoData);
      
      const response = await axios.put(`/inventario/movimientos/${id}`, movimientoData);
      
      console.log('Movimiento actualizado:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar movimiento ${id}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        movimientoData
      });
      throw error;
    }
  },

  /**
   * Eliminar un movimiento
   * @param {String} id - ID del movimiento
   * @returns {Promise} - Respuesta de la API
   */
  async delete(id) {
    if (!id) return Promise.reject(new Error('ID de movimiento requerido'));
    
    try {
      console.log('Eliminando movimiento:', id);
      
      const response = await axios.delete(`/inventario/movimientos/${id}`);
      
      console.log('Movimiento eliminado:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar movimiento ${id}:`, error);
      throw error;
    }
  }
};

export default movimientoService;