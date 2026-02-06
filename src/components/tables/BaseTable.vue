<template>
  <div class="base-table-container">
    <!-- Estados de carga y sin resultados -->
    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
      <p>{{ loadingMessage }}</p>
    </div>

    <div v-else-if="data.length === 0" class="no-results">
      <div class="no-results-icon">{{ noResultsIcon }}</div>
      <h3>{{ noResultsTitle }}</h3>
      <p>{{ noResultsMessage }}</p>
      <slot name="no-results-action"></slot>
    </div>

    <!-- Vista responsiva -->
    <div v-else class="table-wrapper">
      <!-- Vista móvil - Cards -->
      <div v-if="isMobile" class="mobile-view">
        <div 
          v-for="(item, index) in paginatedData" 
          :key="getRowKey(item, index)"
          class="mobile-card"
          :class="getRowClass(item, index)"
          @click="onRowClick(item, index)"
        >
          <!-- Checkbox para selección en móvil -->
          <div v-if="selectable" class="mobile-checkbox">
            <input 
              type="checkbox" 
              :value="getItemId(item)" 
              :checked="selectedItems.includes(getItemId(item))"
              @change="toggleItemSelection(getItemId(item))"
              @click.stop
            />
          </div>

          <!-- Contenido de la card -->
          <div class="mobile-card-content">
            <!-- Columna principal (primera columna) -->
            <div class="mobile-primary">
              <slot 
                :name="`cell-${columns[0].key}`" 
                :item="item" 
                :value="getNestedValue(item, columns[0].key)" 
                :index="index"
                :column="columns[0]"
              >
                <div class="mobile-primary-content">
                  {{ formatCellValue(item, columns[0]) }}
                </div>
              </slot>
            </div>

            <!-- Información secundaria -->
            <div class="mobile-secondary">
              <div 
                v-for="column in columns.slice(1)" 
                :key="column.key"
                class="mobile-field"
              >
                <span class="mobile-label">{{ column.title }}:</span>
                <span class="mobile-value">
                  <slot 
                    :name="`cell-${column.key}`" 
                    :item="item" 
                    :value="getNestedValue(item, column.key)" 
                    :index="index"
                    :column="column"
                  >
                    {{ formatCellValue(item, column) }}
                  </slot>
                </span>
              </div>
            </div>

            <!-- Acciones en móvil -->
            <div v-if="showActions" class="mobile-actions">
              <slot name="actions" :item="item" :index="index">
                <div class="actions-cell mobile">
                  <button 
                    v-for="action in actions" 
                    :key="action.key"
                    :class="['action-btn', 'mobile', action.class]"
                    :title="action.title"
                    @click.stop="$emit(action.event, item, index)"
                  >
                    {{ action.icon }}
                  </button>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista desktop/tablet - Tabla -->
      <div v-else class="desktop-view">
        <div class="table-scroll-container">
          <table class="base-table" :class="{ 'compact': isTablet }">
            <thead>
              <tr>
                <th v-if="selectable" class="col-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="allSelected" 
                    @change="toggleAllItems"
                  />
                </th>
                
                <th 
                  v-for="column in visibleColumns" 
                  :key="column.key"
                  :class="[`col-${column.key}`, column.headerClass]"
                  :style="getColumnStyle(column)"
                >
                  {{ column.title }}
                </th>
                
                <th v-if="showActions" class="col-actions">
                  {{ actionsTitle }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in paginatedData" 
                :key="getRowKey(item, index)" 
                :class="getRowClass(item, index)"
                @click="onRowClick(item, index)"
              >
                <td v-if="selectable" class="col-checkbox">
                  <input 
                    type="checkbox" 
                    :value="getItemId(item)" 
                    :checked="selectedItems.includes(getItemId(item))"
                    @change="toggleItemSelection(getItemId(item))"
                    @click.stop
                  />
                </td>
                
                <td 
                  v-for="column in visibleColumns" 
                  :key="column.key"
                  :class="[`col-${column.key}`, column.cellClass]"
                >
                  <div class="cell-content" :title="formatCellValue(item, column)">
                    <slot 
                      :name="`cell-${column.key}`" 
                      :item="item" 
                      :value="getNestedValue(item, column.key)" 
                      :index="index"
                      :column="column"
                    >
                      <span v-if="column.type === 'badge'" :class="getBadgeClass(item, column)">
                        {{ formatCellValue(item, column) }}
                      </span>
                      <span v-else-if="column.type === 'currency'">
                        {{ formatCurrency(getNestedValue(item, column.key)) }}
                      </span>
                      <span v-else-if="column.type === 'date'">
                        {{ formatDate(getNestedValue(item, column.key)) }}
                      </span>
                      <span v-else>
                        {{ formatCellValue(item, column) }}
                      </span>
                    </slot>
                  </div>
                </td>
                
                <td v-if="showActions" class="col-actions">
                  <slot name="actions" :item="item" :index="index">
                    <div class="actions-cell">
                      <button 
                        v-for="action in actions" 
                        :key="action.key"
                        :class="['action-btn', action.class]"
                        :title="action.title"
                        @click.stop="$emit(action.event, item, index)"
                      >
                        {{ action.icon }}
                      </button>
                    </div>
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Paginación responsiva -->
      <div v-if="showPagination && totalItems > itemsPerPage" class="table-pagination">
        <div class="pagination-info">
          <span class="desktop-text">Mostrando {{ Math.min(currentPage * itemsPerPage, totalItems) }} de {{ totalItems }} elementos</span>
          <span class="mobile-text">{{ Math.min(currentPage * itemsPerPage, totalItems) }}/{{ totalItems }}</span>
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-secondary small" 
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
          >
            <span class="desktop-text">Anterior</span>
            <span class="mobile-text">‹</span>
          </button>
          <span class="page-info">{{ currentPage }} de {{ totalPages }}</span>
          <button 
            class="btn-secondary small" 
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
          >
            <span class="desktop-text">Siguiente</span>
            <span class="mobile-text">›</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'BaseTable',
  props: {
    // Props existentes...
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [], required: true },
    loading: { type: Boolean, default: false },
    loadingMessage: { type: String, default: 'Cargando datos...' },
    noResultsIcon: { type: String, default: '📄' },
    noResultsTitle: { type: String, default: 'No se encontraron resultados' },
    noResultsMessage: { type: String, default: 'Prueba con diferentes filtros' },
    selectable: { type: Boolean, default: false },
    selectedItems: { type: Array, default: () => [] },
    showActions: { type: Boolean, default: false },
    actionsTitle: { type: String, default: 'Acciones' },
    actions: { type: Array, default: () => [] },
    showPagination: { type: Boolean, default: false },
    itemsPerPage: { type: Number, default: 50 },
    rowClass: { type: [String, Function], default: '' },
    rowKey: { type: [String, Function], default: 'id' },
    clickable: { type: Boolean, default: false },
    
    // Nuevas props para responsividad
    hideOnMobile: { type: Array, default: () => [] },
    hideOnTablet: { type: Array, default: () => [] },
    compactMode: { type: Boolean, default: true }
  },
  
  emits: ['update:selectedItems', 'row-click'],
  
  setup(props, { emit }) {
    const currentPage = ref(1)
    const windowWidth = ref(window.innerWidth)
    
    // Computed para breakpoints
    const isMobile = computed(() => windowWidth.value < 768)
    const isTablet = computed(() => windowWidth.value < 1024 && windowWidth.value >= 768)
    const isDesktop = computed(() => windowWidth.value >= 1024)
    
    // Columnas visibles según el breakpoint
    const visibleColumns = computed(() => {
      if (isMobile.value) {
        return props.columns.filter(col => !props.hideOnMobile.includes(col.key))
      } else if (isTablet.value) {
        return props.columns.filter(col => !props.hideOnTablet.includes(col.key))
      }
      return props.columns
    })
    
    // Computed para la selección
    const allSelected = computed(() => {
      return props.data.length > 0 && 
             props.selectedItems.length === props.data.length
    })
    
    // Computed para paginación
    const totalItems = computed(() => props.data.length)
    const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))
    
    const paginatedData = computed(() => {
      if (!props.showPagination) return props.data
      
      const start = (currentPage.value - 1) * props.itemsPerPage
      const end = start + props.itemsPerPage
      return props.data.slice(start, end)
    })
    
    // Función para obtener estilos de columna responsive
    const getColumnStyle = (column) => {
      const styles = {}
      
      if (isDesktop.value) {
        if (column.width) styles.width = column.width
        if (column.minWidth) styles.minWidth = column.minWidth
      } else if (isTablet.value) {
        // En tablet, usar anchos más flexibles
        if (column.tabletWidth) styles.width = column.tabletWidth
        else if (column.width) styles.width = 'auto'
        if (column.minWidth) styles.minWidth = '80px'
      }
      
      return styles
    }
    
    // Event listener para resize
    const handleResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    
    // Funciones existentes...
    const getRowKey = (item, index) => {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(item, index)
      }
      return item[props.rowKey] || index
    }
    
    const getRowClass = (item, index) => {
      const baseClass = 'table-row'
      const clickableClass = props.clickable ? 'clickable' : ''
      
      if (typeof props.rowClass === 'function') {
        return [baseClass, clickableClass, props.rowClass(item, index)]
      }
      return [baseClass, clickableClass, props.rowClass]
    }
    
    const getItemId = (item) => {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(item)
      }
      return item[props.rowKey]
    }
    
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null
      }, obj)
    }
    
    const formatCellValue = (item, column) => {
      const value = getNestedValue(item, column.key)
      
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(value, item)
      }
      
      return value !== null && value !== undefined ? value : ''
    }
    
    const getBadgeClass = (item, column) => {
      if (column.badgeClass && typeof column.badgeClass === 'function') {
        return column.badgeClass(item)
      }
      return column.badgeClass || 'badge'
    }
    
    const formatCurrency = (value) => {
      const numero = parseFloat(value)
      if (isNaN(numero)) return '$0.00'
      
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero)
    }
    
    const formatDate = (dateStr) => {
      if (!dateStr) return 'No disponible'
      
      const fecha = new Date(dateStr)
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(fecha)
    }
    
    // Event handlers
    const toggleAllItems = () => {
      if (allSelected.value) {
        emit('update:selectedItems', [])
      } else {
        const allIds = props.data.map(item => getItemId(item))
        emit('update:selectedItems', allIds)
      }
    }
    
    const toggleItemSelection = (itemId) => {
      const currentSelected = [...props.selectedItems]
      const index = currentSelected.indexOf(itemId)
      
      if (index > -1) {
        currentSelected.splice(index, 1)
      } else {
        currentSelected.push(itemId)
      }
      
      emit('update:selectedItems', currentSelected)
    }
    
    const onRowClick = (item, index) => {
      if (props.clickable) {
        emit('row-click', item, index)
      }
    }
    
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    watch(() => props.selectedItems, () => {
      // Este watcher asegura que el componente padre pueda actualizar selectedItems
    })
    
    return {
      currentPage,
      windowWidth,
      isMobile,
      isTablet,
      isDesktop,
      allSelected,
      totalItems,
      totalPages,
      paginatedData,
      visibleColumns,
      getColumnStyle,
      getRowKey,
      getRowClass,
      getItemId,
      getNestedValue,
      formatCellValue,
      getBadgeClass,
      formatCurrency,
      formatDate,
      toggleAllItems,
      toggleItemSelection,
      onRowClick,
      changePage
    }
  }
}
</script>

