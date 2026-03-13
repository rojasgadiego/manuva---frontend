<template>
  <div class="form-panel">

    <!-- Topbar -->
    <div class="form-topbar">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Volver
      </button>

      <div class="form-date-badge">
        <div>
          <p class="badge-sup">Agendar salida</p>
          <p class="badge-title">{{ dateLabel }}</p>
        </div>
        <span class="badge-icon">🛶</span>
      </div>
    </div>

    <!-- Scrollable body -->
    <div class="form-body">

      <!-- ① Hora -->
      <div class="field-block">
        <label class="field-label">Hora de salida</label>
        <div class="select-wrapper">
          <select v-model="localForm.hora" class="field-select">
            <option value="" disabled>Selecciona una hora</option>
            <option v-for="t in availableTimes" :key="t.value" :value="t.value" :disabled="t.disabled">
              {{ t.label }}
            </option>
          </select>
          <svg class="select-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <!-- Timeline colapsable -->
        <button class="timeline-toggle" @click="showTimeline = !showTimeline" type="button">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Ver disponibilidad del día
          <svg class="chevron" :class="{ open: showTimeline }" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <Transition name="expand">
          <div v-if="showTimeline" class="timeline-inline">
            <div
              v-for="time in times" :key="time"
              class="tl-row"
              :class="{
                'tl-selected': localForm.hora === time,
                'tl-full': isTimeFull(time)
              }"
              @click="selectHour(time)"
            >
              <span class="tl-time">{{ time }}</span>
              <div class="tl-bar-wrap">
                <div class="tl-bar" :class="{ active: salidasPorTime(time).length > 0 || localForm.hora === time }"></div>
              </div>
              <span class="tl-status">
                <template v-if="salidasPorTime(time).length">
                  <span v-for="(s, i) in salidasPorTime(time)" :key="i" class="tl-pill" :class="s.cupos === 0 ? 'pill-full' : 'pill-ok'">
                    {{ s.cupos === 0 ? 'Completo' : s.cupos + ' cupo' + (s.cupos !== 1 ? 's' : '') }}
                  </span>
                </template>
                <span v-else class="tl-free">Libre</span>
              </span>
              <span v-if="localForm.hora === time" class="tl-mine">✓</span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ② Duración -->
      <div class="field-block">
        <label class="field-label">Duración</label>
        <div class="pill-row">
          <button
            v-for="d in duraciones" :key="d.value"
            class="dur-pill" :class="{ active: localForm.duracion === d.value }"
            @click="localForm.duracion = d.value" type="button"
          >{{ d.label }}</button>
        </div>
      </div>

      <!-- ③ Embarcación -->
      <div class="field-block">
        <label class="field-label">Embarcación</label>
        <div class="canoa-scroll-wrap">
          <div class="canoa-scroll" ref="canoeScroll" @scroll="onCanoeScroll">
            <button
              v-for="c in canoas" :key="c.id"
              class="canoa-card"
              :class="{ active: localForm.canoa === c.id, disabled: !c.disponible }"
              :disabled="!c.disponible"
              @click="localForm.canoa = c.id"
              type="button"
            >
              <div class="canoa-top">
                <span class="canoa-icon">{{ c.tipo.includes('Kayak') ? '🚣' : '⛵' }}</span>
                <span v-if="localForm.canoa === c.id" class="canoa-check">✓</span>
                <span v-else-if="!c.disponible" class="canoa-na">–</span>
              </div>
              <span class="canoa-nombre">{{ c.nombre }}</span>
              <span class="canoa-meta">{{ c.capacidad }} pers.</span>
            </button>
          </div>
          <div v-if="showFade" class="canoa-fade"></div>
        </div>
      </div>

      <!-- ④ Equipamiento -->
      <div class="field-block">
        <label class="field-label">Equipamiento</label>
        <div class="equip-list">
          <div class="equip-row">
            <div class="equip-left">
              <span class="equip-name">Chaleco salvavidas</span>
              <span class="equip-sub">Obligatorio por seguridad</span>
            </div>
            <div class="equip-right">
              <span class="equip-toggle-label">Propio</span>
              <div class="toggle-track" :class="{ on: localForm.chalecoPropio }" @click="localForm.chalecoPropio = !localForm.chalecoPropio">
                <div class="toggle-thumb"></div>
              </div>
            </div>
          </div>
          <div class="equip-row">
            <div class="equip-left">
              <span class="equip-name">Remo</span>
              <span class="equip-sub">Paddle / canalete</span>
            </div>
            <div class="equip-right">
              <span class="equip-toggle-label">Propio</span>
              <div class="toggle-track" :class="{ on: localForm.remoPropio }" @click="localForm.remoPropio = !localForm.remoPropio">
                <div class="toggle-thumb"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ⑤ Nota -->
      <div class="field-block">
        <label class="field-label">
          Nota <span class="optional">opcional</span>
        </label>
        <textarea
          v-model="localForm.nota"
          class="field-textarea"
          rows="2"
          placeholder="Ej: Salida en grupo, aguas tranquilas..."
        ></textarea>
      </div>

    </div>

    <!-- Footer fijo con CTA -->
    <div class="form-footer">
      <button class="submit-btn" :disabled="!isFormValid" @click="handleSubmit" type="button">
        Confirmar reserva
      </button>
    </div>

  </div>
