<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="backdrop" @click.self="close">
        <div class="modal">

          <!-- Header -->
          <div class="modal-header">
            <div class="header-left">
              <span class="header-icon">🛶</span>
              <div>
                <p class="header-sup">Agendar salida</p>
                <h2 class="header-title">{{ dateLabel }}</h2>
              </div>
            </div>
            <button class="close-btn" @click="close" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Two-column body -->
          <div class="modal-body">

            <!-- LEFT: Formulario -->
            <div class="form-col">

              <!-- Sección: Horario -->
              <section class="form-section">
                <h3 class="section-title">
                  <span class="section-icon">🕐</span> Horario
                </h3>
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
                      v-for="d in duraciones"
                      :key="d.value"
                      class="pill"
                      :class="{ active: form.duracion === d.value }"
                      @click="form.duracion = d.value"
                      type="button"
                    >{{ d.label }}</button>
                  </div>
                </div>
              </section>

              <!-- Sección: Embarcación -->
              <section class="form-section">
                <h3 class="section-title">
                  <span class="section-icon">🚣</span> Embarcación
                </h3>
                <div class="field-group">
                  <label class="field-label">Canoa / Kayak</label>
                  <div class="select-wrapper">
                    <select v-model="form.canoa" class="field-select">
                      <option value="" disabled>Selecciona una embarcación</option>
                      <option v-for="c in canoas" :key="c.id" :value="c.id" :disabled="!c.disponible">
                        {{ c.nombre }} {{ !c.disponible ? '— No disponible' : '' }}
                      </option>
                    </select>
                    <span class="select-arrow">▾</span>
                  </div>
                </div>
                <div v-if="form.canoa" class="canoa-badge">
                  <span>{{ canoas.find(c => c.id === form.canoa)?.tipo }}</span>
                  <span class="dot">·</span>
                  <span>Capacidad: {{ canoas.find(c => c.id === form.canoa)?.capacidad }} persona(s)</span>
                </div>
              </section>

              <!-- Sección: Equipamiento -->
              <section class="form-section">
                <h3 class="section-title">
                  <span class="section-icon">🛟</span> Equipamiento
                </h3>

                <div class="equip-item">
                  <div class="equip-info">
                    <span class="equip-name">Chaleco salvavidas</span>
                    <span class="equip-sub">Obligatorio por seguridad</span>
                  </div>
                  <div class="toggle-group">
                    <button
                      class="toggle-btn"
                      :class="{ active: form.chalecoPropio === false }"
                      @click="form.chalecoPropio = false"
                      type="button"
                    >Del club</button>
                    <button
                      class="toggle-btn"
                      :class="{ active: form.chalecoPropio === true }"
                      @click="form.chalecoPropio = true"
                      type="button"
                    >Propio</button>
                  </div>
                </div>

                <div class="equip-item">
                  <div class="equip-info">
                    <span class="equip-name">Remo</span>
                    <span class="equip-sub">Paddle / canalete</span>
                  </div>
                  <div class="toggle-group">
                    <button
                      class="toggle-btn"
                      :class="{ active: form.remoPropio === false }"
                      @click="form.remoPropio = false"
                      type="button"
                    >Del club</button>
                    <button
                      class="toggle-btn"
                      :class="{ active: form.remoPropio === true }"
                      @click="form.remoPropio = true"
                      type="button"
                    >Propio</button>
                  </div>
                </div>

                <div class="equip-item">
                  <div class="equip-info">
                    <span class="equip-name">Casco</span>
                    <span class="equip-sub">Opcional según zona</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" v-model="form.casco" />
                    <span class="switch-track"></span>
                  </label>
                </div>
              </section>

              <!-- Nota -->
              <section class="form-section">
                <div class="field-group">
                  <label class="field-label">Nota (opcional)</label>
                  <textarea v-model="form.nota" class="field-textarea" rows="2" placeholder="Ej: Salida en grupo, aguas tranquilas..."></textarea>
                </div>
              </section>

              <!-- CTA -->
              <button
                class="submit-btn"
                :disabled="!isFormValid"
                @click="submit"
                type="button"
              >
                <span>Confirmar reserva</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>

            <!-- RIGHT: Timeline del día -->
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
                  v-for="time in times"
                  :key="time"
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
                      <div
                        v-for="(s, i) in salidasPorTime(time)"
                        :key="i"
                        class="tl-chip"
                        :class="s.cupos === 0 ? 'chip-full' : 'chip-available'"
                      >
                        <span class="chip-boat">{{ s.embarcacion || '🛶' }}</span>
                        <span>{{ s.cupos === 0 ? 'Sin cupos' : s.cupos + ' cupo' + (s.cupos !== 1 ? 's' : '') }}</span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="tl-empty">Libre</span>
                    </template>

                    <!-- Indicador de selección -->
                    <div v-if="form.hora === time" class="tl-selected-indicator">
                      <span>← Tu reserva</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { defineComponent, computed, reactive, watch } from 'vue'

