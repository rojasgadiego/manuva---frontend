<template>
  <AppLayout>
    <div class="historial">

      <!-- ── Header ── -->
      <section class="hist-header">
        <div class="hist-header__left">
          <h1 class="hist-header__title">Historial de salidas</h1>
          <p class="hist-header__sub">{{ totalSalidas }} salidas registradas</p>
        </div>
        <div class="hist-header__filters">
          <select class="hist-select" v-model="filtroTipo">
            <option value="">Todos los tipos</option>
            <option value="V1">V1</option>
            <option value="V6">V6</option>
          </select>
          <select class="hist-select" v-model="filtroRol">
            <option value="">Todos los roles</option>
            <option value="Responsable">Responsable</option>
            <option value="Participante">Participante</option>
            <option value="Responsable y participante">Responsable y participante</option>
          </select>
        </div>
      </section>

      <!-- ── Cargando ── -->
      <div v-if="cargando" class="hist-estado">
        <span class="hist-estado__text">Cargando historial...</span>
      </div>

      <!-- ── Error ── -->
      <div v-else-if="error" class="hist-estado hist-estado--error">
        <span class="hist-estado__text">No se pudo cargar el historial.</span>
        <button class="hist-estado__retry" @click="cargarHistorial">Reintentar</button>
      </div>

      <!-- ── Lista ── -->
      <template v-else>

        <!-- Vacío -->
        <div v-if="salidasFiltradas.length === 0" class="hist-empty">
          No hay salidas que coincidan con los filtros.
        </div>

        <!-- Grupos por fecha -->
        <div
          v-for="(grupo, fecha) in salidasAgrupadas"
          :key="fecha"
          class="hist-grupo"
        >
          <div class="hist-grupo__label">{{ fecha }}</div>

          <div class="hist-row" v-for="s in grupo" :key="s.idSalida">

            <!-- Acento de tipo canoa -->
            <div class="hist-row__accent" :class="`accent--${s.tipoCanoa.toLowerCase()}`"></div>

            <!-- Hora -->
            <div class="hist-row__time">
              <span class="time__hora">{{ formatHora(s.fechaHoraProgramada) }}</span>
            </div>

            <!-- Canoa -->
            <div class="hist-row__canoa">
              <span class="canoa__nombre">{{ s.nombreCanoa }}</span>
              <span class="canoa__codigo">{{ s.codigoCanoa }} · {{ s.marcaCanoa }}</span>
            </div>

            <!-- Tipo -->
            <span class="hist-row__tipo" :class="`tipo--${s.tipoCanoa.toLowerCase()}`">
              {{ s.tipoCanoa }}
            </span>

            <!-- Rol -->
            <span class="hist-row__rol">{{ s.rolUsuario }}</span>

            <!-- Estado -->
            <span class="hist-row__estado" :class="estadoClass(s.idEstado)">
              {{ s.nombreEstado }}
            </span>

            <!-- Tiempos reales -->
            <div class="hist-row__tiempos">
              <span class="tiempos__item" :class="{ 'tiempos__item--vacio': !s.fechaHoraSalidaReal }">
                ↑ {{ s.fechaHoraSalidaReal ? formatHora(s.fechaHoraSalidaReal) : '—' }}
              </span>
              <span class="tiempos__item" :class="{ 'tiempos__item--vacio': !s.fechaHoraRetornoReal }">
                ↓ {{ s.fechaHoraRetornoReal ? formatHora(s.fechaHoraRetornoReal) : '—' }}
              </span>
            </div>

          </div>
        </div>

      <!-- ── Sentinel infinite scroll ── -->
      <div ref="sentinel" class="hist-sentinel">
        <span v-if="cargandoMas" class="sentinel__text">Cargando más...</span>
        <span v-else-if="!hayMas" class="sentinel__text">· Fin del historial ·</span>
      </div>

      </template>

    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import salidaService from '@/services/salida.service';

