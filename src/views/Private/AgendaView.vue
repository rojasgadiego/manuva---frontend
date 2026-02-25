<template>
  <AppLayout>
    <div class="dashboard-content">
      <div class="scene">

        <!--  CALENDARIO -->
        <Transition name="slide-left">
          <div v-if="view === 'calendar'" class="panel calendar-panel">

            <div class="calendar-card">
              <div class="calendar-header">
                <button class="nav-btn" @click="prevMonth">‹</button>
                <h2>{{ monthYearLabel }}</h2>
                <button class="nav-btn" @click="nextMonth">›</button>
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
                  @click="!day.isPast && selectDay(day)"
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
        </Transition>

        <!--  FORMULARIO  -->
        <Transition name="slide-right">
          <div v-if="view === 'form'" class="panel form-panel">

            <!-- Header con back -->
            <div class="form-topbar">
              <button class="back-btn" @click="goBack">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Volver al calendario
              </button>
              <div class="form-date-badge">
                <span class="badge-icon">🛶</span>
                <div>
                  <p class="badge-sup">Agendar salida</p>
                  <p class="badge-title">{{ dateLabel }}</p>
                </div>
              </div>
            </div>

            <!-- Body: form + timeline -->
            <div class="form-body">

              <!-- Formulario -->
              <div class="form-col">

                <section class="form-section">
                  <h3 class="section-title"><span>🕐</span> Horario</h3>
                  <div class="field-group">
                    <label class="field-label">Hora de salida</label>
                    <div class="select-wrapper">
                      <select v-model="form.hora" class="field-select">
                        <option value="" disabled>Selecciona una hora</option>
                        <option v-for="t in availableTimes" :key="t.value" :value="t.value" :disabled="t.disabled">
                          {{ t.label }}
                        </option>
                      </select>
                      <span class="select-arrow">▾</span>
                    </div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Duración estimada</label>
                    <div class="duration-pills">
                      <button
                        v-for="d in duraciones" :key="d.value"
                        class="pill" :class="{ active: form.duracion === d.value }"
                        @click="form.duracion = d.value" type="button"
                      >{{ d.label }}</button>
                    </div>
                  </div>
                </section>

                <section class="form-section">
                  <h3 class="section-title"><span>🚣</span> Embarcación</h3>
                  <div class="field-group">
                    <label class="field-label">Canoa / Kayak</label>
                    <div class="select-wrapper">
                      <select v-model="form.canoa" class="field-select">
                        <option value="" disabled>Selecciona una embarcación</option>
                        <option v-for="c in canoas" :key="c.id" :value="c.id" :disabled="!c.disponible">
                          {{ c.nombre }}{{ !c.disponible ? ' — No disponible' : '' }}
                        </option>
                      </select>
                      <span class="select-arrow">▾</span>
                    </div>
                  </div>
                  <div v-if="form.canoa" class="canoa-badge">
                    <span>{{ canoas.find(c => c.id === form.canoa)?.tipo }}</span>
                    <span class="dot-sep">·</span>
                    <span>Capacidad: {{ canoas.find(c => c.id === form.canoa)?.capacidad }} persona(s)</span>
                  </div>
                </section>

                <section class="form-section">
                  <h3 class="section-title"><span>🛟</span> Equipamiento</h3>

                  <div class="equip-item">
                    <div class="equip-info">
                      <span class="equip-name">Chaleco salvavidas</span>
                      <span class="equip-sub">Obligatorio por seguridad</span>
                    </div>
                    <div class="toggle-group">
                      <button class="toggle-btn" :class="{ active: !form.chalecoPropio }" @click="form.chalecoPropio = false" type="button">Del club</button>
                      <button class="toggle-btn" :class="{ active: form.chalecoPropio }"  @click="form.chalecoPropio = true"  type="button">Propio</button>
                    </div>
                  </div>

                  <div class="equip-item">
                    <div class="equip-info">
                      <span class="equip-name">Remo</span>
                      <span class="equip-sub">Paddle / canalete</span>
                    </div>
                    <div class="toggle-group">
                      <button class="toggle-btn" :class="{ active: !form.remoPropio }" @click="form.remoPropio = false" type="button">Del club</button>
                      <button class="toggle-btn" :class="{ active: form.remoPropio }"  @click="form.remoPropio = true"  type="button">Propio</button>
                    </div>
                  </div>

                </section>

                <section class="form-section">
                  <div class="field-group">
                    <label class="field-label">Nota (opcional)</label>
                    <textarea v-model="form.nota" class="field-textarea" rows="2" placeholder="Ej: Salida en grupo, aguas tranquilas..."></textarea>
                  </div>
                </section>

                <button class="submit-btn" :disabled="!isFormValid" @click="submit" type="button">
                  <span>Confirmar reserva</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>

              </div>

              <!-- Timeline -->
              <div class="timeline-col">
                <div class="timeline-header">
                  <span class="timeline-title">Disponibilidad del día</span>
                  <div class="legend">
                    <span class="legend-item"><span class="legend-dot available"></span>Disponible</span>
                    <span class="legend-item"><span class="legend-dot full"></span>Completo</span>
                  </div>
                </div>

                <div class="timeline">
                  <div
                    v-for="time in times" :key="time"
                    class="timeline-row"
                    :class="{
                      'has-salidas': salidasPorTime(time).length > 0,
                      'selected-hour': form.hora === time
                    }"
                    @click="selectHour(time)"
                  >
                    <div class="tl-time">{{ time }}</div>
                    <div class="tl-line">
                      <div class="tl-dot" :class="{ active: salidasPorTime(time).length > 0 || form.hora === time }"></div>
                      <div class="tl-track"></div>
                    </div>
                    <div class="tl-content">
                      <template v-if="salidasPorTime(time).length > 0">
                        <div v-for="(s, i) in salidasPorTime(time)" :key="i" class="tl-chip" :class="s.cupos === 0 ? 'chip-full' : 'chip-available'">
                          <span>{{ s.cupos === 0 ? 'Sin cupos' : s.cupos + ' cupo' + (s.cupos !== 1 ? 's' : '') }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <span class="tl-empty">Libre</span>
                      </template>
                      <div v-if="form.hora === time" class="tl-selected-indicator">← Tu reserva</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Transition>

      </div>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, reactive } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'

