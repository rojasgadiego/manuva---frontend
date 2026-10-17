<template>
  <AppLayout>
    <div class="ui-page">
      <div class="ui-page__head">
        <div>
          <h1 class="ui-title">Socios</h1>
          <p class="ui-subtitle">Membresías y certificados médicos de los remadores.</p>
        </div>
        <input v-model="busqueda" class="ui-input buscador" type="search" placeholder="Buscar por nombre o RUT" aria-label="Buscar socio" />
      </div>

      <div class="ui-tabs" role="tablist">
        <button v-for="f in filtros" :key="f.id" class="ui-tab" :class="{ 'is-active': filtro === f.id }"
                role="tab" :aria-selected="filtro === f.id" @click="filtro = f.id">
          {{ f.nombre }} <span class="ui-muted">{{ conteo(f.id) }}</span>
        </button>
      </div>

      <section class="ui-card ui-card--flush">
        <div v-if="cargando" class="ui-skeleton"></div>
        <div v-else-if="!visibles.length" class="ui-empty">No hay socios que coincidan.</div>
        <div v-else class="ui-table-wrap">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>Categoría</th>
                <th>Membresía</th>
                <th>Cert. médico</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in visibles" :key="r.id">
                <td>
                  <span class="nombre">{{ r.nombreCompleto }}</span>
                  <span class="ui-muted rut">{{ r.rut }} · {{ r.email }}</span>
                </td>
                <td>{{ r.categoria }}<span v-if="r.estado !== 'Activo'" class="ui-chip ui-chip--muted estado">{{ r.estado }}</span></td>
                <td>
                  <span class="ui-chip" :class="claseMembresia(r.estadoMembresia)">{{ r.estadoMembresia }}</span>
                  <span v-if="r.estadoMembresia === 'Vigente' && r.diasParaVencer != null" class="ui-muted dias">{{ r.diasParaVencer }} d</span>
                </td>
                <td><span class="ui-chip" :class="claseCert(r.estadoCertMedica)">{{ r.estadoCertMedica }}</span></td>
                <td class="ui-num"><button class="ui-btn ui-btn--ghost ui-btn--sm" @click="abrir(r)">Gestionar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Ficha del socio -->
      <div v-if="seleccionado" class="ui-modal-backdrop" @click.self="cerrar">
        <div class="ui-modal" role="dialog" aria-modal="true" :aria-label="`Gestionar a ${seleccionado.nombreCompleto}`">
          <div>
            <h2 class="ui-title modal-titulo">{{ seleccionado.nombreCompleto }}</h2>
            <p class="ui-subtitle">{{ seleccionado.rut }} · {{ seleccionado.email }}</p>
          </div>

          <div v-if="!detalle" class="ui-skeleton"></div>
          <template v-else>
            <!-- Certificado y equipamiento -->
            <form class="bloque" @submit.prevent="guardarFicha">
              <p class="ui-section-title">Certificado médico y equipamiento</p>
              <div class="ui-form-grid">
                <label class="ui-field">
                  <span class="ui-label">Certificado vence</span>
                  <input v-model="ficha.certMedicaVence" type="date" class="ui-input" />
                </label>
                <label class="check"><input v-model="ficha.tieneRemoPropio" type="checkbox" /> Remo propio</label>
                <label class="check"><input v-model="ficha.tieneSalvavidasPropio" type="checkbox" /> Chaleco propio</label>
              </div>
              <div class="ui-modal__actions">
                <button type="submit" class="ui-btn ui-btn--primary" :disabled="guardando">Guardar ficha</button>
              </div>
            </form>

            <!-- Membresía -->
            <form class="bloque" @submit.prevent="asignarMembresia">
              <p class="ui-section-title">Membresía</p>
              <p v-if="detalle.membresiaVigente" class="ui-muted actual">
                Actual: {{ detalle.membresiaVigente.tipo }} · {{ fecha(detalle.membresiaVigente.fechaInicio) }} → {{ fecha(detalle.membresiaVigente.fechaFin) }}
                <span class="ui-chip" :class="detalle.membresiaVigente.estaVigente ? 'ui-chip--green' : 'ui-chip--red'">
                  {{ detalle.membresiaVigente.estaVigente ? 'Vigente' : 'Vencida' }}
                </span>
              </p>
              <p v-else class="ui-muted actual">Sin membresía activa.</p>
              <div class="ui-form-grid">
                <label class="ui-field">
                  <span class="ui-label">Tipo</span>
                  <select v-model="nuevaMembresia.idTipoMembresia" class="ui-input" required>
                    <option :value="null" disabled>Selecciona</option>
                    <option v-for="t in tiposMembresia" :key="t.id" :value="t.id">{{ t.nombre }} · {{ clp(t.precio) }}</option>
                  </select>
                </label>
                <label class="ui-field">
                  <span class="ui-label">Desde</span>
                  <input v-model="nuevaMembresia.fechaInicio" type="date" class="ui-input" required />
                </label>
              </div>
              <div class="ui-modal__actions">
                <button type="submit" class="ui-btn ui-btn--green" :disabled="guardando || !nuevaMembresia.idTipoMembresia">Asignar membresía</button>
              </div>
            </form>
          </template>

          <div class="ui-modal__actions">
            <button type="button" class="ui-btn ui-btn--ghost" @click="cerrar">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import adminService from '@/services/admin.service'
