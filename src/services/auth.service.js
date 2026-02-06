import axios from '@/plugins/axios'

/**
 * Servicio de autenticación para operaciones relacionadas con autenticación y usuarios
 */
const authService = {
  /**
   * Iniciar sesión de usuario
   * @param {Object} credentials - Credenciales (email, password)
   * @returns {Promise} - Respuesta de la API con el token
   */
  login(credentials) {
    return axios.post('/auth/login', credentials)
  },

  /**
   * Validar token de autenticación
   * @param {String} token - Token JWT a validar
   * @returns {Promise} - Respuesta con información del usuario (userId, rol)
   */
  validateToken(token) {
    return axios.post('/auth/validate', { token })
  },

  /**
   * Obtener información detallada del usuario
   * @param {String} userId - ID del usuario o token
   * @returns {Promise} - Respuesta con datos completos del usuario
   */
  getUserInfo(userId) {
    return axios.get(`/auth/user/${userId}`)
  },

  /**
   * Cerrar sesión de usuario
   * @returns {Promise} - Respuesta de la API
   */
  logout() {
    return axios.post('/auth/logout')
  },

  /**
   * Verificar si el token actual es válido
   * @returns {Promise} - Respuesta de la API
   */
  verifyToken() {
    const token = localStorage.getItem('token')
    if (!token) return Promise.reject(new Error('No hay token disponible'))
    
    return this.validateToken(token)
  }
}

export default authService