export default defineComponent({
  name: 'DayAgendaModal',
  props: {
    date:    { type: String,  required: true },
    salidas: { type: Array,   default: () => [] },
    visible: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],

  setup(props, { emit }) {

    // ── Horarios 08:00 → 19:00 en intervalos de 30min ──
    const times = []
    for (let h = 8; h <= 19; h++) {
      times.push(`${String(h).padStart(2,'0')}:00`)
      if (h < 19) times.push(`${String(h).padStart(2,'0')}:30`)
    }

    // ── Canoas de ejemplo ──
    const canoas = [
      { id: 'k1', nombre: 'Kayak Azul #1',    tipo: 'Kayak individual',  capacidad: 1, disponible: true  },
      { id: 'k2', nombre: 'Kayak Azul #2',    tipo: 'Kayak individual',  capacidad: 1, disponible: true  },
      { id: 'c1', nombre: 'Canoa Roja #1',    tipo: 'Canoa doble',       capacidad: 2, disponible: true  },
      { id: 'c2', nombre: 'Canoa Roja #2',    tipo: 'Canoa doble',       capacidad: 2, disponible: false },
      { id: 'c3', nombre: 'Canoa Verde #3',   tipo: 'Canoa grupal',      capacidad: 4, disponible: true  },
    ]

    const duraciones = [
      { value: '30',  label: '30 min' },
      { value: '60',  label: '1 hora' },
      { value: '90',  label: '1:30 h' },
      { value: '120', label: '2 horas' },
    ]

    // ── Formulario ──
    const form = reactive({
      hora:         '',
      duracion:     '60',
      canoa:        '',
      chalecoPropio: false,
      remoPropio:   false,
      casco:        false,
      nota:         '',
    })

    // Reset al abrir/cerrar
    watch(() => props.visible, (v) => {
      if (!v) {
        Object.assign(form, { hora: '', duracion: '60', canoa: '', chalecoPropio: false, remoPropio: false, casco: false, nota: '' })
      }
    })

    const dateLabel = computed(() => {
      const d = new Date(props.date + 'T12:00:00')
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    })

    const salidasPorTime = (time) => props.salidas.filter(s => s.hora === time)

    // Muestra si el horario tiene cupos o está completo
    const availableTimes = computed(() =>
      times.map(t => {
        const salidas = salidasPorTime(t)
        const allFull = salidas.length > 0 && salidas.every(s => s.cupos === 0)
        return {
          value:    t,
          label:    allFull ? `${t} — Sin cupos` : t,
          disabled: allFull,
        }
      })
    )

    const isFormValid = computed(() =>
      form.hora !== '' && form.canoa !== ''
    )

    const selectHour = (time) => {
      const t = availableTimes.value.find(at => at.value === time)
      if (t && !t.disabled) form.hora = time
    }

    const close  = () => emit('close')
    const submit = () => {
      if (!isFormValid.value) return
      emit('submit', { ...form, date: props.date })
      close()
    }

    return {
      times, canoas, duraciones, form,
      dateLabel, salidasPorTime, availableTimes,
      isFormValid, selectHour, close, submit,
    }
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

/* ── Tokens ──────────────────────────────────── */
:root {
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
  --radius:   14px;
  --shadow:   0 24px 60px rgba(10, 30, 50, 0.18), 0 4px 16px rgba(10, 30, 50, 0.08);
}

/* ── Backdrop ────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 24, 40, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

/* ── Modal ───────────────────────────────────── */
.modal {
  font-family: 'DM Sans', sans-serif;
  background: #fff;
  border-radius: var(--radius);
  width: 100%;
  max-width: 860px;
  max-height: 92vh;
  overflow: hidden;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
}

/* ── Header ──────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--foam);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  font-size: 2rem;
  line-height: 1;
}

.header-sup {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ocean);
  font-weight: 600;
  margin: 0 0 2px;
}

.header-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.4rem;
  color: var(--text);
  margin: 0;
  text-transform: capitalize;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.close-btn:hover { background: #fdecea; color: var(--red); border-color: #f5c6c2; }

/* ── Body (two columns) ──────────────────────── */
.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

/* ── Form column ─────────────────────────────── */
.form-col {
  padding: 20px 22px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon { font-size: 1rem; }

.field-group { margin-bottom: 12px; }

.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.select-wrapper {
  position: relative;
}

.field-select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: var(--text);
  background: #fff;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field-select:focus {
  outline: none;
  border-color: var(--ocean);
  box-shadow: 0 0 0 3px var(--ocean-lt);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
  font-size: 0.8rem;
}

.canoa-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 6px 10px;
  background: var(--ocean-lt);
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--ocean-dk);
  font-weight: 500;
}

.dot { color: var(--muted); }

/* Duration pills */
.duration-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}

