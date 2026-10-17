import axios from '@/plugins/axios'

const eventoService = {
  todos()               { return axios.get('/Eventos') },
  proximos()            { return axios.get('/Eventos/proximos') },
  detalle(id)           { return axios.get(`/Eventos/${id}`) },
  resultados(id)        { return axios.get(`/Eventos/${id}/resultados`) },

  // POST /api/Eventos/:id/inscribir-remador { idRemador, idCanoa, categoriaCompetencia, observaciones }
  inscribirRemador(id, dto) { return axios.post(`/Eventos/${id}/inscribir-remador`, dto) },

  // ── Directiva ──────────────────────────────────────
  abrirInscripciones(id)  { return axios.post(`/Eventos/${id}/abrir-inscripciones`) },
  cerrarInscripciones(id) { return axios.post(`/Eventos/${id}/cerrar-inscripciones`) },
  confirmarInscripcion(idInscripcion) { return axios.post(`/Eventos/inscripciones/${idInscripcion}/confirmar`) },
}

export const claseEstadoEvento = (estado) => ({
  'Planificado': 'ui-chip--indigo',
  'Inscripciones abiertas': 'ui-chip--green',
  'En curso': 'ui-chip--amber',
  'Finalizado': 'ui-chip--muted',
  'Cancelado': 'ui-chip--red',
}[estado] ?? '')

export default eventoService
