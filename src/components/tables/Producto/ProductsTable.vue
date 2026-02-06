<template>
  <BaseTable
    :data="data"
    :columns="tableColumns"
    :loading="loading"
    :loading-message="loadingMessage"
    :no-results-icon="noResultsIcon"
    :no-results-title="noResultsTitle"
    :no-results-message="noResultsMessage"
    :show-actions="true"
    :actions="tableActions"
    :show-pagination="false"
    :row-class="getRowClass"
    :clickable="false"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @restore="$emit('restore', $event)"
  >
    <!-- Slot para acciones cuando no hay resultados -->
    <template #no-results-action>
      <button class="btn-primary" @click="$emit('create')">
        <span class="icon">+</span> {{ createButtonText }}
      </button>
    </template>

    <!-- Slots personalizados para celdas específicas -->
    <template #cell-nombre="{ item }">
      <div class="product-name-cell">
        <span class="product-name" :title="item.nombre">{{ item.nombre }}</span>
      </div>
    </template>

    <template #cell-categoria="{ item }">
      <span v-if="tipoVista === 'productos'" class="category-badge">
        {{ item.categoria?.nombre || 'Sin categoría' }}
      </span>
      <span v-else class="category-badge" :class="item.personalizado ? 'personalizado' : 'estandar'">
        {{ item.personalizado ? 'Personalizado' : 'Estándar' }}
      </span>
    </template>

    <template #cell-precio="{ item }">
      <span class="price-value">
        {{ formatCurrency(tipoVista === 'productos' ? item.precio_unitario : item.precio_venta) }}
      </span>
    </template>

    <template #cell-stock="{ item }">
      <span class="stock-badge" :class="getStockClass(item.stock_actual || 0)">
        {{ item.stock_actual || 0 }}
      </span>
    </template>

    <template #cell-disponible_catalogo="{ item }">
      <span class="catalog-badge" :class="item.disponible_catalogo ? 'in-catalog' : 'not-in-catalog'">
        {{ item.disponible_catalogo ? 'Sí' : 'No' }}
      </span>
    </template>

    <!-- Acciones personalizadas -->
    <template #actions="{ item }">
      <div class="actions-cell">
        <button class="action-btn edit" title="Editar" @click="$emit('edit', item)">
          ✏️
        </button>
        <button class="action-btn view" title="Ver detalles" @click="$emit('view', item)">
          👁️
        </button>
        <button 
          v-if="esElementoActivo(item)" 
          class="action-btn delete" 
          title="Eliminar" 
          @click="$emit('delete', item)"
        >
          🗑️
        </button>
        <button 
          v-else 
          class="action-btn restore" 
          title="Restaurar" 
          @click="$emit('restore', item)"
        >
          ♻️
        </button>
      </div>
    </template>
  </BaseTable>
</template>

<script>
import { computed } from 'vue'
import BaseTable from '../BaseTable.vue'

