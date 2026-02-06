<template>
  <div class="dashboard-section low-stock-section">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <div class="section-actions">
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
      <!-- Slot personalizado para producto -->
      <template #cell-producto="{ item }">
        <div class="producto-info">
          <div class="producto-detalle">
            <span class="producto-nombre">{{ item.nombre || 'Producto sin nombre' }}</span>
            <span class="producto-id" v-if="item.id">ID: {{ item.id.substring(0, 8) }}</span>
          </div>
        </div>
      </template>

      <!-- Slot personalizado para stock crítico -->
      <template #cell-stock_actual="{ item, value }">
        <span :class="getStockClass(item)">
          {{ value || 0 }}
        </span>
      </template>

      <!-- Slot personalizado para categoría -->
      <template #cell-categoria="{ item }">
        <span class="categoria-badge">
          {{ item.categoria?.nombre || 'Sin categoría' }}
        </span>
      </template>

      <!-- Slot personalizado para proveedor -->
      <template #cell-proveedor="{ item }">
        <span class="proveedor-info">
          {{ item.proveedor?.nombre || 'N/A' }}
        </span>
      </template>

      <!-- Slot para acciones personalizadas si se necesita -->
      <template #actions="{ item }" v-if="$slots.actions">
        <slot name="actions" :item="item"></slot>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '../BaseTable.vue'

export default {
  name: 'LowStockSection',
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
      default: 'Productos con Bajo Stock'
    },
    viewAllLink: {
      type: String,
      default: '/inventory/products'
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
      default: 'Cargando productos...'
    },
    noResultsIcon: {
      type: String,
      default: '✅'
    },
    noResultsTitle: {
      type: String,
      default: 'No hay productos con bajo stock'
    },
    noResultsMessage: {
      type: String,
      default: 'Todos los productos tienen stock adecuado'
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
          minWidth: '100px'
        },
        {
          key: 'categoria',
          title: 'Categoría',
          width: '130px'
        },
        {
          key: 'stock_actual',
          title: 'Stock Actual',
          width: '100px',
          headerClass: 'text-center',
          cellClass: 'text-center'
        },
        {
          key: 'proveedor',
          title: 'Proveedor',
          width: '160px'
        }
      ]
    }
  },
  methods: {
    getStockClass(producto) {
      const classes = ['stock-value']
      
      const stockActual = producto.stock_actual || 0
      
      if (stockActual <= 0) {
        classes.push('stock-agotado')
      } else if (stockActual <= 5) {
        classes.push('stock-critico')
      } else if (stockActual <= 10) {
        classes.push('stock-bajo')
      } else {
        classes.push('stock-normal')
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
  gap: 4px;
  text-align: center;
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

.producto-id {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
  opacity: 0.8;
}

.categoria-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #e0e7ff;
  color: #3730a3;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.proveedor-info {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Clases para stock */
.stock-value {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 40px;
  text-align: center;
  font-size: 0.9rem;
}

.stock-normal {
  background-color: #d1fae5;
  color: #065f46;
}

.stock-bajo {
  background-color: #fef3c7;
  color: #92400e;
}

.stock-critico {
  background-color: #fecaca;
  color: #991b1b;
}

.stock-agotado {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
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