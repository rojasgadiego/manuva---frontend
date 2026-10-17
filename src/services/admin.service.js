import axios from '@/plugins/axios'

/** Endpoints de gestión (Administrador, Directiva, Entrenador según el caso). */
const adminService = {
  // ── Socios ─────────────────────────────────────────
  remadores()            { return axios.get('/Remadores') },
  remador(id)            { return axios.get(`/Remadores/${id}`) },
  actualizarRemador(id, dto) { return axios.patch(`/Remadores/${id}`, dto) },

  // ── Flota ──────────────────────────────────────────
  canoas()               { return axios.get('/Canoas') },
  cambiarEstadoCanoa(id, idEstado) {
    // El endpoint recibe el id de estado como cuerpo JSON plano
    return axios.put(`/Canoas/${id}/estado`, idEstado)
  },
  implementos()          { return axios.get('/Implementos') },
  cambiarEstadoImplemento(id, idEstado) {
    return axios.patch(`/Implementos/${id}/estado`, { idEstado })
  },

  // ── Catálogos ──────────────────────────────────────
  tiposMembresia()       { return axios.get('/Mantenedor/tipos-membresia') },
  metodosPago()          { return axios.get('/Mantenedor/metodos-pago') },
  estadosCanoa()         { return axios.get('/Mantenedor/estados-canoa') },
  estadosImplemento()    { return axios.get('/Mantenedor/estados-implemento') },
}

export default adminService
