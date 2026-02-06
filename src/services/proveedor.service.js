// src/services/proveedor.service.js
import axios from '@/plugins/axios'

/**
 * Servicio para operaciones relacionadas con proveedores
 */
const proveedorService = {
  /**
   * Obtener todos los proveedores
   * @returns {Promise} - Respuesta de la API con la lista de proveedores
   */
  async getAll() {
    const response = await axios.get('/proveedores')
    return response.data ? response.data : []
  },

  /**
   * Obtener un proveedor específico por ID
   * @param {String} id - ID del proveedor
   * @returns {Promise} - Respuesta de la API con los datos del proveedor
   */
  async getById(id) {
    if (!id) return Promise.reject(new Error('ID de proveedor requerido'))
    const response = await axios.get(`/proveedores/${id}`)
    return response.data ? response.data : null
  },

  /**
   * Crear un nuevo proveedor
   * @param {Object} proveedorData - Datos del proveedor a crear
   * @returns {Promise} - Respuesta de la API con el proveedor creado
   */
  async create(proveedorData) {
    const response = await axios.post('/proveedores', proveedorData)
    return response.data ? response.data : null
  },

  /**
   * Actualizar un proveedor existente
   * @param {String} id - ID del proveedor a actualizar
   * @param {Object} proveedorData - Nuevos datos del proveedor
   * @returns {Promise} - Respuesta de la API con el proveedor actualizado
   */
  async update(id, proveedorData) {
    if (!id) return Promise.reject(new Error('ID de proveedor requerido'))
    const response = await axios.put(`/proveedores/${id}`, proveedorData)
    return response.data ? response.data : null
  },

  /**
   * Desactivar (soft delete) un proveedor
   * @param {String} id - ID del proveedor a desactivar
   * @returns {Promise} - Respuesta de la API
   */
  async remove(id) {
    if (!id) return Promise.reject(new Error('ID de proveedor requerido'))
    const response = await axios.delete(`/proveedores/${id}`)
    return response
  },

  /**
   * Restaurar un proveedor previamente desactivado
   * @param {String} id - ID del proveedor a restaurar
   * @returns {Promise} - Respuesta de la API con el proveedor restaurado
   */
  async restore(id) {
    if (!id) return Promise.reject(new Error('ID de proveedor requerido'))
    const response = await axios.post(`/proveedores/${id}/restore`)
    return response.data ? response.data : null
  }
}

export default proveedorService