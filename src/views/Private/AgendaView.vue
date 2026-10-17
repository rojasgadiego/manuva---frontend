<template>
  <AppLayout>
    <div class="dashboard-content">
      <div class="scene">

        <Transition name="slide-left">
          <CalendarPanel
            v-if="view === 'calendar'"
            :calendar-days="calendarDays"
            :month-year-label="monthYearLabel"
            :selected-date="selectedDay?.date ?? null"
            @prev-month="prevMonth"
            @next-month="nextMonth"
            @select-day="selectDay"
          />
        </Transition>

        <Transition name="slide-right">
          <FormularioAgenda
            v-if="view === 'form'"
            :selected-day="selectedDay"
            @go-back="goBack"
            @cambio="onCambio"
          />
        </Transition>

      </div>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout        from '@/components/Layout/AppLayout.vue'
import CalendarPanel    from '@/components/Agenda/Calendarpanel.vue'
import FormularioAgenda from '@/components/Agenda/FormularioAgenda.vue'
import salidaService    from '@/services/salida.service'
import { useToast }     from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'

const formatDate = (d) => {
  const y   = d.getFullYear()
  const m   = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Primer lunes visible en la grilla de 6 semanas del mes. */
const inicioGrilla = (mes) => {
  const primero = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const offset  = primero.getDay() === 0 ? 6 : primero.getDay() - 1
  return new Date(mes.getFullYear(), mes.getMonth(), 1 - offset)
}

export default defineComponent({
  name: 'AgendaCanoasDashboard',
  components: { AppLayout, CalendarPanel, FormularioAgenda },

  setup() {
    const route  = useRoute()
    const router = useRouter()
    const { mostrarToast } = useToast()

    const view            = ref('calendar')
    const selectedDay     = ref(null)
    const currentMonth    = ref(new Date())
    const salidasPorFecha = ref({})
    const cargando        = ref(false)

    // ── Cargar resumen del rango visible del mes ──────
    const cargarSalidas = async () => {
      cargando.value = true
      try {
        const inicio = inicioGrilla(currentMonth.value)
        const fin    = new Date(inicio)
        fin.setDate(inicio.getDate() + 41)

        const response = await salidaService.getResumenRango(formatDate(inicio), formatDate(fin))
        const agrupadas = {}
        ;(response.data?.data ?? []).forEach(d => {
          const fecha = d.fecha?.substring(0, 10)
          if (!fecha) return
          agrupadas[fecha] = {
            totalSalidas:     d.totalSalidas,
            totalCupos:       d.totalCupos,
            cuposDisponibles: d.cuposDisponibles,
          }
        })
        salidasPorFecha.value = agrupadas
      } catch (error) {
        mostrarToast(mensajeError(error, 'No se pudo cargar el calendario.'), 'error', 5000)
      } finally {
        cargando.value = false
      }
    }

    // ── Calendario ────────────────────────────────
    const monthYearLabel = computed(() =>
      currentMonth.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase())
    )

    const buildDay = (date, currentMonthFlag) => {
      const key     = formatDate(date)
      const today   = new Date(); today.setHours(0, 0, 0, 0)
      const cmp     = new Date(date); cmp.setHours(0, 0, 0, 0)
      const resumen = salidasPorFecha.value[key] ?? null

      return {
        date:             key,
        day:              date.getDate(),
        currentMonth:     currentMonthFlag,
        isToday:          key === formatDate(new Date()),
        isPast:           cmp < today,
        totalSalidas:     resumen?.totalSalidas     ?? 0,
        totalCupos:       resumen?.totalCupos       ?? 0,
        cuposDisponibles: resumen?.cuposDisponibles ?? 0,
        tieneSalidas:     (resumen?.totalSalidas    ?? 0) > 0,
      }
    }

    const calendarDays = computed(() => {
      const inicio = inicioGrilla(currentMonth.value)
      const month  = currentMonth.value.getMonth()
      return Array.from({ length: 42 }, (_, i) => {
        const cur = new Date(inicio)
        cur.setDate(inicio.getDate() + i)
        return buildDay(cur, cur.getMonth() === month)
      })
    })

    const cambiarMes = (delta) => {
      currentMonth.value = new Date(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() + delta, 1
      )
      cargarSalidas()
    }

    // ── Navegación ────────────────────────────────
    const selectDay = (day) => {
      selectedDay.value = day
      view.value = 'form'
      router.replace({ query: { ...route.query, fecha: day.date } })
    }

    const goBack = () => {
      view.value = 'calendar'
      const { fecha, ...resto } = route.query // eslint-disable-line no-unused-vars
      router.replace({ query: resto })
    }

    // El formulario avisa cuando cambió algo (reserva creada, unirse, salir): refrescar cupos
    const onCambio = () => cargarSalidas()

    onMounted(async () => {
      // /agenda?fecha=YYYY-MM-DD abre directamente ese día (p. ej. desde el dashboard)
      const fecha = route.query.fecha
      if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const [y, m, d] = fecha.split('-').map(Number)
        currentMonth.value = new Date(y, m - 1, 1)
        await cargarSalidas()
        const dia = calendarDays.value.find(x => x.date === fecha) ?? buildDay(new Date(y, m - 1, d), true)
        if (!dia.isPast) selectDay(dia)
      } else {
        await cargarSalidas()
      }
    })

    return {
      view, selectedDay, goBack, selectDay, onCambio,
      calendarDays, monthYearLabel,
      prevMonth: () => cambiarMes(-1),
      nextMonth: () => cambiarMes(1),
      cargando,
    }
  },
})
</script>

<style scoped>
* { box-sizing: border-box; }

.dashboard-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.scene {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.42s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-left-leave-to   { transform: translateX(-100%); opacity: 0; }

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.42s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from { transform: translateX(100%); opacity: 0; }
.slide-right-leave-to   { transform: translateX(100%); opacity: 0; }
</style>