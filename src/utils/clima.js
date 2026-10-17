/**
 * Pronóstico de tiempo y mar con Open-Meteo (sin API key) para la bahía del club.
 * Lo usan el Dashboard y la Agenda; se cachea en memoria 30 minutos.
 */

export const COORDS = { lat: -29.95, lon: -71.34, ubicacion: 'Coquimbo, IV Región' }
const DIAS_PRONOSTICO = 8 // cubre la ventana de reserva (hoy + 7)
const TTL_MS = 30 * 60 * 1000

const WMO_ICONS = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫',
  51: '🌦', 53: '🌦', 55: '🌧', 61: '🌧', 63: '🌧', 65: '🌧',
  71: '🌨', 73: '🌨', 75: '🌨', 80: '🌦', 81: '🌧', 82: '⛈',
  95: '⛈', 96: '⛈', 99: '⛈',
}
const WMO_DESC = {
  0: 'Despejado', 1: 'Mayormente sol', 2: 'Parcial nublado', 3: 'Nublado', 45: 'Niebla', 48: 'Niebla',
  51: 'Llovizna leve', 53: 'Llovizna', 55: 'Llovizna intensa', 61: 'Lluvia leve', 63: 'Lluvia', 65: 'Lluvia intensa',
  71: 'Nieve leve', 73: 'Nieve', 75: 'Nieve intensa', 80: 'Chubascos', 81: 'Chubascos', 82: 'Chubascos fuertes',
  95: 'Tormenta', 96: 'Tormenta', 99: 'Tormenta fuerte',
}
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const gradosADireccion = (deg) => {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
  return dirs[Math.round(deg / 22.5) % 16]
}

/** Criterio del club: sobre 1,5 m de oleaje no se sale al agua. */
export const estadoMar = (oleaje) => {
  if (oleaje < 0.5) return { descripcion: 'muy calmo', apto: true }
  if (oleaje < 1.0) return { descripcion: 'calmo', apto: true }
  if (oleaje < 1.5) return { descripcion: 'algo de oleaje', apto: true }
  if (oleaje < 2.0) return { descripcion: 'oleaje moderado', apto: false }
  return { descripcion: 'agitado', apto: false }
}

let cache = null // { cuando, dias }

/** Lista de días: { fecha: 'YYYY-MM-DD', label, dia, icono, desc, tempMax, tempMin, viento, mar }. */
export async function cargarPronostico() {
  if (cache && Date.now() - cache.cuando < TTL_MS) return cache.dias

  const [resForecast, resMarine] = await Promise.all([
    fetch(
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${COORDS.lat}&longitude=${COORDS.lon}` +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant' +
      `&timezone=auto&forecast_days=${DIAS_PRONOSTICO}`
    ),
    fetch(
      'https://marine-api.open-meteo.com/v1/marine' +
      `?latitude=${COORDS.lat}&longitude=${COORDS.lon}` +
      '&daily=wave_height_max,wave_direction_dominant' +
      `&timezone=auto&forecast_days=${DIAS_PRONOSTICO}`
    ),
  ])
  if (!resForecast.ok || !resMarine.ok) throw new Error('Open-Meteo no respondió')

  const [fw, fm] = await Promise.all([resForecast.json(), resMarine.json()])

  const dias = fw.daily.time.map((fecha, i) => {
    const date   = new Date(fecha + 'T12:00:00')
    const wmo    = fw.daily.weathercode[i]
    const oleaje = fm.daily.wave_height_max?.[i] ?? 0
    const mar    = estadoMar(oleaje)
    return {
      fecha,
      label:   i === 0 ? 'Hoy' : DIAS[date.getDay()],
      dia:     String(date.getDate()),
      icono:   WMO_ICONS[wmo] ?? '🌡',
      desc:    WMO_DESC[wmo] ?? 'Variable',
      tempMax: Math.round(fw.daily.temperature_2m_max[i]),
      tempMin: Math.round(fw.daily.temperature_2m_min[i]),
      viento: {
        direccion: gradosADireccion(fw.daily.winddirection_10m_dominant[i]),
        velocidad: Math.round(fw.daily.windspeed_10m_max[i]),
        rafagas:   Math.round(fw.daily.windgusts_10m_max[i]),
      },
      mar: {
        apto:          mar.apto,
        oleaje:        oleaje.toFixed(1),
        descripcion:   mar.descripcion,
        direccion:     gradosADireccion(fm.daily.wave_direction_dominant?.[i] ?? 0),
        barPorcentaje: Math.min(Math.round((oleaje / 3) * 100), 100),
      },
    }
  })

  cache = { cuando: Date.now(), dias }
  return dias
}
