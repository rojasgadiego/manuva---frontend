<template>
  <Teleport to="body">
    <transition name="scan-modal-fade">
      <div v-if="modelValue" class="scan-modal-overlay" @click="closeModal">
        <div class="scan-modal-container" @click.stop>
          <div class="scan-modal-header">
            <div class="scan-title">
              <span class="scan-icon">📦</span>
              <h3>Producto Escaneado</h3>
            </div>
            <button class="scan-close" @click="closeModal">×</button>
          </div>
          
          <div class="scan-modal-body">
            <!-- Estado de carga -->
            <div v-if="loading" class="scan-loading">
              <div class="scan-spinner"></div>
              <p>Buscando producto...</p>
            </div>

            <!-- Producto no encontrado -->
            <div v-else-if="!product && !loading" class="scan-not-found">
              <div class="not-found-icon">❌</div>
              <h4>Producto no encontrado</h4>
              <p>El código <strong>{{ scannedCode }}</strong> no está registrado en el sistema.</p>
              <button class="btn-primary" @click="$emit('create-product', scannedCode)">
                Crear Producto
              </button>
            </div>

            <!-- Producto encontrado -->
            <div v-else-if="product" class="scan-product">
              <!-- Información del producto -->
              <div class="product-card">
                <div class="product-header">
                  <h4>{{ product.nombre }}</h4>
                  <span class="product-category">{{ product.categoria }}</span>
                </div>
                
                <div class="product-details">
                  <div class="product-info">
                    <div class="info-item">
                      <label>Código:</label>
                      <span class="product-code">{{ scannedCode }}</span>
                    </div>
                    <div class="info-item">
                      <label>Precio:</label>
                      <span class="product-price">{{ formatCurrency(product.precio) }}</span>
                    </div>
                    <div class="info-item" v-if="product.stock !== undefined">
                      <label>Stock:</label>
                      <span :class="getStockClass(product.stock)">{{ product.stock }} unidades</span>
                    </div>
                    <div class="info-item" v-if="product.fecha_caducidad">
                      <label>Vencimiento:</label>
                      <span :class="getExpiryClass(product.fecha_caducidad)">
                        {{ formatDate(product.fecha_caducidad) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Imagen del producto si existe -->
                  <div v-if="product.imagen" class="product-image">
                    <img :src="product.imagen" :alt="product.nombre" />
                  </div>
                </div>
              </div>

              <!-- Control de cantidad -->
              <div class="quantity-control">
                <label>Cantidad:</label>
                <div class="quantity-input">
                  <button class="qty-btn" @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                  <input 
                    type="number" 
                    v-model.number="quantity" 
                    min="1" 
                    :max="product.stock || 999"
                    @change="validateQuantity"
                  />
                  <button class="qty-btn" @click="increaseQuantity" :disabled="quantity >= (product.stock || 999)">+</button>
                </div>
              </div>

              <!-- Total -->
              <div class="total-section">
                <div class="total-label">Total:</div>
                <div class="total-amount">{{ formatCurrency((product.precio || 0) * quantity) }}</div>
              </div>
            </div>
          </div>
          
          <div class="scan-modal-footer" v-if="product">
            <button class="btn-secondary" @click="$emit('view-details', product)">
              Ver Detalles
            </button>
            <button class="btn-primary" @click="addToCart" :disabled="quantity <= 0">
              <span class="cart-icon">🛒</span>
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ScanCartModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    scannedCode: {
      type: String,
      default: ''
    },
    product: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close', 'add-to-cart', 'view-details', 'create-product'],
  setup(props, { emit }) {
    const quantity = ref(1)

    // Resetear cantidad cuando se abre el modal
    watch(() => props.modelValue, (isOpen) => {
      if (isOpen) {
        quantity.value = 1
      }
    })

    const closeModal = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    const increaseQuantity = () => {
      const maxStock = props.product?.stock || 999
      if (quantity.value < maxStock) {
        quantity.value++
      }
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const validateQuantity = () => {
      const maxStock = props.product?.stock || 999
      if (quantity.value < 1) {
        quantity.value = 1
      } else if (quantity.value > maxStock) {
        quantity.value = maxStock
      }
    }

    const addToCart = () => {
      emit('add-to-cart', {
        product: props.product,
        quantity: quantity.value,
        code: props.scannedCode
      })
      closeModal()
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
      if (!dateStr) return 'N/A'
      
      const fecha = new Date(dateStr)
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(fecha)
    }

    const getStockClass = (stock) => {
      if (stock <= 0) return 'stock-empty'
      if (stock <= 5) return 'stock-low'
      if (stock <= 20) return 'stock-medium'
      return 'stock-good'
    }

    const getExpiryClass = (expiryDate) => {
      if (!expiryDate) return ''
      
      const today = new Date()
      const expiry = new Date(expiryDate)
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'expired'
      if (diffDays <= 3) return 'expires-soon'
      if (diffDays <= 7) return 'expires-warning'
      return 'expires-good'
    }

    return {
      quantity,
      closeModal,
      increaseQuantity,
      decreaseQuantity,
      validateQuantity,
      addToCart,
      formatCurrency,
      formatDate,
      getStockClass,
      getExpiryClass
    }
  }
}
</script>

<style scoped>
.scan-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
  padding: 20px;
}

.scan-modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: scanModalSlideIn 0.3s ease-out;
}

@keyframes scanModalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.scan-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.scan-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scan-icon {
  font-size: 24px;
}

.scan-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.scan-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  line-height: 1;
}

.scan-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.scan-modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

/* Estados de carga */
.scan-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.scan-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Producto no encontrado */
.scan-not-found {
  text-align: center;
  padding: 40px 20px;
}

.not-found-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.scan-not-found h4 {
  margin: 0 0 12px 0;
  color: #dc2626;
  font-size: 1.25rem;
}

.scan-not-found p {
  margin: 0 0 24px 0;
  color: #6b7280;
  line-height: 1.5;
}

/* Producto encontrado */
.scan-product {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.product-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.product-header h4 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
}

.product-category {
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.product-details {
  display: flex;
  gap: 16px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.product-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #059669;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Estados de stock */
.stock-empty { color: #dc2626; font-weight: 600; }
.stock-low { color: #d97706; font-weight: 600; }
.stock-medium { color: #059669; }
.stock-good { color: #059669; }

/* Estados de vencimiento */
.expired { color: #dc2626; font-weight: 600; }
.expires-soon { color: #dc2626; font-weight: 600; }
.expires-warning { color: #d97706; font-weight: 600; }
.expires-good { color: #059669; }

/* Control de cantidad */
.quantity-control {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.quantity-control label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.quantity-input {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  background: #f9fafb;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s;
  color: #374151;
}

.qty-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input input {
  border: none;
  padding: 12px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  width: 80px;
  outline: none;
}

/* Total */
.total-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: #059669;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #047857;
}

.scan-modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Botones */
.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.cart-icon {
  font-size: 16px;
}

/* Animaciones */
.scan-modal-fade-enter-active,
.scan-modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.scan-modal-fade-enter-from,
.scan-modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .scan-modal-container {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }
  
  .scan-modal-header {
    padding: 16px 20px;
  }
  
  .scan-modal-body {
    padding: 20px;
  }
  
  .scan-modal-footer {
    padding: 16px 20px;
    flex-direction: column;
  }
  
  .scan-modal-footer .btn-primary,
  .scan-modal-footer .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .product-details {
    flex-direction: column;
  }
  
  .product-image {
    align-self: center;
  }
}
</style>