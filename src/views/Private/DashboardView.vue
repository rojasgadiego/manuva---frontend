<template>
  <AppLayout>
    <div class="home">

      <!-- ── Saludo ── -->
      <section class="greet">
        <div class="greet__left">
          <p class="greet__date">{{ fechaHoy }}</p>
          <h1 class="greet__name">{{ saludo }}{{ nombreCorto ? `, ${nombreCorto}` : '' }}</h1>
          <p class="greet__club">Club de Canotaje Manuva'a</p>
        </div>
        <div class="greet__right">
          <div class="greet__streak">
            <span class="streak__num">{{ actividadMes }}</span>
            <span class="streak__lbl">salidas<br>este mes</span>
          </div>
          <div class="avatar">
            <img v-if="panel?.fotoUrl" :src="panel.fotoUrl" class="avatar__img" alt="" />
            <div v-else class="avatar__initials">{{ iniciales }}</div>
            <span class="avatar__dot" :class="puedeReservar ? 'dot--on' : 'dot--off'"
                  :title="puedeReservar ? 'Habilitado para reservar' : 'Con requisitos pendientes'"></span>
          </div>
        </div>
      </section>

      <!-- ── Stats personales ── -->
      <section class="section">
        <h2 class="section__title">Mi actividad</h2>
        <div class="stats-row" :class="{ 'is-loading': cargando }">
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
          <div class="stat" :class="cert.estado === 'ok' ? 'stat--green' : 'stat--amber'">
            <div class="stat__accent"></div>
            <div class="stat__body">
              <span class="stat__label">Cert. médica</span>
              <span class="stat__value stat__value--sm">{{ cargando ? '—' : cert.texto }}</span>
              <span class="stat__sub" :class="cert.estado !== 'ok' ? 'sub--warn' : ''">{{ cargando ? '' : cert.sub }}</span>
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

      <!-- ── Avisos personales ── -->
      <section class="section" v-if="avisos.length">
        <h2 class="section__title">Avisos</h2>
        <div class="avisos-list">
          <div v-for="a in avisos" :key="a.id" class="aviso">
            <div class="aviso__dot" :class="`aviso__dot--${a.tipo}`"></div>
            <div class="aviso__content">
              <p class="aviso__text">{{ a.mensaje }}</p>
              <p class="aviso__meta">{{ a.meta }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Próximas salidas ── -->
      <section class="section">
        <div class="section__head">
          <h2 class="section__title">Mis próximas salidas</h2>
          <button class="section__action" @click="irAgenda">Reservar</button>
        </div>
        <div v-if="proximasSalidas.length" class="next-cards-row">
          <div class="next-card" v-for="s in proximasSalidas" :key="s.id">
            <div class="next-card__accent"></div>
            <div class="next-card__body">
              <div class="next-card__date-box">
                <span class="date-box__day">{{ s.dia }}</span>
                <span class="date-box__month">{{ s.mes }}</span>
              </div>
              <div class="next-card__info">
                <p class="next-card__title">{{ s.nombreCanoa || s.codigoCanoa }} · {{ s.hora }} h</p>
                <p class="next-card__meta">{{ s.duracionMin }} min · {{ s.tipoCanoa }} · {{ s.estado }}</p>
                <p class="next-card__meta">
                  {{ s.soyResponsable ? 'Eres responsable' : `Responsable: ${s.responsable}` }} ·
                  <span class="meta__confirmados">{{ s.participantes }}/{{ s.capacidadMax }} inscritos</span>
                </p>
              </div>
              <button class="next-card__cancel next-card__ver" @click="verSalida(s)">Ver</button>
            </div>
          </div>
        </div>
        <div v-else-if="!cargando" class="salidas-empty">
          No tienes salidas próximas.
          <button v-if="puedeReservar" class="link-btn" @click="irAgenda">Reserva una en la agenda →</button>
        </div>
      </section>

      <!-- ── Condiciones del día ── -->
      <section class="section">
        <h2 class="section__title">Condiciones del día</h2>

        <!-- Skeleton de carga -->
        <div v-if="climaCargando" class="weather-grid weather-skeleton">
          <div class="days-card">
            <div class="day-col" v-for="i in 6" :key="i">
              <div class="sk sk--label"></div>
              <div class="sk sk--day"></div>
              <div class="sk sk--icon"></div>
              <div class="sk-temps">
                <div class="sk sk--temp"></div>
                <div class="sk sk--temp-min"></div>
              </div>
            </div>
          </div>
          <div class="weather-cells">
            <div class="wcell" v-for="i in 3" :key="i">
              <div class="sk sk--cell-label"></div>
              <div class="sk sk--cell-value"></div>
              <div class="sk sk--cell-sub"></div>
              <div v-if="i === 1" class="sk sk--cell-bar"></div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="climaError" class="clima-estado clima-estado--error">
          <span class="clima-estado__text">No se pudo cargar el clima.</span>
          <button class="clima-estado__retry" @click="cargarClima">Reintentar</button>
        </div>

        <!-- Datos cargados -->
        <div v-else-if="diaActual" class="weather-grid weather-grid--loaded">

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

        </div>
      </section>


      <!-- ── Salidas con cupos ── -->
      <section class="section">
        <div class="section__head">
          <h2 class="section__title">Salidas con cupos disponibles</h2>
          <button class="section__action" @click="irAgenda">Ver agenda</button>
        </div>
        <div class="salidas-list">
          <div
            v-for="s in salidasConCupos"
            :key="s.id"
            class="salida-row"
          >
            <div class="salida-row__time">{{ s.hora }}</div>
            <div class="salida-row__date">{{ s.fecha }}</div>
            <div class="salida-row__seats" :aria-label="`${s.participantes} de ${s.capacidadMax} cupos ocupados`">
              <div
                v-for="i in s.capacidadMax" :key="i"
                class="seat"
                :class="i <= s.participantes ? 'seat--taken' : 'seat--open'"
              ></div>
            </div>
            <span class="salida-row__badge" :class="s.cuposLibres <= 2 ? 'badge--warn' : 'badge--ok'">
              {{ s.cuposLibres }} cupo{{ s.cuposLibres !== 1 ? 's' : '' }}
            </span>
            <span class="salida-row__patron">{{ s.tipoCanoa }} · {{ s.responsable }}</span>
            <button
              v-if="puedeReservar"
              class="salida-row__btn" :disabled="uniendo === s.id"
              @click="unirseASalida(s)"
            >{{ uniendo === s.id ? 'Uniendo…' : 'Unirse' }}</button>
            <button v-else class="salida-row__btn" @click="verSalida(s)">Ver</button>
          </div>

          <div v-if="!cargando && salidasConCupos.length === 0" class="salidas-empty">
            No hay salidas con cupos en los próximos días.
          </div>
        </div>
      </section>

    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import AppLayout from '@/components/Layout/AppLayout.vue'
import clubService from '@/services/club.service'
import salidaService from '@/services/salida.service'
import { useToast } from '@/utils/useToast'
import { mensajeError, limpiarMensaje } from '@/utils/apiError'
import { cargarPronostico } from '@/utils/clima'

const DIAS_AVISO_CERT = 60

export default defineComponent({
  name: 'HomeDashboard',
  components: { AppLayout },

  setup() {
    const router = useRouter()
    const store  = useStore()
    const { mostrarToast } = useToast()

    // ── Datos del panel (GET /api/Dashboard/me) ────
    const panel    = ref(null)
    const cargando = ref(true)
    const uniendo  = ref(null)

    const cargarPanel = async () => {
      try {
        const res = await clubService.dashboard()
        panel.value = res.data.data
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cargar tu panel.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    const nombre = computed(() => panel.value?.nombre ?? store.getters['auth/currentUser']?.nombreCompleto ?? '')

    const iniciales = computed(() =>
      nombre.value.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase())

    const nombreCorto = computed(() => nombre.value.split(' ')[0])

    const saludo = computed(() => {
      const h = new Date().getHours()
      return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches'
    })

    // ── Fecha ──────────────────────────────────────
    const anioActual = new Date().getFullYear()

    const fechaHoy = computed(() => new Date().toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    }))

    // ── Stats ──────────────────────────────────────
    const stats = computed(() => {
      const e = panel.value?.estadisticas
      return {
        salidasTotales: e?.salidasTotales ?? '—',
        salidasMes:     e?.salidasMes ?? 0,
        horasAgua:      e?.horasTemporada ?? '—',
        rachaActual:    e?.rachaSemanas ?? '—',
      }
    })

    const actividadMes = computed(() => panel.value?.estadisticas.salidasMes ?? 0)

    const diasHasta = (fechaIso) => Math.ceil((new Date(fechaIso + 'T00:00:00') - new Date().setHours(0, 0, 0, 0)) / 86400000)

    // Estado del certificado médico: sin registro / vencido / vence pronto / al día
    const cert = computed(() => {
      if (store.getters['auth/idRemador'] == null) return { texto: '—', estado: 'ok', sub: 'no aplica' }
      const vence = panel.value?.certMedicaVence
      if (!vence) return { texto: 'Sin registro', estado: 'vencido', sub: 'regulariza con el club' }
      const dias = diasHasta(vence)
      const [y, m] = vence.split('-')
      const texto = `${m}/${y}`
      if (dias < 0)                return { texto, estado: 'vencido', sub: 'vencido' }
      if (dias <= DIAS_AVISO_CERT) return { texto, estado: 'pronto',  sub: `vence en ${dias} día${dias !== 1 ? 's' : ''}` }
      return { texto, estado: 'ok', sub: 'al día' }
    })

    // ── Salidas ────────────────────────────────────
    const formatoSalida = (s) => {
      const d = new Date(s.fechaHoraProgramada)
      const hoy = new Date()
      const manana = new Date(); manana.setDate(hoy.getDate() + 1)
      const mismoDia = (a, b) => a.toDateString() === b.toDateString()
      return {
        ...s,
        dia:   String(d.getDate()),
        mes:   d.toLocaleDateString('es-CL', { month: 'short' }).replace('.', ''),
        hora:  d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fecha: mismoDia(d, hoy) ? 'hoy' : mismoDia(d, manana) ? 'mañana'
               : d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }),
      }
    }

    const proximasSalidas = computed(() => (panel.value?.proximasSalidas ?? []).map(formatoSalida))
    const salidasConCupos = computed(() => (panel.value?.salidasConCupos ?? []).map(formatoSalida))
    const puedeReservar   = computed(() => !!panel.value?.requisitos.puedeReservar)

    const verSalida = (s) => router.push(`/salidas/${s.id}`)

    const unirseASalida = async (s) => {
      uniendo.value = s.id
      try {
        const user = store.getters['auth/currentUser']
        await salidaService.agregarParticipante(s.id, {
          idRemador: store.getters['auth/idRemador'],
          usaRemoClub: !user?.tieneRemoPropio,
          usaSalvavidasClub: !user?.tieneSalvavidasPropio,
        })
        mostrarToast(`Te uniste a la salida de ${s.fecha} a las ${s.hora}.`, 'success', 4000)
        await cargarPanel()
      } catch (e) {
        mostrarToast(limpiarMensaje(mensajeError(e, 'No se pudo unir a la salida.')), 'error', 6000)
      } finally {
        uniendo.value = null
      }
    }

    const irAgenda = () => router.push({ name: 'Agenda' })

    // ── Avisos personales (derivados de tu estado en el club) ──
    const avisos = computed(() => {
      const p = panel.value
      if (!p) return []
      const lista = (p.requisitos.pendientes ?? []).map((m, i) => ({ id: `req-${i}`, tipo: 'amber', mensaje: m, meta: 'Requisito para reservar' }))
      if (cert.value.estado === 'pronto')
        lista.push({ id: 'cert', tipo: 'amber', mensaje: `Tu certificado médico ${cert.value.sub}. Renuévalo para seguir reservando.`, meta: 'Certificado médico' })
      if (p.cuotasPendientes > 0)
        lista.push({ id: 'cuotas', tipo: 'amber', mensaje: `Tienes ${p.cuotasPendientes} cuota${p.cuotasPendientes !== 1 ? 's' : ''} pendiente${p.cuotasPendientes !== 1 ? 's' : ''} de pago.`, meta: 'Membresía' })
      if (p.membresia?.vigente) {
        const dias = diasHasta(p.membresia.fechaFin)
        if (dias <= 30)
          lista.push({ id: 'memb', tipo: 'cyan', mensaje: `Tu membresía ${p.membresia.tipo.toLowerCase()} vence en ${dias} día${dias !== 1 ? 's' : ''}.`, meta: 'Membresía' })
      }
      return lista
    })

    // ── Clima (utils/clima.js, Open-Meteo) ─────────
    const diaSeleccionado = ref(0)
    const forecast        = ref([])
    const climaCargando   = ref(true)
    const climaError      = ref(false)

    const cargarClima = async () => {
      climaCargando.value = true
      climaError.value    = false
      try {
        forecast.value = (await cargarPronostico()).slice(0, 6)
      } catch (e) {
        climaError.value = true
      } finally {
        climaCargando.value = false
      }
    }

    cargarClima()

    const diaActual = computed(() => forecast.value[diaSeleccionado.value] ?? null)

    onMounted(cargarPanel)

    return {
      panel, cargando, uniendo,
      nombre, iniciales, nombreCorto, saludo, fechaHoy, anioActual,
      stats, actividadMes, cert,
      proximasSalidas, salidasConCupos, puedeReservar, verSalida, unirseASalida, irAgenda,
      forecast, diaSeleccionado, diaActual, climaCargando, climaError, cargarClima,
      avisos,
    }
  },
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ─────────────────────────────────────────────────
   Contenedor principal
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

/* ─── Skeleton shimmer ──────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}

.sk {
  border-radius: 5px;
  background: linear-gradient(
    90deg,
    var(--content-bg, #f1f5f9) 25%,
    var(--surface-bg, #ffffff) 50%,
    var(--content-bg, #f1f5f9) 75%
  );
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
  flex-shrink: 0;
}

/* Tamaños de los bloques skeleton */
.sk--label     { width: 28px;  height: 10px; }
.sk--day       { width: 22px;  height: 28px; border-radius: 5px; }
.sk--icon      { width: 24px;  height: 24px; border-radius: 50%; }
.sk--temp      { width: 20px;  height: 12px; }
.sk--temp-min  { width: 14px;  height: 12px; opacity: 0.6; }

.sk--cell-label { width: 50px;  height: 10px; }
.sk--cell-value { width: 110px; height: 16px; margin-top: 2px; }
.sk--cell-sub   { width: 140px; height: 10px; opacity: 0.7; }
.sk--cell-bar   { width: 100%;  height: 4px;  border-radius: 2px; margin-top: 4px; }

/* Contenedor de temperaturas en skeleton */
.sk-temps {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* El skeleton reutiliza las mismas clases days-card / day-col / weather-cells / wcell
   del estado cargado, pero los hijos son bloques .sk en lugar de texto */
.weather-skeleton .day-col {
  cursor: default;
  pointer-events: none;
}

.weather-skeleton .wcell {
  min-height: 68px;
}

/* ─── Fade-in al aparecer los datos reales ─────── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.weather-grid--loaded {
  animation: fadeInUp 0.4s ease both;
}

/* ─────────────────────────────────────────────── */

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

/* Estado error */
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
  .stats-row    { grid-template-columns: 1fr 1fr; }
  .weather-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .home                 { padding: 14px; gap: 16px; }
  .stats-row            { grid-template-columns: 1fr 1fr; }
  .greet                { flex-direction: column; align-items: flex-start; gap: 12px; }
  .salida-row           { flex-wrap: wrap; }
  .salida-row__patron   { display: none; }
}
</style>
<style scoped>
/* ── Fase 2: estados de carga y enlaces ── */
.stats-row.is-loading .stat__value { opacity: 0.4; }

.next-card__ver {
  color: #38bdf8 !important;
  border-color: rgba(56, 189, 248, 0.35) !important;
}

.link-btn {
  margin-left: 6px;
  background: none;
  border: none;
  padding: 0;
  color: #38bdf8;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.link-btn:hover { text-decoration: underline; }

.salida-row__btn:disabled { opacity: 0.5; cursor: wait; }
</style>
