import axios from '@/plugins/axios'

const usuarioService = {
  getInfoCompleta(id) {
    return axios.get(`/usuarios/${id}`)
  },

  me() {
    return axios.get('/auth/me')
  }
}

export default usuarioService