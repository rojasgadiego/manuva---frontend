<template>
  <BaseModal 
    v-model="isOpen" 
    title="Detalles del Lote"
    size="large"
    @close="$emit('close')"
  >
    <div v-if="cargando" class="loader-container">
      <div class="loader"></div>
      <p>Cargando detalles...</p>
    </div>
    
    <div v-else-if="lote" class="lote-detalles">
      <div class="detalle-header">
        <div class="codigo-display">
          <h4>{{ lote.codigo_interno }}</h4>
          <span :class="['estado-badge-large', getCriticidadClass(lote)]">
            {{ getEstadoLabel(lote) }}
          </span>
        </div>
      </div>

      <div v-if="lote.imagen_codigo_barras" class="codigo-barras-detalle-card">
        <div class="codigo-barras-detalle-header">
          <h5>Código de Barras</h5>
          <div class="codigo-barras-info">
            <span class="codigo-interno-detalle">{{ lote.codigo_interno }}</span>
            <span class="codigo-barras-text-detalle">{{ lote.codigo_barras }}</span>
          </div>
        </div>
        
        <div class="codigo-barras-detalle-display">
          <img 
            :src="`http://localhost:3000${lote.imagen_codigo_barras}`" 
            :alt="`Código de barras ${lote.codigo_interno}`"
            class="barcode-image-detalle"
            @error="$event.target.style.display='none'"
          />
        </div>
      </div>

      <div class="detalles-grid">
        <div class="detalle-item">
          <label>Producto</label>
          <span>{{ lote.producto.nombre }}</span>
        </div>
        
        <div class="detalle-item">
          <label>Categoría</label>
          <span>{{ lote.producto.categoria }}</span>
        </div>
        
        <div class="detalle-item">
          <label>Cantidad Inicial</label>
          <span>{{ lote.cantidad_inicial }} unidades</span>
        </div>

        <div class="detalle-item">
          <label>Cantidad Actual</label>
          <span>{{ lote.cantidad_actual }} unidades</span>
        </div>
        
        <!-- <div class="detalle-item">
          <label>Precio por Unidad</label>
          <span>{{ formatCurrency(lote.precio_venta_unitario) }}</span>
        </div> -->
        
        <div class="detalle-item">
          <label>Valor Total</label>
          <span>{{ formatCurrency(lote.valor_lote) }}</span>
        </div>
        
        <div class="detalle-item">
          <label>Proveedor</label>
          <span>{{ lote.proveedor.nombre }}</span>
        </div>
        
        <div class="detalle-item">
          <label>Fecha de Ingreso</label>
          <span>{{ formatFecha(lote.createdAt) }}</span>
        </div>
        
        <div class="detalle-item">
          <label>Fecha de Vencimiento</label>
          <span>{{ formatFecha(lote.fecha_caducidad) }}</span>
        </div>
        
        <div class="detalle-item">
          <label>Días Restantes</label>
          <span :class="getCriticidadClass(lote)">
            {{ calcularDiasRestantes(lote.fecha_caducidad) }} días
          </span>
        </div>
      </div>

      <div v-if="lote.notas" class="detalle-notas">
        <label>Notas</label>
        <p>{{ lote.notas }}</p>
      </div>
    </div>

    <template #footer>
      <button class="btn-secondary" @click="$emit('close')">
        Cerrar
      </button>
      <button class="btn-secondary" @click="$emit('edit', lote)">
        ✏️ Editar
      </button>
      <button class="btn-primary" @click="$emit('print', lote)">
        🖨️ Imprimir
      </button>
    </template>
  </BaseModal>
</template>

<script>
import { computed } from 'vue'
import BaseModal from '../BaseModal.vue'

export default {
  name: 'LoteDetailModal',
  components: {
    BaseModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    lote: {
      type: Object,
      default: null
    },
    cargando: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close', 'edit', 'print'],
  setup(props, { emit }) {
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const calcularDiasRestantes = (fechaCaducidad) => {
      const hoy = new Date()
      const fechaFin = new Date(fechaCaducidad)

      hoy.setHours(0, 0, 0, 0)
      fechaFin.setHours(0, 0, 0, 0)

      const diferenciaMs = fechaFin - hoy
      const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24))

      return dias >= 0 ? dias : 0
    }

    const getCriticidadClass = (lote) => {
      if (calcularDiasRestantes(lote.fecha_caducidad) < 0) return 'vencido'
      if (calcularDiasRestantes(lote.fecha_caducidad) <= 3) return 'critico'
      if (calcularDiasRestantes(lote.fecha_caducidad) <= 7) return 'advertencia'
      return 'normal'
    }

    const getEstadoLabel = (lote) => {
      const criticidad = getCriticidadClass(lote)
      const labels = {
        vencido: 'Vencido',
        critico: 'Crítico',
        advertencia: 'Por vencer',
        normal: 'Normal'
      }
      return labels[criticidad]
    }

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
      calcularDiasRestantes,
      getCriticidadClass,
      getEstadoLabel,
      formatCurrency,
      formatFecha
    }
  }
}
</script>

<style scoped>
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

.lote-detalles {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detalle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
}

.codigo-display {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.codigo-display h4 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
  font-family: 'Courier New', monospace;
}

.estado-badge-large {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge-large.critico {
  background: #ef4444;
  color: white;
}

.estado-badge-large.advertencia {
  background: #f59e0b;
  color: white;
}

.estado-badge-large.vencido {
  background: #8b5cf6;
  color: white;
}

.estado-badge-large.normal {
  background: #10b981;
  color: white;
}

.codigo-barras-detalle-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.codigo-barras-detalle-header {
  text-align: center;
  margin-bottom: 16px;
}

.codigo-barras-detalle-header h5 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.codigo-barras-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.codigo-interno-detalle {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
  font-family: 'Courier New', monospace;
}

.codigo-barras-text-detalle {
  font-size: 12px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
}

.codigo-barras-detalle-display {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  background: #f9fafb;
}

.barcode-image-detalle {
  max-width: 100%;
  max-height: 100px;
  height: auto;
  border: 1px solid #e5e7eb;
  border-radius: 3px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detalle-item label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detalle-item span {
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
}

.detalle-item span.critico {
  color: #dc2626;
  font-weight: 600;
}

.detalle-item span.advertencia {
  color: #d97706;
  font-weight: 600;
}

.detalle-item span.vencido {
  color: #8b5cf6;
  font-weight: 600;
}

.detalle-item span.normal {
  color: #059669;
  font-weight: 600;
}

.detalle-notas {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.detalle-notas label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.detalle-notas p {
  margin: 0;
  color: #6b7280;
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
  .codigo-display {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .codigo-display h4 {
    font-size: 1.2rem;
  }
  
  .detalles-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .codigo-display {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .codigo-display h4 {
    font-size: 1.2rem;
  }
}
</style>