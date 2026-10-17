<template>
  <AppLayout>
    <div class="detalle">

      <button class="back" type="button" @click="volver">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Volver
      </button>

      <div v-if="cargando" class="card card--skeleton"></div>

      <div v-else-if="!salida" class="card vacio">
        <p>No encontramos esta salida.</p>
        <router-link to="/agenda" class="btn btn--primary">Ir a la agenda</router-link>
      </div>

      <template v-else>
        <!-- Cabecera -->
        <section class="card cabecera">
          <div class="fecha">
            <span class="fecha__dia">{{ fecha.dia }}</span>
            <span class="fecha__mes">{{ fecha.mes }}</span>
          </div>
          <div class="cabecera__info">
            <p class="cabecera__sup">{{ fecha.semana }} · {{ fecha.hora }} · {{ salida.duracionEstimadaMin ?? 120 }} min</p>
            <h1 class="cabecera__titulo">{{ salida.nombreCanoa || salida.codigoCanoa }}</h1>
            <div class="chips">
              <span class="chip">{{ salida.tipoCanoa }}</span>
              <span class="chip" :class="`chip--${claseEstado}`">{{ salida.estado }}</span>
              <span v-if="salida.esEntrenamiento" class="chip chip--indigo">Entrenamiento</span>
            </div>
          </div>
          <div class="cupos">
            <span class="cupos__num">{{ cuposLibres }}</span>
            <span class="cupos__lbl">cupo{{ cuposLibres !== 1 ? 's' : '' }} libre{{ cuposLibres !== 1 ? 's' : '' }}</span>
          </div>
        </section>

        <div class="grid">
          <!-- Participantes -->
          <section class="card">
            <h2 class="card__titulo">Participantes <span class="muted">{{ salida.participantes.length }}/{{ salida.capacidadMax }}</span></h2>
            <ul class="participantes">
              <li v-for="p in salida.participantes" :key="p.idRemador" class="participante">
                <span class="avatar">{{ iniciales(p.nombreCompleto) }}</span>
                <div class="participante__info">
                  <span class="participante__nombre">
                    {{ p.nombreCompleto }}
                    <span v-if="p.idRemador === idRemador" class="muted">(tú)</span>
                  </span>
                  <span class="participante__meta">
                    {{ p.idRemador === salida.idResponsable ? 'Responsable' : (p.rol || 'Remador') }}
                    · {{ p.usaRemoClub ? 'remo del club' : 'remo propio' }}
                    · {{ p.usaSalvavidasClub ? 'chaleco del club' : 'chaleco propio' }}
                  </span>
                </div>
                <button
                  v-if="esStaff && p.idRemador !== salida.idResponsable && editable"
                  class="icon-btn" type="button" :aria-label="`Quitar a ${p.nombreCompleto}`"
                  :disabled="ocupado" @click="quitar(p.idRemador)"
                >×</button>
              </li>
              <li v-for="i in cuposLibres" :key="`libre-${i}`" class="participante participante--libre">
                <span class="avatar avatar--libre"></span>
                <span class="muted">Cupo disponible</span>
              </li>
            </ul>
          </section>

          <!-- Detalle + acciones -->
          <section class="card">
            <h2 class="card__titulo">Detalle</h2>
            <dl class="datos">
              <div><dt>Responsable</dt><dd>{{ soyResponsable ? 'Tú' : salida.responsable }}</dd></div>
              <div v-if="salida.zonaRecorrido"><dt>Zona</dt><dd>{{ salida.zonaRecorrido }}</dd></div>
              <div v-if="salida.condicionClima"><dt>Clima</dt><dd>{{ salida.condicionClima }}</dd></div>
              <div v-if="salida.fechaHoraSalidaReal"><dt>Salida real</dt><dd>{{ horaDe(salida.fechaHoraSalidaReal) }}</dd></div>
              <div v-if="salida.fechaHoraRetornoReal"><dt>Retorno</dt><dd>{{ horaDe(salida.fechaHoraRetornoReal) }}</dd></div>
              <div v-if="salida.observaciones"><dt>Nota</dt><dd>{{ salida.observaciones }}</dd></div>
              <div><dt>Reservada el</dt><dd>{{ new Date(salida.fechaHoraReserva).toLocaleDateString('es-CL') }}</dd></div>
            </dl>

            <div class="acciones">
              <button v-if="puedeUnirse" class="btn btn--primary" :disabled="ocupado" @click="unirse">Unirme a la salida</button>
              <button v-if="puedeSalir" class="btn btn--ghost" :disabled="ocupado" @click="quitar(idRemador)">Salir de la salida</button>

              <template v-if="esStaff">
                <button v-if="editable" class="btn btn--green" :disabled="ocupado" @click="panel = panel === 'iniciar' ? null : 'iniciar'">Iniciar salida</button>
                <button v-if="salida.estado === 'En curso'" class="btn btn--green" :disabled="ocupado" @click="panel = panel === 'finalizar' ? null : 'finalizar'">Finalizar salida</button>
              </template>

              <button v-if="puedeCancelar" class="btn btn--danger" :disabled="ocupado" @click="abrirCancelar">Cancelar salida</button>
            </div>

            <!-- Paneles de confirmación -->
            <form v-if="panel === 'cancelar'" class="panel" @submit.prevent="cancelar">
              <label class="lbl" for="motivo">Motivo</label>
              <select id="motivo" v-model="formCancelar.motivo" class="input" required>
                <option :value="null" disabled>Selecciona un motivo</option>
                <option v-for="m in motivos" :key="m.id" :value="m.id">{{ m.nombre }}</option>
              </select>
              <label class="lbl" for="obs-cancel">Comentario <span class="muted">opcional</span></label>
              <textarea id="obs-cancel" v-model="formCancelar.observacion" class="input" rows="2" maxlength="300"></textarea>
              <div class="panel__acciones">
                <button type="button" class="btn btn--ghost" @click="panel = null">Volver</button>
                <button type="submit" class="btn btn--danger" :disabled="!formCancelar.motivo || ocupado">Confirmar cancelación</button>
              </div>
            </form>

            <form v-if="panel === 'iniciar'" class="panel" @submit.prevent="iniciar">
              <label class="lbl" for="clima">Condición del clima <span class="muted">opcional</span></label>
              <input id="clima" v-model="texto" class="input" maxlength="50" placeholder="Ej: mar calmo, viento suave" />
              <div class="panel__acciones">
                <button type="button" class="btn btn--ghost" @click="panel = null">Volver</button>
                <button type="submit" class="btn btn--green" :disabled="ocupado">Confirmar inicio</button>
              </div>
            </form>

            <form v-if="panel === 'finalizar'" class="panel" @submit.prevent="finalizar">
              <label class="lbl" for="obs-fin">Observaciones <span class="muted">opcional</span></label>
              <textarea id="obs-fin" v-model="texto" class="input" rows="2" maxlength="500"></textarea>
              <div class="panel__acciones">
                <button type="button" class="btn btn--ghost" @click="panel = null">Volver</button>
                <button type="submit" class="btn btn--green" :disabled="ocupado">Confirmar término</button>
              </div>
            </form>
          </section>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import AppLayout from '@/components/Layout/AppLayout.vue'
