import axios from '@/plugins/axios'

/** Canoas, catálogos y panel principal. */
const clubService = {
  // GET /api/Canoas/disponibles/horario?fechaHora=...&duracionMin=...
  canoasDisponibles(fechaHora, duracionMin) {
    return axios.get('/Canoas/disponibles/horario', { params: { fechaHora, duracionMin } })
  },

  // GET /api/Mantenedor/motivos-cancelacion
  motivosCancelacion() {
    return axios.get('/Mantenedor/motivos-cancelacion')
  },

  // GET /api/Dashboard/me
  dashboard() {
    return axios.get('/Dashboard/me')
  },
}

export default clubService
