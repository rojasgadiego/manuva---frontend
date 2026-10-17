<template>
  <div class="toast-container" role="status" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.tipo}`]"
      >
        <span class="toast-dot"></span>
        <p class="toast-mensaje">{{ toast.mensaje }}</p>
        <button class="toast-close" @click="removerToast(toast.id)" aria-label="Cerrar aviso">&times;</button>
        <div class="toast-progress" :style="{ animationDuration: `${toast.duracion}ms` }"></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { useToast } from '@/utils/useToast'

export default {
  name: 'ToastContainer',
  setup() {
    const { toasts, removerToast } = useToast()
    return { toasts, removerToast }
  },
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 70px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(360px, calc(100vw - 32px));
  font-family: 'Inter', sans-serif;
}

.toast {
  --tono: #38bdf8;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 12px 14px;
  background: #141820;
  border: 0.5px solid #1e2433;
  border-left: 3px solid var(--tono);
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  color: #e2e8f0;
}

.toast-success { --tono: #22c55e; }
.toast-error   { --tono: #ef4444; }
.toast-warning { --tono: #f59e0b; }
.toast-info    { --tono: #38bdf8; }

.toast-dot {
  width: 8px; height: 8px; min-width: 8px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--tono);
}

.toast-mensaje {
  flex: 1;
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}
.toast-close:hover { color: #e2e8f0; }

.toast-progress {
  position: absolute;
  left: 0; bottom: 0;
  height: 2px;
  background: var(--tono);
  opacity: 0.6;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from { width: 100%; }
  to   { width: 0%; }
}

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(24px); }
</style>
