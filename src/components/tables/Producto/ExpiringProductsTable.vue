<template>
  <div class="dashboard-section expiring-products-section">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <div class="section-actions">
        <!-- <button 
          @click="$emit('refresh')" 
          :disabled="loading" 
          class="refresh-btn"
          title="Actualizar datos"
        >
          <span :class="{ 'rotating': loading }">🔄</span>
        </button> -->
        <router-link :to="viewAllLink" class="view-all">{{ viewAllText }}</router-link>
      </div>
    </div>

    <BaseTable
      :data="productos.slice(0, maxItems)"
      :columns="columns"
      :loading="loading"
      :loading-message="loadingMessage"
      :no-results-icon="noResultsIcon"
      :no-results-title="noResultsTitle"
      :no-results-message="noResultsMessage"
    >
      <!-- Slot personalizado para fecha de vencimiento -->
      <template #cell-fecha_vencimiento="{ value }">
        <span :class="getFechaClass(value)">
          {{ formatExpiryDate(value) }}
        </span>
      </template>

      <!-- Slot personalizado para días restantes -->
      <template #cell-dias_restantes="{ value }">
        <span :class="getDaysRemainingClass(value)">
          {{ formatDias(value) }}
        </span>
      </template>

      <!-- Slot personalizado para producto -->
      <template #cell-producto="{ item }">
        <div class="producto-info">
          <div class="producto-detalle">
            <span class="producto-nombre">{{ item.nombre || 'Producto desconocido' }}</span>
            <span class="producto-precio" v-if="item.precio_unitario">
              ${{ formatCurrency(item.precio_unitario) }}
            </span>
          </div>
        </div>
      </template>

      <!-- Slot personalizado para lote -->
      <template #cell-lote="{ value, item }">
        <div class="lote-container">
          <span class="lote-info">{{ value || 'N/A' }}</span>
          <div class="lote-detalles">
            <span class="cantidad-info" v-if="item.cantidad_actual !== undefined">
              {{ item.cantidad_actual }}/{{ item.cantidad_inicial || 0 }}
            </span>
          </div>
        </div>
      </template>

      <!-- Slot personalizado para valor expuesto -->
      <template #cell-valor_expuesto="{ item }">
        <span :class="getValorClass(item.perdida)">
          ${{ formatCurrency(item.perdida || 0) }}
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '../BaseTable.vue'

