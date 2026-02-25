<template>
  <AppLayout>
    <div class="dashboard-content">

      <!-- CALENDARIO -->
      <div class="calendar-card">
        <div class="calendar-header">
          <button @click="prevMonth">‹</button>
          <h2>{{ monthYearLabel }}</h2>
          <button @click="nextMonth">›</button>
        </div>

        <div class="calendar-grid">
          <!-- Nombres de días -->
          <div v-for="d in weekDays" :key="d" class="calendar-day-name">
            {{ d }}
          </div>

          <!-- Días -->
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="calendar-day"
            :class="{
              today: day.isToday,
              selected: isSelected(day.date),
              inactive: !day.currentMonth,
              past: day.isPast
            }"
            @click="!day.isPast && openModal(day)"
          >
            <div class="day-header">
              <span>{{ day.day }}</span>
              <span v-if="day.salidas.length" class="dot"></span>
            </div>

            <div class="salidas-preview">
              <span
                v-for="(s, i) in day.salidas.slice(0, 2)"
                :key="i"
                class="salida-chip"
                :class="s.cupos === 0 ? 'full' : 'available'"
              >
                {{ s.hora }}
              </span>

              <span v-if="day.salidas.length > 2" class="more">
                +{{ day.salidas.length - 2 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL -->
      <DayAgendaModal
        :visible="modalVisible"
        :date="selectedDay?.date || ''"
        :salidas="selectedDay?.salidas || []"
        @close="modalVisible = false"
      />

    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import DayAgendaModal from '@/components/schedule/DayAgendaModal.vue'

export default defineComponent({
  name: 'AgendaCanoasDashboard',
  components: { AppLayout, DayAgendaModal },
  setup() {

    const currentMonth = ref(new Date())
    const selectedDay = ref(null)
    const modalVisible = ref(false)

    const weekDays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

    const salidas = ref({
      '2026-02-14': [
        { hora: '08:00', cupos: 2 },
        { hora: '08:30', cupos: 1 },
        { hora: '09:00', cupos: 0 }
      ],
      '2026-02-15': [
        { hora: '08:00', cupos: 1 },
        { hora: '09:00', cupos: 2 }
      ]
    })

    const formatDate = (d) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2,'0')
      const day = String(d.getDate()).padStart(2,'0')
      return `${year}-${month}-${day}`
    }

    const monthYearLabel = computed(() =>
      currentMonth.value.toLocaleDateString('es-ES',{month:'long', year:'numeric'})
    )

    const buildDay = (date,currentMonthFlag) => {
      const key = formatDate(date)

      const today = new Date()
      today.setHours(0,0,0,0)

      const compareDate = new Date(date)
      compareDate.setHours(0,0,0,0)

      return {
        date: key,
        day: date.getDate(),
        currentMonth: currentMonthFlag,
        isToday: key === formatDate(new Date()),
        isPast: compareDate < today,
        salidas: salidas.value[key] || []
      }
    }

    const calendarDays = computed(() => {
      const year = currentMonth.value.getFullYear()
      const month = currentMonth.value.getMonth()

      const start = new Date(year, month, 1)
      const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1

      const firstVisibleDay = new Date(year, month, 1 - startDay)

      const days = []

      for (let i = 0; i < 42; i++) {
        const current = new Date(firstVisibleDay)
        current.setDate(firstVisibleDay.getDate() + i)

        const isCurrentMonth = current.getMonth() === month

        days.push(buildDay(current, isCurrentMonth))
      }

      return days
    })

    const prevMonth = () => {
      currentMonth.value = new Date(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() - 1,
        1
      )
    }

    const nextMonth = () => {
      currentMonth.value = new Date(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() + 1,
        1
      )
    }

    const isSelected = (date) => selectedDay.value?.date === date

    const openModal = (day) => {
      if (day.isPast) return
      selectedDay.value = day
      modalVisible.value = true
    }

    return {
      weekDays,
      calendarDays,
      monthYearLabel,
      prevMonth,
      nextMonth,
      isSelected,
      openModal,
      modalVisible,
      selectedDay
    }
  }
})
</script>

<style scoped>
.dashboard-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.calendar-card {
  background: rgb(203, 230, 238);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 6px 20px rgba(0,0,0,.08);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.calendar-header button {
  border: none;
  background: #e3f2fd;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr);
  gap: 8px;
  flex: 1;
}

.calendar-day-name {
  text-align: center;
  font-size: .75rem;
  font-weight: 600;
  color: #607d8b;
}

.calendar-day {
  background: #f7fafc;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: all .15s ease;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background: #e1f5fe;
  transform: translateY(-2px);
}

.calendar-day.today {
  border: 2px solid #0288d1;
}

.calendar-day.selected {
  background: #b3e5fc;
}

.calendar-day.inactive {
  opacity: .4;
}

/* 🔒 Bloqueado */
.calendar-day.past {
  opacity: 0.35;
  background: #eceff1;
  cursor: not-allowed;
}

.calendar-day.past:hover {
  transform: none;
  background: #eceff1;
}

.day-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.dot {
  width: 6px;
  height: 6px;
  background: #0288d1;
  border-radius: 50%;
}

.salidas-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.salida-chip {
  font-size: .65rem;
  padding: 3px 7px;
  border-radius: 12px;
}

.salida-chip.available {
  background: #e0f2f1;
  color: #00695c;
}

.salida-chip.full {
  background: #ffebee;
  color: #c62828;
  text-decoration: line-through;
}

.more {
  font-size: .65rem;
  color: #555;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .calendar-card {
    flex: none;
  }

  .calendar-grid {
    grid-template-rows: auto;
  }

  .calendar-day {
    min-height: 80px;
  }
}
</style>