export default defineComponent({
  name: 'AgendaCanoasDashboard',
  components: { AppLayout },

  setup() {
    // Vista activa 
    const view = ref('calendar')   // 'calendar' | 'form'
    const selectedDay = ref(null)

    // Calendario
    const currentMonth = ref(new Date())
    const weekDays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

    const salidas = ref({
      '2026-02-14': [{ hora: '08:00', cupos: 2 }, { hora: '08:30', cupos: 1 }, { hora: '09:00', cupos: 0 }],
      '2026-02-15': [{ hora: '08:00', cupos: 1 }, { hora: '09:00', cupos: 2 }],
      '2026-02-27': [{ hora: '10:00', cupos: 3 }],
    })

    const formatDate = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2,'0')
      const day = String(d.getDate()).padStart(2,'0')
      return `${y}-${m}-${day}`
    }

    const monthYearLabel = computed(() =>
      currentMonth.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    )

    const buildDay = (date, currentMonthFlag) => {
      const key = formatDate(date)
      const today = new Date(); today.setHours(0,0,0,0)
      const cmp   = new Date(date); cmp.setHours(0,0,0,0)
      return {
        date: key,
        day: date.getDate(),
        currentMonth: currentMonthFlag,
        isToday: key === formatDate(new Date()),
        isPast: cmp < today,
        salidas: salidas.value[key] || [],
      }
    }

    const calendarDays = computed(() => {
      const year  = currentMonth.value.getFullYear()
      const month = currentMonth.value.getMonth()
      const start    = new Date(year, month, 1)
      const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1
      const firstVisible = new Date(year, month, 1 - startDay)
      const days = []
      for (let i = 0; i < 42; i++) {
        const cur = new Date(firstVisible)
        cur.setDate(firstVisible.getDate() + i)
        days.push(buildDay(cur, cur.getMonth() === month))
      }
      return days
    })

    const prevMonth = () => {
      currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
    }
    const nextMonth = () => {
      currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
    }
    const isSelected = (date) => selectedDay.value?.date === date

    const selectDay = (day) => {
      selectedDay.value = day
      resetForm()
      view.value = 'form'
    }

    const goBack = () => {
      view.value = 'calendar'
    }

    // Formulario
    const times = []
    for (let h = 8; h <= 19; h++) {
      times.push(`${String(h).padStart(2,'0')}:00`)
      if (h < 19) times.push(`${String(h).padStart(2,'0')}:30`)
    }

    const canoas = [
      { id: 'k1', nombre: 'Kayak Azul #1',   tipo: 'Kayak individual', capacidad: 1, disponible: true  },
      { id: 'k2', nombre: 'Kayak Azul #2',   tipo: 'Kayak individual', capacidad: 1, disponible: true  },
      { id: 'c1', nombre: 'Canoa Roja #1',   tipo: 'Canoa doble',      capacidad: 2, disponible: true  },
      { id: 'c2', nombre: 'Canoa Roja #2',   tipo: 'Canoa doble',      capacidad: 2, disponible: false },
      { id: 'c3', nombre: 'Canoa Verde #3',  tipo: 'Canoa grupal',     capacidad: 4, disponible: true  },
    ]

    const duraciones = [
      { value: '30',  label: '30 min'  },
      { value: '60',  label: '1 hora'  },
      { value: '90',  label: '1:30 h'  },
      { value: '120', label: '2 horas' },
    ]

    const form = reactive({ hora: '', duracion: '60', canoa: '', chalecoPropio: false, remoPropio: false, casco: false, nota: '' })

    const resetForm = () => Object.assign(form, { hora: '', duracion: '60', canoa: '', chalecoPropio: false, remoPropio: false, casco: false, nota: '' })

    const dateLabel = computed(() => {
      if (!selectedDay.value) return ''
      const d = new Date(selectedDay.value.date + 'T12:00:00')
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    })

    const salidasPorTime = (time) => (selectedDay.value?.salidas || []).filter(s => s.hora === time)

    const availableTimes = computed(() =>
      times.map(t => {
        const sal = salidasPorTime(t)
        const allFull = sal.length > 0 && sal.every(s => s.cupos === 0)
        return { value: t, label: allFull ? `${t} — Sin cupos` : t, disabled: allFull }
      })
    )

    const isFormValid = computed(() => form.hora !== '' && form.canoa !== '')

    const selectHour = (time) => {
      const t = availableTimes.value.find(at => at.value === time)
      if (t && !t.disabled) form.hora = time
    }

    const submit = () => {
      if (!isFormValid.value) return
      console.log('Reserva:', { ...form, date: selectedDay.value?.date })
      // Aquí iría el dispatch al store / llamada a API
      goBack()
    }

    return {
      view, selectedDay, goBack, selectDay,
      weekDays, calendarDays, monthYearLabel, prevMonth, nextMonth, isSelected,
      times, canoas, duraciones, form, dateLabel, salidasPorTime,
      availableTimes, isFormValid, selectHour, submit,
    }
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');

/* ── Tokens ─────────────────────────────────── */
* { box-sizing: border-box; }

.dashboard-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  font-family: 'DM Sans', sans-serif;
  --ocean:    #0a7ea4;
  --ocean-lt: #e0f4fb;
  --ocean-dk: #064e68;
  --foam:     #f0f9fc;
  --sand:     #faf8f5;
  --text:     #1a2332;
  --muted:    #6b7a8d;
  --border:   #dde4ea;
  --green:    #0d9066;
  --green-lt: #e6f7f2;
  --red:      #c0392b;
  --red-lt:   #fdecea;
}