<style scoped>
.base-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Estados de carga - sin cambios */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.loader {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.no-results p {
  margin: 0 0 24px 0;
  font-size: 16px;
}

/* Vista móvil - Cards */
.mobile-view {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  gap: 12px;
  display: flex;
  flex-direction: column;
}

.mobile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  position: relative;
}

.mobile-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.mobile-card.clickable {
  cursor: pointer;
}

.mobile-card.clickable:active {
  transform: scale(0.99);
}

.mobile-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
}

.mobile-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-primary {
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.mobile-primary-content {
  font-weight: 600;
  font-size: 16px;
  color: #374151;
}

.mobile-secondary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mobile-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.mobile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

/* Vista desktop/tablet */
.desktop-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-scroll-container {
  flex: 1;
  overflow: auto;
  min-height: 0;
  position: relative;
}

/* Tabla base */
.base-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 600px;
}

.base-table.compact {
  min-width: 500px;
  font-size: 13px;
}

.base-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f9fafb;
}

.base-table th {
  background: #f9fafb;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  font-size: 13px;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 11;
}

.base-table.compact th {
  padding: 8px 6px;
  font-size: 12px;
}

.base-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  text-align: center;
  vertical-align: middle;
}

.base-table.compact td {
  padding: 8px 6px;
  font-size: 12px;
}

