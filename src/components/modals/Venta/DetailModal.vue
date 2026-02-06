<template>
  <BaseModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
    @print="$emit('print', $event)"
    title="Detalle de Venta"
    size="large"
    :scrollable="true"
  >
    <template #default>
      <!-- CONTENIDO DE LA VENTA (siempre se muestra cuando hay datos) -->
      <div v-if="ventaSeleccionada">
        <!-- Información general -->
        <div class="detalle-seccion">
          <h4>Información General</h4>
          <div class="detalle-grid">
            <div class="detalle-item">
              <span class="detalle-label">ID Venta:</span>
              <span class="detalle-valor">{{ ventaSeleccionada.id }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Fecha:</span>
              <span class="detalle-valor">{{ ventaSeleccionada.fecha ? formatDate(ventaSeleccionada.fecha) : 'Sin fecha' }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Estado:</span>
              <span :class="['status-badge', ventaSeleccionada.estado.toLowerCase()]">
                {{ formatEstado(ventaSeleccionada.estado) }}
              </span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Método de Pago:</span>
              <span :class="['metodo-badge', ventaSeleccionada.metodo_pago.toLowerCase()]">
                {{ formatMetodoPago(ventaSeleccionada.metodo_pago) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Información del cliente -->
        <div class="detalle-seccion">
          <h4>Cliente</h4>
          <div class="detalle-grid" v-if="ventaSeleccionada.cliente">
            <div class="detalle-item">
              <span class="detalle-label">Nombre:</span>
              <span class="detalle-valor">{{ ventaSeleccionada.cliente.nombre }} {{ ventaSeleccionada.cliente.apellido }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Email:</span>
              <span class="detalle-valor">{{ ventaSeleccionada.cliente.email }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Teléfono:</span>
              <span class="detalle-valor">{{ ventaSeleccionada.cliente.telefono }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Dirección:</span>
              <span class="detalle-valor">{{ ventaSeleccionada.cliente.direccion }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>Cliente: {{ ventaSeleccionada.cliente_nombre || 'N/A' }}</p>
            <p>No hay información adicional del cliente</p>
          </div>
        </div>

        <!-- Productos/Ramos vendidos -->
        <div class="detalle-seccion" v-if="ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0">
          <h4>Productos</h4>
          <table class="detalles-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
                <th v-if="tieneDevueltos(ventaSeleccionada)">Devueltos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detalle in ventaSeleccionada.detalles" :key="detalle.id">
                <td>
                  <span :class="['tipo-badge', detalle.tipo.toLowerCase()]">
                    {{ detalle.tipo }}
                  </span>
                </td>
                <td>
                  {{ getNombreProducto(detalle) }}
                </td>
                <td class="text-center">{{ detalle.cantidad }}</td>
                <td class="text-right">{{ formatCurrency(detalle.precio_unitario) }}</td>
                <td class="text-right">{{ formatCurrency(detalle.subtotal) }}</td>
                <td v-if="tieneDevueltos(ventaSeleccionada)" class="text-center">
                  {{ detalle.cantidad_devuelta > 0 ? detalle.cantidad_devuelta : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div class="detalle-seccion totales-seccion">
          <div class="totales-grid">
            <div class="total-item">
              <span class="total-label">Subtotal:</span>
              <span class="total-valor">{{ formatCurrency(ventaSeleccionada.subtotal) }}</span>
            </div>
            <div class="total-item" v-if="Number(ventaSeleccionada.descuento) > 0">
              <span class="total-label">Descuento:</span>
              <span class="total-valor">-{{ formatCurrency(ventaSeleccionada.descuento) }}</span>
            </div>
            <div class="total-item" v-if="Number(ventaSeleccionada.impuestos) > 0">
              <span class="total-label">Impuestos:</span>
              <span class="total-valor">{{ formatCurrency(ventaSeleccionada.impuestos) }}</span>
            </div>
            <div class="total-item total-final">
              <span class="total-label">Total:</span>
              <span class="total-valor">{{ formatCurrency(ventaSeleccionada.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Notas -->
        <div class="detalle-seccion" v-if="ventaSeleccionada.notas">
          <h4>Notas</h4>
          <p class="detalle-notas">{{ ventaSeleccionada.notas }}</p>
        </div>
      </div>

      <!-- ERROR AL CARGAR -->
      <div v-else-if="errorDetalle" class="error-container-modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <h4>Error al cargar</h4>
        <p>{{ errorDetalle }}</p>
      </div>

      <!-- FALLBACK: Si no hay datos ni error -->
      <div v-else class="loading-container-modal">
        <div class="spinner"></div>
        <p>No hay datos disponibles</p>
      </div>
    </template>
    
    <!-- Footer del modal - Solo visible cuando hay datos de venta -->
    <template #footer>
      <div v-if="ventaSeleccionada">
        <button class="btn btn-outline" @click="$emit('close')">Cerrar</button>
        <button class="btn btn-primary" @click="$emit('print', ventaSeleccionada)">
          <span class="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
          </span>
          Imprimir
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '../BaseModal.vue'

export default {
  name: 'DetailModal',
  components: {
    BaseModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    ventaSeleccionada: {
      type: Object,
      default: null
    },
    cargandoDetalle: {
      type: Boolean,
      default: false
    },
    errorDetalle: {
      type: String,
      default: null
    }
  },
      emits: ['update:modelValue', 'close', 'print'],
  setup() {
    // Formatear moneda
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(value)
    }
    
    // Formatear fecha
    const formatDate = (dateString) => {
      if (!dateString || dateString === '') {
        return 'Fecha no disponible'
      }
      
      try {
        const date = new Date(dateString)
        
        if (isNaN(date.getTime())) {
          return 'Fecha inválida'
        }
        
        return new Intl.DateTimeFormat('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      } catch (error) {
        return 'Error en fecha'
      }
    }
    
    // Formatear estado
    const formatEstado = (estado) => {
      const formatMap = {
        'COMPLETADA': 'Completada',
        'PENDIENTE': 'Pendiente',
        'CANCELADA': 'Cancelada',
        'PARCIAL_DEVUELTA': 'Parcial Devuelta'
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
    
    // Obtener nombre del producto en detalle
    const getNombreProducto = (detalle) => {
      if (detalle.tipo === 'PRODUCTO' && detalle.producto) {
        return detalle.producto.nombre
      } else if (detalle.tipo === 'RAMO' && detalle.ramo) {
        return detalle.ramo.nombre
      }
      return 'N/A'
    }
    
    // Verificar si hay productos devueltos
    const tieneDevueltos = (venta) => {
      if (!venta || !venta.detalles) return false
      return venta.detalles.some(d => d.cantidad_devuelta > 0)
    }
    
    return {
      formatCurrency,
      formatDate,
      formatEstado,
      formatMetodoPago,
      getNombreProducto,
      tieneDevueltos
    }
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
}

.btn-primary {
  background-color: #743cfa;
  color: white;
}

.btn-primary:hover {
  background-color: #6030d8;
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

.btn-icon {
  margin-right: 8px;
}

/* Estados del modal */
.loading-container-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-container-modal .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #743cfa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container-modal p {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.error-container-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-container-modal svg {
  color: #e53e3e;
  margin-bottom: 20px;
}

.error-container-modal h4 {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.error-container-modal p {
  color: #666;
  font-size: 0.95rem;
  margin: 0 0 25px 0;
  max-width: 400px;
  line-height: 1.5;
}

/* Detalle de venta en modal */
.detalle-seccion {
  margin-bottom: 20px;
}

.detalle-seccion h4 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detalle-item {
  display: flex;
  flex-direction: column;
}

.detalle-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 3px;
}

.detalle-valor {
  font-size: 0.95rem;
  color: #333;
}

.no-data {
  color: #666;
  font-style: italic;
}

.detalles-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.detalles-table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #eee;
}

.detalles-table td {
  padding: 8px 10px;
  vertical-align: middle;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.tipo-badge, .status-badge, .metodo-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-size: 0.75rem;
}

.tipo-badge.producto {
  background-color: #e6fffa;
  color: #38b2ac;
  border: 1px solid #38b2ac20;
}

.tipo-badge.ramo {
  background-color: #e9d8fd;
  color: #805ad5;
  border: 1px solid #805ad520;
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

.totales-seccion {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.totales-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-final {
  font-weight: 700;
  font-size: 1.1rem;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px dashed #ddd;
}

.detalle-notas {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  font-style: italic;
  color: #666;
}

@media (max-width: 768px) {
  .detalle-grid {
    grid-template-columns: 1fr;
  }
}
</style>