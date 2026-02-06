<template>
  <BaseModal
    v-model="isVisible"
    title="Detalles de Factura"
    size="large"
    :scrollable="true"
    @close="cerrarModal"
  >
    <!-- Contenido del modal -->
    <div v-if="cargando" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando detalles de la factura...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar la factura</h3>
      <p>{{ error }}</p>
      <button class="btn-secondary" @click="cargarFactura">Reintentar</button>
    </div>

    <div v-else-if="factura" class="factura-detalle">
      <!-- Header de la factura -->
      <div class="factura-header">
        <div class="factura-info-principal">
          <h2>{{ factura.numero }}</h2>
          <span class="tipo-badge" :class="factura.tipo">
            {{ factura.tipo === 'emitida' ? 'Factura Emitida' : 'Factura Recibida' }}
          </span>
          <span class="estado-badge" :class="factura.estado">
            {{ formatearEstado(factura.estado) }}
          </span>
        </div>
        <div class="factura-totales">
          <div class="total-principal">
            <span class="label">Total:</span>
            <span class="valor">{{ formatCurrency(factura.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Información general -->
      <div class="seccion">
        <h3>Información General</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Fecha de Emisión:</span>
            <span class="valor">{{ formatearFecha(factura.fecha_emision) }}</span>
          </div>
          <div class="info-item" v-if="factura.fecha_vencimiento">
            <span class="label">Fecha de Vencimiento:</span>
            <span class="valor">{{ formatearFecha(factura.fecha_vencimiento) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Subtotal:</span>
            <span class="valor">{{ formatCurrency(factura.subtotal) }}</span>
          </div>
          <div class="info-item" v-if="parseFloat(factura.descuento) > 0">
            <span class="label">Descuento:</span>
            <span class="valor">{{ formatCurrency(factura.descuento) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Impuestos:</span>
            <span class="valor">{{ formatCurrency(factura.impuestos) }}</span>
          </div>
          <div class="info-item" v-if="factura.notas">
            <span class="label">Notas:</span>
            <span class="valor">{{ factura.notas }}</span>
          </div>
        </div>
      </div>

      <!-- Información del cliente/proveedor -->
      <div class="seccion" v-if="entidadInfo">
        <h3>{{ factura.tipo === 'emitida' ? 'Cliente' : 'Proveedor' }}</h3>
        <div class="entidad-card">
          <div class="entidad-nombre">{{ entidadInfo.nombre }}</div>
          <div class="entidad-detalles">
            <div v-if="entidadInfo.email" class="detalle-item">
              <span class="icono">📧</span>
              <span>{{ entidadInfo.email }}</span>
            </div>
            <div v-if="entidadInfo.telefono" class="detalle-item">
              <span class="icono">📞</span>
              <span>{{ entidadInfo.telefono }}</span>
            </div>
            <div v-if="entidadInfo.direccion" class="detalle-item">
              <span class="icono">📍</span>
              <span>{{ entidadInfo.direccion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalles de productos/servicios -->
      <div class="seccion" v-if="factura.venta && factura.venta.detalles && factura.venta.detalles.length > 0">
        <h3>Detalles de la Venta</h3>
        <div class="tabla-detalles">
          <div class="tabla-header">
            <div class="col-producto">Producto</div>
            <div class="col-cantidad">Cantidad</div>
            <div class="col-precio">Precio Unit.</div>
            <div class="col-subtotal">Subtotal</div>
          </div>
          <div class="tabla-body">
            <div v-for="detalle in factura.venta.detalles" :key="detalle.id" class="tabla-row">
              <div class="col-producto">
                <div class="producto-info">
                  <span class="producto-nombre">{{ detalle.producto.nombre }}</span>
                  <span v-if="detalle.producto.descripcion" class="producto-descripcion">
                    {{ detalle.producto.descripcion }}
                  </span>
                </div>
              </div>
              <div class="col-cantidad">{{ detalle.cantidad }}</div>
              <div class="col-precio">{{ formatCurrency(detalle.precio_unitario) }}</div>
              <div class="col-subtotal">{{ formatCurrency(detalle.subtotal) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información del usuario que creó la factura -->
      <div class="seccion" v-if="factura.usuario">
        <h3>Información del Sistema</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Creado por:</span>
            <span class="valor">{{ factura.usuario.nombre }} ({{ factura.usuario.email }})</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha de creación:</span>
            <span class="valor">{{ formatearFecha(factura.created_at) }}</span>
          </div>
          <div class="info-item" v-if="factura.updated_at !== factura.created_at">
            <span class="label">Última actualización:</span>
            <span class="valor">{{ formatearFecha(factura.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <template #footer>
      <div class="modal-actions">
        <button class="btn-secondary" @click="cerrarModal">Cerrar</button>
        <button v-if="factura" class="btn-primary" @click="imprimirFactura">
          <span class="btn-icon">🖨️</span>
          Imprimir
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import { ref, computed, watch } from 'vue'
import facturaService from '@/services/factura.service' // Asegúrate de importar tu service
import BaseModal from '../BaseModal.vue'

export default {
  name: 'FacturaDetalleModal',
  components: {
    BaseModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    facturaId: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit }) {
    // Estado
    const factura = ref(null)
    const cargando = ref(false)
    const error = ref(null)
    
    // Computed para controlar la visibilidad del modal
    const isVisible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    // Computed para obtener información de la entidad (cliente/proveedor)
    const entidadInfo = computed(() => {
      if (!factura.value) return null
      
      if (factura.value.tipo === 'emitida' && factura.value.venta?.cliente) {
        const cliente = factura.value.venta.cliente
        return {
          nombre: `${cliente.nombre} ${cliente.apellido}`,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion
        }
      } else if (factura.value.tipo === 'recibida' && factura.value.compra?.proveedor) {
        const proveedor = factura.value.compra.proveedor
        return {
          nombre: proveedor.nombre,
          email: proveedor.email,
          telefono: proveedor.telefono,
          direccion: proveedor.direccion
        }
      }
      
      return null
    })

    // Cargar datos de la factura
    const cargarFactura = async () => {
      if (!props.facturaId) return
      
      cargando.value = true
      error.value = null
      
      try {
        const response = await facturaService.getById(props.facturaId)
        factura.value = response.data
      } catch (err) {
        console.error('Error al cargar factura:', err)
        error.value = err.response?.data?.message || 'Error al cargar los detalles de la factura'
      } finally {
        cargando.value = false
      }
    }

    // Cerrar modal
    const cerrarModal = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    // Imprimir factura
    const imprimirFactura = () => {
      // Implementar lógica de impresión
      console.log('Imprimir factura:', factura.value.id)
      // Aquí puedes abrir una nueva ventana con la vista de impresión
      // o generar un PDF
    }

    // Funciones de utilidad
    const formatearFecha = (fecha) => {
      if (!fecha) return '-'
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatCurrency = (value) => {
      const numero = parseFloat(value)
      if (isNaN(numero)) return '-'
      
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero)
    }

    const formatearEstado = (estado) => {
      const estados = {
        'pendiente': 'Pendiente',
        'pagada': 'Pagada',
        'anulada': 'Anulada',
        'vencida': 'Vencida'
      }
      return estados[estado] || estado
    }

    // Watchers
    watch(() => props.facturaId, (newId) => {
      if (newId && props.modelValue) {
        cargarFactura()
      }
    })

    watch(() => props.modelValue, (newValue) => {
      if (newValue && props.facturaId) {
        cargarFactura()
      } else if (!newValue) {
        // Limpiar datos cuando se cierra el modal
        factura.value = null
        error.value = null
      }
    })

    return {
      isVisible,
      factura,
      cargando,
      error,
      entidadInfo,
      cargarFactura,
      cerrarModal,
      imprimirFactura,
      formatearFecha,
      formatCurrency,
      formatearEstado
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.error-container h3 {
  margin: 0 0 10px 0;
  color: #e53e3e;
}

.error-container p {
  margin: 0 0 20px 0;
  color: #666;
}

.factura-detalle {
  padding: 0;
}

.factura-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin-bottom: 25px;
}

.factura-info-principal h2 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.tipo-badge, .estado-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 8px;
  text-transform: uppercase;
}

.tipo-badge.emitida {
  background-color: #e6fffa;
  color: #38b2ac;
}

.tipo-badge.recibida {
  background-color: #ebf8ff;
  color: #3182ce;
}

.estado-badge.pendiente {
  background-color: #feecdc;
  color: #dd6b20;
}

.estado-badge.pagada {
  background-color: #e6fffa;
  color: #38b2ac;
}

.estado-badge.anulada {
  background-color: #fed7d7;
  color: #e53e3e;
}

.estado-badge.vencida {
  background-color: #fff5f5;
  color: #e53e3e;
}

.factura-totales {
  text-align: right;
}

.total-principal {
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-principal .label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.total-principal .valor {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.seccion {
  margin-bottom: 30px;
}

.seccion h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #42b983;
  padding-bottom: 5px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}

.info-item .valor {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.entidad-card {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}

.entidad-nombre {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.entidad-detalles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #555;
}

.icono {
  font-size: 1rem;
}

.tabla-detalles {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabla-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #333;
  text-transform: uppercase;
}

.tabla-body {
  /* Eliminamos la línea incorrecta - los bordes se manejan en .tabla-row */
}

.tabla-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.tabla-row:last-child {
  border-bottom: none;
}

.producto-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.producto-nombre {
  font-weight: 500;
  color: #333;
}

.producto-descripcion {
  font-size: 0.8rem;
  color: #666;
}

.col-cantidad, .col-precio, .col-subtotal {
  text-align: right;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #42b983;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #3aa876;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
}

.btn-icon {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .factura-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .tabla-header, .tabla-row {
    grid-template-columns: 2fr 80px 80px 80px;
    gap: 10px;
  }
  
  .col-cantidad, .col-precio, .col-subtotal {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .tabla-header, .tabla-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .tabla-header {
    display: none;
  }
  
  .tabla-row {
    display: block;
    padding: 15px;
  }
  
  .col-producto, .col-cantidad, .col-precio, .col-subtotal {
    margin-bottom: 5px;
  }
  
  .col-cantidad::before { content: "Cantidad: "; font-weight: 600; }
  .col-precio::before { content: "Precio: "; font-weight: 600; }
  .col-subtotal::before { content: "Subtotal: "; font-weight: 600; }
}
</style>