<template>
  <div class="form-panel">

    <!-- Topbar -->
    <div class="form-topbar">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Volver
      </button>

      <div class="form-date-badge">
        <span class="badge-icon">🛶</span>
        <div>
          <p class="badge-sup">Agendar salida</p>
          <p class="badge-title">{{ dateLabel }}</p>
        </div>
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
          <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <!-- Timeline colapsable -->
        <button class="timeline-toggle" @click="showTimeline = !showTimeline" type="button">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Ver disponibilidad del día
          <svg class="chevron" :class="{ open: showTimeline }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
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
        <label class="field-label">Nota <span class="optional">opcional</span></label>
        <textarea v-model="localForm.nota" class="field-textarea" rows="2" placeholder="Ej: Salida en grupo, aguas tranquilas..."></textarea>
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
    const showFade = ref(true)
    const canoeScroll = ref(null)

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
      Object.assign(localForm, { hora: '', duracion: '60', canoa: '', chalecoPropio: false, remoPropio: false, nota: '' })

    watch(() => props.selectedDay?.date, () => { resetForm(); showTimeline.value = false })

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
      showTimeline, showFade, canoeScroll, onCanoeScroll, times, canoas, duraciones,
      localForm, dateLabel,
      salidasPorTime, isTimeFull, availableTimes, isFormValid,
      selectHour, handleSubmit,
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Serif+Display&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.form-panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f8f9fb;
  border-radius: 16px;
  overflow-y: auto;
  font-family: 'DM Sans', sans-serif;

  --ocean:    #0a7ea4;
  --ocean-lt: #e8f5fb;
  --ocean-dk: #064e68;
  --text:     #161e2a;
  --muted:    #7a8899;
  --border:   #e3e8ee;
  --surface:  #ffffff;
  --green:    #0d9066;
  --green-lt: #e6f7f2;
  --red:      #c0392b;
  --red-lt:   #fdecea;
}

/* ── Topbar ── */
.form-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: .82rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  padding: 4px 0;
  transition: color .15s;
}
.back-btn:hover { color: var(--ocean); }

.form-date-badge { display: flex; align-items: center; gap: 9px; text-align: right; }
.badge-icon { font-size: 1.4rem; line-height: 1; }
.badge-sup {
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .09em;
  color: var(--ocean);
  font-weight: 600;
}
.badge-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1rem;
  color: var(--text);
  text-transform: capitalize;
  line-height: 1.2;
}

/* ── Body ── */
.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px 8px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

/* ── Field blocks ── */
.field-block { display: flex; flex-direction: column; gap: 10px; }

.field-label {
  font-size: .75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.optional {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-style: italic;
  font-size: .75rem;
}

/* ── Select ── */
.select-wrapper { position: relative; }
.field-select {
  width: 100%;
  padding: 13px 40px 13px 14px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: .9rem;
  color: var(--text);
  background: var(--surface);
  appearance: none;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.field-select:focus { outline: none; border-color: var(--ocean); box-shadow: 0 0 0 3px var(--ocean-lt); }
.select-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}

/* ── Timeline toggle ── */
.timeline-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: .78rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
  transition: color .15s;
  width: fit-content;
}
.timeline-toggle:hover { color: var(--ocean); }
.chevron { transition: transform .2s; }
.chevron.open { transform: rotate(180deg); }

/* ── Timeline inline ── */
.expand-enter-active, .expand-leave-active {
  transition: opacity .2s ease, max-height .25s ease;
  max-height: 600px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }

