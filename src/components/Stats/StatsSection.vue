<template>
  <div class="stats-section">
    <div class="section-header">
      <h2>{{ titulo }}</h2>
      <div class="header-controls">
        <div class="period-selector" v-if="mostrarSelectorPeriodo">
          <button 
            v-for="periodo in periodosDisponibles"
            :key="periodo.value"
            :class="{ active: periodoActivo === periodo.value }" 
            @click="cambiarPeriodo(periodo.value)"
            :title="periodoActivo === periodo.value ? 'Período actual' : `Cambiar a ${periodo.label}`"
          >
            {{ periodo.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Grid de estadísticas -->
    <div 
      class="stats-grid" 
      :class="`stats-grid-${estadisticas.length}`"
    >
      <div 
        v-for="(stat, index) in estadisticas"
        :key="index"
        class="stat-box"
        :class="stat.className || ''"
      >
        <div class="stat-title">{{ stat.titulo }}</div>
        <div 
          class="stat-value"
          :class="{ 'loading': cargando }"
          :title="stat.tooltip || `Valor: ${stat.valor} | ${stat.descripcion || ''}`"
        >
          <template v-if="stat.esDinero">
            {{ formatCurrency(stat.valor) }}
          </template>
          <template v-else>
            {{ formatNumber(stat.valor) }}
          </template>
        </div>
        
        <div 
          v-if="stat.tendencia"
          class="stat-trend" 
          :class="stat.tendencia.tipo || 'neutral'"
        >
          <span class="trend-icon">
            {{ stat.tendencia.icono || getTrendIcon(stat.tendencia.tipo) }}
          </span> 
          {{ stat.tendencia.valor || '0.0' }}% vs. {{ labelPeriodoAnterior }}
        </div>
        
        <div 
          v-else-if="stat.descripcion"
          class="stat-description"
        >
          {{ stat.descripcion }}
        </div>
      </div>
    </div>

    <div v-if="cargando" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatsSection',
  emits: ['period-change', 'refresh'],
  props: {
    // Título de la sección
    titulo: {
      type: String,
      default: 'Estadísticas'
    },
    
    // Array de estadísticas a mostrar
    estadisticas: {
      type: Array,
      required: true,
      validator: (estadisticas) => {
        return Array.isArray(estadisticas) && estadisticas.every(stat => 
          stat && typeof stat === 'object' && 
          'titulo' in stat && 
          'valor' in stat
        )
      }
    },
    
    // Configuración del selector de período
    mostrarSelectorPeriodo: {
      type: Boolean,
      default: true
    },
    
    periodoActivo: {
      type: String,
      default: 'dia',
      validator: (value) => ['dia', 'semana', 'mes'].includes(value)
    },
    
    periodosDisponibles: {
      type: Array,
      default: () => [
        { value: 'dia', label: 'Hoy' },
        { value: 'semana', label: 'Semana' },
        { value: 'mes', label: 'Mes' }
      ]
    },
    
    // Controles adicionales
    mostrarControlesExtra: {
      type: Boolean,
      default: false
    },
    
    // Estado de carga
    cargando: {
      type: Boolean,
      default: false
    },
    
    // Configuración de formato
    locale: {
      type: String,
      default: 'es-MX'
    },
    
    moneda: {
      type: String,
      default: 'MXN'
    }
  },
  
  setup(props, { emit }) {
    // Computed para el label del período anterior
    const labelPeriodoAnterior = computed(() => {
      const labels = {
        'dia': 'ayer',
        'semana': 'semana anterior',
        'mes': 'mes anterior'
      }
      return labels[props.periodoActivo] || 'período anterior'
    })
    
    // Métodos de formato
    const formatCurrency = (value) => {
      try {
        const numValue = Number(value) || 0
        return new Intl.NumberFormat(props.locale, {
          style: 'currency',
          currency: props.moneda
        }).format(numValue)
      } catch (error) {
        console.warn('Error al formatear moneda:', value, error)
        return '$0.00'
      }
    }
    
    const formatNumber = (value) => {
      try {
        const numValue = Number(value) || 0
        return new Intl.NumberFormat(props.locale).format(numValue)
      } catch (error) {
        console.warn('Error al formatear número:', value, error)
        return '0'
      }
    }
    
    const getTrendIcon = (tipo) => {
      const iconos = {
        'positive': '↑',
        'negative': '↓',
        'neutral': '↔'
      }
      return iconos[tipo] || '↔'
    }
    
    // Event handlers
    const cambiarPeriodo = (periodo) => {
      if (periodo === props.periodoActivo) return
      emit('period-change', periodo)
    }
    
    return {
      labelPeriodoAnterior,
      formatCurrency,
      formatNumber,
      getTrendIcon,
      cambiarPeriodo
    }
  }
}
</script>

<style scoped>
/* ===== SECCIÓN DE ESTADÍSTICAS ===== */
.stats-section {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.period-selector {
  display: flex;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.period-selector button {
  border: none;
  background: none;
  padding: 8px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-selector button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.period-selector button.active {
  background-color: #805ad5;
  color: white;
  font-weight: 500;
}

.extra-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.control-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ===== GRID DE ESTADÍSTICAS ===== */
.stats-grid {
  display: grid;
  gap: 20px;
}

/* Grid dinámico basado en el número de estadísticas */
.stats-grid-1 { grid-template-columns: 1fr; }
.stats-grid-2 { grid-template-columns: repeat(2, 1fr); }
.stats-grid-3 { grid-template-columns: repeat(3, 1fr); }
.stats-grid-4 { grid-template-columns: repeat(4, 1fr); }
.stats-grid-5 { grid-template-columns: repeat(3, 1fr); }
.stats-grid-6 { grid-template-columns: repeat(3, 1fr); }

/* Para más de 6 estadísticas, usar 4 columnas */
.stats-grid {
  grid-template-columns: repeat(4, 1fr);
}

.stat-box {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #805ad5;
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Clases específicas para diferentes tipos de estadísticas */
.stat-box.entradas {
  border-left-color: #805ad5;
}

.stat-box.salidas {
  border-left-color: #e53e3e;
}

.stat-box.movimientos {
  border-left-color: #3182ce;
}

.stat-box.inventario {
  border-left-color: #38a169;
}

.stat-box.critico {
  border-left-color: #d69e2e;
}

.stat-box.vencimiento {
  border-left-color: #dd6b20;
}

.stat-title {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.stat-value.loading {
  opacity: 0.6;
  animation: pulse 1.5s ease-in-out infinite;
}

.stat-trend {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.stat-trend.positive {
  color: #48bb78;
}

.stat-trend.negative {
  color: #e53e3e;
}

.stat-trend.neutral {
  color: #718096;
}

.trend-icon {
  font-weight: bold;
  margin-right: 5px;
}

.stat-description {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.3;
}

/* ===== LOADING OVERLAY ===== */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #805ad5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ===== ANIMACIONES ===== */
.stats-section {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}



/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1200px) {
  .stats-grid-4,
  .stats-grid-5,
  .stats-grid-6,
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .period-selector {
    width: 100%;
    justify-content: space-between;
  }
  
  .period-selector button {
    flex: 1;
    text-align: center;
  }
  
  .stats-grid-1,
  .stats-grid-2,
  .stats-grid-3,
  .stats-grid-4,
  .stats-grid-5,
  .stats-grid-6,
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .stats-section {
    padding: 12px;
  }
  
  .stat-box {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .section-header h2 {
    font-size: 1.1rem;
  }
}
</style>