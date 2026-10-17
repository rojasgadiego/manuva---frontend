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
          <p class="badge-sup">Agenda del día</p>
          <p class="badge-title">{{ dateLabel }}</p>
        </div>
        <span class="badge-icon">🛶</span>
      </div>
    </div>

    <!-- Scrollable body -->
    <div class="form-body">

      <!-- Requisitos pendientes para reservar / unirse -->
      <div v-if="dia && !dia.requisitos.puedeReservar" class="notice notice--warn">
        <p class="notice__title">Todavía no puedes reservar ni unirte a salidas</p>
        <ul class="notice__list">
          <li v-for="p in dia.requisitos.pendientes" :key="p">{{ p }}</li>
        </ul>
        <p class="notice__hint">Regulariza estos puntos con la directiva del club.</p>
      </div>

      <!-- ① Salidas del día -->
      <div class="field-block">
        <label class="field-label">Salidas de este día</label>

        <div v-if="cargandoDia" class="day-list">
          <div v-for="i in 2" :key="i" class="day-item day-item--skeleton"></div>
        </div>

        <p v-else-if="!salidasDia.length" class="empty-note">
          Aún no hay salidas este día. {{ puedeCrear ? '¡Crea la primera abajo!' : '' }}
        </p>

        <div v-else class="day-list">
          <div v-for="s in salidasDia" :key="s.id" class="day-item" :class="{ 'day-item--mine': s.soyParticipante }">
            <div class="day-item__time">
              <span class="day-item__hora">{{ hora(s.fechaHoraProgramada) }}</span>
              <span class="day-item__dur">{{ s.duracionMin }} min</span>
            </div>

            <div class="day-item__info">
              <p class="day-item__title">
                {{ s.nombreCanoa || s.codigoCanoa }}
                <span class="chip">{{ s.tipoCanoa }}</span>
                <span v-if="s.estado !== 'Reservada'" class="chip chip--estado">{{ s.estado }}</span>
              </p>
              <p class="day-item__meta">
                Responsable: {{ s.soyResponsable ? 'tú' : s.responsable }}
              </p>
              <div class="seats" :aria-label="`${s.participantes} de ${s.capacidadMax} cupos ocupados`">
                <span
                  v-for="i in s.capacidadMax" :key="i"
                  class="seat" :class="i <= s.participantes ? 'seat--taken' : 'seat--open'"
                ></span>
                <span class="seats__label" :class="{ 'seats__label--full': s.cuposLibres <= 0 }">
                  {{ s.cuposLibres > 0 ? `${s.cuposLibres} libre${s.cuposLibres !== 1 ? 's' : ''}` : 'Completa' }}
                </span>
              </div>
            </div>

            <div class="day-item__actions">
              <button
                v-if="puedeUnirse(s)"
                class="btn btn--primary" :disabled="accionEnCurso === s.id"
                @click="unirse(s)" type="button"
              >Unirme</button>
              <button
                v-else-if="s.soyParticipante && !s.soyResponsable && esFutura(s)"
                class="btn btn--ghost" :disabled="accionEnCurso === s.id"
                @click="salir(s)" type="button"
              >Salir</button>
              <router-link :to="`/salidas/${s.id}`" class="btn btn--link">Ver</router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-if="dia && !dia.dentroDeVentana" class="notice">
        Las reservas se abren con hasta {{ dia.diasAnticipacion }} días de anticipación.
        Vuelve más cerca de la fecha para crear una salida este día.
      </div>

      <template v-if="puedeCrear">
        <div class="section-split">
          <span>Nueva salida</span>
        </div>

        <!-- ② Hora -->
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
                v-for="t in availableTimes" :key="t.value"
                class="tl-row"
                :class="{ 'tl-selected': localForm.hora === t.value, 'tl-full': t.disabled }"
                @click="selectHour(t)"
              >
                <span class="tl-time">{{ t.value }}</span>
                <div class="tl-bar-wrap">
                  <div class="tl-bar" :class="{ active: salidasPorHora(t.value).length > 0 || localForm.hora === t.value }"></div>
                </div>
                <span class="tl-status">
                  <template v-if="salidasPorHora(t.value).length">
                    <span v-for="s in salidasPorHora(t.value)" :key="s.id" class="tl-pill" :class="s.cuposLibres <= 0 ? 'pill-full' : 'pill-ok'">
                      {{ s.tipoCanoa }} · {{ s.cuposLibres <= 0 ? 'completa' : s.cuposLibres + ' cupo' + (s.cuposLibres !== 1 ? 's' : '') }}
                    </span>
                  </template>
                  <span v-else-if="t.pasada" class="tl-free">Ya pasó</span>
                  <span v-else class="tl-free">Libre</span>
                </span>
                <span v-if="localForm.hora === t.value" class="tl-mine">✓</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- ③ Duración -->
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

        <!-- ④ Embarcación -->
        <div class="field-block">
          <label class="field-label">Embarcación</label>

          <p v-if="!localForm.hora" class="empty-note">Elige una hora para ver las canoas libres en ese horario.</p>
          <div v-else-if="cargandoCanoas" class="canoa-scroll">
            <div v-for="i in 3" :key="i" class="canoa-card canoa-card--skeleton"></div>
          </div>
          <p v-else-if="!canoas.length" class="empty-note">No quedan canoas libres en ese horario. Prueba otra hora.</p>

          <div v-else class="canoa-scroll-wrap">
            <div class="canoa-scroll" ref="canoeScroll" @scroll="onCanoeScroll">
              <button
                v-for="c in canoas" :key="c.id"
                class="canoa-card"
                :class="{ active: localForm.canoa === c.id }"
                @click="localForm.canoa = c.id"
                type="button"
              >
                <div class="canoa-top">
                  <span class="canoa-icon">{{ c.capacidadMax > 1 ? '🛶' : '🚣' }}</span>
                  <span v-if="localForm.canoa === c.id" class="canoa-check">✓</span>
                </div>
                <span class="canoa-nombre">{{ c.nombre || c.codigo }}</span>
                <span class="canoa-meta">{{ c.tipo }} · {{ c.capacidadMax }} pers.</span>
              </button>
            </div>
            <div v-if="showFade" class="canoa-fade"></div>
          </div>
        </div>
      </template>

      <!-- ⑤ Equipamiento (aplica al crear y al unirse) -->
      <div v-if="dia && dia.requisitos.puedeReservar" class="field-block">
        <label class="field-label">Tu equipamiento</label>
        <div class="equip-list">
          <div class="equip-row">
            <div class="equip-left">
              <span class="equip-name">Chaleco salvavidas</span>
              <span class="equip-sub">Obligatorio por seguridad</span>
            </div>
            <div class="equip-right">
              <span class="equip-toggle-label">Propio</span>
              <button type="button" class="toggle-track" :class="{ on: localForm.chalecoPropio }"
                      role="switch" :aria-checked="localForm.chalecoPropio" aria-label="Chaleco propio"
                      @click="localForm.chalecoPropio = !localForm.chalecoPropio">
                <span class="toggle-thumb"></span>
              </button>
            </div>
          </div>
          <div class="equip-row">
            <div class="equip-left">
              <span class="equip-name">Remo</span>
              <span class="equip-sub">Paddle / canalete</span>
            </div>
            <div class="equip-right">
              <span class="equip-toggle-label">Propio</span>
              <button type="button" class="toggle-track" :class="{ on: localForm.remoPropio }"
                      role="switch" :aria-checked="localForm.remoPropio" aria-label="Remo propio"
                      @click="localForm.remoPropio = !localForm.remoPropio">
                <span class="toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ⑥ Nota -->
      <div v-if="puedeCrear" class="field-block">
        <label class="field-label" for="nota-salida">
          Nota <span class="optional">opcional</span>
        </label>
        <textarea
          id="nota-salida"
          v-model="localForm.nota"
          class="field-textarea"
          rows="2"
          maxlength="500"
          placeholder="Ej: Salida en grupo, aguas tranquilas..."
        ></textarea>
      </div>

    </div>

    <!-- Footer fijo con CTA -->
    <div v-if="puedeCrear" class="form-footer">
      <button class="submit-btn" :disabled="!isFormValid || enviando" @click="handleSubmit" type="button">
        {{ enviando ? 'Reservando…' : 'Confirmar reserva' }}
      </button>
    </div>

  </div>
