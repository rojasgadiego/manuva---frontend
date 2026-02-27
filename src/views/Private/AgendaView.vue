<template>
  <AppLayout>
    <div class="dashboard-content">
      <div class="scene">

        <!-- CALENDARIO -->
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

        <!-- FORMULARIO -->
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
import { defineComponent, ref, computed } from 'vue'
import AppLayout        from '@/components/Layout/AppLayout.vue'
import CalendarPanel    from '@/components/Agenda/Calendarpanel.vue'
import FormularioAgenda from '@/components/Agenda/FormularioAgenda.vue'

export default defineComponent({
  name: 'AgendaCanoasDashboard',
  components: { AppLayout, CalendarPanel, FormularioAgenda },

  setup() {
    // ── Vista activa ──────────────────────────────
    const view        = ref('calendar')   // 'calendar' | 'form'
    const selectedDay = ref(null)

    // ── Calendario ────────────────────────────────
    const currentMonth = ref(new Date())

    /**
     * Mock de salidas existentes.
     * En producción esto vendría del store / API.
     */
    const salidas = ref({
      '2026-02-14': [{ hora: '08:00', cupos: 2 }, { hora: '08:30', cupos: 1 }, { hora: '09:00', cupos: 0 }],
      '2026-02-15': [{ hora: '08:00', cupos: 1 }, { hora: '09:00', cupos: 2 }],
      '2026-02-27': [{ hora: '10:00', cupos: 3 }],
    })

    const formatDate = (d) => {
      const y   = d.getFullYear()
      const m   = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const monthYearLabel = computed(() =>
      currentMonth.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    )

    const buildDay = (date, currentMonthFlag) => {
      const key   = formatDate(date)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const cmp   = new Date(date); cmp.setHours(0, 0, 0, 0)
      return {
        date: key,
        day: date.getDate(),
        currentMonth: currentMonthFlag,
        isToday: key === formatDate(new Date()),
        isPast: cmp < today,
        salidas: salidas.value[key] || [],
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

    const prevMonth = () =>
      currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)

    const nextMonth = () =>
      currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)

    // ── Navegación ────────────────────────────────
    const selectDay = (day) => {
      selectedDay.value = day
      view.value = 'form'
    }

    const goBack = () => {
      view.value = 'calendar'
    }

    /**
     * Recibe el payload emitido por BookingFormPanel.
     * Aquí puedes hacer dispatch al store o llamar a la API.
     */
    const handleSubmit = (payload) => {
      console.log('Nueva reserva:', payload)
      goBack()
    }

    return {
      view, selectedDay, goBack, selectDay, handleSubmit,
      calendarDays, monthYearLabel, prevMonth, nextMonth,
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

/* Contenedor que recorta los paneles fuera de vista */
.scene {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Transición: calendario sale por izquierda ── */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.42s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-left-leave-to   { transform: translateX(-100%); opacity: 0; }

/* ── Transición: formulario entra por derecha ── */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.42s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from { transform: translateX(100%); opacity: 0; }
.slide-right-leave-to   { transform: translateX(100%); opacity: 0; }
</style>