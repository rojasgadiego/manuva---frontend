<template>
  <BaseTable
    :data="movimientos"
    :columns="columnas"
    :loading="loading"
    :show-actions="true"
    :actions="acciones"
    :show-pagination="true"
    :items-per-page="itemsPerPage"
    :clickable="true"
    :row-key="'id'"
    loading-message="Cargando movimientos..."
    no-results-title="No se encontraron movimientos"
    no-results-message="No se encontraron movimientos con los filtros aplicados"
    no-results-icon="📄"
    actions-title="Acciones"
    @row-click="onRowClick"
    @ver-detalle="verDetalle"
    @ver-factura="verFactura"
    @editar-movimiento="editarMovimiento"
  >
    <!-- Slot personalizado para la columna de fecha -->
    <template #cell-fecha="{ item }">
      <div class="fecha-cell">
        <div class="fecha-principal">
          {{ item.fecha ? formatDateMejorado(item.fecha).principal : 'Sin fecha' }}
        </div>
        <div :class="['tiempo-relativo', item.fecha ? formatDateMejorado(item.fecha).clase : 'antigua']">
          {{ item.fecha ? formatDateMejorado(item.fecha).relativo : 'Sin fecha' }}
        </div>
      </div>
    </template>

    <!-- Slot personalizado para la columna de tipo -->
    <template #cell-tipo="{ item }">
      <span :class="['tipo-badge', getTipoClase(item.tipo)]">
        {{ formatearTipoMovimiento(item.tipo) }}
      </span>
    </template>

    <!-- Slot personalizado para la columna de descripción/motivo -->
    <template #cell-motivo="{ item }">
      <div class="motivo-cell">
        <div class="motivo-texto">{{ item.motivo || 'Sin descripción' }}</div>
        <div class="motivo-tipo" v-if="esVenta(item.tipo)">
          <span class="venta-badge">{{ obtenerIdVenta(item.motivo) }}</span>
        </div>
      </div>
    </template>

    <!-- Slot personalizado para la columna de usuario -->
    <template #cell-usuario="{ item }">
      <div class="usuario-cell">
        <span class="usuario-nombre">{{ item.usuario?.nombre || 'Sistema' }}</span>
        <span class="usuario-rol" v-if="item.usuario?.rol">{{ item.usuario.rol }}</span>
      </div>
    </template>

    <!-- Slot personalizado para la columna de referencia -->
    <template #cell-referencia="{ item }">
      <div class="referencia-cell">
        <span v-if="esVenta(item.tipo)" class="ref-badge venta">🛒 Venta</span>
        <span v-else-if="esAjuste(item.tipo)" class="ref-badge ajuste">⚙️ Ajuste</span>
        <span v-else class="ref-badge default">📝 Manual</span>
      </div>
    </template>

    <!-- Slot personalizado para acciones -->
    <template #actions="{ item }">
      <div class="actions-container">
        <button 
          class="action-btn view" 
          title="Ver detalles del movimiento" 
          @click.stop="verDetalle(item)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        
        <button 
          v-if="esVenta(item.tipo)" 
          class="action-btn info" 
          title="Ver factura" 
          @click.stop="verFactura(obtenerIdVenta(item.motivo))"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </button>
        
        <button 
          v-if="puedeEditarse(item)" 
          class="action-btn edit" 
          title="Editar" 
          @click.stop="editarMovimiento(item.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
          </svg>
        </button>
      </div>
    </template>
  </BaseTable>
</template>

<script>
import { computed } from 'vue'
import BaseTable from '../BaseTable.vue'

