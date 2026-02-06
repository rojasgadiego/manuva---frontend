<template>
    <BaseModal 
      v-model="show"
      :title="title || 'Confirmar acción'"
      size="medium"
      :close-on-overlay-click="false"
      @close="onCancel"
      class="confirmation-modal"
    >
      <div class="confirmation-content">
        <div v-if="icon" class="confirmation-icon" :class="iconClass">
          <span v-if="icon === 'warning'">⚠️</span>
          <span v-else-if="icon === 'danger'">⛔</span>
          <span v-else-if="icon === 'info'">ℹ️</span>
          <span v-else-if="icon === 'success'">✅</span>
          <span v-else>{{ icon }}</span>
        </div>
        <div class="confirmation-message">
          <p v-if="message" class="message-text">{{ message }}</p>
          <p v-if="subMessage" class="sub-message-text">{{ subMessage }}</p>
          <slot></slot>
        </div>
      </div>
      
      <template #footer>
        <div class="confirmation-actions">
          <button 
            v-if="showCancelButton" 
            class="btn-secondary" 
            @click="onCancel"
            :disabled="isLoading"
          >
            {{ cancelButtonText }}
          </button>
          <button 
            class="btn-confirm" 
            :class="confirmButtonClass" 
            @click="onConfirm"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loader-inline"></span>
            {{ confirmButtonText }}
          </button>
        </div>
      </template>
    </BaseModal>
  </template>
  
  <script>
  import { computed } from 'vue';
  import BaseModal from './BaseModal.vue';
  
  export default {
    name: 'ConfirmationModal',
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
        default: ''
      },
      message: {
        type: String,
        default: ''
      },
      subMessage: {
        type: String,
        default: ''
      },
      confirmButtonText: {
        type: String,
        default: 'Confirmar'
      },
      cancelButtonText: {
        type: String,
        default: 'Cancelar'
      },
      confirmButtonType: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'danger', 'success', 'warning'].includes(value)
      },
      icon: {
        type: String,
        default: ''
      },
      showCancelButton: {
        type: Boolean,
        default: true
      },
      isLoading: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue', 'confirm', 'cancel'],
    setup(props, { emit }) {
      // Computados
      const show = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
      });
  
      const confirmButtonClass = computed(() => {
        return {
          'btn-primary': props.confirmButtonType === 'primary',
          'btn-danger': props.confirmButtonType === 'danger', 
          'btn-success': props.confirmButtonType === 'success',
          'btn-warning': props.confirmButtonType === 'warning'
        };
      });
  
      const iconClass = computed(() => {
        return {
          'icon-warning': props.icon === 'warning',
          'icon-danger': props.icon === 'danger',
          'icon-info': props.icon === 'info',
          'icon-success': props.icon === 'success'
        };
      });
  
      // Métodos
      const onConfirm = () => {
        emit('confirm');
      };
  
      const onCancel = () => {
        emit('cancel');
        emit('update:modelValue', false);
      };
  
      return {
        show,
        confirmButtonClass,
        iconClass,
        onConfirm,
        onCancel
      };
    }
  };
  </script>
  
  <style scoped>
  /* Estilos del modal */
  :deep(.modal-container) {
    min-width: 450px;
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
  
  /* Contenido del modal */
  .confirmation-content {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 20px;
  }
  
  .confirmation-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background-color: #f8fafc;
  }
  
  .icon-warning {
    color: #f59e0b;
    background-color: #fef3c7;
  }
  
  .icon-danger {
    color: #dc2626;
    background-color: #fee2e2;
  }
  
  .icon-info {
    color: #3b82f6;
    background-color: #dbeafe;
  }
  
  .icon-success {
    color: #10b981;
    background-color: #d1fae5;
  }
  
  .confirmation-message {
    flex: 1;
  }
  
  .message-text {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 1.15rem;
    line-height: 1.5;
    color: #1e293b;
    font-weight: 500;
  }
  
  .sub-message-text {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: #64748b;
  }
  
  .confirmation-actions {
    display: flex;
    justify-content: flex-end;
    gap: 14px;
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
  
  .btn-secondary:hover:not(:disabled) {
    background-color: #e2e8f0;
    transform: translateY(-1px);
  }
  
  .btn-confirm {
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 100px;
  }
  
  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
  }
  
  .btn-danger {
    background-color: #ef4444;
    color: white;
  }
  
  .btn-danger:hover:not(:disabled) {
    background-color: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
  }
  
  .btn-success {
    background-color: #10b981;
    color: white;
  }
  
  .btn-success:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
  }
  
  .btn-warning {
    background-color: #f59e0b;
    color: white;
  }
  
  .btn-warning:hover:not(:disabled) {
    background-color: #d97706;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);
  }
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  .loader-inline {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Media queries para dispositivos móviles */
  @media (max-width: 640px) {
    :deep(.modal-container) {
      min-width: auto;
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 8px;
    }
  
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
  
    .confirmation-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .confirmation-message {
      width: 100%;
    }
  
    .confirmation-actions {
      flex-direction: column-reverse;
      gap: 10px;
    }
  
    .btn-secondary, .btn-confirm {
      width: 100%;
      padding: 12px 16px;
      font-size: 1.05rem;
    }
  }
  
  /* Media queries para tablets */
  @media (min-width: 641px) and (max-width: 1024px) {
    :deep(.modal-container) {
      min-width: 400px;
    }
    
    .confirmation-icon {
      font-size: 2.2rem;
      width: 48px;
      height: 48px;
    }
    
    .btn-secondary, .btn-confirm {
      padding: 10px 18px;
      min-width: 90px;
    }
  }
  </style>