/**
 * Extrae un mensaje legible de un error de axios contra la API ClubCanotaje.
 * La API responde en dos formatos:
 *  - ApiResponse:      { success: false, message, errors: [] }
 *  - Errores de negocio (middleware): { error: { code, message } }
 */
export function mensajeError(error, porDefecto = 'Ocurrió un error inesperado. Intenta nuevamente.') {
  const data = error?.response?.data
  if (data?.error?.message) return data.error.message
  if (data?.message) return data.message
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors[0]
  if (error?.response?.status === 403) return 'No tienes permiso para realizar esta acción.'
  if (error?.code === 'ERR_NETWORK') return 'No se pudo conectar con el servidor.'
  return porDefecto
}

/** Quita el prefijo "Error: " que agregan los procedimientos almacenados a sus mensajes. */
export const limpiarMensaje = (msg) => (msg || '').replace(/^Error:\s*/, '')