.pill:hover { border-color: var(--ocean); color: var(--ocean); }
.pill.active {
  background: var(--ocean);
  border-color: var(--ocean);
  color: #fff;
}

/* Equipment rows */
.equip-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.equip-item:last-child { border-bottom: none; }

.equip-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.equip-name {
  font-size: 0.87rem;
  font-weight: 500;
  color: var(--text);
}

.equip-sub {
  font-size: 0.74rem;
  color: var(--muted);
}

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
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-btn + .toggle-btn { border-left: 1px solid var(--border); }
.toggle-btn.active { background: var(--ocean); color: #fff; }

/* Switch */
.switch { position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer; }
.switch input { opacity: 0; width: 0; height: 0; }

.switch-track {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: 999px;
  transition: background 0.2s;
}

.switch-track::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.switch input:checked + .switch-track { background: var(--ocean); }
.switch input:checked + .switch-track::before { transform: translateX(18px); }

/* Textarea */
.field-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.86rem;
  color: var(--text);
  resize: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.field-textarea:focus {
  outline: none;
  border-color: var(--ocean);
  box-shadow: 0 0 0 3px var(--ocean-lt);
}

/* Submit */
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
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.15s, opacity 0.15s, transform 0.1s;
}

.submit-btn:hover:not(:disabled) { background: var(--ocean-dk); transform: translateY(-1px); }
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Timeline column ──────────────────────────── */
.timeline-col {
  border-left: 1px solid var(--border);
  background: var(--sand);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.timeline-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.legend {
  display: flex;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.available { background: var(--green); }
.legend-dot.full      { background: var(--red); }

/* Timeline scroll */
.timeline {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.timeline-row {
  display: grid;
  grid-template-columns: 48px 20px 1fr;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 16px;
  cursor: pointer;
  border-radius: 8px;
  margin: 0 8px;
  transition: background 0.12s;
  min-height: 36px;
}

.timeline-row:hover { background: rgba(10, 126, 164, 0.06); }
.timeline-row.selected-hour { background: var(--ocean-lt); }

.tl-time {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  padding-top: 6px;
  text-align: right;
}

.selected-hour .tl-time { color: var(--ocean); }

.tl-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
  height: 100%;
}

.tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: #fff;
  flex-shrink: 0;
  transition: all 0.15s;
}

.tl-dot.active {
  border-color: var(--ocean);
  background: var(--ocean);
}

.selected-hour .tl-dot {
  border-color: var(--ocean);
  background: var(--ocean);
  box-shadow: 0 0 0 3px var(--ocean-lt);
}

.tl-track {
  width: 2px;
  flex: 1;
  background: var(--border);
  margin-top: 3px;
}

.tl-content {
  padding: 4px 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.tl-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 500;
}

.chip-available {
  background: var(--green-lt);
  color: var(--green);
}

.chip-full {
  background: var(--red-lt);
  color: var(--red);
  text-decoration: line-through;
}

.chip-boat { font-size: 0.9rem; }

.tl-empty {
  font-size: 0.76rem;
  color: #c0c8d4;
  font-style: italic;
}

.tl-selected-indicator {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ocean);
  padding: 2px 8px;
  background: var(--ocean-lt);
  border-radius: 20px;
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

/* ── Modal transition ────────────────────────── */
.modal-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.modal-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.modal-enter-from   { opacity: 0; transform: scale(0.96) translateY(8px); }
.modal-leave-to     { opacity: 0; transform: scale(0.97) translateY(4px); }

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 680px) {
  .modal-body {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow-y: auto;
  }

  .timeline-col {
    border-left: none;
    border-top: 1px solid var(--border);
    max-height: 300px;
  }

  .form-col { overflow-y: visible; }
  .modal { max-height: 95vh; overflow-y: auto; }
}
</style>