export default defineComponent({
  name: 'HistorialSalidas',
  components: { AppLayout },

  setup() {
    const historial   = ref([])
    const cargando    = ref(true)
    const error       = ref(false)
    const filtroTipo  = ref('')
    const filtroRol   = ref('')

    // ── Clase visual por idEstado ──────────────────
    const ESTADO_CLASES = {
      1: 'estado--programada',
      2: 'estado--en-curso',
      3: 'estado--completada',
      4: 'estado--cancelada',
    }
    const estadoClass = (id) => ESTADO_CLASES[id] ?? ''

    // ── Infinite scroll ────────────────────────────
    const paginaActual   = ref(1)
    const porPagina      = ref(20)
    const totalRegistros = ref(0)
    const totalPaginasApi = ref(1)
    const totalPaginas    = computed(() => totalPaginasApi.value)
    const cargandoMas    = ref(false)
    const hayMas         = computed(() => paginaActual.value < totalPaginas.value)
    const sentinel       = ref(null)
    let   observer       = null

    // ── Formato de hora ─────────────────────────────
    const formatHora = (isoString) => {
      if (!isoString) return '—'
      const d = new Date(isoString)
      return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    // ── Formato de fecha para encabezado de grupo ───
    const formatFechaGrupo = (isoString) => {
      const d    = new Date(isoString)
      const hoy  = new Date()
      const ayer = new Date(); ayer.setDate(hoy.getDate() - 1)

      if (d.toDateString() === hoy.toDateString())  return 'Hoy'
      if (d.toDateString() === ayer.toDateString()) return 'Ayer'

      return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    }

    // ── Datos filtrados ─────────────────────────────
    const salidasFiltradas = computed(() => {
      return historial.value.filter(s => {
        const okTipo = !filtroTipo.value || s.tipoCanoa   === filtroTipo.value
        const okRol  = !filtroRol.value  || s.rolUsuario  === filtroRol.value
        return okTipo && okRol
      })
    })

    const totalSalidas = computed(() => salidasFiltradas.value.length)

    // ── Agrupar por fecha ───────────────────────────
    const salidasAgrupadas = computed(() => {
      const grupos = {}
      for (const s of salidasFiltradas.value) {
        const key = formatFechaGrupo(s.fechaHoraProgramada)
        if (!grupos[key]) grupos[key] = []
        grupos[key].push(s)
      }
      return grupos
    })

    // ── Carga desde API ─────────────────────────────
    const cargarHistorial = async (acumular = false) => {
      if (acumular) cargandoMas.value = true
      else          cargando.value    = true
      error.value = false
      try {
        const res = await salidaService.getHistorialUsuario(paginaActual.value, porPagina.value)
        if (!res.data.success) throw new Error(res.data.message)
        const paginado        = res.data.data
        // Acumular en infinite scroll, reemplazar en carga inicial
        historial.value       = acumular
          ? [...historial.value, ...paginado.items]
          : paginado.items
        totalRegistros.value  = paginado.totalRegistros
        totalPaginasApi.value = paginado.totalPaginas
      } catch (e) {
        console.error('Error cargando historial:', e)
        if (!acumular) error.value = true
      } finally {
        cargando.value    = false
        cargandoMas.value = false
      }
    }

    // ── IntersectionObserver ────────────────────────
    const iniciarObserver = () => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hayMas.value && !cargandoMas.value) {
            paginaActual.value++
            cargarHistorial(true)
          }
        },
        { threshold: 0.1 }
      )
      if (sentinel.value) observer.observe(sentinel.value)
    }

    onMounted(async () => {
      await cargarHistorial()
      iniciarObserver()
    })

    onUnmounted(() => {
      if (observer) observer.disconnect()
    })

    return {
      historial, cargando, error,
      filtroTipo, filtroRol,
      salidasFiltradas, salidasAgrupadas, totalSalidas,
      estadoClass,
      formatHora, cargarHistorial,
      cargandoMas, hayMas, sentinel,
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.historial {
  font-family: 'Inter', sans-serif;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-border, #e2e8f0) transparent;

  --cyan:   #38bdf8;
  --indigo: #818cf8;
  --amber:  #f59e0b;
  --green:  #22c55e;
  --red:    #ef4444;
}

/* ── Header ───────────────────────────────────── */
.hist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.hist-header__title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  letter-spacing: -0.3px;
}

