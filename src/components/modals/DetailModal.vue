<template>
    <BaseModal
      v-model="show"
      :title="title"
      :size="size"
      :scrollable="true"
      @close="onClose"
    >
      <div class="detail-content">
        <!-- Loader mientras carga -->
        <div v-if="isLoading" class="detail-loader">
          <div class="loader"></div>
          <p>Cargando información...</p>
        </div>
        
        <!-- Mensaje de error -->
        <div v-else-if="error" class="detail-error">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button class="btn-retry" @click="$emit('retry')" v-if="showRetryButton">
            Reintentar
          </button>
        </div>
        
        <!-- Contenido -->
        <div v-else class="detail-body">
          <slot></slot>
        </div>
      </div>
      
      <template #footer>
        <div class="detail-actions">
          <slot name="actions"></slot>
          <button 
            v-if="showCloseButton" 
            class="btn-secondary" 
            @click="onClose"
          >
            {{ closeButtonText }}
          </button>
        </div>
      </template>
    </BaseModal>
  </template>
  
  <script>
  import { computed } from 'vue';
  import BaseModal from './BaseModal.vue';
  
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
      title: {
        type: String,
        default: 'Detalles'
      },
      size: {
        type: String,
        default: 'large'
      },
      isLoading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: ''
      },
      showRetryButton: {
        type: Boolean,
        default: true
      },
      showCloseButton: {
        type: Boolean,
        default: true
      },
      closeButtonText: {
        type: String,
        default: 'Cerrar'
      }
    },
    emits: ['update:modelValue', 'close', 'retry'],
    setup(props, { emit }) {
      const show = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
      });
  
      const onClose = () => {
        emit('close');
        emit('update:modelValue', false);
      };
  
      return {
        show,
        onClose
      };
    }
  };
  </script>
  
  <style scoped>
  /* Mejora visual para el modal de detalles */
  :deep(.modal-container) {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    border-radius: 12px;
  }
  
  :deep(.modal-header) {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  :deep(.modal-header h2) {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1e293b;
  }
  
  :deep(.modal-body) {
    padding: 24px;
  }
  
  :deep(.modal-footer) {
    padding: 18px 24px;
    border-top: 1px solid #e2e8f0;
  }
  
  :deep(.modal-close) {
    font-size: 1.8rem;
    color: #64748b;
    transition: color 0.2s;
  }
  
  :deep(.modal-close:hover) {
    color: #dc2626;
  }
  
  .detail-content {
    min-height: 200px;
  }
  
  .detail-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 30px;
    color: #64748b;
  }
  
  .loader {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-radius: 50%;
    border-top-color: #3b82f6;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }
  
  .detail-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 30px;
    color: #b91c1c;
    text-align: center;
  }
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }
  
  .detail-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .detail-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
  }
  
  .btn-secondary {
    background-color: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 100px;
  }
  
  .btn-secondary:hover {
    background-color: #e2e8f0;
    transform: translateY(-1px);
  }
  
  .btn-retry {
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 20px;
  }
  
  .btn-retry:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    :deep(.modal-header) {
      padding: 16px 20px;
    }
  
    :deep(.modal-header h2) {
      font-size: 1.3rem;
    }
  
    :deep(.modal-body) {
      padding: 20px;
    }
  
    :deep(.modal-footer) {
      padding: 16px 20px;
    }
    
    .detail-actions {
      flex-direction: column-reverse;
      gap: 12px;
    }
    
    .detail-actions button {
      width: 100%;
      padding: 12px;
      justify-content: center;
      min-width: auto;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loader {
      width: 40px;
      height: 40px;
    }
  }
  </style>