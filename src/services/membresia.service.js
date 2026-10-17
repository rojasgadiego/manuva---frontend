import axios from '@/plugins/axios'

const membresiaService = {
  // GET /api/Membresias/mia → { membresia, cuotas }
  miMembresia() {
    return axios.get('/Membresias/mia')
  },

  // POST /api/Pagos/cuotas/:id/webpay → { url, token }
  iniciarPagoWebpay(idCuota) {
    return axios.post(`/Pagos/cuotas/${idCuota}/webpay`)
  },

  // ── Directiva ──────────────────────────────────────
  // GET /api/Membresias/cuotas/pendientes
  cuotasPendientes() {
    return axios.get('/Membresias/cuotas/pendientes')
  },

  // POST /api/Membresias/cuotas/pago
  registrarPago(dto) {
    return axios.post('/Membresias/cuotas/pago', dto)
  },

  // POST /api/Membresias/cuotas/generar { periodo: 'YYYY-MM' }
  generarCuotas(periodo) {
    return axios.post('/Membresias/cuotas/generar', { periodo })
  },

  // POST /api/Membresias { idRemador, idTipoMembresia, fechaInicio }
  crearMembresia(dto) {
    return axios.post('/Membresias', dto)
  },
}

/**
 * Webpay Plus exige llegar a su formulario por POST con token_ws:
 * se arma un formulario oculto y se envía (el navegador sale de la app).
 */
export function irAWebpay({ url, token }) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'token_ws'
  input.value = token
  form.appendChild(input)
  document.body.appendChild(form)
  form.submit()
}

export default membresiaService
