/** Validaciones de formularios. Mismas reglas que Helper/Validaciones.cs en la API. */

/** "12.345.678-k" → "12345678-K"; null si no tiene forma de RUT. */
export function normalizarRut(rut) {
  let limpio = String(rut || '').replace(/[.\s]/g, '').toUpperCase()
  if (!limpio.includes('-') && limpio.length > 1) limpio = `${limpio.slice(0, -1)}-${limpio.slice(-1)}`
  return /^\d{7,8}-[\dK]$/.test(limpio) ? limpio : null
}

/** RUT chileno con dígito verificador correcto (módulo 11). */
export function rutValido(rut) {
  const n = normalizarRut(rut)
  if (!n) return false
  const [cuerpo, dv] = n.split('-')
  let suma = 0
  let factor = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const resto = 11 - (suma % 11)
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return esperado === dv
}

/** null si la contraseña es válida; si no, el motivo. */
export function problemaPassword(pw) {
  if (!pw || pw.length < 8) return 'Debe tener al menos 8 caracteres.'
  if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(pw) || !/\d/.test(pw)) return 'Debe incluir letras y números.'
  return null
}

export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())

export const usernameValido = (u) => /^[a-zA-Z0-9._-]{3,30}$/.test(String(u || '').trim())
