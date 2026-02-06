<template>
  <BaseTable
    :data="ventas"
    :columns="tableColumns"
    :loading="loading"
    loading-message="Cargando ventas..."
    no-results-icon="🛒"
    no-results-title="No se encontraron ventas"
    no-results-message="No hay ventas con los filtros aplicados"
    :show-actions="true"
    actions-title="Acciones"
    :clickable="false"
    row-key="id"
  >
    <!-- Slot personalizado para la columna ID -->
    <template #cell-id="{ value }">
      <span class="id-column">{{ value.substring(0, 8) }}</span>
    </template>

    <!-- Slot personalizado para la columna usuario -->
    <template #cell-usuario="{ item }">
      <span class="user-column">{{ item.usuario?.nombre || 'N/A' }}</span>
    </template>

    <!-- Slot personalizado para la columna cliente -->
    <template #cell-cliente_nombre="{ value }">
      <span class="client-column">{{ value || 'N/A' }}</span>
    </template>

    <!-- Slot personalizado para la columna fecha -->
    <template #cell-fecha="{ value }">
      <div class="fecha-option-1" v-if="value">
        <div class="fecha-principal">{{ formatDateMejorado(value).principal }}</div>
        <div :class="['tiempo-relativo', formatDateMejorado(value).clase]">
          {{ formatDateMejorado(value).relativo }}
        </div>
      </div>
      <span v-else class="sin-fecha">Sin fecha</span>
    </template>

    <!-- Slot personalizado para método de pago -->
    <template #cell-metodo_pago="{ value }">
      <span :class="['metodo-badge', value.toLowerCase()]">
        {{ formatMetodoPago(value) }}
      </span>
    </template>

    <!-- Slot personalizado para total -->
    <template #cell-total="{ value }">
      <span class="amount-column">{{ formatCurrency(value) }}</span>
    </template>

    <!-- Slot personalizado para estado -->
    <template #cell-estado="{ value }">
      <span :class="['status-badge', value.toLowerCase()]">
        {{ formatEstado(value) }}
      </span>
    </template>

    <!-- Slot personalizado para acciones -->
    <template #actions="{ item }">
      <div class="action-buttons">
        <button class="action-btn view" title="Ver detalle" @click="$emit('view-detail', item)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="action-btn print" title="Imprimir" @click="$emit('print-sale', item)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        </button>
        <button 
          v-if="esAdministrador && item.estado !== 'CANCELADA'" 
          class="action-btn cancel" 
          title="Cancelar venta" 
          @click="$emit('cancel-sale', item)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </template>

    <!-- Slot para acción cuando no hay resultados -->
    <template #no-results-action>
      <button class="btn btn-outline" @click="$emit('clear-filters')">
        Limpiar Filtros
      </button>
    </template>
  </BaseTable>
</template>

<script>
import BaseTable from '../BaseTable.vue'