.cell-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Columnas específicas */
.col-checkbox {
  width: 40px;
  min-width: 40px;
}

.col-actions {
  width: 120px;
  min-width: 120px;
}

/* Filas de tabla */
.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.clickable {
  cursor: pointer;
}

.table-row.clickable:hover {
  background: #f1f5f9;
}

/* Celdas de acciones */
.actions-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.actions-cell.mobile {
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.action-btn.mobile {
  padding: 8px 12px;
  font-size: 16px;
  min-width: 40px;
  height: 40px;
}

.action-btn:hover {
  transform: scale(1.05);
}

/* Estilos de acciones específicas */
.action-btn.view {
  background: #eff6ff;
  color: #2563eb;
}

.action-btn.view:hover {
  background: #dbeafe;
}

.action-btn.edit {
  background: #f0fdf4;
  color: #16a34a;
}

.action-btn.edit:hover {
  background: #dcfce7;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.action-btn.print {
  background: #faf5ff;
  color: #8b5cf6;
}

.action-btn.print:hover {
  background: #f3e8ff;
}

/* Badges responsivos */
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.mobile-value .badge {
  font-size: 12px;
  padding: 6px 10px;
}

.badge.critico {
  background: #ef4444;
  color: white;
}

.badge.advertencia {
  background: #f59e0b;
  color: white;
}

.badge.vencido {
  background: #8b5cf6;
  color: white;
}

.badge.normal {
  background: #10b981;
  color: white;
}

/* Paginación responsiva */
.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-info {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  min-width: 80px;
  text-align: center;
}

/* Textos responsivos */
.desktop-text {
  display: inline;
}

.mobile-text {
  display: none;
}

/* Botones */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary.small {
  padding: 6px 8px;
  font-size: 13px;
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.base-table-container {
  animation: fadeInUp 0.5s ease-out;
}

/* Responsive breakpoints */
@media (max-width: 1023px) and (min-width: 768px) {
  /* Tablet styles */
  .base-table {
    min-width: 500px;
  }
  
  .base-table th,
  .base-table td {
    padding: 8px 6px;
    font-size: 12px;
  }
  
  .col-actions {
    width: 100px;
    min-width: 100px;
  }
  
  .action-btn {
    padding: 4px 6px;
    font-size: 12px;
    min-width: 28px;
    height: 28px;
  }
}

@media (max-width: 767px) {
  /* Mobile styles */
  .desktop-text {
    display: none;
  }
  
  .mobile-text {
    display: inline;
  }
  
  .table-pagination {
    padding: 12px 16px;
  }
  
  .pagination-info {
    font-size: 12px;
  }
  
  .page-info {
    font-size: 12px;
    min-width: 60px;
  }
  
  .btn-secondary.small {
    padding: 6px 12px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .mobile-secondary {
    grid-template-columns: 1fr;
  }
  
  .mobile-field {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .mobile-label {
    font-size: 11px;
  }
  
  .mobile-value {
    font-size: 13px;
    text-align: right;
  }
}

@media (max-width: 480px) {
  /* Small mobile styles */
  .mobile-view {
    padding: 8px;
    gap: 8px;
  }
  
  .mobile-card {
    padding: 12px;
  }
  
  .mobile-primary-content {
    font-size: 14px;
  }
  
  .mobile-label {
    font-size: 10px;
  }
  
  .mobile-value {
    font-size: 12px;
  }
  
  .mobile-actions {
    gap: 6px;
  }
  
  .action-btn.mobile {
    padding: 6px 10px;
    font-size: 14px;
    min-width: 36px;
    height: 36px;
  }
}

/* Estilos específicos para la tabla de stock */
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

/* Estilos para información de producto */
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

/* Responsive adjustments for mobile cards */
@media (max-width: 767px) {
  .mobile-value .stock-value {
    font-size: 14px;
    padding: 6px 10px;
    min-width: 50px;
  }
  
  .mobile-value .categoria-badge {
    font-size: 12px;
    padding: 4px 10px;
  }
  
  .producto-info {
    text-align: left;
  }
  
  .producto-nombre {
    font-size: 16px;
    font-weight: 600;
  }
  
  .producto-id {
    font-size: 11px;
    margin-top: 2px;
  }
}

</style>