<template>
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          :class="['toast', `toast-${toast.tipo}`]"
        >
          <div class="toast-content">
            <span class="toast-icon">
              <svg v-if="toast.tipo === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <svg v-else-if="toast.tipo === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <svg v-else-if="toast.tipo === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <div class="toast-mensaje">{{ toast.mensaje }}</div>
            <button class="toast-close" @click="removerToast(toast.id)">&times;</button>
          </div>
          <div class="toast-progress" :style="{ animationDuration: `${toast.duracion}ms` }"></div>
        </div>
      </transition-group>
    </div>
  </template>
  
  <script>
  import { useToast } from '@/composables/useToast';
  
  export default {
    name: 'ToastContainer',
    setup() {
      const { toasts, removerToast } = useToast();
      
      return {
        toasts,
        removerToast
      };
    }
  };
  </script>
  
  <style scoped>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 350px;
  }
  
  .toast {
    background-color: white;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    position: relative;
  }
  
  .toast-content {
    padding: 1rem;
    display: flex;
    align-items: center;
  }
  
  .toast-icon {
    margin-right: 0.75rem;
    display: flex;
    align-items: center;
  }
  
  .toast-mensaje {
    flex: 1;
    padding-right: 1rem;
  }
  
  .toast-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #6b7280;
    line-height: 1;
  }
  
  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    animation: toast-progress linear forwards;
  }
  
  @keyframes toast-progress {
    0% { width: 100%; }
    100% { width: 0%; }
  }
  
  .toast-success .toast-icon {
    color: #10b981;
  }
  
  .toast-error .toast-icon {
    color: #ef4444;
  }
  
  .toast-warning .toast-icon {
    color: #f59e0b;
  }
  
  .toast-info .toast-icon {
    color: #3b82f6;
  }
  
  .toast-success .toast-progress {
    background-color: #10b981;
  }
  
  .toast-error .toast-progress {
    background-color: #ef4444;
  }
  
  .toast-warning .toast-progress {
    background-color: #f59e0b;
  }
  
  .toast-info .toast-progress {
    background-color: #3b82f6;
  }
  
  /* Transiciones */
  .toast-enter-active, 
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  
  .toast-enter-from {
    transform: translateX(100%);
    opacity: 0;
  }
  
  .toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
  </style>