import membresiaService from '@/services/membresia.service'
import { useToast } from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'
import { clp, fecha, hoyIso } from '@/utils/formato'

const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default defineComponent({
  name: 'AdminSociosView',
  components: { AppLayout },

  setup() {
    const { mostrarToast } = useToast()

    const remadores = ref([])
    const cargando  = ref(true)
    const busqueda  = ref('')
    const filtro    = ref('todos')
    const tiposMembresia = ref([])

    const seleccionado = ref(null)
    const detalle      = ref(null)
    const guardando    = ref(false)
    const ficha = reactive({ certMedicaVence: '', tieneRemoPropio: false, tieneSalvavidasPropio: false })
    const nuevaMembresia = reactive({ idTipoMembresia: null, fechaInicio: hoyIso() })

    const habilitado = (r) => r.estadoMembresia === 'Vigente' && ['Vigente', 'Por vencer'].includes(r.estadoCertMedica)

    const filtros = [
      { id: 'todos',       nombre: 'Todos',         fn: () => true },
      { id: 'habilitados', nombre: 'Al día',        fn: habilitado },
      { id: 'pendientes',  nombre: 'Con pendientes', fn: (r) => !habilitado(r) },
    ]

    const conteo = (id) => remadores.value.filter(filtros.find(f => f.id === id).fn).length

    const visibles = computed(() => {
      const q = normalizar(busqueda.value)
      const fn = filtros.find(f => f.id === filtro.value).fn
      return remadores.value
        .filter(fn)
        .filter(r => !q || normalizar(r.nombreCompleto).includes(q) || normalizar(r.rut).includes(q))
    })

    const claseMembresia = (e) => ({ Vigente: 'ui-chip--green', Futura: 'ui-chip--indigo', Vencida: 'ui-chip--red' }[e] ?? 'ui-chip--amber')
    const claseCert      = (e) => ({ Vigente: 'ui-chip--green', 'Por vencer': 'ui-chip--amber', Vencida: 'ui-chip--red' }[e] ?? 'ui-chip--amber')

    const cargar = async () => {
      try {
        const [rem, tipos] = await Promise.all([adminService.remadores(), adminService.tiposMembresia()])
        remadores.value = (rem.data.data ?? []).sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))
        tiposMembresia.value = tipos.data.data ?? []
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cargar la lista de socios.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    const cargarDetalle = async (id) => {
      const res = await adminService.remador(id)
      detalle.value = res.data.data
      Object.assign(ficha, {
        certMedicaVence:       detalle.value.certMedicaVence ?? '',
        tieneRemoPropio:       detalle.value.tieneRemoPropio,
        tieneSalvavidasPropio: detalle.value.tieneSalvavidasPropio,
      })
    }

    const abrir = async (r) => {
      seleccionado.value = r
      detalle.value = null
      Object.assign(nuevaMembresia, { idTipoMembresia: null, fechaInicio: hoyIso() })
      try {
        await cargarDetalle(r.id)
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cargar la ficha.'), 'error', 5000)
        seleccionado.value = null
      }
    }

    const cerrar = () => { seleccionado.value = null }

    const ejecutar = async (accion, exito) => {
      guardando.value = true
      try {
        await accion()
        mostrarToast(exito, 'success', 3500)
        await Promise.all([cargarDetalle(seleccionado.value.id), cargarLista()])
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo guardar.'), 'error', 6000)
      } finally {
        guardando.value = false
      }
    }

    const cargarLista = async () => {
      const res = await adminService.remadores()
      remadores.value = (res.data.data ?? []).sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))
    }

    const guardarFicha = () => ejecutar(
      () => adminService.actualizarRemador(seleccionado.value.id, {
        certMedicaVence:       ficha.certMedicaVence || null,
        tieneRemoPropio:       ficha.tieneRemoPropio,
        tieneSalvavidasPropio: ficha.tieneSalvavidasPropio,
      }),
      'Ficha actualizada.')

    const asignarMembresia = () => ejecutar(
      () => membresiaService.crearMembresia({
        idRemador:       seleccionado.value.id,
        idTipoMembresia: nuevaMembresia.idTipoMembresia,
        fechaInicio:     nuevaMembresia.fechaInicio,
      }),
      'Membresía asignada.')

    onMounted(cargar)

    return {
      cargando, busqueda, filtro, filtros, conteo, visibles,
      claseMembresia, claseCert, tiposMembresia,
      seleccionado, detalle, guardando, ficha, nuevaMembresia,
      abrir, cerrar, guardarFicha, asignarMembresia,
      clp, fecha,
    }
  },
})
</script>

<style scoped>
.buscador { width: min(280px, 100%); }
.nombre { display: block; font-weight: 500; }
.rut { display: block; font-size: 0.74rem; }
.estado { margin-left: 6px; }
.dias { font-size: 0.74rem; margin-left: 6px; }
.modal-titulo { font-size: 1.1rem; }
.bloque {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 0.5px solid var(--surface-border, #1e2433);
}
.bloque .ui-section-title { margin-bottom: 0; }
.actual { font-size: 0.82rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  align-self: end;
  padding-bottom: 10px;
}
</style>
