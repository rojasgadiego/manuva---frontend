// src/services/ramo.service.js
import axios from '@/plugins/axios';

/**
 * Servicio para operaciones relacionadas con ramos
 */
const ramoService = {
  /**
   * Obtener todos los ramos con filtros opcionales
   * @param {Object} filtros - Filtros para consulta (disponibleCatalogo, personalizado, usuarioId)
   * @returns {Promise} - Respuesta de la API con la lista de ramos
   */
  async getAll(filtros = {}) {
    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      if (filtros.disponibleCatalogo !== undefined) 
        queryParams.append('disponible_catalogo', filtros.disponibleCatalogo.toString());
      if (filtros.personalizado !== undefined) 
        queryParams.append('personalizado', filtros.personalizado.toString());
      if (filtros.usuarioId) 
        queryParams.append('usuario_id', filtros.usuarioId);
      if (filtros.busqueda) 
        queryParams.append('busqueda', filtros.busqueda);
      
      const response = await axios.get(`/ramos?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener ramos:', error);
      throw error;
    }
  },

  /**
   * Obtener un ramo específico por ID
   * @param {String} id - ID del ramo
   * @returns {Promise} - Respuesta de la API con los datos del ramo
   */
  async getById(id) {
    try {
      if (!id) throw new Error('ID de ramo requerido');
      
      const response = await axios.get(`/ramos/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error al obtener ramo con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener componentes de un ramo
   * @param {String} id - ID del ramo
   * @returns {Promise} - Respuesta de la API con los componentes del ramo
   */
  async getComponentes(id) {
    try {
      if (!id) throw new Error('ID de ramo requerido');
      
      const response = await axios.get(`/ramos/${id}/componentes`);
      return response.data || [];
    } catch (error) {
      console.error(`Error al obtener componentes del ramo con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo ramo
   * @param {Object} ramoData - Datos del ramo a crear
   * @returns {Promise} - Respuesta de la API con el ramo creado
   */
  async create(ramoData) {
    try {
      console.log('Creando ramo:', ramoData);
      const response = await axios.post('/ramos', ramoData);
      return response.data || null;
    } catch (error) {
      console.error('Error al crear ramo:', error);
      throw error;
    }
  },

  /**
   * Actualizar un ramo existente
   * @param {String} id - ID del ramo a actualizar
   * @param {Object} ramoData - Nuevos datos del ramo
   * @returns {Promise} - Respuesta de la API con el ramo actualizado
   */
  async update(id, ramoData) {
    try {
      if (!id) throw new Error('ID de ramo requerido');
      
      // Crear una copia sin el ID
      const datosSinId = { ...ramoData };
      delete datosSinId.id; // Eliminar el ID de los datos
      
      const response = await axios.patch(`/ramos/${id}`, datosSinId);
      return response.data || null;
    } catch (error) {
      console.error(`Error al actualizar ramo con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un ramo
   * @param {String} id - ID del ramo a eliminar
   * @returns {Promise} - Respuesta de la API
   */
  async remove(id) {
    try {
      if (!id) throw new Error('ID de ramo requerido');
      
      const response = await axios.delete(`/ramos/${id}`);
      return response.data || { message: 'Ramo eliminado correctamente' };
    } catch (error) {
      console.error(`Error al eliminar ramo con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Restaurar un ramo previamente eliminado
   * @param {String} id - ID del ramo a restaurar
   * @returns {Promise} - Respuesta de la API con el ramo restaurado
   */
  async restore(id) {
    try {
      if (!id) throw new Error('ID de ramo requerido');
      
      const response = await axios.patch(`/ramos/${id}/restore`);
      return response.data || null;
    } catch (error) {
      console.error(`Error al restaurar ramo con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Duplicar un ramo existente
   * @param {String} id - ID del ramo a duplicar
   * @param {String} usuarioId - ID del usuario propietario del nuevo ramo
   * @param {Boolean} personalizado - Indica si el nuevo ramo es personalizado
   * @returns {Promise} - Respuesta de la API con el nuevo ramo creado
   */
  async duplicar(id, usuarioId, personalizado) {
    try {
      if (!id) throw new Error('ID de ramo requerido');
      if (!usuarioId) throw new Error('ID de usuario requerido');
      
      const data = {
        usuario_id: usuarioId,
        personalizado: personalizado !== undefined ? personalizado : true
      };
      
      const response = await axios.post(`/ramos/${id}/duplicar`, data);
      return response.data || null;
    } catch (error) {
      console.error(`Error al duplicar ramo con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los ramos disponibles en el catálogo
   * @returns {Promise} - Respuesta de la API con los ramos disponibles
   */
  async getRamosCatalogo() {
    try {
      const response = await axios.get('/ramos/catalogo/disponibles');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener ramos del catálogo:', error);
      throw error;
    }
  }
};

export default ramoService;