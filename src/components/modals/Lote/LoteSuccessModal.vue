<template>
  <BaseModal 
    v-model="isOpen" 
    title=""
    size="large"
    @close="$emit('close')"
  >
    <template #header>
      <div class="exito-icon-container">
        <span class="exito-icon">✅</span>
        <h3>¡Lote Creado Exitosamente!</h3>
      </div>
    </template>
    
    <div v-if="cargando" class="loader-container">
      <div class="loader"></div>
      <p>Cargando información del lote...</p>
    </div>
    
    <div v-else-if="loteCreado" class="lote-exito-content">
      <div class="lote-info-card">
        <div class="lote-info-header">
          <h4>{{ loteCreado.codigo_interno }}</h4>
          <span class="nuevo-badge">NUEVO</span>
        </div>
        
        <div class="lote-info-grid">
          <div class="info-item">
            <label>Producto</label>
            <span>{{ loteCreado.producto.nombre }}</span>
          </div>
          
          <div class="info-item">
            <label>Proveedor</label>
            <span>{{ loteCreado.proveedor.nombre }}</span>
          </div>
          
          <div class="info-item">
            <label>Cantidad</label>
            <span>{{ loteCreado.cantidad_inicial }} unidades</span>
          </div>
          
          <div class="info-item">
            <label>Valor Total</label>
            <span>{{ formatCurrency(loteCreado.valor_lote) }}</span>
          </div>
          
          <!-- <div class="info-item">
            <label>Precio Unitario</label>
            <span>{{ formatCurrency(loteCreado.precio_venta_unitario) }}</span>
          </div> -->
          
          <div class="info-item">
            <label>Fecha de Vencimiento</label>
            <span>{{ formatFecha(loteCreado.fecha_caducidad) }}</span>
          </div>
        </div>
      </div>

      <div class="codigo-barras-card">
        <div class="codigo-barras-header">
          <h5>Código de Barras Generado</h5>
          <div class="codigo-info">
            <span class="codigo-interno">{{ loteCreado.codigo_interno }}</span>
            <span class="codigo-barras-text">{{ loteCreado.codigo_barras }}</span>
          </div>
        </div>
        
        <div class="codigo-barras-display">
          <img 
            v-if="loteCreado.imagen_codigo_barras"
            :src="`http://localhost:3000${loteCreado.imagen_codigo_barras}`" 
            :alt="`Código de barras ${loteCreado.codigo_interno}`"
            class="barcode-image"
            @error="$event.target.style.display='none'"
          />
          
          <div class="barcode-fallback" v-if="!loteCreado.imagen_codigo_barras">
            <span class="barcode-icon">📊</span>
            <p>Código de barras generado</p>
            <code>{{ loteCreado.codigo_barras }}</code>
          </div>
        </div>
      </div>

      <div class="instrucciones-card">
        <h6>📋 Próximos pasos:</h6>
        <ul>
          <li>Imprime y pega el código de barras en el producto</li>
          <li>Guarda el lote en tu ubicación de almacén</li>
          <li>El sistema actualizará automáticamente el inventario</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <button class="btn-secondary" @click="$emit('close')">
        Cerrar
      </button>
      <button class="btn-secondary" @click="$emit('print-code')">
        🖨️ Imprimir Código
      </button>
      <button class="btn-primary" @click="$emit('create-another')">
        ➕ Crear Otro Lote
      </button>
    </template>
  </BaseModal>
</template>

<script>
import { computed } from 'vue'
import BaseModal from '../BaseModal.vue'

export default {
  name: 'LoteSuccessModal',
  components: {
    BaseModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    loteCreado: {
      type: Object,
      default: null
    },
    cargando: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close', 'print-code', 'create-another'],
  setup(props, { emit }) {
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const formatCurrency = (value) => {
      const numero = parseFloat(value)
      if (isNaN(numero)) return '$0.00'
      
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero)
    }
    
    const formatFecha = (fechaStr) => {
      if (!fechaStr) return 'No disponible'
      
      const fecha = new Date(fechaStr)
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(fecha)
    }

    return {
      isOpen,
      formatCurrency,
      formatFecha
    }
  }
}
</script>

<style scoped>
.exito-icon-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.exito-icon {
  font-size: 32px;
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.exito-icon-container h3 {
  margin: 0;
  color: #059669;
  font-weight: 600;
}

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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.lote-exito-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lote-info-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.lote-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
}

.lote-info-header h4 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.nuevo-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.lote-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
}

.codigo-barras-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.codigo-barras-header {
  text-align: center;
  margin-bottom: 20px;
}

.codigo-barras-header h5 {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
}

.codigo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.codigo-interno {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
  font-family: 'Courier New', monospace;
}

.codigo-barras-text {
  font-size: 14px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
}

.codigo-barras-display {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
}

.barcode-image {
  max-width: 100%;
  max-height: 150px;
  height: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.barcode-fallback {
  text-align: center;
  color: #6b7280;
}

.barcode-fallback .barcode-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.barcode-fallback p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.barcode-fallback code {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.instrucciones-card {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
}

.instrucciones-card h6 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1e40af;
  font-weight: 600;
}

.instrucciones-card ul {
  margin: 0;
  padding-left: 20px;
  color: #374151;
}

.instrucciones-card li {
  margin-bottom: 6px;
  line-height: 1.5;
}

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

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .exito-icon-container {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .lote-info-header {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .lote-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .exito-icon-container {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .lote-info-header h4 {
    font-size: 1.2rem;
  }
}
</style>