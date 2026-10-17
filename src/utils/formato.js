/** Formatos de presentación compartidos (es-CL). */

const clpFmt = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

/** 25000 → "$25.000" */
export const clp = (monto) => clpFmt.format(Number(monto) || 0)

/** "2026-10-17" (DateOnly de la API) → "17-10-2026" */
export const fecha = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = String(iso).substring(0, 10).split('-')
  return `${d}-${m}-${y}`
}

/** "2025-05" → "mayo 2025" (si no es YYYY-MM, se devuelve igual) */
export const periodo = (p) => {
  if (!/^\d{4}-\d{2}$/.test(p || '')) return p
  const [y, m] = p.split('-').map(Number)
  const texto = new Date(y, m - 1, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Días desde hoy hasta una fecha "YYYY-MM-DD" (negativo si ya pasó). */
export const diasHasta = (iso) => {
  if (!iso) return null
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return Math.round((new Date(String(iso).substring(0, 10) + 'T00:00:00') - hoy) / 86400000)
}

/** Fecha local de hoy como "YYYY-MM-DD". */
export const hoyIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Clase de chip según estado de cuota/pago. */
export const claseEstadoCuota = (estado) => ({
  Pagado: 'ui-chip--green', Pendiente: 'ui-chip--amber', Vencido: 'ui-chip--red', Anulado: 'ui-chip--muted',
}[estado] ?? '')
