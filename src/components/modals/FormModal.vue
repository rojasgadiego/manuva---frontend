<template>
    <BaseModal
      v-model="show"
      :title="title"
      :size="size"
      :scrollable="true"
      :close-on-overlay-click="false"
      @close="onCancel"
    >
      <form @submit.prevent="onSubmit" class="form-modal-content">
        <slot></slot>
        
        <div v-if="error" class="form-error">
          {{ error }}
        </div>
      </form>
      
      <template #footer>
        <div class="form-modal-actions">
          <button 
            v-if="showCancelButton" 
            type="button" 
            class="btn-secondary" 
            @click="onCancel"
            :disabled="isLoading"
          >
            {{ cancelButtonText }}
          </button>
          <button 
            type="button"
            class="btn-submit" 
            :class="submitButtonClass"
            @click="onSubmit"
            :disabled="isLoading || isSubmitDisabled"
          >
            <span v-if="isLoading" class="loader-inline"></span>
            {{ submitButtonText }}
          </button>
        </div>
      </template>
    </BaseModal>
  </template>
  
  <script>
  import { computed } from 'vue';
  import BaseModal from './BaseModal.vue';
  
  export default {
    name: 'FormModal',
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
        default: 'Formulario'
      },
      size: {
        type: String,
        default: 'medium'
      },
      submitButtonText: {
        type: String,
        default: 'Guardar'
      },
      cancelButtonText: {
        type: String,
        default: 'Cancelar'
      },
      submitButtonType: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'success', 'danger', 'warning'].includes(value)
      },
      showCancelButton: {
        type: Boolean,
        default: true
      },
      isLoading: {
        type: Boolean,
        default: false
      },
      isSubmitDisabled: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: ''
      }
    },
    emits: ['update:modelValue', 'submit', 'cancel'],
    setup(props, { emit }) {
      const show = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
      });
  
      const submitButtonClass = computed(() => {
        return {
          'btn-primary': props.submitButtonType === 'primary',
          'btn-success': props.submitButtonType === 'success',
          'btn-danger': props.submitButtonType === 'danger',
          'btn-warning': props.submitButtonType === 'warning'
        };
      });
  
      const onSubmit = () => {
        if (!props.isSubmitDisabled && !props.isLoading) {
          emit('submit');
        }
      };
  
      const onCancel = () => {
        emit('cancel');
        emit('update:modelValue', false);
      };
  
      return {
        show,
        submitButtonClass,
        onSubmit,
        onCancel
      };
    }
  };
  </script>
  
  <style scoped>
  .form-modal-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-error {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-top: 16px;
  }
  
  .form-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    width: 100%;
  }
  
  .btn-secondary {
    background-color: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background-color: #e2e8f0;
  }
  
  .btn-submit {
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  .btn-success {
    background-color: #10b981;
    color: white;
  }
  
  .btn-success:hover:not(:disabled) {
    background-color: #059669;
  }
  
  .btn-danger {
    background-color: #ef4444;
    color: white;
  }
  
  .btn-danger:hover:not(:disabled) {
    background-color: #dc2626;
  }
  
  .btn-warning {
    background-color: #f59e0b;
    color: white;
  }
  
  .btn-warning:hover:not(:disabled) {
    background-color: #d97706;
  }
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .loader-inline {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
  .form-modal-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .btn-submit, .btn-secondary {
    width: 100%;
    padding: 12px;
    font-size: 1.05rem; /* Texto más grande para mejor interacción táctil */
  }
}
  </style>