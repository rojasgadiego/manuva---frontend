<template>
  <AppLayout>
    <div class="ui-page">
      <div class="ui-page__head">
        <div>
          <h1 class="ui-title">Flota</h1>
          <p class="ui-subtitle">Estado de canoas e implementos del club.</p>
        </div>
        <div class="ui-tabs" role="tablist">
          <button class="ui-tab" :class="{ 'is-active': vista === 'canoas' }" role="tab" :aria-selected="vista === 'canoas'" @click="vista = 'canoas'">Canoas</button>
          <button class="ui-tab" :class="{ 'is-active': vista === 'implementos' }" role="tab" :aria-selected="vista === 'implementos'" @click="vista = 'implementos'">Implementos</button>
        </div>
      </div>

      <section class="ui-card ui-card--flush">
        <div v-if="cargando" class="ui-skeleton"></div>

        <!-- Canoas -->
        <div v-else-if="vista === 'canoas'" class="ui-table-wrap">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Canoa</th>
                <th>Tipo</th>
                <th>Próxima revisión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in canoas" :key="c.id">
                <td><span class="nombre">{{ c.nombre || c.codigo }}</span><span class="ui-muted sub">{{ c.codigo }}</span></td>
                <td>{{ c.tipo }} <span class="ui-muted">· {{ c.capacidadMax }} pers.</span></td>
                <td :class="{ vencida: revisionVencida(c.proximaRevision) }">{{ fecha(c.proximaRevision) }}</td>
                <td>
                  <select class="ui-input estado-select" :value="idEstadoCanoa(c.estado)"
                          :disabled="guardando === `c${c.id}`" :aria-label="`Estado de ${c.nombre || c.codigo}`"
                          @change="cambiarCanoa(c, Number($event.target.value))">
                    <option v-for="e in estadosCanoa" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Implementos -->
        <div v-else class="ui-table-wrap">
          <div v-if="!implementos.length" class="ui-empty">No hay implementos registrados.</div>
          <table v-else class="ui-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Marca / modelo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in implementos" :key="i.id">
                <td class="nombre">{{ i.codigo }}</td>
                <td>{{ i.tipo }}</td>
                <td class="ui-muted">{{ [i.marca, i.modelo].filter(Boolean).join(' · ') || '—' }}</td>
                <td>
                  <select class="ui-input estado-select" :value="idEstadoImplemento(i.estado)"
                          :disabled="guardando === `i${i.id}`" :aria-label="`Estado de ${i.codigo}`"
                          @change="cambiarImplemento(i, Number($event.target.value))">
                    <option v-for="e in estadosImplemento" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="ui-muted nota">
        Una canoa en <strong>Mantenimiento</strong> o <strong>Dada de baja</strong> deja de aparecer para nuevas reservas.
        "En uso" lo asigna el sistema al iniciar una salida.
      </p>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import adminService from '@/services/admin.service'
import { useToast } from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'
import { fecha, diasHasta } from '@/utils/formato'

export default defineComponent({
  name: 'AdminFlotaView',
  components: { AppLayout },

  setup() {
    const { mostrarToast } = useToast()

    const vista       = ref('canoas')
    const cargando    = ref(true)
    const guardando   = ref(null)
    const canoas      = ref([])
    const implementos = ref([])
    const estadosCanoa      = ref([])
    const estadosImplemento = ref([])

    const cargar = async () => {
      try {
        const [c, i, ec, ei] = await Promise.all([
          adminService.canoas(), adminService.implementos(),
          adminService.estadosCanoa(), adminService.estadosImplemento(),
        ])
        canoas.value = c.data.data ?? []
        implementos.value = i.data.data ?? []
        estadosCanoa.value = ec.data.data ?? []
        estadosImplemento.value = ei.data.data ?? []
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cargar la flota.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    const idEstadoCanoa      = (nombre) => estadosCanoa.value.find(e => e.nombre === nombre)?.id
    const idEstadoImplemento = (nombre) => estadosImplemento.value.find(e => e.nombre === nombre)?.id
    const revisionVencida    = (iso) => iso != null && diasHasta(iso) < 0

    const cambiar = async (clave, accion, item, lista, idEstado, nombreEstado) => {
      guardando.value = clave
      try {
        await accion()
        item.estado = nombreEstado
        mostrarToast(`Estado actualizado a "${nombreEstado}".`, 'success', 3000)
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cambiar el estado.'), 'error', 5000)
        lista.value = [...lista.value] // re-render para volver el select a su valor
      } finally {
        guardando.value = null
      }
    }

    const cambiarCanoa = (c, idEstado) => cambiar(`c${c.id}`,
      () => adminService.cambiarEstadoCanoa(c.id, idEstado), c, canoas, idEstado,
      estadosCanoa.value.find(e => e.id === idEstado)?.nombre)

    const cambiarImplemento = (i, idEstado) => cambiar(`i${i.id}`,
      () => adminService.cambiarEstadoImplemento(i.id, idEstado), i, implementos, idEstado,
      estadosImplemento.value.find(e => e.id === idEstado)?.nombre)

    onMounted(cargar)

    return {
      vista, cargando, guardando, canoas, implementos, estadosCanoa, estadosImplemento,
      idEstadoCanoa, idEstadoImplemento, revisionVencida, cambiarCanoa, cambiarImplemento, fecha,
    }
  },
})
</script>

<style scoped>
.nombre { display: block; font-weight: 500; }
.sub { display: block; font-size: 0.74rem; }
.vencida { color: var(--ui-red); font-weight: 600; }
.estado-select { width: auto; min-width: 150px; padding: 7px 10px; }
.nota { font-size: 0.78rem; }
</style>
