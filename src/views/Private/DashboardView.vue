<template>
  <AppLayout>
    <div class="home">

      <!-- ── Saludo ── -->
      <section class="greet">
        <div class="greet__left">
          <p class="greet__date">{{ fechaHoy }}</p>
          <h1 class="greet__name">Buenos días, {{ nombreCorto }}</h1>
          <p class="greet__club">Club de Canotaje Manuva'a</p>
        </div>
        <div class="greet__right">
          <div class="greet__streak">
            <span class="streak__num">{{ actividadMes }}</span>
            <span class="streak__lbl">salidas<br>este mes</span>
          </div>
          <div class="avatar">
            <img v-if="usuario?.remador?.fotoUrl" :src="usuario.remador.fotoUrl" class="avatar__img" />
            <div v-else class="avatar__initials">{{ iniciales }}</div>
            <span class="avatar__dot" :class="usuario?.activo ? 'dot--on' : 'dot--off'"></span>
          </div>
        </div>
      </section>

      <!-- ── Stats personales ── -->
      <section class="section">
        <h2 class="section__title">Mi actividad</h2>
        <div class="stats-row">
          <div class="stat stat--cyan">
            <div class="stat__accent"></div>
            <div class="stat__body">
              <span class="stat__label">Salidas totales</span>
              <span class="stat__value">{{ stats.salidasTotales }}</span>
              <span class="stat__sub">+{{ stats.salidasMes }} este mes</span>
            </div>
          </div>
          <div class="stat stat--indigo">
            <div class="stat__accent"></div>
            <div class="stat__body">
              <span class="stat__label">Horas en agua</span>
              <span class="stat__value">{{ stats.horasAgua }}</span>
              <span class="stat__sub">temporada {{ anioActual }}</span>
            </div>
          </div>
          <div class="stat" :class="certVencePronto ? 'stat--amber' : 'stat--green'">
            <div class="stat__accent"></div>
            <div class="stat__body">
              <span class="stat__label">Cert. médica</span>
              <span class="stat__value stat__value--sm">{{ stats.certMedica }}</span>
              <span class="stat__sub" :class="certVencePronto ? 'sub--warn' : ''">
                {{ certVencePronto ? 'vence pronto' : 'al día' }}
              </span>
            </div>
          </div>
          <div class="stat stat--green">
            <div class="stat__accent"></div>
            <div class="stat__body">
              <span class="stat__label">Racha actual</span>
              <span class="stat__value">{{ stats.rachaActual }}</span>
              <span class="stat__sub">semanas seguidas</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Próxima salida ── -->
      <section class="section" v-if="proximasSalidas.length">
        <h2 class="section__title">Mis próximas salidas</h2>
        <div class="next-cards-row">
          <div class="next-card" v-for="(s, i) in proximasSalidas" :key="i">
            <div class="next-card__accent"></div>
            <div class="next-card__body">
              <div class="next-card__date-box">
                <span class="date-box__day">{{ s.dia }}</span>
                <span class="date-box__month">{{ s.mes }}</span>
              </div>
              <div class="next-card__info">
                <p class="next-card__title">{{ s.embarcacion }} · {{ s.hora }}</p>
                <p class="next-card__meta">{{ s.duracion }} · {{ s.equipo }}</p>
                <p class="next-card__meta">
                  Patrón: {{ s.patron }} ·
                  <span class="meta__confirmados">{{ s.confirmados }}/{{ s.capacidad }} confirmados</span>
                </p>
              </div>
              <button class="next-card__cancel" @click="cancelarSalida(i)">Cancelar</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Condiciones del día ── -->
      <section class="section">
        <h2 class="section__title">Condiciones del día</h2>

        <!-- Cargando -->
        <div v-if="climaCargando" class="clima-estado">
          <span class="clima-estado__text">Cargando condiciones...</span>
        </div>

        <!-- Error -->
        <div v-else-if="climaError" class="clima-estado clima-estado--error">
          <span class="clima-estado__text">No se pudo cargar el clima.</span>
          <button class="clima-estado__retry" @click="cargarClima">Reintentar</button>
        </div>

        <div v-else-if="diaActual" class="weather-grid">

          <!-- Días seleccionables -->
          <div class="days-card">
            <div
              v-for="(dia, i) in forecast"
              :key="i"
              class="day-col"
              :class="{ active: diaSeleccionado === i }"
              @click="diaSeleccionado = i"
            >
              <span class="day-col__label">{{ dia.label }}</span>
              <span class="day-col__dia">{{ dia.dia }}</span>
              <span class="day-col__icon">{{ dia.icono }}</span>
              <div class="day-col__temps">
                <span class="day-col__max">{{ dia.tempMax }}°</span>
                <span class="day-col__min">{{ dia.tempMin }}°</span>
              </div>
            </div>
          </div>

          <!-- Celdas de condición del día seleccionado -->
          <div class="weather-cells">
            <div class="wcell">
              <span class="wcell__label">Oleaje</span>
              <span class="wcell__value">{{ diaActual.mar.oleaje }} m</span>
              <span class="wcell__sub">{{ diaActual.mar.descripcion }} · Dir. {{ diaActual.mar.direccion }}</span>
              <div class="tide-bar">
                <div class="tide-bar__fill" :style="{ width: diaActual.mar.barPorcentaje + '%' }"></div>
              </div>
            </div>
            <div class="wcell">
              <span class="wcell__label">Viento</span>
              <span class="wcell__value">{{ diaActual.viento.direccion }} · {{ diaActual.viento.velocidad }} km/h</span>
              <span class="wcell__sub">Ráfagas hasta {{ diaActual.viento.rafagas }} km/h</span>
            </div>
            <div class="wcell">
              <span class="wcell__label">Estado del mar</span>
              <span class="wcell__value" :class="diaActual.mar.apto ? 'val--green' : 'val--red'">
                {{ diaActual.mar.apto ? 'Apto' : 'No apto' }}
              </span>
              <span class="wcell__sub">Oleaje {{ diaActual.mar.oleaje }} m · {{ diaActual.mar.descripcion }}</span>
            </div>
          </div>

        </div><!-- end weather-grid / v-else-if -->
      </section>

      <!-- ── Salidas V6 con cupos ── -->
      <section class="section">
        <div class="section__head">
          <h2 class="section__title">Salidas V6 con cupos disponibles</h2>
          <button class="section__action" @click="irAgenda">Ver agenda</button>
        </div>
        <div class="salidas-list">
          <div
            v-for="s in salidasV6"
            :key="s.id"
            class="salida-row"
          >
            <div class="salida-row__time">{{ s.hora }}</div>
            <div class="salida-row__date">{{ s.fecha }}</div>
            <div class="salida-row__seats">
              <div
                v-for="i in s.capacidad" :key="i"
                class="seat"
                :class="i <= s.ocupados ? 'seat--taken' : 'seat--open'"
              ></div>
            </div>
            <span class="salida-row__badge" :class="s.libres <= 2 ? 'badge--warn' : 'badge--ok'">
              {{ s.libres }} cupo{{ s.libres !== 1 ? 's' : '' }}
            </span>
            <span class="salida-row__patron">{{ s.patron }}</span>
            <button class="salida-row__btn" @click="unirseASalida(s)">Unirse</button>
          </div>

          <div v-if="salidasV6.length === 0" class="salidas-empty">
            No hay salidas V6 con cupos disponibles en los próximos días.
          </div>
        </div>
      </section>

      <!-- ── Avisos del club ── -->
      <section class="section">
        <h2 class="section__title">Avisos del club</h2>
        <div class="avisos-list">
          <div v-for="a in avisos" :key="a.id" class="aviso">
            <div class="aviso__dot" :class="`aviso__dot--${a.tipo}`"></div>
            <div class="aviso__content">
              <p class="aviso__text">{{ a.mensaje }}</p>
              <p class="aviso__meta">{{ a.tiempo }} · {{ a.autor }}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'