export default {
  name: 'ExpiringProductsSection',
  components: {
    BaseTable
  },
  props: {
    productos: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Lotes próximos a vencer'
    },
    viewAllLink: {
      type: String,
      default: '/inventory/lotes'
    },
    viewAllText: {
      type: String,
      default: 'Ver todos'
    },
    maxItems: {
      type: Number,
      default: 10
    },
    loadingMessage: {
      type: String,
      default: 'Cargando lotes...'
    },
    noResultsIcon: {
      type: String,
      default: '✅'
    },
    noResultsTitle: {
      type: String,
      default: 'No hay lotes próximos a vencer'
    },
    noResultsMessage: {
      type: String,
      default: 'Todos los lotes están en buen estado'
    }
  },
  emits: ['refresh'],
  computed: {
    columns() {
      return [
        {
          key: 'producto',
          title: 'Producto',
          width: '100px',
          headerClass: 'text-center',
          cellClass: 'text-center'
        },
        {
          key: 'lote',
          title: 'Lote',
          width: '100px',
          headerClass: 'text-center',
          cellClass: 'text-center'
        },
        {
          key: 'fecha_vencimiento',
          title: 'Vencimiento',
          width: '100px',
          headerClass: 'text-center',
          cellClass: 'text-center'
        },
        {
          key: 'dias_restantes',
          title: 'Días',
          width: '70px',
          headerClass: 'text-center',
          cellClass: 'text-center'
        },
        {
          key: 'valor_expuesto',
          title: 'Valor en Riesgo',
          width: '110px',
          headerClass: 'text-center',
          cellClass: 'text-center'
        }
      ]
    }
  },
  methods: {
    formatExpiryDate(fecha) {
      if (!fecha) return 'N/A'
      try {
        return new Date(fecha).toLocaleDateString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      } catch (error) {
        return 'N/A'
      }
    },
    
    formatDias(dias) {
      if (dias === null || dias === undefined || isNaN(dias)) {
        return 'N/A'
      }
      
      if (dias <= 0) {
        return 'Vencido'
      }
      
      return `${dias}d`
    },

    formatCurrency(value) {
      if (!value || isNaN(value)) return '0'
      
      return new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    },
    
    calcularDiasRestantes(fecha) {
      if (!fecha) return null
      
      try {
        const now = new Date()
        const expiryDate = new Date(fecha)
        const diffTime = expiryDate - now
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      } catch (error) {
        return null
      }
    },
    
    getFechaClass(fecha) {
      const dias = this.calcularDiasRestantes(fecha)
      
      if (dias === null) return 'fecha-normal'
      if (dias <= 0) return 'fecha-vencida'
      if (dias <= 3) return 'fecha-critica'
      if (dias <= 7) return 'fecha-advertencia'
      return 'fecha-normal'
    },
    
    getDaysRemainingClass(dias) {
      if (dias === null || dias === undefined || isNaN(dias)) {
        return 'badge normal'
      }
      
      if (dias <= 0) return 'badge vencido'
      if (dias <= 3) return 'badge critico'
      if (dias <= 7) return 'badge advertencia'
      return 'badge normal'
    },

    getValorClass(valor) {
      const classes = ['valor-riesgo']
      const valorNum = parseFloat(valor) || 0
      
      if (valorNum >= 50000) {
        classes.push('riesgo-alto')
      } else if (valorNum >= 20000) {
        classes.push('riesgo-medio')
      } else if (valorNum > 0) {
        classes.push('riesgo-bajo')
      } else {
        classes.push('riesgo-nulo')
      }
      
      return classes.join(' ')
    }
  }
}
</script>

<style scoped>
.dashboard-section {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 420px;
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

.dashboard-section {
  animation: fadeInUp 0.5s ease-out;
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

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.refresh-btn:hover {
  background-color: #f3f4f6;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rotating {
  animation: spin 1s linear infinite;
}

.view-all {
  color: #42b983;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

/* Estilos específicos para las celdas personalizadas */
.producto-info {
  display: flex;
  flex-direction: column;
}

.producto-detalle {
  display: flex;
  flex-direction: column;
}

.producto-nombre {
  font-weight: 500;
  color: #374151;
  line-height: 1.3;
}

.producto-precio {
  font-size: 0.8rem;
  color: #059669;
  font-weight: 500;
}

.lote-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.lote-info {
  font-family: monospace;
  color: #6b7280;
  font-size: 0.8rem;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
}

.cantidad-info {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Fecha styles */
.fecha-vencida {
  color: #dc2626;
  font-weight: bold;
}

.fecha-critica {
  color: #ef4444;
  font-weight: 600;
}

.fecha-advertencia {
  color: #f59e0b;
  font-weight: 500;
}

.fecha-normal {
  color: #6b7280;
}

/* Badges para días restantes */
.badge {
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  min-width: 35px;
}

.badge.vencido {
  background: #dc2626;
  color: white;
}

.badge.critico {
  background: #ef4444;
  color: white;
}

.badge.advertencia {
  background: #f59e0b;
  color: white;
}

.badge.normal {
  background: #10b981;
  color: white;
}

/* Estilos para valor en riesgo */
.valor-riesgo {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  font-size: 0.85rem;
}

.riesgo-alto {
  background-color: #fecaca;
  color: #991b1b;
}

.riesgo-medio {
  background-color: #fef3c7;
  color: #92400e;
}

.riesgo-bajo {
  background-color: #dbeafe;
  color: #1e40af;
}

.riesgo-nulo {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* Clases de utilidad */
.text-center {
  text-align: center;
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-section {
    max-height: 320px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .section-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .dashboard-section {
    padding: 15px;
    max-height: 280px;
  }
  
  .section-header h2 {
    font-size: 1.1rem;
  }
}
</style>