</template>

<script>
import { defineComponent, reactive, computed, watch, ref } from 'vue'

export default defineComponent({
  name: 'BookingFormPanel',

  props: {
    selectedDay: {
      type: Object,
      default: null,
    },
  },

  emits: ['go-back', 'submit'],

  setup(props, { emit }) {
    const showTimeline = ref(false)
    const showFade     = ref(true)
    const canoeScroll  = ref(null)

    const onCanoeScroll = (e) => {
      const el = e.target
      showFade.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 4
    }

    const times = []
    for (let h = 8; h <= 19; h++) {
      times.push(`${String(h).padStart(2, '0')}:00`)
      if (h < 19) times.push(`${String(h).padStart(2, '0')}:30`)
    }

    const canoas = [
      { id: 'k1', nombre: 'Kayak Azul #1',  tipo: 'Kayak individual', capacidad: 1, disponible: true  },
      { id: 'k2', nombre: 'Kayak Azul #2',  tipo: 'Kayak individual', capacidad: 1, disponible: true  },
      { id: 'c1', nombre: 'Canoa Roja #1',  tipo: 'Canoa doble',      capacidad: 2, disponible: true  },
      { id: 'c2', nombre: 'Canoa Roja #2',  tipo: 'Canoa doble',      capacidad: 2, disponible: false },
      { id: 'c3', nombre: 'Canoa Verde #3', tipo: 'Canoa grupal',     capacidad: 4, disponible: true  },
    ]

    const duraciones = [
      { value: '30',  label: '30 min'  },
      { value: '60',  label: '1 hora'  },
      { value: '90',  label: '1:30 h'  },
      { value: '120', label: '2 horas' },
    ]

    const localForm = reactive({
      hora: '', duracion: '60', canoa: '',
      chalecoPropio: false, remoPropio: false, nota: '',
    })

    const resetForm = () =>
      Object.assign(localForm, {
        hora: '', duracion: '60', canoa: '',
        chalecoPropio: false, remoPropio: false, nota: '',
      })

    watch(() => props.selectedDay?.date, () => {
      resetForm()
      showTimeline.value = false
    })

    const dateLabel = computed(() => {
      if (!props.selectedDay) return ''
      const d = new Date(props.selectedDay.date + 'T12:00:00')
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    })

    const salidasPorTime = (time) =>
      (props.selectedDay?.salidas || []).filter(s => s.hora === time)

    const isTimeFull = (time) => {
      const sal = salidasPorTime(time)
      return sal.length > 0 && sal.every(s => s.cupos === 0)
    }

    const availableTimes = computed(() =>
      times.map(t => ({
        value: t,
        label: isTimeFull(t) ? `${t} — Sin cupos` : t,
        disabled: isTimeFull(t),
      }))
    )

    const isFormValid = computed(() => localForm.hora !== '' && localForm.canoa !== '')

    const selectHour = (time) => {
      if (!isTimeFull(time)) localForm.hora = time
    }

    const handleSubmit = () => {
      if (!isFormValid.value) return
      emit('submit', { ...localForm, date: props.selectedDay?.date })
      resetForm()
    }

    return {
      showTimeline, showFade, canoeScroll, onCanoeScroll,
      times, canoas, duraciones, localForm, dateLabel,
      salidasPorTime, isTimeFull, availableTimes, isFormValid,
      selectHour, handleSubmit,
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

* { box-sizing: border-box; }

/* ─────────────────────────────────────────────────────
   El formulario hereda las variables CSS definidas en
   AppLayout (.dark / .light) y no define colores fijos.
   Fallbacks para cuando se usa fuera del layout.
───────────────────────────────────────────────────── */
.form-panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--content-bg, #f8fafc);
  border-radius: 14px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  transition: background 0.25s ease;

  /* Tokens de estado — fijos en ambos temas */
  --cyan:       #38bdf8;
  --cyan-dim:   rgba(56, 189, 248, 0.1);
  --cyan-ring:  rgba(56, 189, 248, 0.2);
  --green:      #22c55e;
  --green-dim:  rgba(34, 197, 94, 0.1);
  --red:        #ef4444;
  --red-dim:    rgba(239, 68, 68, 0.1);
}

/* ── Topbar ─────────────────────────────────────────── */
.form-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--surface-bg, #ffffff);
  border-bottom: 0.5px solid var(--surface-border, #e2e8f0);
  flex-shrink: 0;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.15s;
}
.back-btn:hover { color: var(--cyan); }

.form-date-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: right;
}

.badge-icon { font-size: 1.3rem; line-height: 1; }

.badge-sup {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--cyan);
  font-weight: 600;
}

.badge-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  text-transform: capitalize;
  line-height: 1.2;
  letter-spacing: -0.2px;
  transition: color 0.25s ease;
}

