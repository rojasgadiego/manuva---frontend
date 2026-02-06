<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Agenda – {{ dateLabel }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="schedule-grid">
        <div
          v-for="time in times"
          :key="time"
          class="hour-row"
        >
          <div class="hour-label">{{ time }}</div>
          <div class="salidas-container">
            <div
              v-for="(s, index) in salidasPorTime(time)"
              :key="index"
              class="salida-chip"
              :class="s.cupos === 0 ? 'full' : 'available'"
            >
              {{ s.hora }} – {{ s.cupos === 0 ? 'Completo' : s.cupos + ' cupos' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'DayAgendaModal',
  props: {
    date: { type: String, required: true },
    salidas: { type: Array, default: () => [] },
    visible: { type: Boolean, default: false } // <--- cambié de 'show' a 'visible'
  },
  emits: ['close'],
  setup(props, { emit }) {

    // Genera intervalos de 30 min de 8:00 a 19:00
    const times = []
    for (let h = 8; h <= 19; h++) {
      times.push(`${String(h).padStart(2,'0')}:00`)
      times.push(`${String(h).padStart(2,'0')}:30`)
    }
    times.pop() // elimina 19:30

    const dateLabel = computed(() => {
      const d = new Date(props.date)
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    })

    const salidasPorTime = (time) => {
      // Filtra todas las salidas que coinciden exactamente con el horario
      return props.salidas.filter(s => s.hora === time)
    }

    const close = () => emit('close')

    return { times, dateLabel, salidasPorTime, close }
  }
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 10px;
}

.modal-container {
  background: white;
  border-radius: 14px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  animation: fadeIn 0.25s ease;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.schedule-grid {
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  gap: 12px;
}

.hour-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.hour-label {
  min-width: 50px;
  font-weight: 600;
  color: #555;
}

.salidas-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.salida-chip {
  background: #e0f2f1;
  color: #00695c;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
}

.salida-chip.full {
  background: #ffebee;
  color: #c62828;
  text-decoration: line-through;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 95%;
    padding: 10px;
  }
  .hour-label {
    min-width: 40px;
    font-size: 0.75rem;
  }
  .salida-chip {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}
</style>