/* ── Scene: contenedor que hace de "ventana" ── */
.scene {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;  /* clave: recorta los paneles fuera de vista */
}

/* ── Paneles ─────────────────────────────────── */
.panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

/* ── Transición: calendario sale por izquierda ─ */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.42s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-left-leave-to   { transform: translateX(-100%); opacity: 0; }

/* ── Transición: formulario entra por derecha ── */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.42s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from { transform: translateX(100%); opacity: 0; }
.slide-right-leave-to   { transform: translateX(100%); opacity: 0; }

/* ══════════════════════════════════════════════
   CALENDARIO
══════════════════════════════════════════════ */
.calendar-panel { overflow: hidden; }

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
.nav-btn:hover { background: var(--ocean-lt); color: var(--ocean); border-color: var(--ocean); }

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
  background: var(--foam);
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

.calendar-day.today  { border-color: var(--ocean); background: var(--ocean-lt); }
.calendar-day.selected { background: var(--ocean); border-color: var(--ocean); }
.calendar-day.selected .day-header span { color: #fff; }
.calendar-day.inactive { opacity: .35; pointer-events: none; }
.calendar-day.past    { opacity: .3; background: #f0f2f5; cursor: not-allowed; }
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

/* ══════════════════════════════════════════════
   FORMULARIO
══════════════════════════════════════════════ */
.form-panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,.07);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Topbar */
.form-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid var(--border);
  background: var(--foam);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 7px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: .84rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all .15s;
}
.back-btn:hover { background: var(--ocean-lt); color: var(--ocean); border-color: var(--ocean); }

.form-date-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-icon { font-size: 1.6rem; }

.badge-sup {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .09em;
  color: var(--ocean);
  font-weight: 600;
  margin: 0 0 1px;
}

.badge-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.1rem;
  color: var(--text);
  margin: 0;
  text-transform: capitalize;
}