export default {
  name: 'VentasTable',
  components: {
    BaseTable
  },
  props: {
    ventas: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    esAdministrador: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view-detail', 'print-sale', 'cancel-sale', 'clear-filters'],
  setup() {
    // Definición de columnas para la tabla
    const tableColumns = [
      {
        key: 'id',
        title: 'ID Venta',
        width: '100px',
        minWidth: '100px'
      },
      {
        key: 'usuario',
        title: 'Usuario',
        width: '120px',
        minWidth: '120px'
      },
      {
        key: 'cliente_nombre',
        title: 'Cliente',
        width: '150px',
        minWidth: '150px'
      },
      {
        key: 'fecha',
        title: 'Fecha',
        width: '180px',
        minWidth: '180px'
      },
      {
        key: 'metodo_pago',
        title: 'Método de Pago',
        width: '140px',
        minWidth: '140px'
      },
      {
        key: 'total',
        title: 'Total',
        width: '120px',
        minWidth: '120px'
      },
      {
        key: 'estado',
        title: 'Estado',
        width: '120px',
        minWidth: '120px'
      }
    ]

    // Función para formatear moneda
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(value)
    }

    // Función para obtener tiempo relativo en español
    const getTiempoRelativo = (fecha) => {
      if (!fecha || fecha === '') {
        return 'Fecha no disponible'
      }
      
      try {
        const ahora = new Date()
        const fechaVenta = new Date(fecha)
        
        if (isNaN(fechaVenta.getTime())) {
          return 'Fecha inválida'
        }
        
        const diferencia = ahora - fechaVenta
        
        const minutos = Math.floor(diferencia / (1000 * 60))
        const horas = Math.floor(diferencia / (1000 * 60 * 60))
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
        
        if (minutos < 60) {
          if (minutos <= 1) return 'Hace un momento'
          return `Hace ${minutos} min`
        }
        
        if (horas < 24) {
          if (horas === 1) return 'Hace 1 hora'
          return `Hace ${horas} horas`
        }
        
        if (dias === 1) return 'Ayer'
        if (dias === 0) return 'Hoy'
        if (dias <= 7) return `Hace ${dias} días`
        if (dias <= 14) return `Hace ${Math.floor(dias / 7)} semana${Math.floor(dias / 7) > 1 ? 's' : ''}`
        if (dias <= 30) return `Hace ${Math.floor(dias / 7)} semanas`
        
        return `Hace ${Math.floor(dias / 30)} meses`
      } catch (error) {
        console.error('Error al calcular tiempo relativo:', error, 'Fecha:', fecha)
        return 'Error en fecha'
      }
    }
    
    // Función para obtener la clase CSS del tiempo relativo
    const getTiempoRelativoClass = (fecha) => {
      if (!fecha || fecha === '') {
        return 'antigua'
      }
      
      try {
        const ahora = new Date()
        const fechaVenta = new Date(fecha)
        
        if (isNaN(fechaVenta.getTime())) {
          return 'antigua'
        }
        
        const diferencia = ahora - fechaVenta
        const horas = Math.floor(diferencia / (1000 * 60 * 60))
        
        if (horas <= 2) return 'reciente'
        if (horas <= 24) return 'hoy'
        if (horas <= 48) return 'ayer'
        return 'antigua'
      } catch (error) {
        console.error('Error al obtener clase de tiempo relativo:', error, 'Fecha:', fecha)
        return 'antigua'
      }
    }
    
    // Función para formatear fecha principal
    const formatFechaPrincipal = (fecha) => {
      if (!fecha || fecha === '') {
        return 'Fecha no disponible'
      }
      
      try {
        const fechaObj = new Date(fecha)
        
        if (isNaN(fechaObj.getTime())) {
          return 'Fecha inválida'
        }
        
        const diaNombre = new Intl.DateTimeFormat('es-CL', {
          weekday: 'long'
        }).format(fechaObj)
        
        const dia = fechaObj.getDate()
        
        const mesNombre = new Intl.DateTimeFormat('es-CL', {
          month: 'short'
        }).format(fechaObj)
        
        const hora = new Intl.DateTimeFormat('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(fechaObj)
        
        const diaCapitalizado = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1)
        const mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1).replace('.', '')
        
        return `${diaCapitalizado}, ${dia} ${mesCapitalizado} ${hora}hrs`
      } catch (error) {
        console.error('Error al formatear fecha principal:', error, 'Fecha:', fecha)
        return 'Error en fecha'
      }
    }
    
    // Función principal para formatear fecha mejorada
    const formatDateMejorado = (dateString) => {
      if (!dateString || dateString === '') {
        return {
          principal: 'Fecha no disponible',
          relativo: 'Sin fecha',
          clase: 'antigua'
        }
      }
      
      try {
        return {
          principal: formatFechaPrincipal(dateString),
          relativo: getTiempoRelativo(dateString),
          clase: getTiempoRelativoClass(dateString)
        }
      } catch (error) {
        console.error('Error en formatDateMejorado:', error, 'Fecha:', dateString)
        return {
          principal: 'Error en fecha',
          relativo: 'Error',
          clase: 'antigua'
        }
      }
    }
    
    // Formatear estado
    const formatEstado = (estado) => {
      const formatMap = {
        'COMPLETADA': 'Completada',
        'PENDIENTE': 'Pendiente',
        'CANCELADA': 'Cancelada',
        'PARCIAL_DEVUELTA': 'Parcial Devuelta',
        'TOTAL_DEVUELTA': 'Total Devuelta'
      }
      return formatMap[estado] || estado
    }
    
    // Formatear método de pago
    const formatMetodoPago = (metodo) => {
      const formatMap = {
        'EFECTIVO': 'Efectivo',
        'TARJETA': 'Tarjeta',
        'TRANSFERENCIA': 'Transferencia'
      }
      return formatMap[metodo] || metodo
    }

    return {
      tableColumns,
      formatCurrency,
      formatDateMejorado,
      formatEstado,
      formatMetodoPago
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para la tabla de ventas */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.85rem;
  border: none;
}

.btn-outline {
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background-color: #f5f5f5;
  color: #333;
}

/* Estilos específicos para cada tipo de columna */
.id-column {
  font-family: 'Courier New', monospace;
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
}

.amount-column {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.85rem;
}

.user-column, .client-column {
  font-weight: 500;
  font-size: 0.8rem;
}

.sin-fecha {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.8rem;
}

/* Badges para estados y métodos de pago */
.status-badge, .metodo-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 70px;
  font-size: 0.7rem;
  text-align: center;
}