export default defineComponent({
  name: 'HomeDashboard',
  components: { AppLayout },

  setup() {
    const router = useRouter()

    // ── Usuario ────────────────────────────────────
    // En producción: store.getters['auth/usuario'] o similar
    const usuario = ref({
      username: 'jrodriguez',
      activo: true,
      remador: {
        nombreCompleto: 'Juan Rodríguez',
        fotoUrl: null,
        certMedicaVence: '2025-12-01',
      },
    })

    const iniciales = computed(() => {
      const n = usuario.value?.remador?.nombreCompleto ?? usuario.value?.username ?? ''
      return n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    })

    const nombreCorto = computed(() => {
      const n = usuario.value?.remador?.nombreCompleto ?? usuario.value?.username ?? ''
      return n.split(' ')[0]
    })

    // ── Fecha ──────────────────────────────────────
    const anioActual = new Date().getFullYear()

    const fechaHoy = computed(() => {
      return new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    })

    // ── Stats ──────────────────────────────────────
    // En producción: cargar desde store / API
    const stats = ref({
      salidasTotales: 84,
      salidasMes:     3,
      horasAgua:      126,
      certMedica:     '12/2025',
      rachaActual:    7,
    })

    const actividadMes = computed(() => stats.value.salidasMes)

    const certVencePronto = computed(() => {
      if (!usuario.value?.remador?.certMedicaVence) return false
      const vence = new Date(usuario.value.remador.certMedicaVence)
      const hoy   = new Date()
      const diff  = (vence - hoy) / (1000 * 60 * 60 * 24)
      return diff < 60
    })

    // ── Próxima salida ─────────────────────────────
    // En producción: cargar desde store / API
    const proximasSalidas = ref([
      {
        dia:         '17',
        mes:         'mar',
        embarcacion: 'Canoa V6',
        hora:        '08:00 h',
        duracion:    '1 hora',
        equipo:      'Remo propio',
        patron:      'Carlos Vega',
        confirmados: 4,
        capacidad:   6,
      },
      {
        dia:         '20',
        mes:         'mar',
        embarcacion: 'Canoa V1',
        hora:        '10:00 h',
        duracion:    '1 hora',
        equipo:      'Remo propio',
        patron:      'Carlos Vega',
        confirmados: 4,
        capacidad:   6,
      },
    ])

    const cancelarSalida = (i) => {
      // dispatch store o llamada API
      console.log('Cancelar salida', i)
    }

    // ── Clima — Open-Meteo ─────────────────────────
    // Coordenadas de la bahía del club (ajustar según ubicación real)
    const COORDS = { lat: -29.95, lon: -71.34, ubicacion: 'Coquimbo, IV Región' }

    const diaSeleccionado = ref(0)
    const forecast        = ref([])
    const climaCargando   = ref(true)
    const climaError      = ref(false)

    // Mapeo de WMO weather codes a ícono y descripción
    const WMO_ICONS = {
      0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
      45: '🌫', 48: '🌫',
      51: '🌦', 53: '🌦', 55: '🌧',
      61: '🌧', 63: '🌧', 65: '🌧',
      71: '🌨', 73: '🌨', 75: '🌨',
      80: '🌦', 81: '🌧', 82: '⛈',
      95: '⛈', 96: '⛈', 99: '⛈',
    }
    const WMO_DESC = {
      0: 'Despejado', 1: 'Mayormente sol', 2: 'Parcial nublado', 3: 'Nublado',
      45: 'Niebla', 48: 'Niebla',
      51: 'Llovizna leve', 53: 'Llovizna', 55: 'Llovizna intensa',
      61: 'Lluvia leve', 63: 'Lluvia', 65: 'Lluvia intensa',
      71: 'Nieve leve', 73: 'Nieve', 75: 'Nieve intensa',
      80: 'Chubascos', 81: 'Chubascos', 82: 'Chubascos fuertes',
      95: 'Tormenta', 96: 'Tormenta', 99: 'Tormenta fuerte',
    }

    // Convierte grados a dirección cardinal
    const gradosADireccion = (deg) => {
      const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO']
      return dirs[Math.round(deg / 22.5) % 16]
    }

    // Descripción y aptitud del mar según altura de ola
    const estadoMar = (oleaje) => {
      if (oleaje < 0.5)  return { descripcion: 'muy calmo',       apto: true  }
      if (oleaje < 1.0)  return { descripcion: 'calmo',           apto: true  }
      if (oleaje < 1.5)  return { descripcion: 'algo de oleaje',  apto: true  }
      if (oleaje < 2.0)  return { descripcion: 'oleaje moderado', apto: false }
      return               { descripcion: 'agitado',             apto: false }
    }

    // Porcentaje visual para la barra (máx referencia 3m)
    const oleajeAPorcentaje = (oleaje) => Math.min(Math.round((oleaje / 3) * 100), 100)

    // Etiqueta del día
    const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

    const cargarClima = async () => {
      climaCargando.value = true
      climaError.value    = false
      try {
        // Llamadas en paralelo a Forecast y Marine API
        const [resForecast, resMarine] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${COORDS.lat}&longitude=${COORDS.lon}` +
            `&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant` +
            `&hourly=windspeed_10m,winddirection_10m` +
            `&timezone=auto&forecast_days=6`
          ),
          fetch(
            `https://marine-api.open-meteo.com/v1/marine` +
            `?latitude=${COORDS.lat}&longitude=${COORDS.lon}` +
            `&daily=wave_height_max,wave_direction_dominant` +
            `&hourly=wave_height,swell_wave_height` +
            `&timezone=auto&forecast_days=6`
          ),
        ])

        const [fw, fm] = await Promise.all([resForecast.json(), resMarine.json()])

        // Construir array de 6 días
        forecast.value = fw.daily.time.map((fecha, i) => {
          const date    = new Date(fecha + 'T12:00:00')
          const esHoy   = i === 0
          const label   = esHoy ? 'Hoy' : DIAS[date.getDay()]
          const dia     = String(date.getDate())
          const wmo     = fw.daily.weathercode[i]
          const oleaje  = fm.daily.wave_height_max?.[i] ?? 0
          const marInfo = estadoMar(oleaje)

          return {
            label,
            dia,
            icono:   WMO_ICONS[wmo]  ?? '🌡',
            desc:    WMO_DESC[wmo]   ?? 'Variable',
            tempMax: Math.round(fw.daily.temperature_2m_max[i]),
            tempMin: Math.round(fw.daily.temperature_2m_min[i]),
            viento: {
              direccion: gradosADireccion(fw.daily.winddirection_10m_dominant[i]),
              velocidad: Math.round(fw.daily.windspeed_10m_max[i]),
              rafagas:   Math.round(fw.daily.windgusts_10m_max[i]),
            },
            mar: {
              apto:         marInfo.apto,
              oleaje:       oleaje.toFixed(1),
              descripcion:  marInfo.descripcion,
              direccion:    gradosADireccion(fm.daily.wave_direction_dominant?.[i] ?? 0),
              barPorcentaje: oleajeAPorcentaje(oleaje),
            },
          }
        })
      } catch (e) {
        console.error('Error cargando clima:', e)
        climaError.value = true
      } finally {
        climaCargando.value = false
      }
    }

    // Cargar al montar
    cargarClima()

    const diaActual = computed(() => forecast.value[diaSeleccionado.value] ?? null)

    // ── Salidas V6 con cupos ───────────────────────
    // En producción: cargar desde store / API filtrado por tipo V6 + cupos > 0
    const salidasV6 = ref([
      { id: 1, hora: '08:00', fecha: 'hoy, 14 mar',  capacidad: 6, ocupados: 4, libres: 2, patron: 'C. Vega'   },
      { id: 2, hora: '10:30', fecha: 'hoy, 14 mar',  capacidad: 6, ocupados: 2, libres: 4, patron: 'M. Torres' },
      { id: 3, hora: '08:00', fecha: 'lun, 17 mar',  capacidad: 6, ocupados: 5, libres: 1, patron: 'R. Díaz'   },
      { id: 4, hora: '09:00', fecha: 'mar, 18 mar',  capacidad: 6, ocupados: 3, libres: 3, patron: 'C. Vega'   },
    ])

    const unirseASalida = (salida) => {
      // Navegar al formulario de agenda pre-seleccionando la fecha/hora
      console.log('Unirse a salida:', salida)
      router.push({ name: 'agenda', query: { date: salida.fecha, hora: salida.hora } })
    }

    const irAgenda = () => {
      router.push({ name: 'agenda' })
    }

    // ── Avisos ─────────────────────────────────────
    // En producción: cargar desde store / API
    const avisos = ref([
      {
        id: 1,
        tipo:    'amber',
        mensaje: 'Mantenimiento de embarcaciones el sábado 15. No habrá salidas entre 08:00 y 11:00 h.',
        tiempo:  'Hace 2 horas',
        autor:   'Administración',
      },
      {
        id: 2,
        tipo:    'cyan',
        mensaje: 'Recordatorio: renovar certificado médico antes del 31 de marzo para habilitar reservas.',
        tiempo:  'Ayer',
        autor:   'Secretaría',
      },
      {
        id: 3,
        tipo:    'green',
        mensaje: 'Nueva canoa V6 "Verde #4" disponible a partir del lunes 17.',
        tiempo:  'Hace 3 días',
        autor:   'Flota',
      },
    ])

    return {
      usuario, iniciales, nombreCorto, fechaHoy, anioActual,
      stats, actividadMes, certVencePronto,
      proximasSalidas, cancelarSalida,
      forecast, diaSeleccionado, diaActual, climaCargando, climaError, cargarClima, salidasV6, unirseASalida, irAgenda,
      avisos,
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ─────────────────────────────────────────────────
   Contenedor principal — hereda vars del AppLayout
───────────────────────────────────────────────── */
.home {
  font-family: 'Inter', sans-serif;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-border, #e2e8f0) transparent;

  --cyan:   #38bdf8;
  --indigo: #818cf8;
  --amber:  #f59e0b;
  --green:  #22c55e;
  --red:    #ef4444;
}

/* ── Sección genérica ─────────────────────────── */
.section { display: flex; flex-direction: column; gap: 10px; }

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section__title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary, #64748b);
}

