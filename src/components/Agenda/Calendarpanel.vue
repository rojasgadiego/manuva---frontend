<template>
  <div class="calendar-panel">
    <div class="calendar-card">
      <div class="calendar-header">
        <button class="nav-btn" @click="$emit('prev-month')">‹</button>
        <h2>{{ monthYearLabel }}</h2>
        <button class="nav-btn" @click="$emit('next-month')">›</button>
      </div>

      <!-- Leyenda -->
      <div class="legend">
        <span class="legend-item"><span class="legend-dot available"></span>Disponible</span>
        <span class="legend-item"><span class="legend-dot partial"></span>Casi lleno</span>
        <span class="legend-item"><span class="legend-dot full"></span>Sin cupos</span>
      </div>

      <div class="calendar-grid">
        <div v-for="d in weekDays" :key="d" class="calendar-day-name">{{ d }}</div>

        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            today:    day.isToday,
            selected: isSelected(day.date),
            inactive: !day.currentMonth,
            past:     day.isPast
          }"
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
    calendarDays: { type: Array,  required: true },
    monthYearLabel: { type: String, required: true },
    selectedDate: { type: String, default: null },
  },

  emits: ['prev-month', 'next-month', 'select-day'],

  setup(props) {
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    const isSelected = (date) => props.selectedDate === date

    // Cupos libres totales del día
    const getCuposTotales = (salidas) =>
      salidas.reduce((acc, s) => acc + (s.cupos ?? 0), 0)

    // Cupos máximos totales del día
    const getCuposMaximos = (salidas) =>
      salidas.reduce((acc, s) => acc + (s.cuposMax ?? s.cupos ?? 0), 0)

    // Porcentaje de ocupación
    const getPorcentajeOcupacion = (salidas) => {
      const max   = getCuposMaximos(salidas)
      const libre = getCuposTotales(salidas)
      if (max === 0) return 100
      const ocupado = max - libre
      return Math.min(100, Math.round((ocupado / max) * 100))
    }

    // Estado del día según disponibilidad
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
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');

* { box-sizing: border-box; }

.calendar-panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  --ocean:    #0a7ea4;
  --ocean-lt: #e0f4fb;
  --text:     #1a2332;
  --muted:    #6b7a8d;
  --border:   #dde4ea;
  --green:    #0d9066;
  --green-lt: #e6f7f2;
  --yellow:   #b45309;
  --yellow-lt:#fef3c7;
  --red:      #c0392b;
  --red-lt:   #fdecea;
  font-family: 'DM Sans', sans-serif;
}

.calendar-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,.07);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.calendar-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 1.3rem;
  color: var(--text);
  margin: 0;
  text-transform: capitalize;
}

.nav-btn {
  border: 1.5px solid var(--border);
  background: #fff;
  width: 34px; height: 34px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--muted);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.nav-btn:hover { background: var(--ocean-lt); color: var(--ocean); border-color: var(--ocean); }

/* ── Leyenda ── */
.legend {
  display: flex;
  gap: 14px;
  margin-bottom: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .72rem;
  color: var(--muted);
}
.legend-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
}
.legend-dot.available { background: var(--green); }
.legend-dot.partial   { background: var(--yellow); }
.legend-dot.full      { background: var(--red); }

/* ── Grid ── */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr);
  gap: 6px;
  flex: 1;
}

.calendar-day-name {
  text-align: center;
  font-size: .72rem;
  font-weight: 600;
  color: var(--muted);
  padding-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .05em;
}

/* ── Día ── */
.calendar-day {
  background: #f0f9fc;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1.5px solid transparent;
}

.calendar-day:hover:not(.past):not(.inactive) {
  background: var(--ocean-lt);
  border-color: var(--ocean);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10,126,164,.15);
}

.calendar-day.today    { border-color: var(--ocean); background: var(--ocean-lt); }
.calendar-day.selected { background: var(--ocean); border-color: var(--ocean); }
.calendar-day.selected .day-number,
.calendar-day.selected .salidas-count,
.calendar-day.selected .cupos-texto { color: #fff; }
.calendar-day.inactive { opacity: .35; pointer-events: none; }
.calendar-day.past     { opacity: .3; background: #f0f2f5; cursor: not-allowed; }

/* ── Cabecera del día ── */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-number {
  font-weight: 600;
  font-size: .85rem;
  color: var(--text);
}

.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
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
  font-size: .62rem;
  font-weight: 600;
  color: var(--muted);
}

.calendar-day.selected .salidas-count { color: rgba(255,255,255,.8); }

/* Barra de ocupación */
.ocupacion-bar {
  height: 4px;
  background: rgba(0,0,0,.08);
  border-radius: 4px;
  overflow: hidden;
}

.ocupacion-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
.ocupacion-fill.available { background: var(--green); }
.ocupacion-fill.partial   { background: var(--yellow); }
.ocupacion-fill.full      { background: var(--red); }

.calendar-day.selected .ocupacion-bar { background: rgba(255,255,255,.25); }
.calendar-day.selected .ocupacion-fill { background: #fff; }

.cupos-texto {
  font-size: .58rem;
  color: var(--muted);
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .calendar-day {
    padding: 6px 4px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
  }
  .day-header { justify-content: center; font-size: .9rem; }
  .status-dot, .day-summary, .legend { display: none; }
}
</style>