.status-badge.completada {
  background-color: #f0fff4;
  color: #48bb78;
  border: 1px solid #48bb7820;
}

.status-badge.pendiente {
  background-color: #fffaf0;
  color: #ed8936;
  border: 1px solid #ed893620;
}

.status-badge.cancelada {
  background-color: #fff5f5;
  color: #e53e3e;
  border: 1px solid #e53e3e20;
}

.status-badge.parcial_devuelta {
  background-color: #ebf8ff;
  color: #3182ce;
  border: 1px solid #3182ce20;
}

.status-badge.total_devuelta {
  background-color: #faf5ff;
  color: #9f7aea;
  border: 1px solid #9f7aea20;
}

.metodo-badge.efectivo {
  background-color: #f0fff4;
  color: #48bb78;
  border: 1px solid #48bb7820;
}

.metodo-badge.tarjeta {
  background-color: #ebf8ff;
  color: #3182ce;
  border: 1px solid #3182ce20;
}

.metodo-badge.transferencia {
  background-color: #faf5ff;
  color: #9f7aea;
  border: 1px solid #9f7aea20;
}

/* Estilos para la fecha mejorada */
.fecha-option-1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 140px;
}

.fecha-principal {
  font-size: 0.75rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
}

.tiempo-relativo {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  min-width: 60px;
  letter-spacing: 0.2px;
}

.tiempo-relativo.reciente {
  background-color: #e6fffa;
  color: #2d7d72;
  border: 1px solid #38b2ac30;
  animation: pulse-subtle 2s infinite;
  box-shadow: 0 1px 3px rgba(56, 178, 172, 0.1);
}

.tiempo-relativo.hoy {
  background-color: #f0fff4;
  color: #2f7d32;
  border: 1px solid #48bb7830;
  box-shadow: 0 1px 3px rgba(72, 187, 120, 0.1);
}

.tiempo-relativo.ayer {
  background-color: #fffaf0;
  color: #c05621;
  border: 1px solid #ed893630;
  box-shadow: 0 1px 3px rgba(237, 137, 54, 0.1);
}

.tiempo-relativo.antigua {
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #71809630;
  box-shadow: 0 1px 3px rgba(113, 128, 150, 0.08);
}

@keyframes pulse-subtle {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.01);
  }
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.action-btn.view {
  background-color: #ebf8ff;
  color: #3182ce;
}

.action-btn.view:hover {
  background-color: #bee3f8;
}

.action-btn.print {
  background-color: #f0fff4;
  color: #48bb78;
}

.action-btn.print:hover {
  background-color: #c6f6d5;
}

.action-btn.cancel {
  background-color: #fff5f5;
  color: #e53e3e;
}

.action-btn.cancel:hover {
  background-color: #fed7d7;
}

/* Responsive */
@media (max-width: 768px) {
  .fecha-principal {
    font-size: 0.7rem;
  }
  
  .tiempo-relativo {
    font-size: 0.6rem;
    padding: 1px 4px;
  }
  
  .action-btn {
    width: 26px;
    height: 26px;
  }
  
  .action-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>