.section__action {
  background: none;
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--cyan);
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}
.section__action:hover { opacity: 0.7; }

/* ── Saludo ───────────────────────────────────── */
.greet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 12px;
  padding: 16px 20px;
}

.greet__date {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  text-transform: capitalize;
  margin-bottom: 4px;
}

.greet__name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  letter-spacing: -0.3px;
  
}

.greet__club {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  margin-top: 3px;
}

.greet__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.greet__streak {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--content-bg, #f8fafc);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  padding: 8px 14px;
}

.streak__num {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--cyan);
  line-height: 1;
}

.streak__lbl {
  font-size: 0.68rem;
  color: var(--text-secondary, #64748b);
  line-height: 1.4;
}

/* Avatar en saludo */
.avatar { position: relative; flex-shrink: 0; }

.avatar__img,
.avatar__initials {
  width: 46px; height: 46px;
  border-radius: 12px;
}
.avatar__img { object-fit: cover; }

.avatar__initials {
  background: linear-gradient(135deg, var(--cyan), var(--indigo));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0c1017;
}

.avatar__dot {
  position: absolute;
  bottom: -2px; right: -2px;
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid var(--surface-bg, #ffffff);
}
.dot--on  { background: var(--green); }
.dot--off { background: var(--red); }

/* ── Stats ────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.stat {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
}

.stat__accent { height: 3px; flex-shrink: 0; }
.stat--cyan   .stat__accent { background: var(--cyan); }
.stat--indigo .stat__accent { background: var(--indigo); }
.stat--amber  .stat__accent { background: var(--amber); }
.stat--green  .stat__accent { background: var(--green); }

.stat__body {
  padding: 11px 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat__label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
}

.stat__value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin-top: 4px;
  
}

.stat__value--sm { font-size: 1rem; margin-top: 6px; }

.stat__sub {
  font-size: 0.68rem;
  color: var(--text-secondary, #64748b);
  margin-top: 2px;
}
.sub--warn { color: var(--amber); font-weight: 600; }

/* ── Próxima salida ───────────────────────────── */
.next-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 8px;
}

.next-card {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
}

.next-card__accent { height: 3px; background: var(--cyan); }

.next-card__body {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.next-card__date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--content-bg, #f8fafc);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 8px;
  padding: 8px 13px;
  flex-shrink: 0;
}

.date-box__day {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  line-height: 1;
  
}

.date-box__month {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary, #64748b);
  margin-top: 2px;
}

.next-card__info { flex: 1; display: flex; flex-direction: column; gap: 3px; }

.next-card__title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  
}

