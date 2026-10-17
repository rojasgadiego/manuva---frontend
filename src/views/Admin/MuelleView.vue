<template>
  <AppLayout>
    <div class="ui-page">
      <div class="ui-page__head">
        <div>
          <h1 class="ui-title">Muelle · hoy</h1>
          <p class="ui-subtitle">{{ hoyTexto }} — inicia y cierra las salidas del día.</p>
        </div>
        <button class="ui-btn ui-btn--ghost" :disabled="cargando" @click="cargar">Actualizar</button>
      </div>

      <div v-if="cargando && !salidas.length" class="ui-card ui-skeleton"></div>
      <div v-else-if="!salidas.length" class="ui-card ui-empty">No hay salidas programadas para hoy.</div>

      <div v-else class="lista">
        <article v-for="s in salidas" :key="s.id" class="ui-card salida" :class="`salida--${claseEstado(s.estado)}`">
          <div class="salida__hora">
            <span class="hora">{{ hora(s.fechaHoraProgramada) }}</span>
            <span class="ui-muted dur">{{ s.duracionMin }} min</span>
          </div>
          <div class="salida__info">
            <p class="titulo">
              {{ s.nombreCanoa || s.codigoCanoa }}
              <span class="ui-chip">{{ s.tipoCanoa }}</span>
              <span class="ui-chip" :class="`ui-chip--${claseEstado(s.estado)}`">{{ s.estado }}</span>
            </p>
            <p class="ui-muted meta">Responsable: {{ s.responsable }} · {{ s.participantes }}/{{ s.capacidadMax }} remadores</p>
          </div>
          <div class="salida__acciones">
            <button v-if="['Reservada', 'Confirmada'].includes(s.estado)" class="ui-btn ui-btn--green ui-btn--sm"
                    :disabled="ocupada === s.id" @click="iniciar(s)">Iniciar</button>
            <button v-if="s.estado === 'En curso'" class="ui-btn ui-btn--primary ui-btn--sm"
                    :disabled="ocupada === s.id" @click="finalizar(s)">Finalizar</button>
            <router-link :to="`/salidas/${s.id}`" class="ui-btn ui-btn--ghost ui-btn--sm">Detalle</router-link>
          </div>
        </article>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import salidaService from '@/services/salida.service'
import { useToast } from '@/utils/useToast'
import { mensajeError, limpiarMensaje } from '@/utils/apiError'
import { hoyIso } from '@/utils/formato'

export default defineComponent({
  name: 'MuelleView',
  components: { AppLayout },

  setup() {
    const { mostrarToast } = useToast()

    const salidas  = ref([])
    const cargando = ref(true)
    const ocupada  = ref(null)

    const hoyTexto = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    const hora = (iso) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
    const claseEstado = (e) => ({ Reservada: 'cyan', Confirmada: 'green', 'En curso': 'amber', Finalizada: 'muted' }[e] ?? 'cyan')

    const cargar = async () => {
      cargando.value = true
      try {
        const res = await salidaService.getDia(hoyIso())
        salidas.value = res.data.data.salidas
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cargar la agenda de hoy.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    const accion = async (s, fn, exito) => {
      ocupada.value = s.id
      try {
        await fn()
        mostrarToast(exito, 'success', 3500)
        await cargar()
      } catch (e) {
        mostrarToast(limpiarMensaje(mensajeError(e, 'No se pudo completar la acción.')), 'error', 6000)
      } finally {
        ocupada.value = null
      }
    }

    const iniciar   = (s) => accion(s, () => salidaService.iniciar(s.id, { condicionClima: null }), `Salida de las ${hora(s.fechaHoraProgramada)} iniciada.`)
    const finalizar = (s) => accion(s, () => salidaService.finalizar(s.id, { observaciones: null }), `Salida de las ${hora(s.fechaHoraProgramada)} finalizada.`)

    onMounted(cargar)

    return { salidas, cargando, ocupada, hoyTexto, hora, claseEstado, cargar, iniciar, finalizar }
  },
})
</script>

<style scoped>
.lista { display: flex; flex-direction: column; gap: 10px; }
.salida {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  align-items: center;
  gap: 14px;
  border-left: 3px solid var(--ui-cyan);
}
.salida--green { border-left-color: var(--ui-green); }
.salida--amber { border-left-color: var(--ui-amber); }
.salida--muted { border-left-color: var(--surface-border, #1e2433); opacity: 0.7; }
.salida__hora { display: flex; flex-direction: column; align-items: center; }
.hora { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.15rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.dur { font-size: 0.72rem; }
.titulo { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-weight: 600; }
.meta { font-size: 0.78rem; margin-top: 2px; }
.salida__acciones { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

@media (max-width: 600px) {
  .salida { grid-template-columns: 56px 1fr; }
  .salida__acciones { grid-column: 1 / -1; }
}
</style>