/* ── Body ───────────────────────────────────────────── */
.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px 8px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-border, #e2e8f0) transparent;
}

/* ── Field blocks ───────────────────────────────────── */
.field-block { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
  display: flex;
  align-items: center;
  gap: 6px;
}

.optional {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-style: italic;
  font-size: 0.75rem;
}

/* ── Select ─────────────────────────────────────────── */
.select-wrapper { position: relative; }

.field-select {
  width: 100%;
  padding: 11px 38px 11px 13px;
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: var(--text-primary, #0f172a);
  background: var(--surface-bg, #ffffff);
  appearance: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.25s, color 0.25s;
}

.field-select:focus {
  outline: none;
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px var(--cyan-ring);
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary, #64748b);
  pointer-events: none;
}

/* ── Timeline toggle ────────────────────────────────── */
.timeline-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
  width: fit-content;
}
.timeline-toggle:hover { color: var(--cyan); }
.chevron { transition: transform 0.2s; }
.chevron.open { transform: rotate(180deg); }

/* ── Timeline inline ────────────────────────────────── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 600px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to { opacity: 0; max-height: 0; }

.timeline-inline {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.tl-row {
  display: grid;
  grid-template-columns: 44px 10px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 0.5px solid var(--surface-border, #e2e8f0);
}
.tl-row:last-child { border-bottom: none; }
.tl-row:hover:not(.tl-full) { background: var(--cyan-dim); }
.tl-row.tl-selected          { background: var(--cyan-dim); }
.tl-row.tl-full               { opacity: 0.4; cursor: not-allowed; }

.tl-time {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  font-variant-numeric: tabular-nums;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.tl-selected .tl-time { color: var(--cyan); }

.tl-bar-wrap { display: flex; align-items: center; }
.tl-bar {
  width: 2.5px; height: 18px;
  border-radius: 2px;
  background: var(--surface-border, #e2e8f0);
  transition: background 0.15s;
}
.tl-bar.active { background: var(--cyan); }

.tl-status { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }

.tl-pill {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.pill-ok   { background: var(--green-dim); color: var(--green); }
.pill-full { background: var(--red-dim);   color: var(--red);   }

.tl-free { font-size: 0.7rem; color: var(--text-secondary, #64748b); font-style: italic; opacity: 0.6; }
.tl-mine { font-size: 0.72rem; font-weight: 700; color: var(--cyan); }

/* ── Duración pills ─────────────────────────────────── */
.pill-row { display: flex; gap: 6px; flex-wrap: wrap; }

.dur-pill {
  padding: 8px 0;
  border-radius: 8px;
  border: 0.5px solid var(--surface-border, #e2e8f0);
  background: var(--surface-bg, #ffffff);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  flex: 1;
  min-width: 60px;
  text-align: center;
}
.dur-pill:hover { border-color: var(--cyan); color: var(--cyan); }
.dur-pill.active {
  background: var(--cyan-dim);
  border-color: var(--cyan);
  color: var(--cyan);
  font-weight: 600;
}

/* ── Embarcaciones ──────────────────────────────────── */
.canoa-scroll-wrap { position: relative; }

.canoa-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.canoa-scroll::-webkit-scrollbar { display: none; }

.canoa-fade {
  position: absolute;
  top: 0; right: 0;
  width: 48px;
  height: calc(100% - 4px);
  background: linear-gradient(to right, transparent, var(--content-bg, #f8fafc));
  pointer-events: none;
  border-radius: 0 10px 10px 0;
}

.canoa-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 11px 8px 9px;
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  background: var(--surface-bg, #ffffff);
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: border-color 0.15s, background 0.15s;
  flex-shrink: 0;
  width: 88px;
  text-align: center;
}
.canoa-card:hover:not(.disabled) {
  border-color: var(--cyan);
  background: var(--cyan-dim);
}
.canoa-card.active {
  border-color: var(--cyan);
  background: var(--cyan-dim);
}
.canoa-card.disabled { opacity: 0.35; cursor: not-allowed; }

.canoa-top {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 2px;
}
.canoa-icon { font-size: 1.6rem; line-height: 1; }

.canoa-check {
  position: absolute; top: -2px; right: 4px;
  font-size: 0.65rem; font-weight: 700;
  color: var(--cyan);
  background: var(--cyan-dim);
  border-radius: 50%;
  width: 15px; height: 15px;
  display: flex; align-items: center; justify-content: center;
}
.canoa-na {
  position: absolute; top: -2px; right: 4px;
  font-size: 0.65rem;
  color: var(--text-secondary, #64748b);
}

.canoa-nombre {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  line-height: 1.2;
  transition: color 0.25s ease;
}
.canoa-meta {
  font-size: 0.65rem;
  color: var(--text-secondary, #64748b);
}

/* ── Equipamiento ───────────────────────────────────── */
.equip-list {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.equip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 0.5px solid var(--surface-border, #e2e8f0);
}
.equip-row:last-child { border-bottom: none; }

.equip-left  { display: flex; flex-direction: column; gap: 2px; }
.equip-name  {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary, #0f172a);
  transition: color 0.25s ease;
}
.equip-sub   { font-size: 0.7rem; color: var(--text-secondary, #64748b); }

.equip-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.equip-toggle-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  font-weight: 500;
  user-select: none;
}

/* Toggle switch */
.toggle-track {
  width: 38px; height: 22px;
  border-radius: 999px;
  background: var(--surface-border, #e2e8f0);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-track.on { background: var(--cyan); }

.toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}
.toggle-track.on .toggle-thumb { transform: translateX(16px); }

/* ── Textarea ───────────────────────────────────────── */
.field-textarea {
  width: 100%;
  padding: 11px 13px;
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: var(--text-primary, #0f172a);
  background: var(--surface-bg, #ffffff);
  resize: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.25s, color 0.25s;
}
.field-textarea:focus {
  outline: none;
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px var(--cyan-ring);
}
.field-textarea::placeholder { color: var(--text-secondary, #64748b); opacity: 0.5; }

/* ── Footer CTA ─────────────────────────────────────── */
.form-footer {
  padding: 13px 18px;
  background: var(--surface-bg, #ffffff);
  border-top: 0.5px solid var(--surface-border, #e2e8f0);
  flex-shrink: 0;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.submit-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: #0f1117;
  border: none;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity 0.15s, transform 0.1s;
}
.submit-btn:hover:not(:disabled)  { opacity: 0.9; transform: translateY(-1px); }
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled              { opacity: 0.3; cursor: not-allowed; }
</style>