.next-card__meta {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  line-height: 1.4;
}

.meta__confirmados { color: var(--cyan); font-weight: 600; }

.next-card__cancel {
  background: none;
  border: 0.5px solid var(--red);
  border-radius: 7px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--red);
  cursor: pointer;
  padding: 6px 12px;
  flex-shrink: 0;
}
.next-card__cancel:hover { background: rgba(239, 68, 68, 0.06); }

/* ── Clima ────────────────────────────────────── */
.weather-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.days-card {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.day-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 6px;
  cursor: pointer;
  border-right: 0.5px solid var(--surface-border, #e2e8f0);
  border-bottom: 3px solid transparent;
  user-select: none;
}
.day-col:last-child { border-right: none; }
.day-col:hover { background: var(--content-bg, #f8fafc); }
.day-col.active {
  background: #fdf6ec;
  border-bottom-color: #d4922a;
}

.day-col__label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
}
.day-col.active .day-col__label { color: #92622a; }

.day-col__dia {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-primary, #0f172a);
}
.day-col.active .day-col__dia { color: #7a4f1e; }

.day-col__icon { font-size: 18px; line-height: 1; }

.day-col__temps { display: flex; align-items: baseline; gap: 4px; }

.day-col__max {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}
.day-col.active .day-col__max { color: #7a4f1e; }

.day-col__min { font-size: 0.7rem; color: var(--text-secondary, #64748b); }

/* Celdas de condición */
.weather-cells {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wcell {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  justify-content: center;
}

.wcell__label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
}

.wcell__value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  margin-top: 2px;
  
}

.wcell__sub { font-size: 0.68rem; color: var(--text-secondary, #64748b); }

.val--green { color: var(--green) !important; }
.val--red   { color: var(--red)   !important; }

/* Estado carga clima */
.clima-estado {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
}
.clima-estado--error { border-color: var(--red, #ef4444); }
.clima-estado__text  { font-size: 0.8rem; color: var(--text-secondary, #64748b); }
.clima-estado__retry {
  background: none;
  border: 0.5px solid var(--cyan, #38bdf8);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cyan, #38bdf8);
  cursor: pointer;
}

/* Barra de marea */
.tide-bar {
  height: 4px;
  background: var(--surface-border, #e2e8f0);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}
.tide-bar__fill {
  height: 100%;
  border-radius: 2px;
  background: var(--cyan);
  transition: width 0.6s ease;
}

/* ── Salidas V6 ───────────────────────────────── */
.salidas-list { display: flex; flex-direction: column; gap: 6px; }

.salida-row {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  padding: 11px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.salida-row:hover { border-color: var(--cyan); }

.salida-row__time {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  min-width: 46px;
  
}

.salida-row__date {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  min-width: 86px;
}

/* Asientos */
.salida-row__seats {
  display: flex;
  gap: 4px;
  flex: 1;
}

.seat {
  width: 18px; height: 18px;
  border-radius: 4px;
  border: 0.5px solid var(--surface-border, #e2e8f0);
}
.seat--taken {
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--cyan);
}
.seat--open {
  background: var(--content-bg, #f8fafc);
}

/* Badge de cupos */
.salida-row__badge {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
}
.badge--ok   { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge--warn { background: rgba(245, 158, 11, 0.12); color: #b45309; }

.salida-row__patron {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  min-width: 72px;
  text-align: right;
  flex-shrink: 0;
}

.salida-row__btn {
  background: rgba(56, 189, 248, 0.08);
  border: 0.5px solid var(--cyan);
  border-radius: 7px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #0ea5d9;
  cursor: pointer;
  padding: 6px 13px;
  flex-shrink: 0;
  white-space: nowrap;
}
.salida-row__btn:hover { background: rgba(56, 189, 248, 0.16); }

.salidas-empty {
  font-size: 0.8rem;
  color: var(--text-secondary, #64748b);
  text-align: center;
  padding: 20px;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
}

/* ── Avisos ───────────────────────────────────── */
.avisos-list { display: flex; flex-direction: column; gap: 6px; }

.aviso {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  padding: 11px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.aviso__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.aviso__dot--cyan  { background: var(--cyan); }
.aviso__dot--amber { background: var(--amber); }
.aviso__dot--green { background: var(--green); }
.aviso__dot--red   { background: var(--red); }

.aviso__content { display: flex; flex-direction: column; gap: 3px; }

.aviso__text {
  font-size: 0.8rem;
  color: var(--text-primary, #0f172a);
  line-height: 1.5;
  
}

.aviso__meta {
  font-size: 0.68rem;
  color: var(--text-secondary, #64748b);
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 860px) {
  .stats-row       { grid-template-columns: 1fr 1fr; }
  .weather-grid    { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .home            { padding: 14px; gap: 16px; }
  .stats-row       { grid-template-columns: 1fr 1fr; }
  .greet           { flex-direction: column; align-items: flex-start; gap: 12px; }
  .salida-row      { flex-wrap: wrap; }
  .salida-row__patron { display: none; }
}
</style>