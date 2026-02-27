<template>
  <div class="calendar-panel">
    <div class="calendar-card">
      <div class="calendar-header">
        <button class="nav-btn" @click="$emit('prev-month')">‹</button>
        <h2>{{ monthYearLabel }}</h2>
        <button class="nav-btn" @click="$emit('next-month')">›</button>
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
            <span>{{ day.day }}</span>
            <span v-if="day.salidas.length" class="dot"></span>
          </div>

          <div class="salidas-preview">
            <span
              v-for="(s, i) in day.salidas.slice(0, 2)"
              :key="i"
              class="salida-chip"
              :class="s.cupos === 0 ? 'full' : 'available'"
            >{{ s.hora }}</span>
            <span v-if="day.salidas.length > 2" class="more">+{{ day.salidas.length - 2 }}</span>
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
    calendarDays: {
      type: Array,
      required: true,
    },
    monthYearLabel: {
      type: String,
      required: true,
    },
    selectedDate: {
      type: String,
      default: null,
    },
  },

  emits: ['prev-month', 'next-month', 'select-day'],

  setup(props) {
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    const isSelected = (date) => props.selectedDate === date

    return { weekDays, isSelected }
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
  --ocean-dk: #064e68;
  --foam:     #f0f9fc;
  --text:     #1a2332;
  --muted:    #6b7a8d;
  --border:   #dde4ea;
  --green:    #0d9066;
  --green-lt: #e6f7f2;
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

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.nav-btn:hover {
  background: var(--ocean-lt);
  color: var(--ocean);
  border-color: var(--ocean);
}

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

.calendar-day {
  background: #f0f9fc;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  border: 1.5px solid transparent;
}

.calendar-day:hover:not(.past):not(.inactive) {
  background: var(--ocean-lt);
  border-color: var(--ocean);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10,126,164,.15);
}

.calendar-day.today   { border-color: var(--ocean); background: var(--ocean-lt); }
.calendar-day.selected { background: var(--ocean); border-color: var(--ocean); }
.calendar-day.selected .day-header span { color: #fff; }
.calendar-day.inactive { opacity: .35; pointer-events: none; }
.calendar-day.past     { opacity: .3; background: #f0f2f5; cursor: not-allowed; }
.calendar-day.past:hover { transform: none; }

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: .85rem;
  color: var(--text);
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--ocean);
  border-radius: 50%;
}
.calendar-day.selected .dot { background: #fff; }

.salidas-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 5px;
}

.salida-chip {
  font-size: .6rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}
.salida-chip.available { background: var(--green-lt); color: var(--green); }
.salida-chip.full      { background: var(--red-lt); color: var(--red); text-decoration: line-through; }
.calendar-day.selected .salida-chip { background: rgba(255,255,255,.25); color: #fff; }

.more { font-size: .6rem; color: var(--muted); align-self: center; }

/* ── Mobile: solo números ── */
@media (max-width: 600px) {
  .calendar-day {
    padding: 6px 4px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
  }

  .day-header {
    justify-content: center;
    font-size: .9rem;
  }

  /* Ocultar dot y chips en móvil */
  .dot,
  .salidas-preview {
    display: none;
  }
}
</style>