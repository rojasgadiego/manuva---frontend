<template>
  <div class="calendar-panel">
    <div class="calendar-card">
      <div class="calendar-header">
        <button class="nav-btn" @click="$emit('prev-month')">‹</button>
        <h2>{{ monthYearLabel }}</h2>

        <div class="header-right">
          <div class="legend">
            <span class="legend-item"><span class="legend-dot available"></span>Disponible</span>
            <span class="legend-item"><span class="legend-dot partial"></span>Casi lleno</span>
            <span class="legend-item"><span class="legend-dot full"></span>Sin cupos</span>
          </div>
          <button class="nav-btn" @click="$emit('next-month')">›</button>
        </div>
      </div>

      <div class="calendar-grid">
        <div v-for="d in weekDays" :key="d" class="calendar-day-name">{{ d }}</div>

        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="[
            { today:    day.isToday },
            { selected: isSelected(day.date) },
            { inactive: !day.currentMonth },
            { past:     day.isPast },
            day.salidas.length ? getEstado(day.salidas) : 'empty'
          ]"
          @click="!day.isPast && $emit('select-day', day)"
        >
          <div class="day-header">
            <span class="day-number">{{ day.day }}</span>
            <span
              v-if="day.salidas.length"
              class="status-dot"
              :class="getEstado(day.salidas)"
            ></span>
          </div>

          <div v-if="day.salidas.length" class="day-summary">
            <span class="salidas-count">{{ day.salidas.length }} salida{{ day.salidas.length > 1 ? 's' : '' }}</span>
            <div class="ocupacion-bar">
              <div
                class="ocupacion-fill"
                :class="getEstado(day.salidas)"
                :style="{ width: getPorcentajeOcupacion(day.salidas) + '%' }"
              ></div>
            </div>
            <span class="cupos-texto">{{ getCuposTotales(day.salidas) }} cupos libres</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CalendarPanel',

  props: {
    calendarDays:   { type: Array,  required: true },
    monthYearLabel: { type: String, required: true },
    selectedDate:   { type: String, default: null },
  },

  emits: ['prev-month', 'next-month', 'select-day'],

  setup(props) {
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    const isSelected = (date) => props.selectedDate === date

    const getCuposTotales = (salidas) =>
      salidas.reduce((acc, s) => acc + (s.cupos ?? 0), 0)

    const getCuposMaximos = (salidas) =>
      salidas.reduce((acc, s) => acc + (s.cuposMax ?? 0), 0)

    const getPorcentajeOcupacion = (salidas) => {
      const max   = getCuposMaximos(salidas)
      const libre = getCuposTotales(salidas)
      if (max === 0) return 100
      return Math.min(100, Math.round(((max - libre) / max) * 100))
    }

    const getEstado = (salidas) => {
      const pct = getPorcentajeOcupacion(salidas)
      if (pct >= 100) return 'full'
      if (pct >= 70)  return 'partial'
      return 'available'
    }

    return { weekDays, isSelected, getCuposTotales, getPorcentajeOcupacion, getEstado }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

/* ── Variables de estado (fijas en ambos temas) ── */
.calendar-panel {
  --green:      #22c55e;
  --green-bg:   rgba(34, 197, 94, 0.08);
  --yellow:     #f59e0b;
  --yellow-bg:  rgba(245, 158, 11, 0.08);
  --red:        #ef4444;
  --red-bg:     rgba(239, 68, 68, 0.08);
  --cyan:       #38bdf8;

  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ── Card — usa variables del tema padre ── */
.calendar-card {
  background: var(--surface-bg, #141820);
  border: 0.5px solid var(--surface-border, #1e2433);
  border-radius: 14px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.25s ease, border-color 0.25s ease;
}

/* ── Header ── */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 12px;
}

.calendar-header h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
  margin: 0;
  text-transform: capitalize;
  letter-spacing: -0.3px;
  transition: color 0.25s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 30px; height: 30px;
  border-radius: 7px;
  border: 0.5px solid var(--surface-border, #1e2433);
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-secondary, #64748b);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.nav-btn:hover {
  background: rgba(56, 189, 248, 0.1);
  color: var(--cyan);
  border-color: var(--cyan);
}

/* ── Leyenda ── */
.legend {
  display: flex;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  white-space: nowrap;
}

.legend-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.available { background: var(--green); }
.legend-dot.partial   { background: var(--yellow); }
.legend-dot.full      { background: var(--red); }

/* ── Grid ── */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr);
  gap: 5px;
  flex: 1;
}

.calendar-day-name {
  text-align: center;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  padding-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Día base ── */
.calendar-day {
  background: var(--surface-bg, #141820);
  border-radius: 8px;
  padding: 7px 7px 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 0.5px solid var(--surface-border, #1e2433);
  border-bottom-width: 2px;
}

/* ── Estados — borde inferior de color ── */
.calendar-day.empty     { border-bottom-color: var(--surface-border, #1e2433); }
.calendar-day.available { border-bottom-color: var(--green); }
.calendar-day.partial   { border-bottom-color: var(--yellow); }
.calendar-day.full      { border-bottom-color: var(--red); }

/* ── Hover ── */
.calendar-day:hover:not(.past):not(.inactive) {
  background: rgba(56, 189, 248, 0.07);
  border-color: rgba(56, 189, 248, 0.3);
  border-bottom-color: var(--cyan);
  transform: translateY(-1px);
}

/* ── Hoy ── */
.calendar-day.today {
  border-color: var(--cyan) !important;
  border-bottom-color: var(--cyan) !important;
  background: rgba(56, 189, 248, 0.08) !important;
}

/* ── Seleccionado ── */
.calendar-day.selected {
  background: var(--cyan) !important;
  border-color: var(--cyan) !important;
}

.calendar-day.selected .day-number,
.calendar-day.selected .salidas-count,
.calendar-day.selected .cupos-texto { color: #0f1117; }

.calendar-day.selected .ocupacion-bar  { background: rgba(15, 17, 23, 0.15); }
.calendar-day.selected .ocupacion-fill { background: #0f1117 !important; }
.calendar-day.selected .status-dot     { background: rgba(15, 17, 23, 0.5) !important; }

/* ── Inactivo / pasado ── */
.calendar-day.inactive { opacity: 0.2; pointer-events: none; }
.calendar-day.past     { opacity: 0.25; cursor: not-allowed; }
.calendar-day.past:hover { transform: none; }

/* ── Cabecera del día ── */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-number {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-primary, #e2e8f0);
  transition: color 0.25s ease;
}

.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%; flex-shrink: 0;
}

.status-dot.available { background: var(--green); }
.status-dot.partial   { background: var(--yellow); }
.status-dot.full      { background: var(--red); }

/* ── Resumen del día ── */
.day-summary {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.salidas-count {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.ocupacion-bar {
  height: 3px;
  background: var(--surface-border, #1e2433);
  border-radius: 3px;
  overflow: hidden;
}

.ocupacion-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.ocupacion-fill.available { background: var(--green); }
.ocupacion-fill.partial   { background: var(--yellow); }
.ocupacion-fill.full      { background: var(--red); }

.cupos-texto {
  font-size: 0.58rem;
  color: var(--text-secondary, #64748b);
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .calendar-day { padding: 6px 4px; border-radius: 6px; }
  .day-header   { justify-content: center; }
  .status-dot, .day-summary, .legend { display: none; }
}
</style>