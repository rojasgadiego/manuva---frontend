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
            day.tieneSalidas ? getEstado(day) : 'empty'
          ]"
          @click="!day.isPast && $emit('select-day', day)"
        >
          <div class="day-header">
            <span class="day-number">{{ day.day }}</span>
            <span
              v-if="day.tieneSalidas"
              class="day-badge"
              :class="getEstado(day)"
            >{{ day.totalSalidas }} sal.</span>
          </div>

          <div v-if="day.tieneSalidas" class="day-cupos">
            <template v-if="day.cuposDisponibles === 0">
              <span class="full-tag">Sin cupos</span>
            </template>
            <template v-else>
              <span class="cupos-num" :class="getEstado(day)">{{ day.cuposDisponibles }}</span>
              <span class="cupos-label">cupos libres</span>
            </template>
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

    const getPorcentajeOcupacion = (day) => {
      const max = day.totalCupos ?? 0
      if (max === 0) return 100
      const ocupados = max - (day.cuposDisponibles ?? 0)
      return Math.min(100, Math.round((ocupados / max) * 100))
    }

    const getEstado = (day) => {
      const pct = getPorcentajeOcupacion(day)
      if (pct >= 100) return 'full'
      if (pct >= 70)  return 'partial'
      return 'available'
    }

    return {
      weekDays,
      isSelected,
      getPorcentajeOcupacion,
      getEstado,
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

.calendar-panel {
  --green:      #22c55e;
  --green-bg:   rgba(34, 197, 94, 0.08);
  --green-border: rgba(34, 197, 94, 0.22);
  --green-text: #16a34a;
  --yellow:     #f59e0b;
  --yellow-bg:  rgba(245, 158, 11, 0.08);
  --yellow-border: rgba(245, 158, 11, 0.22);
  --yellow-text: #b45309;
  --red:        #ef4444;
  --red-bg:     rgba(239, 68, 68, 0.07);
  --red-border: rgba(239, 68, 68, 0.2);
  --red-text:   #b91c1c;
  --cyan:       #38bdf8;

  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

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

.calendar-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 12px;
}

.calendar-header h2 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
  margin: 0;
  text-transform: capitalize;
  letter-spacing: -0.3px;
  white-space: nowrap;
  pointer-events: none;
  transition: color 0.25s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
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

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, minmax(100px, 1fr));
  gap: 5px;
  flex: 1;
  min-height: 0;
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
  border-radius: 8px;
  padding: 9px 9px 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border: 0.5px solid var(--surface-border, #1e2433);
  overflow: hidden;
}

.calendar-day.empty {
  background: var(--surface-bg, #141820);
  border-color: var(--surface-border, #1e2433);
}

.calendar-day.available {
  background: var(--green-bg);
  border-color: var(--green-border);
}

.calendar-day.partial {
  background: var(--yellow-bg);
  border-color: var(--yellow-border);
}

.calendar-day.full {
  background: var(--red-bg);
  border-color: var(--red-border);
}

.calendar-day:hover:not(.past):not(.inactive) {
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateY(-1px);
}

.calendar-day.today {
  outline: 1.5px solid var(--cyan);
  outline-offset: -1px;
}

.calendar-day.selected {
  background: var(--cyan) !important;
  border-color: var(--cyan) !important;
  outline: none !important;
}

.calendar-day.selected .day-number  { color: #0f1117; }
.calendar-day.selected .day-badge   { background: rgba(15,17,23,0.15) !important; color: #0f1117 !important; }
.calendar-day.selected .cupos-num   { color: #0f1117 !important; }
.calendar-day.selected .cupos-label { color: rgba(15,17,23,0.6); }
.calendar-day.selected .full-tag    { color: #0f1117; }

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
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-primary, #e2e8f0);
  transition: color 0.25s ease;
}

.day-badge {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 99px;
  white-space: nowrap;
}

.day-badge.available { background: rgba(34,197,94,0.15);  color: var(--green-text); }
.day-badge.partial   { background: rgba(245,158,11,0.15); color: var(--yellow-text); }
.day-badge.full      { background: rgba(239,68,68,0.12);  color: var(--red-text); }

/* ── Cupos ── */
.day-cupos {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cupos-num {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}

.cupos-num.available { color: var(--green-text); }
.cupos-num.partial   { color: var(--yellow-text); }
.cupos-num.full      { color: var(--red-text); }

.cupos-label {
  font-size: 0.6rem;
  color: var(--text-secondary, #64748b);
}

.full-tag {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--red-text);
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .legend { display: none; }
}

@media (max-width: 600px) {
  .calendar-grid {
    grid-template-rows: auto repeat(6, minmax(70px, 1fr));
  }
  .calendar-day   { padding: 6px 5px; border-radius: 6px; }
  .day-header     { justify-content: center; }
  .day-badge, .day-cupos { display: none; }

  .calendar-header h2 { position: static; transform: none; }
  .header-right { margin-left: 0; }
}
</style>