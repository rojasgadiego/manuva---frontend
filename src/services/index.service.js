import authService from './auth.service'
import salidaService from './salida.service'
import usuarioService from './usuario.service'

export {
  authService,
  salidaService,
  usuarioService,
}

export default {
  auth: authService,
  salida: salidaService,
  usuario: usuarioService,
}