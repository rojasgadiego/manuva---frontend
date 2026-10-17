<template>
  <AppLayout>
    <div class="ui-page">
      <router-link to="/eventos" class="volver">‹ Eventos</router-link>

      <div v-if="cargando" class="ui-card ui-skeleton"></div>
      <div v-else-if="!evento" class="ui-card ui-empty">No encontramos este evento.</div>

      <template v-else>
        <section class="ui-card cabecera">
          <div>
            <span class="ui-chip" :class="claseEstadoEvento(evento.estado)">{{ evento.estado }}</span>
            <h1 class="ui-title titulo">{{ evento.nombre }}</h1>
            <p class="ui-muted">
              {{ evento.tipo }} · {{ fecha(evento.fechaInicio) }}{{ evento.fechaFin && evento.fechaFin !== evento.fechaInicio ? ` al ${fecha(evento.fechaFin)}` : '' }}
              {{ evento.lugar ? ` · ${evento.lugar}` : '' }}
            </p>
          </div>
          <div v-if="gestiona" class="acciones">
            <button v-if="evento.estado === 'Planificado'" class="ui-btn ui-btn--green" :disabled="ocupado" @click="ejecutar(() => eventoService.abrirInscripciones(evento.id), 'Inscripciones abiertas.')">Abrir inscripciones</button>
            <button v-if="evento.estado === 'Inscripciones abiertas'" class="ui-btn ui-btn--ghost" :disabled="ocupado" @click="ejecutar(() => eventoService.cerrarInscripciones(evento.id), 'Inscripciones cerradas.')">Cerrar inscripciones</button>
          </div>
        </section>

        <div class="grid">
          <section class="ui-card">
            <h2 class="ui-section-title">Información</h2>
            <p v-if="evento.descripcion" class="descripcion">{{ evento.descripcion }}</p>
            <dl class="datos">
              <div v-if="evento.organizador"><dt>Organiza</dt><dd>{{ evento.organizador }}</dd></div>
              <div v-if="evento.fechaLimiteInscripcion"><dt>Inscripción hasta</dt><dd>{{ fecha(evento.fechaLimiteInscripcion) }}</dd></div>
              <div><dt>Inscritos</dt><dd>{{ evento.totalInscritos }}</dd></div>
              <div v-if="evento.urlInfo"><dt>Más info</dt><dd><a :href="evento.urlInfo" target="_blank" rel="noopener noreferrer">Sitio del evento ↗</a></dd></div>
            </dl>

            <!-- Inscripción propia -->
            <div class="inscripcion">
              <p v-if="miInscripcion" class="ui-notice ui-notice--ok">
                Estás inscrito{{ miInscripcion.categoria ? ` en ${miInscripcion.categoria}` : '' }}.
                {{ miInscripcion.confirmada ? 'Inscripción confirmada.' : 'Pendiente de confirmación de la directiva.' }}
              </p>
              <form v-else-if="puedeInscribirse" class="form" @submit.prevent="inscribirme">
                <label class="ui-field">
                  <span class="ui-label">Categoría <span class="ui-muted">opcional</span></span>
                  <input v-model="categoria" class="ui-input" maxlength="50" placeholder="Ej: Master, Senior, Mixto" />
                </label>
                <button type="submit" class="ui-btn ui-btn--primary" :disabled="ocupado">Inscribirme</button>
              </form>
              <p v-else-if="evento.estado === 'Inscripciones abiertas' && !idRemador" class="ui-muted">
                Tu usuario no tiene perfil de remador para inscribirse.
              </p>
            </div>
          </section>

          <section class="ui-card ui-card--flush">
            <h2 class="ui-section-title lista-titulo">Participantes</h2>
            <div v-if="!evento.inscripciones.length" class="ui-empty">Aún no hay inscritos.</div>
            <ul v-else class="inscritos">
              <li v-for="i in evento.inscripciones" :key="i.id" class="inscrito">
                <span class="largada" :title="i.numeroLargada ? 'Número de largada' : 'Sin número asignado'">{{ i.numeroLargada ?? '—' }}</span>
                <div class="inscrito__info">
                  <span class="nombre">{{ i.participante }} <span v-if="i.idRemador && i.idRemador === idRemador" class="ui-muted">(tú)</span></span>
                  <span class="ui-muted meta">{{ i.tipo }}{{ i.categoria ? ` · ${i.categoria}` : '' }}{{ i.canoa ? ` · ${i.canoa}` : '' }}</span>
                </div>
                <span v-if="i.confirmada" class="ui-chip ui-chip--green">Confirmada</span>
                <button v-else-if="gestiona" class="ui-btn ui-btn--ghost ui-btn--sm" :disabled="ocupado"
                        @click="ejecutar(() => eventoService.confirmarInscripcion(i.id), 'Inscripción confirmada.')">Confirmar</button>
                <span v-else class="ui-chip ui-chip--amber">Pendiente</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- Resultados -->
        <section v-if="resultados.length" class="ui-card ui-card--flush">
          <h2 class="ui-section-title lista-titulo">Resultados</h2>
          <div class="ui-table-wrap">
            <table class="ui-table">
              <thead><tr><th>#</th><th>Participante</th><th>Canoa</th><th>Tiempo</th><th class="ui-num">Puntos</th></tr></thead>
              <tbody>
                <tr v-for="r in resultados" :key="`${r.posicion}-${r.participante}`" :class="{ podio: r.posicion <= 3 && !r.descalificado }">
                  <td class="posicion">{{ r.descalificado ? 'DSQ' : r.posicion }}</td>
                  <td>{{ r.participante }} <span v-if="r.descalificado" class="ui-muted">· {{ r.motivoDesc || 'descalificado' }}</span></td>
                  <td class="ui-muted">{{ r.canoa || '—' }}</td>
                  <td class="tiempo">{{ r.tiempoOficial || '—' }}</td>
                  <td class="ui-num">{{ r.puntos ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import AppLayout from '@/components/Layout/AppLayout.vue'
import eventoService, { claseEstadoEvento } from '@/services/evento.service'
import { useToast } from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'
import { fecha, diasHasta } from '@/utils/formato'

export default defineComponent({
  name: 'EventoDetalleView',
  components: { AppLayout },

  setup() {
    const route = useRoute()
    const store = useStore()
    const { mostrarToast } = useToast()

    const evento     = ref(null)
    const resultados = ref([])
    const cargando   = ref(true)
    const ocupado    = ref(false)
    const categoria  = ref('')

    const idRemador = computed(() => store.getters['auth/idRemador'])
    const gestiona  = computed(() => store.getters['auth/hasAnyRole'](['Administrador', 'Directiva']))
    const miInscripcion = computed(() =>
      evento.value?.inscripciones.find(i => i.idRemador != null && i.idRemador === idRemador.value) ?? null)
    const puedeInscribirse = computed(() =>
      evento.value?.estado === 'Inscripciones abiertas' && idRemador.value != null &&
      (!evento.value.fechaLimiteInscripcion || diasHasta(evento.value.fechaLimiteInscripcion) >= 0))

    const cargar = async () => {
      try {
        const res = await eventoService.detalle(route.params.id)
        evento.value = res.data.data
        if (['En curso', 'Finalizado'].includes(evento.value.estado)) {
          try {
            const r = await eventoService.resultados(route.params.id)
            resultados.value = (r.data.data?.resultados ?? []).sort((a, b) =>
              (a.descalificado - b.descalificado) || (a.posicion - b.posicion))
          } catch { resultados.value = [] }
        }
      } catch (e) {
        evento.value = null
        if (e.response?.status !== 404) mostrarToast(mensajeError(e, 'No se pudo cargar el evento.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    const ejecutar = async (accion, exito) => {
      ocupado.value = true
      try {
        await accion()
        mostrarToast(exito, 'success', 3500)
        await cargar()
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo completar la acción.'), 'error', 6000)
      } finally {
        ocupado.value = false
      }
    }

    const inscribirme = () => ejecutar(
      () => eventoService.inscribirRemador(evento.value.id, {
        idRemador: idRemador.value,
        idCanoa: null,
        categoriaCompetencia: categoria.value.trim() || null,
        observaciones: null,
      }),
      'Inscripción enviada. La directiva la confirmará.')

    onMounted(cargar)

    return {
      evento, resultados, cargando, ocupado, categoria, idRemador, gestiona,
      miInscripcion, puedeInscribirse, ejecutar, inscribirme,
      eventoService, claseEstadoEvento, fecha,
    }
  },
})
</script>

<style scoped>
.volver { font-size: 0.8rem; color: var(--text-secondary, #64748b); text-decoration: none; align-self: flex-start; }
.volver:hover { color: var(--ui-cyan); }
.cabecera { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.titulo { margin: 6px 0 4px; }
.acciones { display: flex; gap: 8px; flex-wrap: wrap; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.descripcion { font-size: 0.88rem; line-height: 1.5; margin-bottom: 14px; }
.datos { display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem; }
.datos div { display: flex; justify-content: space-between; gap: 12px; }
.datos dt { color: var(--text-secondary, #64748b); }
.datos a { color: var(--ui-cyan); }
.inscripcion { margin-top: 16px; }
.form { display: flex; flex-direction: column; gap: 10px; }
.lista-titulo { padding: 18px 18px 0; }
.inscritos { list-style: none; }
.inscrito {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-top: 0.5px solid var(--surface-border, #1e2433);
}
.largada {
  min-width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-indigo-dim);
  color: var(--ui-indigo);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
}
.inscrito__info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nombre { font-weight: 500; font-size: 0.86rem; }
.meta { font-size: 0.74rem; }
.posicion { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; }
.podio .posicion { color: var(--ui-amber); }
.tiempo { font-variant-numeric: tabular-nums; }

@media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
</style>
