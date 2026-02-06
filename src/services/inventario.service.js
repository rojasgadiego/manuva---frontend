import axios from '@/plugins/axios'

const inventarioService = {
  /**
   * ✅ NUEVO: Obtener estadísticas de inventario
   * @param {String} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {String} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @param {String} usuarioId - ID del usuario (opcional, solo para admins)
   * @returns {Promise} - Respuesta de la API con estadísticas agregadas
   */
  async EstadisticasInventario(fechaInicio, fechaFin, usuarioId = null) {
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
      const response = await axios.get(`/inventario/estadisticas?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas de movimientos:", error);
      throw error;
    }
  },

  /**
   * ✅ NUEVO: Obtener productos con bajo stock
   * @returns {Promise} - Respuesta de la API con lista de productos con stock crítico
   */
  async ProductosBajoStock() {
    try {
      const response = await axios.get('/productos/bajo-stock');
      return response.data;
    } catch (error) {
      console.error("Error al obtener productos con bajo stock:", error);
      throw error;
    }
  },

  /**
   * ✅ NUEVO: Obtener lotes próximos a vencer
   * @param {Number} dias - Número de días para considerar "próximo a vencer" (opcional, default del backend)
   * @returns {Promise} - Respuesta de la API con lista de lotes críticos
   */
  async LotesProximosVencer() {
    try {
      const response = await axios.get('/lotes/proximos-vencer');
      return response.data;
    } catch (error) {
      console.error("Error al obtener lotes próximos a vencer:", error);
      throw error;
    }
  },
};

export default inventarioService;