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
            @submit="handleSubmit"
          />
        </Transition>

      </div>
    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import AppLayout        from '@/components/Layout/AppLayout.vue'
import CalendarPanel    from '@/components/Agenda/Calendarpanel.vue'
import FormularioAgenda from '@/components/Agenda/FormularioAgenda.vue'
import salidaService    from '@/services/salida.service'

export default defineComponent({
  name: 'AgendaCanoasDashboard',
  components: { AppLayout, CalendarPanel, FormularioAgenda },

  setup() {
    const view         = ref('calendar')
    const selectedDay  = ref(null)
    const currentMonth = ref(new Date())
    const salidasPorFecha = ref({})
    const cargando     = ref(false)
    const cache        = {}

    // ── Helpers ───────────────────────────────────
    const formatDate = (d) => {
      const y   = d.getFullYear()
      const m   = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const getRango = () => {
      const hoy    = new Date()
      const fin    = new Date()
      fin.setDate(hoy.getDate() + 14)

      return {
        fechaInicio: formatDate(hoy),
        fechaFin:    formatDate(fin),
      }
    }

    // ── Cargar resumen desde la API ───────────────
    const cargarSalidas = async () => {
      cargando.value = true
      try {
        const { fechaInicio, fechaFin } = getRango()
        const response = await salidaService.getResumenRango(fechaInicio, fechaFin)
        const dias     = response.data?.data ?? []

        const agrupadas = {}
        dias.forEach(d => {
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
        console.error('Error al cargar resumen:', error)
      } finally {
        cargando.value = false
      }
    }

    onMounted(cargarSalidas)

    // ── Calendario ────────────────────────────────
    const monthYearLabel = computed(() =>
      currentMonth.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
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
      const year  = currentMonth.value.getFullYear()
      const month = currentMonth.value.getMonth()
      const start    = new Date(year, month, 1)
      const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1
      const firstVisible = new Date(year, month, 1 - startDay)
      const days = []
      for (let i = 0; i < 42; i++) {
        const cur = new Date(firstVisible)
        cur.setDate(firstVisible.getDate() + i)
        days.push(buildDay(cur, cur.getMonth() === month))
      }
      return days
    })

    const prevMonth = () => {
      currentMonth.value = new Date(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() - 1, 1
      )
      cargarSalidas()
    }

    const nextMonth = () => {
      currentMonth.value = new Date(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() + 1, 1
      )
      cargarSalidas()
    }

    // ── Navegación ────────────────────────────────
    const selectDay = (day) => {
      selectedDay.value = day
      view.value = 'form'
    }

    const goBack = () => {
      view.value = 'calendar'
    }

    const handleSubmit = async (payload) => {
      console.log('Nueva reserva:', payload)
      // Invalidar cache del mes actual para reflejar la nueva reserva
      const key = `${currentMonth.value.getFullYear()}-${currentMonth.value.getMonth()}`
      delete cache[key]
      await cargarSalidas()
      goBack()
    }

    return {
      view, selectedDay, goBack, selectDay, handleSubmit,
      calendarDays, monthYearLabel, prevMonth, nextMonth,
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