// src/services/usuario.service.js
import axios from '@/plugins/axios'

/**
 * Servicio para operaciones relacionadas con usuarios
 */
const usuarioService = {
  /**
   * Obtener todos los usuarios
   * @returns {Promise} - Respuesta de la API con la lista de usuarios
   */
  async getAll() {
    const response = await axios.get('/user')
    return response.data ? response.data : []
  },

  /**
   * Obtener un usuario específico por ID
   * @param {String} id - ID del usuario
   * @returns {Promise} - Respuesta de la API con los datos del usuario
   */
  async getById(id) {
    if (!id) return Promise.reject(new Error('ID de usuario requerido'))
    const response = await axios.get(`/user/${id}`)
    return response.data ? response.data : null
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} usuarioData - Datos del usuario a crear
   * @returns {Promise} - Respuesta de la API con el usuario creado
   */
  async create(usuarioData) {
    const response = await axios.post('/user', usuarioData)
    return response.data ? response.data : null
  },

  /**
   * Actualizar un usuario existente
   * @param {String} id - ID del usuario a actualizar
   * @param {Object} usuarioData - Nuevos datos del usuario
   * @returns {Promise} - Respuesta de la API con el usuario actualizado
   */
  async update(id, usuarioData) {
    if (!id) return Promise.reject(new Error('ID de usuario requerido'))
    const response = await axios.put(`/user/${id}`, usuarioData)
    return response.data ? response.data : null
  },

  /**
   * Cambiar contraseña de usuario
   * @param {String} id - ID del usuario 
   * @param {Object} passwordData - Datos de cambio de contraseña
   * @returns {Promise} - Respuesta de la API
   */
  async changePassword(id, passwordData) {
    if (!id) return Promise.reject(new Error('ID de usuario requerido'))
    const response = await axios.post(`/user/${id}/change-password`, passwordData)
    return response.data ? response.data : null
  }
}

export default usuarioService