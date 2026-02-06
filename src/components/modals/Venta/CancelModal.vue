<template>
  <BaseModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Confirmar Cancelación"
    size="small"
  >
    <template #default>
      <div class="cancel-modal-content">
        <p>¿Está seguro que desea cancelar la venta?</p>
        <p><strong>Esta acción no se puede deshacer.</strong></p>
        <div v-if="venta" class="venta-info">
          <div class="venta-detail">
            <span class="label">ID Venta:</span>
            <span class="value">{{ venta.id.substring(0, 8) }}</span>
          </div>
          <div class="venta-detail">
            <span class="label">Total:</span>
            <span class="value">{{ formatCurrency(venta.total) }}</span>
          </div>
          <div class="venta-detail">
            <span class="label">Cliente:</span>
            <span class="value">{{ venta.cliente_nombre || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </template>
    
    <template #footer>
      <button class="btn btn-outline" @click="$emit('cancel')">No, Regresar</button>
      <button class="btn btn-danger" @click="$emit('confirm')" :disabled="loading">
        <span v-if="loading" class="btn-spinner"></span>
        <span v-else>Sí, Cancelar Venta</span>
      </button>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '../BaseModal.vue';

export default {
  name: 'CancelModal',
  components: {
    BaseModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    venta: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  setup() {
    // Formatear moneda
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(value)
    }
    
    return {
      formatCurrency
    }
  }
}
</script>

<style scoped>
.cancel-modal-content {
  text-align: center;
  padding: 10px 0;
}

.cancel-modal-content p {
  margin: 0 0 15px 0;
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.5;
}

.cancel-modal-content strong {
  color: #e53e3e;
  font-weight: 600;
}

.venta-info {
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  text-align: left;
}

.venta-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.venta-detail:last-child {
  margin-bottom: 0;
}

.venta-detail .label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.venta-detail .value {
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 600;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f5f5f5;
  color: #333;
}

.btn-danger {
  background-color: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c53030;
}

.btn-spinner {
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