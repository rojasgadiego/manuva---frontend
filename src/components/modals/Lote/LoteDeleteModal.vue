<template>
  <BaseModal
    v-model="isOpen" 
    title="Confirmar Eliminación"
    size="medium"
    @close="$emit('close')"
  >
    <div class="delete-content">
      <div class="warning-icon">
        ⚠️
      </div>
      
      <div class="delete-message">
        <p>¿Estás seguro de que deseas eliminar el lote <strong>{{ lote?.codigo_interno }}</strong>?</p>
        <p class="warning-text">Esta acción no se puede deshacer.</p>
      </div>
      
      <div v-if="lote" class="lote-summary">
        <div class="summary-item">
          <label>Producto:</label>
          <span>{{ lote.producto?.nombre || 'No disponible' }}</span>
        </div>
        <div class="summary-item">
          <label>Cantidad:</label>
          <span>{{ lote.cantidad_inicial || 0 }} unidades</span>
        </div>
        <div class="summary-item">
          <label>Valor:</label>
          <span>{{ formatCurrency(lote.valor_lote || 0) }}</span>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <template #footer>
      <button class="btn-outline" @click="$emit('close')">
        Cancelar
      </button>
      <button 
        class="btn-danger"
        @click="$emit('confirm')"
        :disabled="cargando"
      >
        <span v-if="cargando" class="loading-spinner"></span>
        Eliminar
      </button>
    </template>
  </BaseModal>
</template>

<script>
import { computed } from 'vue'
import BaseModal from '../BaseModal.vue'

export default {
  name: 'LoteDeleteModal',
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
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'close', 'confirm'],
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

    return {
      isOpen,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.delete-content {
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 20px;
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

.delete-message {
  margin-bottom: 24px;
}

.delete-message p {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #374151;
  line-height: 1.5;
}

.delete-message p:first-child {
  font-weight: 500;
}

.warning-text {
  color: #d97706;
  font-style: italic;
  font-weight: 600;
}

.lote-summary {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.summary-item span {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
}

.btn-outline, .btn-danger {
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

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>