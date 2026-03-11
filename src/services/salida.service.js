import axios from '@/plugins/axios'

const salidaService = {
  // GET /api/Salidas/proximas
  getProximas() {
    return axios.get('/Salidas/proximas')
  },

  // GET /api/Salidas/historial?desde=...&hasta=...
  getHistorial(desde = null, hasta = null) {
    const params = {}
    if (desde) params.desde = desde
    if (hasta) params.hasta = hasta
    return axios.get('/Salidas/historial', { params })
  },

  // GET /api/Salidas/:id
  getById(id) {
    return axios.get(`/Salidas/${id}`)
  },

  // POST /api/Salidas
  crearReserva(dto) {
    return axios.post('/Salidas', dto)
  },

  // POST /api/Salidas/:id/participantes
  agregarParticipante(id, dto) {
    return axios.post(`/Salidas/${id}/participantes`, dto)
  },

  // POST /api/Salidas/:id/iniciar
  iniciar(id, dto) {
    return axios.post(`/Salidas/${id}/iniciar`, dto)
  },

  // POST /api/Salidas/:id/finalizar
  finalizar(id, dto) {
    return axios.post(`/Salidas/${id}/finalizar`, dto)
  },

  // POST /api/Salidas/:id/cancelar
  cancelar(id, dto) {
    return axios.post(`/Salidas/${id}/cancelar`, dto)
  }
}

export default salidaService