/* Body */
.form-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Form col */
.form-col {
  padding: 20px 22px 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.form-section { margin-bottom: 20px; }

.section-title {
  font-size: .76rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--muted);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-group { margin-bottom: 12px; }

.field-label {
  display: block;
  font-size: .82rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.select-wrapper { position: relative; }

.field-select {
  width: 100%;
  padding: 10px 34px 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: .86rem;
  color: var(--text);
  background: #fff;
  appearance: none;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.field-select:focus { outline: none; border-color: var(--ocean); box-shadow: 0 0 0 3px var(--ocean-lt); }

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
  font-size: .8rem;
}

.canoa-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 6px 10px;
  background: var(--ocean-lt);
  border-radius: 8px;
  font-size: .76rem;
  color: var(--ocean-dk);
  font-weight: 500;
}
.dot-sep { color: var(--muted); }

.duration-pills { display: flex; gap: 6px; flex-wrap: wrap; }

.pill {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: .8rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all .15s;
}
.pill:hover { border-color: var(--ocean); color: var(--ocean); }
.pill.active { background: var(--ocean); border-color: var(--ocean); color: #fff; }

.equip-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.equip-item:last-child { border-bottom: none; }

.equip-info { display: flex; flex-direction: column; gap: 2px; }
.equip-name { font-size: .86rem; font-weight: 500; color: var(--text); }
.equip-sub  { font-size: .72rem; color: var(--muted); }

.toggle-group {
  display: flex;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.toggle-btn {
  padding: 6px 12px;
  border: none;
  background: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: .76rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all .15s;
}
.toggle-btn + .toggle-btn { border-left: 1px solid var(--border); }
.toggle-btn.active { background: var(--ocean); color: #fff; }

.switch { position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch-track {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: 999px;
  transition: background .2s;
}
.switch-track::before {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #fff;
  top: 3px; left: 3px;
  transition: transform .2s;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.switch input:checked + .switch-track { background: var(--ocean); }
.switch input:checked + .switch-track::before { transform: translateX(18px); }

.field-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: .84rem;
  color: var(--text);
  resize: none;
  transition: border-color .15s, box-shadow .15s;
}
.field-textarea:focus { outline: none; border-color: var(--ocean); box-shadow: 0 0 0 3px var(--ocean-lt); }

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: var(--ocean);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: background .15s, transform .1s;
}
.submit-btn:hover:not(:disabled) { background: var(--ocean-dk); transform: translateY(-1px); }
.submit-btn:disabled { opacity: .4; cursor: not-allowed; }

/* Timeline col */
.timeline-col {
  border-left: 1px solid var(--border);
  background: var(--sand);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-header {
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.timeline-title {
  font-size: .76rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--muted);
}

.legend { display: flex; gap: 12px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: .7rem; color: var(--muted); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot.available { background: var(--green); }
.legend-dot.full      { background: var(--red); }

.timeline {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.timeline-row {
  display: grid;
  grid-template-columns: 46px 18px 1fr;
  align-items: flex-start;
  gap: 6px;
  padding: 3px 14px;
  cursor: pointer;
  border-radius: 8px;
  margin: 0 6px;
  transition: background .12s;
  min-height: 34px;
}
.timeline-row:hover { background: rgba(10,126,164,.06); }
.timeline-row.selected-hour { background: var(--ocean-lt); }

.tl-time {
  font-size: .75rem;
  font-weight: 600;
  color: var(--muted);
  padding-top: 5px;
  text-align: right;
}
.selected-hour .tl-time { color: var(--ocean); }

.tl-line { display: flex; flex-direction: column; align-items: center; padding-top: 5px; height: 100%; }

.tl-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: #fff;
  flex-shrink: 0;
  transition: all .15s;
}
.tl-dot.active { border-color: var(--ocean); background: var(--ocean); }
.selected-hour .tl-dot { box-shadow: 0 0 0 3px var(--ocean-lt); }

.tl-track { width: 2px; flex: 1; background: var(--border); margin-top: 3px; }

.tl-content {
  padding: 4px 0 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.tl-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: .71rem;
  font-weight: 500;
}
.chip-available { background: var(--green-lt); color: var(--green); }
.chip-full      { background: var(--red-lt);   color: var(--red); text-decoration: line-through; }

.tl-empty { font-size: .73rem; color: #c0c8d4; font-style: italic; }

.tl-selected-indicator {
  font-size: .7rem;
  font-weight: 600;
  color: var(--ocean);
  padding: 2px 8px;
  background: var(--ocean-lt);
  border-radius: 20px;
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 720px) {
  .form-body {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
  .timeline-col {
    border-left: none;
    border-top: 1px solid var(--border);
    max-height: 260px;
  }
  .form-col { overflow-y: visible; }
  .form-panel { overflow-y: auto; }
}
</style>