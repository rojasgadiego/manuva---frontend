<template>
  <BaseModal
    v-model="isVisible"
    title="Detalle del Movimiento"
    size="large"
    :scrollable="true"
    @close="$emit('close')"
  >
    <div class="detalle-movimiento-content">
      <!-- Loading State -->
      <div v-if="cargando" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando detalles del movimiento...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button class="btn-retry" @click="cargarDetalle">Reintentar</button>
      </div>

      <!-- Content -->
      <div v-else-if="movimiento" class="detalle-content">
        <!-- Header con información principal -->
        <div class="detalle-header">
          <div class="movimiento-tipo">
            <span :class="['tipo-badge', getTipoClase(movimiento.tipo)]">
              {{ formatearTipoMovimiento(movimiento.tipo) }}
            </span>
            <span :class="['cantidad-badge', esEntrada(movimiento.tipo) ? 'entrada' : 'salida']">
              {{ formatearCantidadTotal() }}
            </span>
            <span v-if="esMovimientoMultiple" class="productos-badge">
              {{ movimiento.detalles.length }} productos
            </span>
          </div>
          <div class="movimiento-fecha">
            <span class="fecha-label">Fecha y hora:</span>
            <span class="fecha-valor">{{ formatearFechaHora(movimiento.fecha) }}</span>
          </div>
        </div>

        <!-- Grid de información -->
        <div class="info-grid">
          <!-- Usuario -->
          <div class="info-section">
            <h3 class="section-title">👤 Usuario</h3>
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">{{ movimiento.usuario?.nombre || 'Sistema' }}</span>
              </div>
              <div class="info-row" v-if="movimiento.usuario?.email">
                <span class="info-label">Email:</span>
                <span class="info-value">{{ movimiento.usuario.email }}</span>
              </div>
              <div class="info-row" v-if="movimiento.usuario?.rol">
                <span class="info-label">Rol:</span>
                <span class="info-value rol-badge">{{ movimiento.usuario.rol }}</span>
              </div>
            </div>
          </div>

          <!-- Información del Movimiento -->
          <div class="info-section">
            <h3 class="section-title">📋 Información del Movimiento</h3>
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Tipo:</span>
                <span class="info-value">{{ formatearTipoMovimiento(movimiento.tipo) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cantidad total:</span>
                <span class="info-value">{{ formatearCantidadTotal() }}</span>
              </div>
              <div class="info-row" v-if="ventaId">
                <span class="info-label">Venta asociada:</span>
                <span class="info-value venta-link">{{ ventaId }}</span>
              </div>
            </div>
          </div>

          <!-- Motivo y observaciones -->
          <div class="info-section full-width" v-if="movimiento.motivo">
            <h3 class="section-title">📝 Motivo</h3>
            <div class="info-card">
              <p class="motivo-text">{{ movimiento.motivo }}</p>
            </div>
          </div>
        </div>

        <!-- Productos afectados -->
        <div class="productos-section">
          <h3 class="section-title">📦 Productos Afectados</h3>
          
          <div class="productos-list">
            <div 
              v-for="(detalle, index) in movimiento.detalles" 
              :key="detalle.id || index"
              class="producto-card"
            >
              <div class="producto-header">
                <div class="producto-nombre">
                  <span class="nombre-texto">{{ detalle.producto?.nombre || 'Producto no disponible' }}</span>
                  <span :class="['cantidad-producto', esEntrada(movimiento.tipo) ? 'entrada' : 'salida']">
                    {{ formatearCantidad(detalle.cantidad, movimiento.tipo) }}
                  </span>
                </div>
                <div class="producto-acciones">
                  <button 
                    class="toggle-producto" 
                    @click="toggleProductoDetalle(index)"
                    :class="{ expanded: productosExpandidos[index] }"
                  >
                    {{ productosExpandidos[index] ? '▼' : '▶' }}
                  </button>
                </div>
              </div>

              <!-- Información básica siempre visible -->
              <div class="producto-info-basica">
                <div class="info-row" v-if="detalle.producto?.descripcion">
                  <span class="info-label">Descripción:</span>
                  <span class="info-value">{{ detalle.producto.descripcion }}</span>
                </div>
                <div class="info-row" v-if="detalle.lote">
                  <span class="info-label">Lote:</span>
                  <span class="info-value">{{ detalle.lote }}</span>
                </div>
              </div>

              <!-- Información detallada (expandible) -->
              <div v-show="productosExpandidos[index]" class="producto-info-detallada">
                <div class="info-grid-small">
                  <div class="info-row" v-if="detalle.producto">
                    <span class="info-label">Stock actual:</span>
                    <span class="info-value">{{ detalle.producto.stock_actual }}</span>
                  </div>
                  <div class="info-row" v-if="detalle.producto?.precio_unitario">
                    <span class="info-label">Precio unitario:</span>
                    <span class="info-value">{{ formatCurrency(detalle.producto.precio_unitario) }}</span>
                  </div>
                  <div class="info-row" v-if="detalle.producto?.precio_ramo">
                    <span class="info-label">Precio ramo:</span>
                    <span class="info-value">{{ formatCurrency(detalle.producto.precio_ramo) }}</span>
                  </div>
                  <div class="info-row" v-if="detalle.precio_unitario">
                    <span class="info-label">Precio en este movimiento:</span>
                    <span class="info-value">{{ formatCurrency(detalle.precio_unitario) }}</span>
                  </div>
                  <div class="info-row" v-if="calcularSubtotalProducto(detalle)">
                    <span class="info-label">Subtotal:</span>
                    <span class="info-value subtotal">{{ formatCurrency(calcularSubtotalProducto(detalle)) }}</span>
                  </div>
                </div>

                <!-- Información técnica del producto -->
                <div v-if="mostrarInfoTecnica" class="info-tecnica-producto">
                  <div class="info-row">
                    <span class="info-label">ID Producto:</span>
                    <span class="info-value mono">{{ detalle.producto?.id }}</span>
                  </div>
                  <div class="info-row" v-if="detalle.producto?.categoria_id">
                    <span class="info-label">ID Categoría:</span>
                    <span class="info-value mono">{{ detalle.producto.categoria_id }}</span>
                  </div>
                  <div class="info-row" v-if="detalle.producto?.proveedor_id">
                    <span class="info-label">ID Proveedor:</span>
                    <span class="info-value mono">{{ detalle.producto.proveedor_id }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Activo:</span>
                    <span :class="['info-value', 'estado-badge', detalle.producto?.activo ? 'activo' : 'inactivo']">
                      {{ detalle.producto?.activo ? 'Sí' : 'No' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen financiero (si hay información de precios) -->
        <div v-if="tieneInformacionFinanciera" class="resumen-section">
          <h3 class="section-title">💰 Resumen Financiero</h3>
          <div class="resumen-financiero">
            <div class="resumen-row">
              <span class="resumen-label">Total de productos:</span>
              <span class="resumen-valor">{{ movimiento.detalles.length }}</span>
            </div>
            <div class="resumen-row">
              <span class="resumen-label">Cantidad total:</span>
              <span class="resumen-valor">{{ formatearCantidadTotal() }}</span>
            </div>
            <div v-if="calcularValorTotal()" class="resumen-row total">
              <span class="resumen-label">Valor total estimado:</span>
              <span class="resumen-valor">{{ formatCurrency(calcularValorTotal()) }}</span>
            </div>
          </div>
        </div>

        <!-- Información técnica (solo para admins) -->
        <div v-if="mostrarInfoTecnica" class="info-tecnica">
          <button class="toggle-tecnica" @click="expandirInfoTecnica = !expandirInfoTecnica">
            <span>🔧 Información técnica</span>
            <span class="toggle-icon">{{ expandirInfoTecnica ? '▼' : '▶' }}</span>
          </button>
          
          <div v-show="expandirInfoTecnica" class="info-tecnica-content">
            <div class="info-grid-small">
              <div class="info-row">
                <span class="info-label">ID del movimiento:</span>
                <span class="info-value mono">{{ movimiento.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ID del usuario:</span>
                <span class="info-value mono">{{ movimiento.usuario_id }}</span>
              </div>
              <div class="info-row" v-if="movimiento.venta_id">
                <span class="info-label">ID de venta:</span>
                <span class="info-value mono">{{ movimiento.venta_id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Fecha de creación:</span>
                <span class="info-value">{{ formatearFechaCompleta(movimiento.fecha) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Número de detalles:</span>
                <span class="info-value">{{ movimiento.detalles.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <template #footer>
      <div class="modal-actions">
        <button v-if="ventaId" class="btn-secondary" @click="verVenta">
          🛒 Ver Venta Completa
        </button>
        <button v-if="movimiento?.detalles?.length > 1" class="btn-secondary" @click="expandirTodosProductos">
          {{ todosProductosExpandidos ? '📁 Contraer Todo' : '📂 Expandir Todo' }}
        </button>
        <button class="btn-primary" @click="$emit('close')">
          Cerrar
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import { ref, computed, watch, reactive } from 'vue'
import { useStore } from 'vuex'
import movimientoService from '@/services/movimiento.service'
import BaseModal from './BaseModal.vue'

export default {
  name: 'DetalleMovimientoModal',
  components: {
    BaseModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    movimientoId: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue', 'close', 'ver-venta'],
  setup(props, { emit }) {
    const store = useStore()
    
    // Estado
    const cargando = ref(false)
    const error = ref(null)
    const movimiento = ref(null)
    const expandirInfoTecnica = ref(false)
    const productosExpandidos = reactive({})

    // Computed
    const isVisible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const mostrarInfoTecnica = computed(() => {
      const userRoles = store.getters['auth/userRoles'] || []
      return userRoles.includes('admin')
    })

    const esMovimientoMultiple = computed(() => {
      return movimiento.value && movimiento.value.detalles && movimiento.value.detalles.length > 1
    })

    const ventaId = computed(() => {
      if (!movimiento.value?.motivo) return null
      const match = movimiento.value.motivo.match(/#([a-f0-9-]+)\)/)
      if (match) {
        const fullId = match[1]
        return `#${fullId.substring(0, 8)}`
      }
      return null
    })

    const tieneInformacionFinanciera = computed(() => {
      return movimiento.value?.detalles?.some(detalle => 
        detalle.precio_unitario || detalle.producto?.precio_unitario
      )
    })

    const todosProductosExpandidos = computed(() => {
      if (!movimiento.value?.detalles) return false
      return movimiento.value.detalles.every((_, index) => productosExpandidos[index])
    })

    // Métodos
    const cargarDetalle = async () => {
      if (!props.movimientoId) {
        error.value = 'No se proporcionó un ID de movimiento válido'
        return
      }

      cargando.value = true
      error.value = null
      
      try {
        const response = await movimientoService.getById(props.movimientoId)
        
        // Adaptar a la nueva estructura del API
        if (response.status === 'success' && response.data) {
          movimiento.value = response.data
          
          // Inicializar estado de expansión de productos
          if (movimiento.value.detalles) {
            // Limpiar estados previos
            Object.keys(productosExpandidos).forEach(key => {
              delete productosExpandidos[key]
            })
            
            // Inicializar todos como contraídos
            movimiento.value.detalles.forEach((_, index) => {
              productosExpandidos[index] = false
            })
            
            // Si solo hay un producto, expandirlo por defecto
            if (movimiento.value.detalles.length === 1) {
              productosExpandidos[0] = true
            }
          }
        } else {
          throw new Error(response.message || 'Respuesta inválida del servidor')
        }
      } catch (err) {
        console.error('Error al cargar detalle del movimiento:', err)
        error.value = 'Error al cargar los detalles del movimiento. Por favor, intenta nuevamente.'
      } finally {
        cargando.value = false
      }
    }

    // Funciones de utilidad
    const formatearFechaHora = (fecha) => {
      return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatearFechaCompleta = (fecha) => {
      return new Date(fecha).toLocaleString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

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
      if (esEntrada(tipo)) return 'entrada'
      if (esSalida(tipo)) return 'salida'
      if (esAjuste(tipo)) return 'ajuste'
      return 'default'
    }

    const formatearCantidad = (cantidad, tipo) => {
      const valor = Math.abs(cantidad)
      const signo = esEntrada(tipo) ? '+' : '-'
      return `${signo}${valor}`
    }

    const formatearCantidadTotal = () => {
      if (!movimiento.value?.detalles) return '0'
      
      const total = movimiento.value.detalles.reduce((sum, detalle) => {
        return sum + Math.abs(detalle.cantidad || 0)
      }, 0)
      
      const signo = esEntrada(movimiento.value.tipo) ? '+' : '-'
      return `${signo}${total}`
    }

    const esEntrada = (tipo) => {
      return ['entrada', 'compra', 'devolucion_producto', 'devolucion_componente_ramo', 'ajuste_entrada'].includes(tipo)
    }

    const esSalida = (tipo) => {
      return ['salida', 'venta_producto', 'venta_componente_ramo', 'merma', 'devolucion_a_proveedor', 'ajuste_salida'].includes(tipo)
    }

    const esAjuste = (tipo) => {
      return tipo === 'ajuste' || tipo === 'ajuste_entrada' || tipo === 'ajuste_salida'
    }

    const formatCurrency = (value) => {
      if (!value) return '$0.00'
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(value)
    }

    const calcularSubtotalProducto = (detalle) => {
      const precio = detalle.precio_unitario || detalle.producto?.precio_unitario
      if (!precio || !detalle.cantidad) return 0
      return Math.abs(detalle.cantidad) * parseFloat(precio)
    }

    const calcularValorTotal = () => {
      if (!movimiento.value?.detalles) return 0
      
      return movimiento.value.detalles.reduce((total, detalle) => {
        return total + calcularSubtotalProducto(detalle)
      }, 0)
    }

    // Funciones de interacción
    const toggleProductoDetalle = (index) => {
      productosExpandidos[index] = !productosExpandidos[index]
    }

    const expandirTodosProductos = () => {
      const nuevoEstado = !todosProductosExpandidos.value
      if (movimiento.value?.detalles) {
        movimiento.value.detalles.forEach((_, index) => {
          productosExpandidos[index] = nuevoEstado
        })
      }
    }

    // Acciones
    const verVenta = () => {
      if (ventaId.value) {
        const cleanId = ventaId.value.replace('#', '')
        emit('ver-venta', cleanId)
      }
    }

    // Watcher optimizado
    watch([() => props.modelValue, () => props.movimientoId], ([newVisible, newId], [oldVisible, oldId]) => {
      if (newVisible && newId) {
        const modalJustoAbierto = newVisible && !oldVisible
        const idCambio = newId && newId !== oldId && newVisible
        
        if (modalJustoAbierto || idCambio) {
          cargarDetalle()
        }
      } else if (!newVisible) {
        // Limpiar datos cuando se cierra el modal
        movimiento.value = null
        error.value = null
        expandirInfoTecnica.value = false
        Object.keys(productosExpandidos).forEach(key => {
          delete productosExpandidos[key]
        })
      }
    })

    return {
      isVisible,
      cargando,
      error,
      movimiento,
      expandirInfoTecnica,
      productosExpandidos,
      mostrarInfoTecnica,
      esMovimientoMultiple,
      ventaId,
      tieneInformacionFinanciera,
      todosProductosExpandidos,
      cargarDetalle,
      formatearFechaHora,
      formatearFechaCompleta,
      formatearTipoMovimiento,
      getTipoClase,
      formatearCantidad,
      formatearCantidadTotal,
      esEntrada,
      esSalida,
      esAjuste,
      formatCurrency,
      calcularSubtotalProducto,
      calcularValorTotal,
      toggleProductoDetalle,
      expandirTodosProductos,
      verVenta
    }
  }
}
</script>

<style scoped>
.detalle-movimiento-content {
  min-height: 200px;
}

/* Loading y Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #dc2626;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.error-message {
  margin-bottom: 15px;
  color: #374151;
}

.btn-retry {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-retry:hover {
  background-color: #3aa876;
}

/* Header del detalle */
.detalle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.movimiento-tipo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tipo-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.tipo-badge.entrada {
  background-color: #e6fffa;
  color: #38b2ac;
}

.tipo-badge.salida {
  background-color: #fff5f5;
  color: #e53e3e;
}

.tipo-badge.ajuste {
  background-color: #ebf8ff;
  color: #4299e1;
}

.cantidad-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
}

.cantidad-badge.entrada {
  background-color: #e6fffa;
  color: #38b2ac;
}

.cantidad-badge.salida {
  background-color: #fff5f5;
  color: #e53e3e;
}

.productos-badge {
  background-color: #f0f9ff;
  color: #0284c7;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.movimiento-fecha {
  text-align: right;
}

.fecha-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.fecha-valor {
  font-weight: 600;
  color: #374151;
}

/* Grid de información */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.info-grid-small {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.full-width {
  grid-column: span 2;
}

.info-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.section-title {
  background-color: #f9fafb;
  margin: 0;
  padding: 12px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.info-card {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  flex: 0 0 auto;
  margin-right: 12px;
}

.info-value {
  color: #374151;
  text-align: right;
  word-break: break-word;
}

.info-value.mono {
  font-family: monospace;
  font-size: 0.875rem;
}

.rol-badge {
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.venta-link {
  font-family: monospace;
  background-color: #f0f9ff;
  color: #0284c7;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875rem;
}

.motivo-text {
  margin: 0;
  line-height: 1.5;
  color: #374151;
}

/* Sección de productos */
.productos-section {
  margin-bottom: 24px;
}

.productos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.producto-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.producto-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.producto-nombre {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.nombre-texto {
  font-weight: 600;
  color: #374151;
}

.cantidad-producto {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
}

.cantidad-producto.entrada {
  background-color: #e6fffa;
  color: #38b2ac;
}

.cantidad-producto.salida {
  background-color: #fff5f5;
  color: #e53e3e;
}

.producto-acciones {
  display: flex;
  align-items: center;
}

.toggle-producto {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
}

.toggle-producto:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.toggle-producto.expanded {
  color: #42b983;
}

.producto-info-basica {
  padding: 12px 16px;
}

.producto-info-detallada {
  padding: 16px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.info-tecnica-producto {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.estado-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.estado-badge.activo {
  background-color: #e6fffa;
  color: #38b2ac;
}

.estado-badge.inactivo {
  background-color: #fff5f5;
  color: #e53e3e;
}

.subtotal {
  font-weight: 600;
  color: #059669;
}

/* Resumen financiero */
.resumen-section {
  margin-bottom: 24px;
}

.resumen-financiero {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.resumen-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.resumen-row.total {
  border-top: 2px solid #e5e7eb;
  padding-top: 8px;
  margin-top: 8px;
  font-weight: 600;
}

.resumen-label {
  color: #6b7280;
}

.resumen-valor {
  font-weight: 500;
  color: #374151;
}

/* Información técnica */
.info-tecnica {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  margin-top: 20px;
}

.toggle-tecnica {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  padding: 8px 0;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  transition: color 0.2s;
}

.toggle-tecnica:hover {
  color: #374151;
}

.toggle-icon {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.info-tecnica-content {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
}

/* Footer */
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #3aa876;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
  
  .detalle-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .movimiento-fecha {
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-value {
    text-align: left;
  }
  
  .producto-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .producto-nombre {
    width: 100%;
    justify-content: space-between;
  }
}
</style>