export default {
  name: 'ProductsTable',
  components: {
    BaseTable
  },
  props: {
    // Datos
    data: {
      type: Array,
      default: () => []
    },
    
    // Tipo de vista: 'productos' o 'ramos'
    tipoVista: {
      type: String,
      default: 'productos',
      validator: (value) => ['productos', 'ramos'].includes(value)
    },
    
    // Estados
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: [
    'view',
    'edit', 
    'delete',
    'restore',
    'create'
  ],
  
  setup(props) {
    // Mensajes dinámicos según tipo de vista
    const loadingMessage = computed(() => {
      return `Cargando ${props.tipoVista}...`
    })
    
    const noResultsIcon = computed(() => {
      return props.tipoVista === 'productos' ? '📦' : '🌸'
    })
    
    const noResultsTitle = computed(() => {
      return `No se encontraron ${props.tipoVista === 'productos' ? 'productos' : 'ramos florales'}`
    })
    
    const noResultsMessage = computed(() => {
      return `Prueba con diferentes filtros o crea un ${props.tipoVista === 'productos' ? 'nuevo producto' : 'nuevo ramo'}`
    })
    
    const createButtonText = computed(() => {
      return props.tipoVista === 'productos' ? 'Nuevo Producto' : 'Nuevo Ramo'
    })
    
    // Definición de columnas según tipo de vista
    const tableColumns = computed(() => {
      const baseColumns = [
        {
          key: 'nombre',
          title: 'Nombre',
          width: '22%',
          minWidth: '200px'
        },
        {
          key: 'categoria',
          title: props.tipoVista === 'productos' ? 'Categoría' : 'Tipo',
          width: '18%',
          minWidth: '150px'
        },
        {
          key: 'precio',
          title: 'Precio',
          width: '15%',
          minWidth: '120px',
          cellClass: 'text-right'
        },
        {
          key: 'stock',
          title: 'Stock',
          width: '15%',
          minWidth: '100px',
          cellClass: 'text-center'
        }
      ]
      
      // Agregar columna específica para ramos
      if (props.tipoVista === 'ramos') {
        baseColumns.push({
          key: 'disponible_catalogo',
          title: 'Catálogo',
          width: '15%',
          minWidth: '100px',
          cellClass: 'text-center'
        })
      }
      
      return baseColumns
    })
    
    // Acciones de la tabla
    const tableActions = computed(() => [
      {
        key: 'edit',
        title: 'Editar',
        icon: '✏️',
        event: 'edit',
        class: 'edit'
      },
      {
        key: 'view',
        title: 'Ver detalles',
        icon: '👁️',
        event: 'view',
        class: 'view'
      },
      {
        key: 'delete',
        title: 'Eliminar',
        icon: '🗑️',
        event: 'delete',
        class: 'delete'
      }
    ])
    
    // Funciones de utilidad
    const esElementoActivo = (elemento) => {
      if (props.tipoVista === 'productos') {
        return elemento.activo !== false
      } else {
        if (elemento.activo !== undefined) {
          return elemento.activo
        } else if (elemento.deletedAt !== undefined) {
          return elemento.deletedAt === null
        }
        return true
      }
    }
    
    const getRowClass = (item) => {
      return esElementoActivo(item) ? '' : 'inactive-row'
    }
    
    const getStockClass = (stock) => {
      stock = parseInt(stock) || 0
      if (stock <= 0) return 'out-of-stock'
      if (stock <= 10) return 'low-stock'
      return 'in-stock'
    }
    
    const formatCurrency = (value) => {
      const numero = parseFloat(value)
      if (isNaN(numero)) return '$0.00'
      
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero)
    }
    
    return {
      loadingMessage,
      noResultsIcon,
      noResultsTitle,
      noResultsMessage,
      createButtonText,
      tableColumns,
      tableActions,
      esElementoActivo,
      getRowClass,
      getStockClass,
      formatCurrency
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para la tabla de productos */
.product-name-cell {
  display: flex;
  align-items: center;
}

.product-name {
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.price-value {
  font-weight: 600;
  color: #059669;
}

/* Badges para categorías */
.category-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background-color: #f1f5f9;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.category-badge.personalizado {
  background-color: #fef3c7;
  color: #92400e;
}

.category-badge.estandar {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Badges para stock */
.stock-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.stock-badge.in-stock {
  background-color: #d1fae5;
  color: #065f46;
}

.stock-badge.low-stock {
  background-color: #fef3c7;
  color: #92400e;
}

.stock-badge.out-of-stock {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* Badges para catálogo */
.catalog-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.catalog-badge.in-catalog {
  background-color: #dbeafe;
  color: #1e40af;
}

.catalog-badge.not-in-catalog {
  background-color: #f3e8ff;
  color: #6b21a8;
}

/* Acciones */
.actions-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.action-btn.edit {
  background-color: #f0fdf4;
  color: #16a34a;
}

.action-btn.edit:hover {
  background-color: #dcfce7;
  transform: scale(1.1);
}

.action-btn.view {
  background-color: #eff6ff;
  color: #2563eb;
}

.action-btn.view:hover {
  background-color: #dbeafe;
  transform: scale(1.1);
}

.action-btn.delete {
  background-color: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
  transform: scale(1.1);
}

.action-btn.restore {
  background-color: #f0fdf4;
  color: #059669;
}

.action-btn.restore:hover {
  background-color: #dcfce7;
  transform: scale(1.1);
}

/* Fila inactiva */
:deep(.inactive-row) {
  opacity: 0.65;
  background-color: #f8fafc;
}

/* Botón de crear */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #059669;
}

.icon {
  font-size: 16px;
}

/* Alineación de texto */
:deep(.text-right) {
  text-align: right;
}

:deep(.text-center) {
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .product-name {
    max-width: 120px;
  }
  
  .category-badge {
    max-width: 100px;
    font-size: 11px;
  }
  
  .action-btn {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
  
  .actions-cell {
    gap: 2px;
  }
}
</style>