export default {
  name: 'MovimientosTable',
  components: {
    BaseTable
  },
  props: {
    movimientos: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    esAdministrador: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'ver-detalle',
    'ver-factura', 
    'editar-movimiento',
    'row-click'
  ],
  setup(props, { emit }) {
    
    // Definición de columnas
    const columnas = computed(() => [
      {
        key: 'fecha',
        title: 'Fecha/Hora',
        width: '180px',
        minWidth: '150px'
      },
      {
        key: 'tipo',
        title: 'Tipo',
        width: '140px',
        minWidth: '120px'
      },
      {
        key: 'motivo',
        title: 'Descripción',
        width: '200px',
        minWidth: '150px'
      },
      {
        key: 'usuario',
        title: 'Usuario',
        width: '140px',
        minWidth: '120px'
      },
      {
        key: 'referencia',
        title: 'Referencia',
        width: '120px',
        minWidth: '100px'
      }
    ])

    // Definición de acciones (no se usa directamente ya que usamos slot personalizado)
    const acciones = computed(() => [])

    // ===== FUNCIONES DE UTILIDAD =====
    const esEntrada = (tipo) => {
      return ['entrada', 'compra', 'devolucion_producto', 'devolucion_componente_ramo', 'ajuste_entrada'].includes(tipo)
    }

    const esSalida = (tipo) => {
      return ['salida', 'venta_producto', 'venta_componente_ramo', 'merma', 'devolucion_a_proveedor', 'ajuste_salida'].includes(tipo)
    }

    const esVenta = (tipo) => {
      return tipo === 'venta_producto' || tipo === 'venta_componente_ramo'
    }

    const esAjuste = (tipo) => {
      return tipo === 'ajuste' || tipo === 'ajuste_entrada' || tipo === 'ajuste_salida'
    }

    const obtenerIdVenta = (motivo) => {
      if (!motivo) return null
      const match = motivo.match(/#([a-f0-9-]+)\)/)
      if (match) {
        const fullId = match[1]
        return `#${fullId.substring(0, 8)}`
      }
      return null
    }

    // ===== FUNCIONES DE FORMATO DE FECHA =====
    const getTiempoRelativo = (fecha) => {
      if (!fecha || fecha === '') {
        return 'Fecha no disponible'
      }
      
      try {
        const ahora = new Date()
        const fechaMovimiento = new Date(fecha)
        
        if (isNaN(fechaMovimiento.getTime())) {
          return 'Fecha inválida'
        }
        
        const diferencia = ahora - fechaMovimiento
        
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
    
    const getTiempoRelativoClass = (fecha) => {
      if (!fecha || fecha === '') {
        return 'antigua'
      }
      
      try {
        const ahora = new Date()
        const fechaMovimiento = new Date(fecha)
        
        if (isNaN(fechaMovimiento.getTime())) {
          return 'antigua'
        }
        
        const diferencia = ahora - fechaMovimiento
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

    // ===== FUNCIONES DE FORMATO =====
    const formatearTipoMovimiento = (tipo) => {
      const tipos = {
        'entrada': 'Entrada Manual',
        'salida': 'Salida Manual',
        'compra': 'Compra',
        'venta_producto': 'Venta de Producto',
        'venta_componente_ramo': 'Venta de Ramo',
        'devolucion_producto': 'Devolución de Producto',
        'devolucion_componente_ramo': 'Devolución de Ramo',
        'devolucion_a_proveedor': 'Devolución a Proveedor',
        'merma': 'Merma/Pérdida',
        'ajuste': 'Ajuste',
        'ajuste_entrada': 'Ajuste (Entrada)',
        'ajuste_salida': 'Ajuste (Salida)'
      }
      return tipos[tipo] || tipo
    }

    const getTipoClase = (tipo) => {
      if (tipo === 'venta_producto' || tipo === 'venta_componente_ramo') return 'venta'
      if (tipo === 'merma') return 'merma'
      if (tipo === 'devolucion_producto' || tipo === 'devolucion_componente_ramo' || tipo === 'devolucion_a_proveedor') return 'devolucion'
      
      if (esEntrada(tipo)) return 'entrada'
      if (esSalida(tipo)) return 'salida'
      if (esAjuste(tipo)) return 'ajuste'
      return 'default'
    }

    const puedeEditarse = (movimiento) => {
      return props.esAdministrador && 
             esAjuste(movimiento.tipo) && 
             new Date(movimiento.fecha).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)
    }

    // ===== EVENT HANDLERS =====
    const onRowClick = (item, index) => {
      emit('row-click', item, index)
    }

    const verDetalle = (movimiento) => {
      emit('ver-detalle', movimiento)
    }

    const verFactura = (ventaId) => {
      if (ventaId) {
        const cleanId = ventaId.replace('#', '')
        emit('ver-factura', cleanId)
      }
    }

    const editarMovimiento = (id) => {
      emit('editar-movimiento', id)
    }

    return {
      columnas,
      acciones,
      // Funciones de utilidad
      esEntrada,
      esSalida,
      esVenta,
      esAjuste,
      obtenerIdVenta,
      // Funciones de formato
      formatDateMejorado,
      formatearTipoMovimiento,
      getTipoClase,
      puedeEditarse,
      // Event handlers
      onRowClick,
      verDetalle,
      verFactura,
      editarMovimiento
    }
  }
}
</script>

<style scoped>
/* ===== ESTILOS ESPECÍFICOS PARA MOVIMIENTOS TABLE ===== */

/* Celda de fecha */
.fecha-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 120px;
}

.fecha-principal {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
}

.tiempo-relativo {
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  min-width: 50px;
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

/* Badges de tipo */
.tipo-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 60px;
  text-align: center;
}

.tipo-badge.venta {
  background-color: #f0fff4;
  color: #48bb78;
  border: 1px solid #48bb7830;
}

.tipo-badge.merma {
  background-color: #fff5f5;
  color: #e53e3e;
  border: 1px solid #e53e3e30;
}

.tipo-badge.devolucion {
  background-color: #faf5ff;
  color: #9f7aea;
  border: 1px solid #9f7aea30;
}

.tipo-badge.entrada {
  background-color: #e6fffa;
  color: #38b2ac;
  border: 1px solid #38b2ac20;
}

.tipo-badge.salida {
  background-color: #fffaf0;
  color: #ed8936;
  border: 1px solid #ed893620;
}

.tipo-badge.ajuste {
  background-color: #ebf8ff;
  color: #4299e1;
  border: 1px solid #4299e120;
}

.tipo-badge.default {
  background-color: #f0f0f0;
  color: #4a5568;
  border: 1px solid #4a556820;
}

/* Celda de motivo */
.motivo-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
}

.motivo-texto {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.4;
  text-align: center;
}

.motivo-tipo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.venta-badge {
  background-color: #f0f9ff;
  color: #0284c7;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  min-width: 60px;
  text-align: center;
}

/* Celda de usuario */
.usuario-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  text-align: center;
}

.usuario-nombre {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.usuario-rol {
  font-size: 0.9rem;
  color: #9ca3af;
  text-transform: capitalize;
}

/* Celda de referencia */
.referencia-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  justify-content: center;
}

.ref-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.ref-badge.venta {
  background-color: #ebf8ff;
  color: #4299e1;
  border: 1px solid #4299e120;
}

.ref-badge.ajuste {
  background-color: #e6fffa;
  color: #38b2ac;
  border: 1px solid #38b2ac20;
}

.ref-badge.default {
  background-color: #f0f0f0;
  color: #4a5568;
  border: 1px solid #4a556820;
}

/* Contenedor de acciones */
.actions-container {
  display: flex;
  gap: 3px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.view {
  background-color: #ebf8ff;
  color: #3182ce;
}

.action-btn.view:hover {
  background-color: #bee3f8;
}

.action-btn.edit {
  background-color: #fffaf0;
  color: #ed8936;
}

.action-btn.edit:hover {
  background-color: #feebc8;
}

.action-btn.info {
  background-color: #f0f9ff;
  color: #0284c7;
}

.action-btn.info:hover {
  background-color: #bae6fd;
}

/* Responsive */
@media (max-width: 768px) {
  .fecha-cell {
    min-width: 100px;
    gap: 2px;
  }
  
  .fecha-principal {
    font-size: 0.65rem;
  }
  
  .tiempo-relativo {
    font-size: 0.55rem;
    padding: 1px 4px;
    min-width: 40px;
  }
  
  .tipo-badge,
  .ref-badge,
  .venta-badge {
    font-size: 0.65rem;
    padding: 2px 6px;
    min-width: 50px;
  }
  
  .motivo-texto {
    font-size: 0.7rem;
  }
  
  .usuario-nombre {
    font-size: 0.7rem;
  }
  
  .usuario-rol {
    font-size: 0.6rem;
  }
  
  .actions-container {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-btn {
    width: 22px;
    height: 22px;
  }
}
</style>