<template>
  <AppLayout>
    <div class="ui-page">
      <div class="ui-page__head">
        <div>
          <h1 class="ui-title">Mi membresía</h1>
          <p class="ui-subtitle">Estado de tu membresía y tus cuotas del club.</p>
        </div>
      </div>

      <!-- Resultado al volver de Webpay -->
      <div v-if="resultadoPago" class="ui-notice" :class="resultadoPago.clase" role="status">
        <strong>{{ resultadoPago.titulo }}</strong> {{ resultadoPago.texto }}
      </div>

      <div v-if="cargando" class="ui-card ui-skeleton"></div>

      <template v-else>
        <!-- Membresía -->
        <section class="ui-card membresia">
          <template v-if="datos.membresia">
            <div>
              <p class="ui-section-title">Membresía {{ datos.membresia.tipo.toLowerCase() }}</p>
              <p class="membresia__rango">{{ fecha(datos.membresia.fechaInicio) }} → {{ fecha(datos.membresia.fechaFin) }}</p>
            </div>
            <div class="membresia__estado">
              <span class="ui-chip" :class="datos.membresia.estaVigente ? 'ui-chip--green' : 'ui-chip--red'">
                {{ datos.membresia.estaVigente ? 'Vigente' : 'Vencida' }}
              </span>
              <span v-if="datos.membresia.estaVigente" class="ui-muted membresia__dias">
                {{ datos.membresia.diasRestantes }} día{{ datos.membresia.diasRestantes !== 1 ? 's' : '' }} restantes
              </span>
            </div>
          </template>
          <p v-else class="ui-muted">
            No tienes una membresía registrada. Pide a la directiva del club que te asigne una.
          </p>
        </section>

        <!-- Resumen de deuda -->
        <section v-if="pendientes.length" class="ui-card deuda">
          <div>
            <p class="ui-section-title">Por pagar</p>
            <p class="deuda__monto">{{ clp(totalPendiente) }}</p>
            <p class="ui-muted">{{ pendientes.length }} cuota{{ pendientes.length !== 1 ? 's' : '' }} pendiente{{ pendientes.length !== 1 ? 's' : '' }}</p>
          </div>
          <p class="ui-muted deuda__nota">Pago seguro con Webpay (tarjeta de débito o crédito).</p>
        </section>

        <!-- Cuotas -->
        <section class="ui-card ui-card--flush">
          <div v-if="!datos.cuotas.length" class="ui-empty">No tienes cuotas registradas.</div>
          <div v-else class="ui-table-wrap">
            <table class="ui-table">
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Vence</th>
                  <th class="ui-num">Monto</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in datos.cuotas" :key="c.idCuota" :class="{ resaltada: c.idCuota === cuotaResaltada }">
                  <td class="periodo">{{ periodo(c.periodo) }}</td>
                  <td>{{ fecha(c.fechaVencimiento) }}</td>
                  <td class="ui-num">{{ clp(c.monto) }}</td>
                  <td>
                    <span class="ui-chip" :class="claseEstadoCuota(c.estado)">{{ c.estado }}</span>
                    <span v-if="c.fechaPago" class="ui-muted pagado-el">
                      {{ new Date(c.fechaPago).toLocaleDateString('es-CL') }}{{ c.metodoPago ? ` · ${c.metodoPago}` : '' }}
                    </span>
                  </td>
                  <td class="ui-num">
                    <button
                      v-if="c.pagable"
                      class="ui-btn ui-btn--primary ui-btn--sm"
                      :disabled="pagando !== null"
                      @click="pagar(c)"
                    >{{ pagando === c.idCuota ? 'Redirigiendo…' : 'Pagar' }}</button>
                  </td>
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
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'
import membresiaService, { irAWebpay } from '@/services/membresia.service'
import { useToast } from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'
import { clp, fecha, periodo, claseEstadoCuota } from '@/utils/formato'

const RESULTADOS = {
  aprobada:  { clase: 'ui-notice--ok',    titulo: 'Pago aprobado.',   texto: 'Tu cuota quedó registrada como pagada. ¡Gracias!' },
  rechazada: { clase: 'ui-notice--error', titulo: 'Pago rechazado.',  texto: 'Webpay no autorizó el pago. No se realizó ningún cobro; puedes intentarlo de nuevo.' },
  anulada:   { clase: 'ui-notice--warn',  titulo: 'Pago anulado.',    texto: 'Cancelaste el pago en Webpay. La cuota sigue pendiente.' },
  error:     { clase: 'ui-notice--error', titulo: 'No pudimos confirmar el pago.', texto: 'Si se realizó un cobro, contacta a la directiva con el comprobante.' },
}

export default defineComponent({
  name: 'MembresiaView',
  components: { AppLayout },

  setup() {
    const route  = useRoute()
    const router = useRouter()
    const { mostrarToast } = useToast()

    const datos    = ref({ membresia: null, cuotas: [] })
    const cargando = ref(true)
    const pagando  = ref(null)

    // ?pago=aprobada&cuota=12 llega desde el retorno de Webpay
    const resultadoPago  = ref(RESULTADOS[route.query.pago] ?? null)
    const cuotaResaltada = Number(route.query.cuota) || null
    if (route.query.pago) router.replace({ query: {} })

    const cargar = async () => {
      try {
        const res = await membresiaService.miMembresia()
        datos.value = res.data.data
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo cargar tu membresía.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    const pendientes     = computed(() => datos.value.cuotas.filter(c => c.pagable))
    const totalPendiente = computed(() => pendientes.value.reduce((s, c) => s + Number(c.monto), 0))

    const pagar = async (cuota) => {
      pagando.value = cuota.idCuota
      try {
        const res = await membresiaService.iniciarPagoWebpay(cuota.idCuota)
        irAWebpay(res.data.data)
      } catch (e) {
        mostrarToast(mensajeError(e, 'No se pudo iniciar el pago.'), 'error', 6000)
        pagando.value = null
      }
    }

    onMounted(cargar)

    return {
      datos, cargando, pagando, resultadoPago, cuotaResaltada,
      pendientes, totalPendiente, pagar,
      clp, fecha, periodo, claseEstadoCuota,
    }
  },
})
</script>

<style scoped>
.membresia, .deuda {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.membresia .ui-section-title { margin-bottom: 4px; }
.membresia__rango {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
}
.membresia__estado { display: flex; align-items: center; gap: 10px; }
.membresia__dias { font-size: 0.8rem; }

.deuda .ui-section-title { margin-bottom: 2px; }
.deuda__monto {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--ui-amber);
  line-height: 1.1;
}
.deuda__nota { font-size: 0.8rem; max-width: 280px; }

.periodo { font-weight: 500; }
.pagado-el { font-size: 0.74rem; margin-left: 8px; }
.resaltada td { background: rgba(56, 189, 248, 0.08); }
</style>