.hist-header__sub {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  margin-top: 2px;
}

.hist-header__filters {
  display: flex;
  gap: 8px;
}

.hist-select {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 8px;
  padding: 7px 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-primary, #0f172a);
  cursor: pointer;
  outline: none;
}
.hist-select:focus { border-color: var(--cyan); }

/* ── Estado carga/error ───────────────────────── */
.hist-estado {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
}
.hist-estado--error  { border-color: var(--red); }
.hist-estado__text   { font-size: 0.8rem; color: var(--text-secondary, #64748b); }
.hist-estado__retry  {
  background: none;
  border: 0.5px solid var(--cyan);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cyan);
  cursor: pointer;
}

/* ── Vacío ────────────────────────────────────── */
.hist-empty {
  font-size: 0.8rem;
  color: var(--text-secondary, #64748b);
  text-align: center;
  padding: 32px;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
}

/* ── Grupo por fecha ──────────────────────────── */
.hist-grupo {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hist-grupo__label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary, #64748b);
  padding: 0 2px;
  text-transform: capitalize;
}

/* ── Fila de salida ───────────────────────────── */
.hist-row {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0;
}
.hist-row:hover { border-color: var(--cyan); }

/* Acento lateral por tipo */
.hist-row__accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
}
.accent--v1 { background: var(--cyan); }
.accent--v6 { background: var(--indigo); }

/* Hora */
.hist-row__time {
  padding: 13px 16px;
  flex-shrink: 0;
  min-width: 72px;
}
.time__hora {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

/* Canoa */
.hist-row__canoa {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 13px 0;
  min-width: 140px;
  border-left: 0.5px solid var(--surface-border, #e2e8f0);
  padding-left: 14px;
}
.canoa__nombre {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
}
.canoa__codigo {
  font-size: 0.68rem;
  color: var(--text-secondary, #64748b);
}

/* Tipo badge */
.hist-row__tipo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 99px;
  margin-left: 14px;
  flex-shrink: 0;
}
.tipo--v1 { background: rgba(56, 189, 248, 0.1);  color: #0ea5d9; }
.tipo--v6 { background: rgba(129, 140, 248, 0.1); color: #6366f1; }

/* Rol */
.hist-row__rol {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  margin-left: 14px;
  flex: 1;
}

/* Estado badge */
.hist-row__estado {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  flex-shrink: 0;
  margin-left: 10px;
}
.estado--programada { background: rgba(56, 189, 248, 0.1);  color: #0ea5d9; }
.estado--en-curso   { background: rgba(245, 158, 11, 0.1);  color: #b45309; }
.estado--completada { background: rgba(34, 197, 94, 0.1);   color: #15803d; }
.estado--cancelada  { background: rgba(239, 68, 68, 0.1);   color: #dc2626; }

/* Tiempos reales */
.hist-row__tiempos {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  flex-shrink: 0;
  border-left: 0.5px solid var(--surface-border, #e2e8f0);
  margin-left: 10px;
}
.tiempos__item {
  font-size: 0.68rem;
  color: var(--text-secondary, #64748b);
  white-space: nowrap;
}
.tiempos__item--vacio { opacity: 0.4; }

/* ── Sentinel ─────────────────────────────────── */
.hist-sentinel {
  display: flex;
  justify-content: center;
  padding: 16px;
  min-height: 40px;
}
.sentinel__text {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  letter-spacing: 0.04em;
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 700px) {
  .hist-row__tiempos { display: none; }
  .hist-row__rol     { display: none; }
  .hist-header       { flex-direction: column; align-items: flex-start; }
}
</style>