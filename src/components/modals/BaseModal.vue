<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlayClick ? close() : null">
        <div class="modal-container" :class="[size, { 'scrollable': scrollable }]" @click.stop v-bind="$attrs">
          <div class="modal-header">
            <h2 v-if="title">{{ title }}</h2>
            <slot name="header"></slot>
            <button v-if="showCloseButton" class="modal-close" @click="close">×</button>
          </div>
          <div class="modal-body" :class="bodyClass">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import { onMounted, onUnmounted, watch } from 'vue';

export default {
  name: 'BaseModal',
  inheritAttrs: false, // Importante: evita la herencia automática
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    bodyClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'close', 'print'], // Agregamos print aquí
  setup(props, { emit }) {
    // Manejar tecla escape para cerrar el modal
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && props.closeOnEscape && props.modelValue) {
        close();
      }
    };

    const close = () => {
      emit('update:modelValue', false);
      emit('close');
    };

    // Agregar/quitar event listeners
    onMounted(() => {
      document.addEventListener('keydown', handleEscapeKey);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscapeKey);
    });

    // Controlar scroll del body cuando el modal está abierto
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }, { immediate: true });

    return {
      close
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow-y: auto;
  padding: 20px;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 40px);
  margin: auto;
  overflow: hidden;
}

.modal-container.scrollable {
  overflow-y: auto;
}

/* Tamaños de modal */
.modal-container.small {
  width: 400px;
  max-width: calc(100vw - 40px);
}

.modal-container.medium {
  width: 600px;
  max-width: calc(100vw - 40px);
}

.modal-container.large {
  width: 800px;
  max-width: calc(100vw - 40px);
}

.modal-container.full {
  width: 100%;
  height: 100%;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #dc2626;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Animaciones */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    width: 100% !important;
    border-radius: 8px;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .modal-header {
    padding: 12px 16px;
  }
  
  .modal-header h2 {
    font-size: 1.2rem;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-close {
    font-size: 1.8rem;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    border-radius: 8px;
    max-height: calc(100vh - 20px);
  }
}
</style>