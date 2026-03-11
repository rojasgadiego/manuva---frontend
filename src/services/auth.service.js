import axios from '@/plugins/axios'

const authService = {
  login(credentials) {
    return axios.post('/auth/login', credentials)
  },

  registro(dto) {
    return axios.post('/auth/registro', dto)
  },

  registroAdmin(dto) {
    return axios.post('/auth/registro/admin', dto)
  },

  verificarEmail(email, codigo) {
    return axios.post('/auth/verificar-email', { email, codigo })
  },

  reenviarCodigo(email) {
    return axios.post('/auth/reenviar-codigo', { email })
  },

  recuperarPassword(email) {
    return axios.post('/auth/recuperar-password', { email })
  },

  resetPassword(email, codigo, nuevaPassword) {
    return axios.post('/auth/reset-password', { email, codigo, nuevaPassword })
  },

  logout() {
    return axios.post('/auth/logout')
  }
}

export default authService