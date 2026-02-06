// src/services/producto.service.js
import axios from '@/plugins/axios';

/**
 * Servicio para operaciones relacionadas con productos
 */
const productoService = {
  /**
   * Obtener todos los productos con filtros opcionales
   * @param {Object} filtros - Filtros para consulta (categoriaId, proveedorId, activo)
   * @returns {Promise} - Respuesta de la API con la lista de productos
   */
  async getAll(filtros = {}) {
    try {
      // Construir parámetros de consulta de forma más robusta
      const queryParams = new URLSearchParams();
      
      if (filtros.categoriaId) queryParams.append('categoria_id', filtros.categoriaId);
      if (filtros.proveedorId) queryParams.append('proveedor_id', filtros.proveedorId);
      if (filtros.activo !== undefined) queryParams.append('activo', filtros.activo.toString());
      if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
      
      const response = await axios.get(`/productos?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  /**
   * Obtener un producto específico por ID
   * @param {String} id - ID del producto
   * @returns {Promise} - Respuesta de la API con los datos del producto
   */
  async getById(id) {
    try {
      if (!id) throw new Error('ID de producto requerido');
      
      const response = await axios.get(`/productos/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo producto
   * @param {Object} productoData - Datos del producto a crear
   * @returns {Promise} - Respuesta de la API con el producto creado
   */
  async create(productoData) {
    try {
      console.log('Creando producto:', productoData);
      const response = await axios.post('/productos', productoData);
      return response.data || null;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  /**
   * Actualizar un producto existente
   * @param {String} id - ID del producto a actualizar
   * @param {Object} productoData - Nuevos datos del producto
   * @returns {Promise} - Respuesta de la API con el producto actualizado
   */
  async update(id, productoData) {
    try {
      if (!id) throw new Error('ID de producto requerido');
      
      // Crear una copia sin el ID, ya que el backend lo obtiene de la URL
      const datosSinId = { ...productoData };
      delete datosSinId.id; // Eliminar el ID de los datos para evitar conflictos
      
      const response = await axios.patch(`/productos/${id}`, datosSinId);
      return response.data || null;
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un producto (soft delete)
   * @param {String} id - ID del producto a eliminar
   * @returns {Promise} - Respuesta de la API
   */
  async remove(id) {
    try {
      if (!id) throw new Error('ID de producto requerido');
      
      const response = await axios.delete(`/productos/${id}`);
      return response.data || true; // Retornamos true o la respuesta
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Restaurar un producto previamente eliminado
   * @param {String} id - ID del producto a restaurar
   * @returns {Promise} - Respuesta de la API con el producto restaurado
   */
  async restore(id) {
    try {
      if (!id) throw new Error('ID de producto requerido');
      
      const response = await axios.patch(`/productos/${id}/restore`);
      return response.data || null;
    } catch (error) {
      console.error(`Error al restaurar producto con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Exportar productos a formato CSV/Excel (si se implementa en el backend)
   * @param {Object} filtros - Filtros para los productos a exportar
   * @returns {Promise<Blob>} - Archivo generado
   */
  async exportar(filtros = {}) {
    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      if (filtros.categoriaId) queryParams.append('categoria_id', filtros.categoriaId);
      if (filtros.proveedorId) queryParams.append('proveedor_id', filtros.proveedorId);
      if (filtros.activo !== undefined) queryParams.append('activo', filtros.activo.toString());
      if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
      
      // Configurar para recibir un blob
      const response = await axios.get(`/productos/exportar?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al exportar productos:', error);
      throw error;
    }
  }
};

export default productoService;