</template>

<script>
import { defineComponent, reactive, computed, watch, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import salidaService from '@/services/salida.service'
import clubService   from '@/services/club.service'
import { useToast }  from '@/utils/useToast'
import { mensajeError, limpiarMensaje } from '@/utils/apiError'

const pad = (n) => String(n).padStart(2, '0')

export default defineComponent({
  name: 'BookingFormPanel',

  props: {
    selectedDay: {
      type: Object,
      default: null,
    },
  },

  emits: ['go-back', 'cambio'],

  setup(props, { emit }) {
    const store = useStore()
    const { mostrarToast } = useToast()

    const showTimeline  = ref(false)
    const showFade      = ref(true)
    const canoeScroll   = ref(null)
    const dia           = ref(null)
    const cargandoDia   = ref(false)
    const canoas        = ref([])
    const cargandoCanoas = ref(false)
    const enviando      = ref(false)
    const accionEnCurso = ref(null)

    const onCanoeScroll = (e) => {
      const el = e.target
      showFade.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 4
    }

    const duraciones = [
      { value: '30',  label: '30 min'  },
      { value: '60',  label: '1 hora'  },
      { value: '90',  label: '1:30 h'  },
      { value: '120', label: '2 horas' },
    ]

    // Equipamiento propio por defecto según el perfil del remador
    const usuario = computed(() => store.getters['auth/currentUser'])
    const formVacio = () => ({
      hora: '', duracion: '60', canoa: null, nota: '',
      chalecoPropio: !!usuario.value?.tieneSalvavidasPropio,
      remoPropio:    !!usuario.value?.tieneRemoPropio,
    })
    const localForm = reactive(formVacio())

    const dateLabel = computed(() => {
      if (!props.selectedDay) return ''
      const d = new Date(props.selectedDay.date + 'T12:00:00')
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    })

    const salidasDia = computed(() => dia.value?.salidas ?? [])
    const puedeCrear = computed(() => !!dia.value?.requisitos.puedeReservar && !!dia.value?.dentroDeVentana)

    const hora = (iso) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
    const esFutura = (s) => new Date(s.fechaHoraProgramada) > new Date()
    const puedeUnirse = (s) =>
      !s.soyParticipante && s.cuposLibres > 0 && esFutura(s) &&
      ['Reservada', 'Confirmada'].includes(s.estado) && !!dia.value?.requisitos.puedeReservar

    // ── Horas ─────────────────────────────────────────
    const availableTimes = computed(() => {
      const ahora = new Date()
      const lista = []
      for (let h = 7; h <= 19; h++) {
        for (const m of [0, 30]) {
          if (h === 19 && m === 30) continue
          const value = `${pad(h)}:${pad(m)}`
          const pasada = new Date(`${props.selectedDay?.date}T${value}:00`) <= ahora
          lista.push({ value, pasada, disabled: pasada, label: pasada ? `${value} — ya pasó` : value })
        }
      }
      return lista
    })

    const salidasPorHora = (value) => salidasDia.value.filter(s => hora(s.fechaHoraProgramada) === value)

    const selectHour = (t) => { if (!t.disabled) localForm.hora = t.value }

    const isFormValid = computed(() => puedeCrear.value && localForm.hora !== '' && localForm.canoa !== null)

    // ── Carga de datos ────────────────────────────────
    const cargarDia = async () => {
      if (!props.selectedDay) return
      cargandoDia.value = true
      try {
        const res = await salidaService.getDia(props.selectedDay.date)
        dia.value = res.data.data
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cargar la agenda del día.'), 'error', 5000)
      } finally {
        cargandoDia.value = false
      }
    }

    const cargarCanoas = async () => {
      canoas.value = []
      if (!localForm.hora || !puedeCrear.value) return
      cargandoCanoas.value = true
      try {
        const res = await clubService.canoasDisponibles(
          `${props.selectedDay.date}T${localForm.hora}:00`, Number(localForm.duracion))
        canoas.value = res.data.data ?? []
        if (!canoas.value.some(c => c.id === localForm.canoa)) localForm.canoa = null
      } catch (e) {
        mostrarToast(limpiarMensaje(mensajeError(e, 'No se pudieron cargar las canoas.')), 'error', 5000)
      } finally {
        cargandoCanoas.value = false
      }
    }

    watch(() => [localForm.hora, localForm.duracion], cargarCanoas)

    watch(() => props.selectedDay?.date, () => {
      Object.assign(localForm, formVacio())
      showTimeline.value = false
      cargarDia()
    })

    onMounted(cargarDia)

    // ── Acciones ──────────────────────────────────────
    const equipamiento = () => ({
      usaRemoClub:       !localForm.remoPropio,
      usaSalvavidasClub: !localForm.chalecoPropio,
    })

    const handleSubmit = async () => {
      if (!isFormValid.value || enviando.value) return
      enviando.value = true
      try {
        await salidaService.crearReserva({
          idCanoa:             localForm.canoa,
          fechaHoraProgramada: `${props.selectedDay.date}T${localForm.hora}:00`,
          duracionEstimadaMin: Number(localForm.duracion),
          esEntrenamiento:     false,
          observaciones:       localForm.nota.trim() || null,
          ...equipamiento(),
        })
        mostrarToast(`Reserva confirmada para las ${localForm.hora}.`, 'success', 4000)
        Object.assign(localForm, formVacio())
        canoas.value = []
        await cargarDia()
        emit('cambio')
      } catch (e) {
        mostrarToast(limpiarMensaje(mensajeError(e, 'No se pudo crear la reserva.')), 'error', 6000)
        cargarCanoas() // la canoa pudo haber sido tomada por otra persona
      } finally {
        enviando.value = false
      }
    }

    const unirse = async (s) => {
      accionEnCurso.value = s.id
      try {
        await salidaService.agregarParticipante(s.id, {
          idRemador: store.getters['auth/idRemador'],
          ...equipamiento(),
        })
        mostrarToast(`Te uniste a la salida de las ${hora(s.fechaHoraProgramada)}.`, 'success', 4000)
        await cargarDia()
        emit('cambio')
      } catch (e) {
        mostrarToast(limpiarMensaje(mensajeError(e, 'No se pudo unir a la salida.')), 'error', 6000)
      } finally {
        accionEnCurso.value = null
      }
    }

    const salir = async (s) => {
      accionEnCurso.value = s.id
      try {
        await salidaService.quitarParticipante(s.id, store.getters['auth/idRemador'])
        mostrarToast('Saliste de la salida.', 'info', 3500)
        await cargarDia()
        emit('cambio')
      } catch (e) {
        mostrarToast(limpiarMensaje(mensajeError(e, 'No se pudo salir de la salida.')), 'error', 6000)
      } finally {
        accionEnCurso.value = null
      }
    }

    return {
      showTimeline, showFade, canoeScroll, onCanoeScroll,
      duraciones, localForm, dateLabel,
      dia, cargandoDia, salidasDia, puedeCrear,
      canoas, cargandoCanoas, enviando, accionEnCurso,
      hora, esFutura, puedeUnirse,
      availableTimes, salidasPorHora, selectHour, isFormValid,
      handleSubmit, unirse, salir,
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
<style scoped>
/* ── Elementos de la agenda del día (Fase 2) ───────── */
.toggle-track { border: none; padding: 0; }
.toggle-track:focus-visible,
.btn:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }

.notice {
  padding: 12px 14px;
  border-radius: 10px;
  border: 0.5px solid var(--surface-border, #e2e8f0);
  background: var(--surface-bg, #ffffff);
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--text-secondary, #64748b);
}
.notice--warn {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.07);
}
.notice__title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary, #0f172a);
  margin-bottom: 4px;
}
.notice__list { padding-left: 18px; color: var(--text-primary, #0f172a); }
.notice__hint { margin-top: 6px; font-size: 0.74rem; }

.empty-note {
  font-size: 0.8rem;
  color: var(--text-secondary, #64748b);
  padding: 10px 0;
}

.section-split {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--cyan);
}
.section-split::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: var(--surface-border, #e2e8f0);
}

/* Lista de salidas del día */
.day-list { display: flex; flex-direction: column; gap: 8px; }

.day-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
}
.day-item--mine { border-color: rgba(56, 189, 248, 0.45); box-shadow: inset 3px 0 0 var(--cyan); }
.day-item--skeleton { height: 74px; animation: pulso 1.2s ease-in-out infinite; }

.day-item__time { display: flex; flex-direction: column; align-items: center; }
.day-item__hora {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary, #0f172a);
  font-variant-numeric: tabular-nums;
}
.day-item__dur { font-size: 0.66rem; color: var(--text-secondary, #64748b); }

.day-item__info { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.day-item__title {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 0.86rem;
  color: var(--text-primary, #0f172a);
}
.day-item__meta { font-size: 0.72rem; color: var(--text-secondary, #64748b); }

.chip {
  font-size: 0.62rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
  background: var(--cyan-dim);
  color: var(--cyan);
}
.chip--estado { background: var(--green-dim); color: var(--green); }

.seats { display: flex; align-items: center; gap: 3px; flex-wrap: wrap; }
.seat { width: 12px; height: 12px; border-radius: 3px; }
.seat--taken { background: var(--cyan); }
.seat--open  { border: 1px solid var(--surface-border, #cbd5e1); }
.seats__label { margin-left: 6px; font-size: 0.7rem; font-weight: 600; color: var(--green); }
.seats__label--full { color: var(--red); }

.day-item__actions { display: flex; align-items: center; gap: 6px; }

.btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 7px;
  border: 0.5px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: wait; }
.btn--primary { background: var(--cyan); color: #0f1117; }
.btn--primary:hover:not(:disabled) { opacity: 0.88; }
.btn--ghost {
  background: transparent;
  border-color: var(--surface-border, #e2e8f0);
  color: var(--text-secondary, #64748b);
}
.btn--ghost:hover:not(:disabled) { color: var(--red); border-color: var(--red); }
.btn--link { background: transparent; color: var(--text-secondary, #64748b); padding: 7px 6px; }
.btn--link:hover { color: var(--cyan); }

.canoa-card--skeleton { min-height: 96px; animation: pulso 1.2s ease-in-out infinite; }

@keyframes pulso {
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 0.8; }
}

@media (max-width: 600px) {
  .day-item { grid-template-columns: 48px 1fr; }
  .day-item__actions { grid-column: 1 / -1; justify-content: flex-end; }
}
</style>