import salidaService from '@/services/salida.service'
import clubService from '@/services/club.service'
import { useToast } from '@/utils/useToast'
import { mensajeError, limpiarMensaje } from '@/utils/apiError'

export default defineComponent({
  name: 'SalidaDetalleView',
  components: { AppLayout },

  setup() {
    const route  = useRoute()
    const router = useRouter()
    const store  = useStore()
    const { mostrarToast } = useToast()

    const salida   = ref(null)
    const cargando = ref(true)
    const ocupado  = ref(false)
    const panel    = ref(null)       // 'cancelar' | 'iniciar' | 'finalizar'
    const texto    = ref('')
    const motivos  = ref([])
    const formCancelar = reactive({ motivo: null, observacion: '' })

    const idRemador = computed(() => store.getters['auth/idRemador'])
    const esStaff   = computed(() => store.getters['auth/isStaff'])

    const cargar = async () => {
      cargando.value = true
      try {
        const res = await salidaService.getById(route.params.id)
        salida.value = res.data.data
      } catch (e) {
        salida.value = null
        if (e.response?.status !== 404) mostrarToast(mensajeError(e, 'No se pudo cargar la salida.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    onMounted(cargar)
    watch(() => route.params.id, (id) => { if (id) { panel.value = null; cargar() } })

    // ── Derivados ──────────────────────────────────────
    const fecha = computed(() => {
      const d = new Date(salida.value.fechaHoraProgramada)
      return {
        dia:    d.getDate(),
        mes:    d.toLocaleDateString('es-CL', { month: 'short' }).replace('.', ''),
        semana: d.toLocaleDateString('es-CL', { weekday: 'long' }),
        hora:   horaDe(d),
      }
    })
    const horaDe = (v) => new Date(v).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
    const iniciales = (n) => (n || '?').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()

    const cuposLibres    = computed(() => Math.max(0, salida.value.capacidadMax - salida.value.participantes.length))
    const soyResponsable = computed(() => idRemador.value != null && salida.value.idResponsable === idRemador.value)
    const soyParticipante = computed(() => salida.value.participantes.some(p => p.idRemador === idRemador.value))
    const editable       = computed(() => ['Reservada', 'Confirmada'].includes(salida.value.estado))
    const futura         = computed(() => new Date(salida.value.fechaHoraProgramada) > new Date())
    const claseEstado    = computed(() => ({
      'Reservada': 'cyan', 'Confirmada': 'green', 'En curso': 'amber', 'Finalizada': 'muted', 'Cancelada': 'red',
    }[salida.value.estado] ?? 'cyan'))

    const puedeUnirse   = computed(() => editable.value && futura.value && !soyParticipante.value && cuposLibres.value > 0 && idRemador.value != null)
    const puedeSalir    = computed(() => editable.value && futura.value && soyParticipante.value && !soyResponsable.value)
    const puedeCancelar = computed(() => editable.value && (soyResponsable.value || esStaff.value))

    // ── Acciones ───────────────────────────────────────
    const ejecutar = async (accion, exito, fallo) => {
      ocupado.value = true
      try {
        await accion()
        mostrarToast(exito, 'success', 4000)
        panel.value = null
        texto.value = ''
        await cargar()
      } catch (e) {
        mostrarToast(limpiarMensaje(mensajeError(e, fallo)), 'error', 6000)
      } finally {
        ocupado.value = false
      }
    }

    const unirse = () => ejecutar(
      () => salidaService.agregarParticipante(salida.value.id, {
        idRemador: idRemador.value,
        usaRemoClub: !store.getters['auth/currentUser']?.tieneRemoPropio,
        usaSalvavidasClub: !store.getters['auth/currentUser']?.tieneSalvavidasPropio,
      }),
      'Te uniste a la salida.', 'No se pudo unir a la salida.')

    const quitar = (id) => ejecutar(
      () => salidaService.quitarParticipante(salida.value.id, id),
      id === idRemador.value ? 'Saliste de la salida.' : 'Participante quitado.',
      'No se pudo quitar al participante.')

    const abrirCancelar = async () => {
      panel.value = panel.value === 'cancelar' ? null : 'cancelar'
      if (panel.value && !motivos.value.length) {
        try {
          const res = await clubService.motivosCancelacion()
          // El motivo de cierre automático lo usa solo el sistema
          motivos.value = (res.data.data ?? []).filter(m => !m.nombre.includes('cierre automático'))
        } catch (e) {
          mostrarToast(mensajeError(e, 'No se pudieron cargar los motivos.'), 'error', 5000)
        }
      }
    }

    const cancelar = () => ejecutar(
      () => salidaService.cancelar(salida.value.id, {
        idMotivoCancelacion: formCancelar.motivo,
        observacion: formCancelar.observacion.trim() || null,
      }),
      'Salida cancelada.', 'No se pudo cancelar la salida.')

    const iniciar = () => ejecutar(
      () => salidaService.iniciar(salida.value.id, { condicionClima: texto.value.trim() || null }),
      'Salida iniciada: canoa en el agua.', 'No se pudo iniciar la salida.')

    const finalizar = () => ejecutar(
      () => salidaService.finalizar(salida.value.id, { observaciones: texto.value.trim() || null }),
      'Salida finalizada.', 'No se pudo finalizar la salida.')

    const volver = () => (window.history.length > 1 ? router.back() : router.push('/agenda'))

    return {
      salida, cargando, ocupado, panel, texto, motivos, formCancelar,
      idRemador, esStaff, fecha, horaDe, iniciales,
      cuposLibres, soyResponsable, editable, claseEstado,
      puedeUnirse, puedeSalir, puedeCancelar,
      unirse, quitar, abrirCancelar, cancelar, iniciar, finalizar, volver,
    }
  },
})
</script>

<style scoped>
.detalle {
  --cyan: #38bdf8; --cyan-dim: rgba(56, 189, 248, 0.12);
  --green: #22c55e; --green-dim: rgba(34, 197, 94, 0.12);
  --amber: #f59e0b; --amber-dim: rgba(245, 158, 11, 0.12);
  --red: #ef4444; --red-dim: rgba(239, 68, 68, 0.1);
  --indigo: #818cf8; --indigo-dim: rgba(129, 140, 248, 0.12);

  max-width: 1040px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', sans-serif;
}

.back {
  align-self: flex-start;
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem; font-weight: 500;
  color: var(--text-secondary, #64748b);
}
.back:hover { color: var(--cyan); }

.card {
  background: var(--surface-bg, #141820);
  border: 0.5px solid var(--surface-border, #1e2433);
  border-radius: 14px;
  padding: 18px;
}
.card--skeleton { height: 220px; animation: pulso 1.2s ease-in-out infinite; }
.card__titulo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.75rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-secondary, #64748b);
  margin-bottom: 14px;
}
.vacio { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; color: var(--text-primary); }
.muted { color: var(--text-secondary, #64748b); font-weight: 400; }

/* Cabecera */
.cabecera { display: flex; align-items: center; gap: 18px; }
.fecha {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-width: 64px; height: 68px;
  border-radius: 12px;
  background: var(--cyan-dim);
  color: var(--cyan);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.fecha__dia { font-size: 1.6rem; font-weight: 700; line-height: 1; }
.fecha__mes { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
.cabecera__info { flex: 1; min-width: 0; }
.cabecera__sup { font-size: 0.78rem; color: var(--text-secondary, #64748b); text-transform: capitalize; }
.cabecera__titulo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.35rem; font-weight: 700; letter-spacing: -0.3px;
  color: var(--text-primary, #e2e8f0);
  margin: 2px 0 8px;
}
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  font-size: 0.68rem; font-weight: 600;
  padding: 3px 9px; border-radius: 99px;
  background: var(--cyan-dim); color: var(--cyan);
}
.chip--green  { background: var(--green-dim);  color: var(--green); }
.chip--amber  { background: var(--amber-dim);  color: var(--amber); }
.chip--red    { background: var(--red-dim);    color: var(--red); }
.chip--indigo { background: var(--indigo-dim); color: var(--indigo); }
.chip--muted  { background: rgba(100, 116, 139, 0.15); color: var(--text-secondary, #64748b); }

.cupos { display: flex; flex-direction: column; align-items: center; }
.cupos__num {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.8rem; font-weight: 700; line-height: 1;
  color: var(--green);
}
.cupos__lbl { font-size: 0.7rem; color: var(--text-secondary, #64748b); }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }

/* Participantes */
.participantes { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.participante {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 6px; border-radius: 8px;
}
.participante--libre { opacity: 0.7; font-size: 0.8rem; }
.avatar {
  width: 32px; height: 32px; min-width: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: #fff; font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.avatar--libre { background: none; border: 1px dashed var(--surface-border, #334155); }
.participante__info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.participante__nombre { font-size: 0.86rem; font-weight: 500; color: var(--text-primary, #e2e8f0); }
.participante__meta { font-size: 0.72rem; color: var(--text-secondary, #64748b); }
.icon-btn {
  width: 28px; height: 28px; border-radius: 7px;
  border: 0.5px solid var(--surface-border, #1e2433);
  background: transparent; color: var(--text-secondary, #64748b);
  cursor: pointer; font-size: 1rem; line-height: 1;
}
.icon-btn:hover:not(:disabled) { color: var(--red); border-color: var(--red); }

/* Datos */
.datos { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.datos div { display: flex; justify-content: space-between; gap: 12px; font-size: 0.84rem; }
.datos dt { color: var(--text-secondary, #64748b); }
.datos dd { color: var(--text-primary, #e2e8f0); text-align: right; }

/* Acciones */
.acciones { display: flex; flex-wrap: wrap; gap: 8px; }
.btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem; font-weight: 600;
  padding: 9px 14px; border-radius: 8px;
  border: 0.5px solid transparent; cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s, color 0.15s, border-color 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
.btn--primary { background: var(--cyan); color: #0f1117; }
.btn--green   { background: var(--green-dim); color: var(--green); border-color: rgba(34, 197, 94, 0.3); }
.btn--danger  { background: var(--red-dim); color: var(--red); border-color: rgba(239, 68, 68, 0.3); }
.btn--ghost   { background: transparent; color: var(--text-secondary, #64748b); border-color: var(--surface-border, #1e2433); }
.btn:hover:not(:disabled) { opacity: 0.88; }

.panel {
  margin-top: 14px; padding: 14px;
  border-radius: 10px;
  border: 0.5px solid var(--surface-border, #1e2433);
  background: var(--content-bg, #0c0e14);
  display: flex; flex-direction: column; gap: 8px;
}
.lbl {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.7rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
}
.input {
  width: 100%; padding: 10px 12px;
  border-radius: 8px;
  border: 0.5px solid var(--surface-border, #1e2433);
  background: var(--surface-bg, #141820);
  color: var(--text-primary, #e2e8f0);
  font-family: 'Inter', sans-serif; font-size: 0.86rem;
  resize: vertical;
}
.input:focus { outline: none; border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2); }
.panel__acciones { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

@keyframes pulso { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.8; } }

@media (max-width: 760px) {
  .grid { grid-template-columns: 1fr; }
  .cabecera { flex-wrap: wrap; }
  .cupos { flex-direction: row; gap: 6px; align-items: baseline; }
}
</style>
