<template>
  <AppLayout>
    <div class="ui-page">
      <div class="ui-page__head">
        <div>
          <h1 class="ui-title">Eventos y regatas</h1>
          <p class="ui-subtitle">Competencias y encuentros del club.</p>
        </div>
        <div class="ui-tabs" role="tablist">
          <button class="ui-tab" :class="{ 'is-active': vista === 'proximos' }" role="tab" :aria-selected="vista === 'proximos'" @click="vista = 'proximos'">Próximos</button>
          <button class="ui-tab" :class="{ 'is-active': vista === 'todos' }" role="tab" :aria-selected="vista === 'todos'" @click="vista = 'todos'">Todos</button>
        </div>
      </div>

      <div v-if="cargando" class="grid">
        <div v-for="i in 3" :key="i" class="ui-card ui-skeleton"></div>
      </div>
      <div v-else-if="!visibles.length" class="ui-card ui-empty">
        {{ vista === 'proximos' ? 'No hay eventos próximos.' : 'Aún no hay eventos registrados.' }}
      </div>

      <div v-else class="grid">
        <router-link v-for="e in visibles" :key="e.id" :to="`/eventos/${e.id}`" class="ui-card evento">
          <div class="evento__fecha">
            <span class="dia">{{ dia(e.fechaInicio) }}</span>
            <span class="mes">{{ mes(e.fechaInicio) }}</span>
          </div>
          <div class="evento__info">
            <span class="ui-chip" :class="claseEstadoEvento(e.estado)">{{ e.estado }}</span>
            <h2 class="evento__nombre">{{ e.nombre }}</h2>
            <p class="ui-muted meta">{{ e.tipo }}{{ e.lugar ? ` · ${e.lugar}` : '' }}</p>
            <p class="ui-muted meta">{{ e.totalInscritos }} inscrito{{ e.totalInscritos !== 1 ? 's' : '' }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import eventoService, { claseEstadoEvento } from '@/services/evento.service'
import { useToast } from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'

export default defineComponent({
  name: 'EventosView',
  components: { AppLayout },

  setup() {
    const { mostrarToast } = useToast()
    const vista    = ref('proximos')
    const todos    = ref([])
    const proximos = ref([])
    const cargando = ref(true)

    const visibles = computed(() => (vista.value === 'proximos' ? proximos.value : todos.value))

    const aFecha = (iso) => new Date(String(iso).substring(0, 10) + 'T12:00:00')
    const dia = (iso) => aFecha(iso).getDate()
    const mes = (iso) => aFecha(iso).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }).replace('.', '')

    onMounted(async () => {
      try {
        const [t, p] = await Promise.all([eventoService.todos(), eventoService.proximos()])
        todos.value = (t.data.data ?? []).sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))
        proximos.value = (p.data.data ?? []).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
        if (!proximos.value.length) vista.value = 'todos'
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudieron cargar los eventos.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    })

    return { vista, visibles, cargando, dia, mes, claseEstadoEvento }
  },
})
</script>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.evento {
  display: flex;
  gap: 14px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, transform 0.15s;
}
.evento:hover { border-color: rgba(56, 189, 248, 0.45); transform: translateY(-1px); }
.evento:focus-visible { outline: 2px solid var(--ui-cyan); outline-offset: 2px; }
.evento__fecha {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  height: 62px;
  border-radius: 12px;
  background: var(--ui-cyan-dim);
  color: var(--ui-cyan);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.dia { font-size: 1.4rem; font-weight: 700; line-height: 1; }
.mes { font-size: 0.66rem; font-weight: 600; text-transform: uppercase; }
.evento__info { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; min-width: 0; }
.evento__nombre {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
}
.meta { font-size: 0.78rem; }
</style>