.timeline-inline {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.tl-row {
  display: grid;
  grid-template-columns: 44px 12px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background .12s;
  border-bottom: 1px solid var(--border);
}
.tl-row:last-child { border-bottom: none; }
.tl-row:hover:not(.tl-full) { background: var(--ocean-lt); }
.tl-row.tl-selected { background: var(--ocean-lt); }
.tl-row.tl-full { opacity: .45; cursor: not-allowed; }

.tl-time {
  font-size: .75rem;
  font-weight: 600;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.tl-selected .tl-time { color: var(--ocean); }

.tl-bar-wrap { display: flex; align-items: center; }
.tl-bar {
  width: 3px;
  height: 20px;
  border-radius: 2px;
  background: var(--border);
  transition: background .15s;
}
.tl-bar.active { background: var(--ocean); }

.tl-status { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }

.tl-pill {
  font-size: .68rem;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 20px;
}
.pill-ok   { background: var(--green-lt); color: var(--green); }
.pill-full { background: var(--red-lt); color: var(--red); }

.tl-free { font-size: .72rem; color: #bec7d0; font-style: italic; }
.tl-mine { font-size: .75rem; font-weight: 700; color: var(--ocean); }

/* ── Duración pills ── */
.pill-row { display: flex; gap: 8px; flex-wrap: wrap; }

.dur-pill {
  padding: 9px 16px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  font-family: 'DM Sans', sans-serif;
  font-size: .84rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all .15s;
  flex: 1;
  min-width: 70px;
  text-align: center;
}
.dur-pill:hover  { border-color: var(--ocean); color: var(--ocean); }
.dur-pill.active { background: var(--ocean); border-color: var(--ocean); color: #fff; font-weight: 600; }

/* ── Embarcaciones ── */
.canoa-scroll-wrap {
  position: relative;
}

.canoa-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
}
.canoa-scroll::-webkit-scrollbar { display: none; }

.canoa-fade {
  position: absolute;
  top: 0;
  right: 0;
  width: 56px;
  height: calc(100% - 6px);
  background: linear-gradient(to right, transparent, #f8f9fb);
  pointer-events: none;
  border-radius: 0 14px 14px 0;
}

.canoa-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 10px 10px;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all .15s;
  flex-shrink: 0;
  width: 100px;
  text-align: center;
}
.canoa-card:hover:not(.disabled) { border-color: var(--ocean); background: var(--ocean-lt); }
.canoa-card.active { border-color: var(--ocean); background: var(--ocean-lt); }
.canoa-card.disabled { opacity: .38; cursor: not-allowed; }

.canoa-top {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 2px;
}
.canoa-icon { font-size: 1.8rem; line-height: 1; }
.canoa-check {
  position: absolute;
  top: -2px;
  right: 4px;
  font-size: .7rem;
  font-weight: 700;
  color: var(--ocean);
  background: var(--ocean-lt);
  border-radius: 50%;
  width: 16px; height: 16px;
  display: flex; align-items: center; justify-content: center;
}
.canoa-na {
  position: absolute;
  top: -2px;
  right: 4px;
  font-size: .7rem;
  color: var(--muted);
}
.canoa-nombre { font-size: .72rem; font-weight: 600; color: var(--text); line-height: 1.2; }
.canoa-meta   { font-size: .67rem; color: var(--muted); }

/* ── Equipamiento ── */
.equip-list {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.equip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 14px;
  border-bottom: 1px solid var(--border);
}
.equip-row:last-child { border-bottom: none; }

.equip-left { display: flex; flex-direction: column; gap: 2px; }
.equip-name { font-size: .86rem; font-weight: 500; color: var(--text); }
.equip-sub  { font-size: .72rem; color: var(--muted); }

.equip-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.equip-toggle-label {
  font-size: .76rem;
  color: var(--muted);
  font-weight: 500;
  user-select: none;
}

/* Toggle switch */
.toggle-track {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: var(--border);
  cursor: pointer;
  position: relative;
  transition: background .2s;
  flex-shrink: 0;
}
.toggle-track.on { background: var(--ocean); }
.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.18);
  transition: transform .2s;
}
.toggle-track.on .toggle-thumb { transform: translateX(18px); }

/* ── Textarea ── */
.field-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: .86rem;
  color: var(--text);
  background: var(--surface);
  resize: none;
  transition: border-color .15s, box-shadow .15s;
}
.field-textarea:focus { outline: none; border-color: var(--ocean); box-shadow: 0 0 0 3px var(--ocean-lt); }
.field-textarea::placeholder { color: #b0bcc8; }

/* ── Footer CTA ── */
.form-footer {
  padding: 14px 18px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: var(--ocean);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: .92rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: .02em;
  transition: background .15s, transform .1s, opacity .15s;
}
.submit-btn:hover:not(:disabled) { background: var(--ocean-dk); transform: translateY(-1px); }
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: .35; cursor: not-allowed; }
</style>