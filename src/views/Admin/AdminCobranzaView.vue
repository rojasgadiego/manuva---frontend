<template>
  <AppLayout>
    <div class="ui-page">
      <div class="ui-page__head">
        <div>
          <h1 class="ui-title">Cobranza</h1>
          <p class="ui-subtitle">Cuotas pendientes y vencidas de los socios.</p>
        </div>
        <form class="generar" @submit.prevent="generar">
          <label class="ui-field">
            <span class="ui-label">Generar cuotas del mes</span>
            <input v-model="periodoGenerar" type="month" class="ui-input" required />
          </label>
          <button type="submit" class="ui-btn ui-btn--ghost" :disabled="generando">Generar</button>
        </form>
      </div>

      <div class="resumen">
        <div class="ui-card resumen__item">
          <span class="ui-section-title">Por cobrar</span>
          <span class="resumen__valor">{{ clp(total) }}</span>
          <span class="ui-muted">{{ cuotas.length }} cuota{{ cuotas.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="ui-card resumen__item">
          <span class="ui-section-title">Vencidas</span>
          <span class="resumen__valor resumen__valor--red">{{ vencidas.length }}</span>
          <span class="ui-muted">{{ clp(vencidas.reduce((s, c) => s + Number(c.monto), 0)) }}</span>
        </div>
      </div>

      <section class="ui-card ui-card--flush">
        <div v-if="cargando" class="ui-skeleton"></div>
        <div v-else-if="!cuotas.length" class="ui-empty">No hay cuotas pendientes. ¡Todos al día!</div>
        <div v-else class="ui-table-wrap">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>Periodo</th>
                <th>Vence</th>
                <th class="ui-num">Monto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in cuotas" :key="c.idCuota">
                <td>
                  <span class="nombre">{{ c.nombreCompleto }}</span>
                  <span class="ui-muted contacto">{{ c.email }}{{ c.telefono ? ` · ${c.telefono}` : '' }}</span>
                </td>
                <td class="periodo">{{ periodo(c.periodo) }}</td>
                <td>
                  {{ fecha(c.fechaVencimiento) }}
                  <span v-if="c.diasVencida > 0" class="ui-muted atraso">{{ c.diasVencida }} d de atraso</span>
                </td>
                <td class="ui-num">{{ clp(c.monto) }}</td>
                <td><span class="ui-chip" :class="claseEstadoCuota(c.estadoPago)">{{ c.estadoPago }}</span></td>
                <td class="ui-num"><button class="ui-btn ui-btn--green ui-btn--sm" @click="abrirPago(c)">Registrar pago</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Registrar pago manual -->
      <div v-if="cuotaPago" class="ui-modal-backdrop" @click.self="cuotaPago = null">
        <form class="ui-modal" role="dialog" aria-modal="true" aria-label="Registrar pago" @submit.prevent="registrarPago">
          <div>
            <h2 class="ui-title modal-titulo">Registrar pago</h2>
            <p class="ui-subtitle">{{ cuotaPago.nombreCompleto }} · {{ periodo(cuotaPago.periodo) }} · {{ clp(cuotaPago.monto) }}</p>
          </div>
          <div class="ui-form-grid">
            <label class="ui-field">
              <span class="ui-label">Método</span>
              <select v-model="pago.idMetodoPago" class="ui-input" required>
                <option :value="null" disabled>Selecciona</option>
                <option v-for="m in metodos" :key="m.id" :value="m.id">{{ m.nombre }}</option>
              </select>
            </label>
            <label class="ui-field">
              <span class="ui-label">Monto pagado</span>
              <input v-model.number="pago.montoPagado" type="number" min="1" step="1" class="ui-input" required />
            </label>
          </div>
          <label class="ui-field">
            <span class="ui-label">Comprobante <span class="ui-muted">opcional</span></span>
            <input v-model="pago.comprobante" class="ui-input" maxlength="100" placeholder="N° de transferencia, boleta…" />
          </label>
          <label class="ui-field">
            <span class="ui-label">Observaciones <span class="ui-muted">opcional</span></span>
            <textarea v-model="pago.observaciones" class="ui-input" rows="2" maxlength="300"></textarea>
          </label>
          <div class="ui-modal__actions">
            <button type="button" class="ui-btn ui-btn--ghost" @click="cuotaPago = null">Cancelar</button>
            <button type="submit" class="ui-btn ui-btn--green" :disabled="guardando || !pago.idMetodoPago">Registrar pago</button>
          </div>
        </form>
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
import { clp, fecha, periodo, claseEstadoCuota, hoyIso } from '@/utils/formato'

export default defineComponent({
  name: 'AdminCobranzaView',
  components: { AppLayout },

  setup() {
    const { mostrarToast } = useToast()

    const cuotas    = ref([])
    const metodos   = ref([])
    const cargando  = ref(true)
    const guardando = ref(false)
    const generando = ref(false)
    const periodoGenerar = ref(hoyIso().substring(0, 7))

    const cuotaPago = ref(null)
    const pago = reactive({ idMetodoPago: null, montoPagado: 0, comprobante: '', observaciones: '' })

    const total    = computed(() => cuotas.value.reduce((s, c) => s + Number(c.monto), 0))
    const vencidas = computed(() => cuotas.value.filter(c => c.estadoPago === 'Vencido'))

    const cargar = async () => {
      try {
        const res = await membresiaService.cuotasPendientes()
        cuotas.value = (res.data.data ?? []).sort((a, b) => b.diasVencida - a.diasVencida)
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudieron cargar las cuotas.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    const abrirPago = async (c) => {
      cuotaPago.value = c
      Object.assign(pago, { idMetodoPago: null, montoPagado: Number(c.monto), comprobante: '', observaciones: '' })
      if (!metodos.value.length) {
        try {
          const res = await adminService.metodosPago()
          // Webpay se registra solo, al pagar en línea
          metodos.value = (res.data.data ?? []).filter(m => m.nombre !== 'Webpay Plus')
        } catch (e) {
          mostrarToast(mensajeError(e, 'No se pudieron cargar los métodos de pago.'), 'error', 5000)
        }
      }
    }

    const registrarPago = async () => {
      guardando.value = true
      try {
        await membresiaService.registrarPago({
          idCuota:       cuotaPago.value.idCuota,
          montoPagado:   pago.montoPagado,
          idMetodoPago:  pago.idMetodoPago,
          comprobante:   pago.comprobante.trim() || null,
          observaciones: pago.observaciones.trim() || null,
        })
        mostrarToast('Pago registrado.', 'success', 3500)
        cuotaPago.value = null
        await cargar()
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo registrar el pago.'), 'error', 6000)
      } finally {
        guardando.value = false
      }
    }

    const generar = async () => {
      generando.value = true
      try {
        const res = await membresiaService.generarCuotas(periodoGenerar.value)
        mostrarToast(res.data.message || 'Cuotas generadas.', 'success', 4000)
        await cargar()
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudieron generar las cuotas.'), 'error', 6000)
      } finally {
        generando.value = false
      }
    }

    onMounted(cargar)

    return {
      cuotas, metodos, cargando, guardando, generando, periodoGenerar,
      total, vencidas, cuotaPago, pago,
      abrirPago, registrarPago, generar,
      clp, fecha, periodo, claseEstadoCuota,
    }
  },
})
</script>

<style scoped>
.generar { display: flex; align-items: flex-end; gap: 8px; }
.resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.resumen__item { display: flex; flex-direction: column; gap: 2px; }
.resumen__item .ui-section-title { margin-bottom: 4px; }
.resumen__valor {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
}
.resumen__valor--red { color: var(--ui-red); }
.nombre { display: block; font-weight: 500; }
.contacto { display: block; font-size: 0.74rem; }

.atraso { display: block; font-size: 0.72rem; color: var(--ui-red); }
.modal-titulo { font-size: 1.1rem; }
</style>
