// src/services/venta.service.js
import axios from '@/plugins/axios';

/**
 * Servicio para operaciones relacionadas con ventas
 * Actualizado para coincidir perfectamente con la API de NestJS
 */
const ventaService = {
  /**
   * Obtener todas las ventas con filtros opcionales y paginación
   * @param {Object} filtros - Filtros para consulta
   * @returns {Promise} - Respuesta de la API con la lista de ventas paginada
   */
  async getAll(filtros = {}) {
    try {
      
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      // Parámetros de paginación
      if (filtros.page) queryParams.append('page', filtros.page.toString());
      if (filtros.limit) queryParams.append('limit', filtros.limit.toString());
      
      // Filtros específicos
      if (filtros.cliente_id) queryParams.append('cliente_id', filtros.cliente_id);
      if (filtros.usuario_id) queryParams.append('usuario_id', filtros.usuario_id);
      if (filtros.estado) queryParams.append('estado', filtros.estado);
      if (filtros.metodo) queryParams.append('metodo', filtros.metodo);
      if (filtros.fecha_inicio) queryParams.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) queryParams.append('fecha_fin', filtros.fecha_fin);
      if (filtros.facturada !== undefined) queryParams.append('facturada', filtros.facturada.toString());
      
      const response = await axios.get(`/ventas?${queryParams.toString()}`);
      
      // El backend devuelve la estructura: { data: [...], total: 0, page: 1, limit: 15, totalPages: 0 }
      // Mantener compatibilidad: retornar solo el array de datos
      return response.data.data;
    } catch (error) {
      throw this._handleError(`error al obtener ventas`, error);
    }
  },

  /**
   * Obtener ventas del usuario actual (mis ventas)
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise} - Respuesta de la API
   */
  async getMisVentas(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros de paginación
      if (filtros.page) queryParams.append('page', filtros.page.toString());
      if (filtros.limit) queryParams.append('limit', filtros.limit.toString());
      
      // Filtros de fecha
      if (filtros.fecha_inicio) queryParams.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) queryParams.append('fecha_fin', filtros.fecha_fin);
      
      const response = await axios.get(`/ventas/mis-ventas?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw this._handleError(`error al obtener mis ventas`, error);
    }
  },

  /**
   * Obtener una venta específica por ID
   * @param {String} id - ID de la venta
   * @returns {Promise} - Respuesta de la API con los datos de la venta
   */
  async getById(id) {
    try {
      if (!id) throw new Error('ID de venta requerido');
      const response = await axios.get(`/ventas/${id}`);
      return response.data;
    } catch (error) {
      throw this._handleError(`error al obtener venta ${id}`, error);
    }
  },

  /**
   * Crear una nueva venta
   * @param {Object} ventaData - Datos de la venta a crear
   * @returns {Promise} - Respuesta de la API con la venta creada
   */
  async create(ventaData) {
    try {
      this._validateVentaData(ventaData);
      const response = await axios.post('/ventas', ventaData);
      return response.data.data;
    } catch (error) {
      throw this._handleError(`error al crear venta`, error);
    }
  },

  /**
   * Actualizar una venta existente (solo para admins)
   * @param {String} id - ID de la venta a actualizar
   * @param {Object} ventaData - Nuevos datos de la venta
   * @returns {Promise} - Respuesta de la API con la venta actualizada
   */
  async update(id, ventaData) {
    try {
      if (!id) throw new Error('ID de venta requerido');
      const updateData = {};
      if (ventaData.estado !== undefined) updateData.estado = ventaData.estado;
      if (ventaData.notas !== undefined) updateData.notas = ventaData.notas;
      
      const response = await axios.patch(`/ventas/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw this._handleError(`error al actualizar venta ${id}`);
    }
  },

  /**
   * Cancelar una venta (solo para admins)
   * @param {String} id - ID de la venta a cancelar
   * @returns {Promise} - Respuesta de la API con la venta cancelada
   */
  async cancelar(id) {
    try {
      if (!id) throw new Error('ID de venta requerido');
      const response = await axios.patch(`/ventas/${id}/cancelar`);
      return response.data;
    } catch (error) {
      throw this._handleError(`error al cancelar venta ${id}`);
    }
  },

  /**
   * Procesar devolución de items de una venta
   * @param {String} ventaId - ID de la venta
   * @param {Array} devolucionesDto - Array de DevolucionItemDto
   * @returns {Promise} - Respuesta de la API con la venta actualizada
   */
  async devolverItems(ventaId, devolucionesDto) {
    try {
      if (!ventaId) throw new Error('ID de venta requerido');
      if (!Array.isArray(devolucionesDto) || devolucionesDto.length === 0) {
        throw new Error('Se requiere un array de items a devolver');
      }
      
      // Validar estructura de items
      devolucionesDto.forEach((item, index) => {
        if (!item.detalle_venta_id) {
          throw new Error(`Item ${index}: detalle_venta_id es requerido`);
        }
        if (!item.cantidad || item.cantidad <= 0) {
          throw new Error(`Item ${index}: cantidad debe ser mayor a 0`);
        }
      });
      
      const response = await axios.post(`/ventas/${ventaId}/devolver`, devolucionesDto);
      
      return response.data;
    } catch (error) {
      throw this._handleError(`error al procesar devoluciones de venta ${ventaId}`, error);
    }
  },

  /**
   * Validar datos de venta antes de enviar
   * @private
   * @param {Object} ventaData - Datos a validar
   */
  _validateVentaData(ventaData) {
    const errores = [];
    
    // *** VALIDACIÓN CORREGIDA DE CLIENTE - SOPORTA 3 CASOS ***
    
    // CASO 1: Cliente nuevo (cliente_nuevo: true + cliente_datos)
    if (ventaData.cliente_nuevo === true) {
      if (!ventaData.cliente_datos) {
        errores.push('cliente_datos es requerido cuando cliente_nuevo es true');
      } else {
        // Validar ClienteDataDto
        if (!ventaData.cliente_datos.nombre || !ventaData.cliente_datos.nombre.trim()) {
          errores.push('cliente_datos.nombre es requerido para cliente nuevo');
        }
      }
      
      // Cliente nuevo debe tener cliente_nombre para referencia
      if (!ventaData.cliente_nombre || !ventaData.cliente_nombre.trim()) {
        errores.push('cliente_nombre es requerido para cliente nuevo');
      }
    } 
    // CASO 2 y 3: Cliente existente o sin registro (cliente_nuevo: false)
    else if (ventaData.cliente_nuevo === false) {
      // CASO 2: Cliente existente (cliente_nuevo: false + cliente_id)
      if (ventaData.cliente_id) {
        // Validar que cliente_id sea un UUID válido (opcional, el backend también lo valida)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(ventaData.cliente_id)) {
          errores.push('cliente_id debe ser un UUID válido');
        }
      }
      // CASO 3: Sin registro (cliente_nuevo: false + cliente_id: null + cliente_nombre)
      else if (ventaData.cliente_id === null) {
        // Para venta sin registro, debe tener al menos cliente_nombre
        if (!ventaData.cliente_nombre || !ventaData.cliente_nombre.trim()) {
          errores.push('cliente_nombre es requerido para venta sin registro de cliente');
        }
      } else {
        // Si cliente_nuevo es false y cliente_id no está definido correctamente
        errores.push('Para cliente_nuevo=false, debe proporcionar cliente_id (UUID) o cliente_id=null con cliente_nombre');
      }
    } else {
      // cliente_nuevo debe ser explícitamente true o false
      errores.push('cliente_nuevo debe ser true o false');
    }
    
    // Validaciones básicas
    if (!ventaData.usuario_id) {
      errores.push('usuario_id es requerido');
    }
    
    if (!ventaData.detalles || !Array.isArray(ventaData.detalles) || ventaData.detalles.length === 0) {
      errores.push('detalles es requerido y debe ser un array con al menos un elemento');
    }
    
    // Validar detalles
    if (ventaData.detalles && Array.isArray(ventaData.detalles)) {
      ventaData.detalles.forEach((detalle, index) => {
        if (!detalle.tipo || !['PRODUCTO', 'RAMO'].includes(detalle.tipo)) {
          errores.push(`Detalle ${index}: tipo debe ser 'PRODUCTO' o 'RAMO'`);
        }
        
        if (detalle.tipo === 'PRODUCTO' && !detalle.producto_id) {
          errores.push(`Detalle ${index}: producto_id es requerido para tipo PRODUCTO`);
        }
        
        if (detalle.tipo === 'RAMO' && !detalle.ramo_id) {
          errores.push(`Detalle ${index}: ramo_id es requerido para tipo RAMO`);
        }
        
        if (!detalle.cantidad || detalle.cantidad <= 0) {
          errores.push(`Detalle ${index}: cantidad debe ser mayor a 0`);
        }
        
        if (detalle.precio_unitario === undefined || detalle.precio_unitario <= 0) {
          errores.push(`Detalle ${index}: precio_unitario debe ser mayor a 0`);
        }
      });
    }
    
    // Validar método de pago
    const metodosValidos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
    if (!ventaData.metodo_pago || !metodosValidos.includes(ventaData.metodo_pago)) {
      errores.push(`metodo_pago debe ser uno de: ${metodosValidos.join(', ')}`);
    }
    
    // Validar estado (si se proporciona)
    if (ventaData.estado) {
      const estadosValidos = ['COMPLETADA', 'CANCELADA', 'PARCIAL_DEVUELTA', 'TOTAL_DEVUELTA'];
      if (!estadosValidos.includes(ventaData.estado)) {
        errores.push(`estado debe ser uno de: ${estadosValidos.join(', ')}`);
      }
    }
    
    // Validar campos numéricos opcionales
    if (ventaData.descuento !== undefined && ventaData.descuento < 0) {
      errores.push('descuento no puede ser negativo');
    }
    
    if (ventaData.impuestos !== undefined && ventaData.impuestos < 0) {
      errores.push('impuestos no puede ser negativo');
    }
    
    if (errores.length > 0) {
      const errorDetallado = `Datos de venta inválidos:\n${errores.map((error, index) => `${index + 1}. ${error}`).join('\n')}`;
      throw new Error(errorDetallado);
    }
    
  },

  /**
   * Detectar tipo de cliente para logging
   * @private
   * @param {Object} ventaData - Datos de la venta
   * @returns {String} - Descripción del tipo de cliente
   */
  _getTipoClienteDetectado(ventaData) {
    if (ventaData.cliente_nuevo === true) {
      return `Cliente Nuevo: ${ventaData.cliente_nombre}`;
    } else if (ventaData.cliente_id) {
      return `Cliente Existente: ${ventaData.cliente_nombre} (ID: ${ventaData.cliente_id})`;
    } else {
      return `Venta Sin Registro: ${ventaData.cliente_nombre}`;
    }
  },

  /**
   * Manejar errores de forma consistente
   * @private
   * @param {Error} error - Error original
   * @param {String} operacion - Descripción de la operación
   * @returns {Error} - Error procesado
   */
  _handleError(error, operacion) {
    let mensaje = `Error al ${operacion}`;
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          mensaje = data.message || 'Datos inválidos proporcionados';
          break;
        case 401:
          mensaje = 'No está autenticado para realizar esta operación';
          break;
        case 403:
          mensaje = 'No tiene permisos para realizar esta operación';
          break;
        case 404:
          mensaje = 'El recurso solicitado no fue encontrado';
          break;
        case 409:
          mensaje = data.message || 'Conflicto en el estado del recurso';
          break;
        case 422:
          mensaje = data.message || 'Error de validación en los datos';
          break;
        case 500:
          mensaje = 'Error interno del servidor. Intente más tarde';
          break;
        default:
          mensaje = data.message || `Error ${status} del servidor`;
      }
    } else if (error.request) {
      mensaje = 'Error de conexión. Verifique su conexión a internet';
    } else {
      mensaje = error.message || mensaje;
    }
    
    const errorProcesado = new Error(mensaje);
    errorProcesado.original = error;
    errorProcesado.status = error.response?.status;
    errorProcesado.data = error.response?.data;
    
    return errorProcesado;
  },

  /**
   * *** UTILIDADES Y CONSTANTES ***
   */

  /**
   * Obtener estados válidos de venta
   * @returns {Array} - Array de estados válidos
   */
  getEstadosValidos() {
    return ['COMPLETADA', 'CANCELADA', 'PARCIAL_DEVUELTA', 'TOTAL_DEVUELTA'];
  },

  /**
   * Obtener métodos de pago válidos
   * @returns {Array} - Array de métodos de pago válidos
   */
  getMetodosPagoValidos() {
    return ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
  },

  /**
   * Obtener tipos de items válidos
   * @returns {Array} - Array de tipos de items válidos
   */
  getTiposItemValidos() {
    return ['PRODUCTO', 'RAMO'];
  },

  /**
   * Obtener tipos de cliente válidos
   * @returns {Object} - Objeto con los tipos de cliente
   */
  getTiposClienteValidos() {
    return {
      NUEVO: 'cliente_nuevo: true + cliente_datos',
      EXISTENTE: 'cliente_nuevo: false + cliente_id',
      SIN_REGISTRO: 'cliente_nuevo: false + cliente_id: null + cliente_nombre'
    };
  }
};

export default ventaService;