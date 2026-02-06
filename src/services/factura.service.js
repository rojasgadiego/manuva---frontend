import axios from '@/plugins/axios'

/**
 * Servicio para operaciones relacionadas con facturas
 */
const facturaService = {
  /**
   * Obtener facturas con paginación y filtros
   * @param {Object} filtros - Filtros para la consulta
   * @returns {Promise} - Respuesta de la API con lista paginada de facturas
   */
  async getPaginated(filtros = {}) {
    let queryParams = new URLSearchParams();
    
    // Parámetros de paginación
    if (filtros.page) queryParams.append('page', filtros.page.toString());
    if (filtros.limit) queryParams.append('limit', filtros.limit.toString());
    
    // Filtros específicos
    if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
    if (filtros.estado) queryParams.append('estado', filtros.estado);
    if (filtros.numero) queryParams.append('numero', filtros.numero);
    if (filtros.venta_id) queryParams.append('venta_id', filtros.venta_id);
    if (filtros.compra_id) queryParams.append('compra_id', filtros.compra_id);
    if (filtros.usuario_id) queryParams.append('usuario_id', filtros.usuario_id);
    if (filtros.cliente_id) queryParams.append('cliente_id', filtros.cliente_id);
    if (filtros.proveedor_id) queryParams.append('proveedor_id', filtros.proveedor_id);
    if (filtros.fecha_inicio) queryParams.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) queryParams.append('fecha_fin', filtros.fecha_fin);
    
    try {
      const response = await axios.get(`/facturas?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      throw error;
    }
  },

  /**
   * Obtener facturas pendientes
   * @returns {Promise} - Respuesta de la API con facturas pendientes
   */
  async getPendientes() {
    try {
      const response = await axios.get('/facturas/pendientes/todas');
      return response.data;
    } catch (error) {
      console.error("Error al obtener facturas pendientes:", error);
      throw error;
    }
  },

  /**
   * Obtener una factura específica por ID
   * @param {String} id - ID de la factura
   * @returns {Promise} - Respuesta de la API con la factura
   */
  async getById(id) {
    if (!id) return Promise.reject(new Error('ID de factura requerido'));
    
    try {
      const response = await axios.get(`/facturas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener factura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nueva factura
   * @param {Object} facturaData - Datos de la factura a crear
   * @returns {Promise} - Respuesta de la API con la factura creada
   */
  async create(facturaData) {
    try {
      const response = await axios.post('/facturas', facturaData);
      return response.data;
    } catch (error) {
      console.error("Error al crear factura:", error);
      throw error;
    }
  },

  /**
   * Actualizar factura
   * @param {String} id - ID de la factura
   * @param {Object} facturaData - Datos a actualizar
   * @returns {Promise} - Respuesta de la API con la factura actualizada
   */
  async update(id, facturaData) {
    if (!id) return Promise.reject(new Error('ID de factura requerido'));
    
    try {
      const response = await axios.put(`/facturas/${id}`, facturaData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar factura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Registrar pago de factura
   * @param {String} id - ID de la factura
   * @param {Object} pagoData - Datos del pago
   * @returns {Promise} - Respuesta de la API con la factura actualizada
   */
  async pagar(id, pagoData) {
    if (!id) return Promise.reject(new Error('ID de factura requerido'));
    
    try {
      const response = await axios.patch(`/facturas/${id}/pagar`, pagoData);
      return response.data;
    } catch (error) {
      console.error(`Error al registrar pago de factura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Anular factura
   * @param {String} id - ID de la factura
   * @param {Object} anulacionData - Datos de anulación
   * @returns {Promise} - Respuesta de la API con la factura anulada
   */
  async anular(id, anulacionData) {
    if (!id) return Promise.reject(new Error('ID de factura requerido'));
    
    try {
      const response = await axios.patch(`/facturas/${id}/anular`, anulacionData);
      return response.data;
    } catch (error) {
      console.error(`Error al anular factura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Marcar factura como vencida
   * @param {String} id - ID de la factura
   * @returns {Promise} - Respuesta de la API con la factura vencida
   */
  async marcarVencida(id) {
    if (!id) return Promise.reject(new Error('ID de factura requerido'));
    
    try {
      const response = await axios.patch(`/facturas/${id}/marcar-vencida`);
      return response.data;
    } catch (error) {
      console.error(`Error al marcar como vencida la factura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar todas las facturas vencidas
   * @returns {Promise} - Respuesta de la API con el número de facturas actualizadas
   */
  async actualizarVencidas() {
    try {
      const response = await axios.post('/facturas/actualizar-vencidas');
      return response.data;
    } catch (error) {
      console.error("Error al actualizar facturas vencidas:", error);
      throw error;
    }
  },

  /**
   * Generar número de factura
   * @param {String} tipo - Tipo de factura (emitida o recibida)
   * @returns {Promise} - Respuesta de la API con el número generado
   */
  async generarNumero(tipo) {
    try {
      const response = await axios.get(`/facturas/generar-numero/${tipo}`);
      return response.data;
    } catch (error) {
      console.error("Error al generar número de factura:", error);
      throw error;
    }
  },

  /**
   * Generar reporte de facturas
   * @param {String} inicio - Fecha de inicio
   * @param {String} fin - Fecha de fin
   * @param {String} tipo - Tipo de factura (opcional)
   * @returns {Promise} - Respuesta de la API con el reporte
   */
  async generarReporte(inicio, fin, tipo) {
    let queryParams = new URLSearchParams();
    queryParams.append('inicio', inicio);
    queryParams.append('fin', fin);
    if (tipo) queryParams.append('tipo', tipo);
    
    try {
      const response = await axios.get(`/facturas/reportes/periodo?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error al generar reporte de facturas:", error);
      throw error;
    }
  }
};

export default facturaService;