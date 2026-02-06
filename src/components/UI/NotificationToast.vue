<template>
  <div class="notification-toast" :class="notificationClasses" @click="handleClick">
    <div class="notification-content">
      <!-- Icon -->
      <div class="notification-icon">
        <component :is="iconComponent" />
      </div>
      
      <!-- Main Content -->
      <div class="notification-main">
        <h4 v-if="notification.title" class="notification-title">
          {{ notification.title }}
        </h4>
        <p v-if="notification.message" class="notification-message">
          {{ notification.message }}
        </p>
        
        <!-- Actions -->
        <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
          <button 
            v-for="action in notification.actions" 
            :key="action.label"
            @click.stop="handleAction(action)"
            class="notification-action-btn"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Close Button -->
      <button @click.stop="$emit('remove')" class="notification-close">
        <CloseIcon />
      </button>
    </div>
    
    <!-- Progress Bar -->
    <div 
      v-if="notification.showProgress && notification.duration > 0" 
      class="notification-progress"
      :style="{ animationDuration: notification.duration + 'ms' }"
    ></div>
  </div>
</template>

<script>
import { computed } from 'vue'

// Simple icon components (you can replace with your icon library)
const SuccessIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

const ErrorIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

const WarningIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.55 21H20.45A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86ZM12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

const InfoIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

const CloseIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

export default {
  name: 'NotificationToast',
  components: {
    SuccessIcon,
    ErrorIcon,
    WarningIcon,
    InfoIcon,
    CloseIcon
  },
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  emits: ['remove'],
  setup(props, { emit }) {
    const iconComponent = computed(() => {
      const iconMap = {
        success: 'SuccessIcon',
        error: 'ErrorIcon',
        warning: 'WarningIcon',
        info: 'InfoIcon'
      }
      return iconMap[props.notification.type] || 'InfoIcon'
    })

    const notificationClasses = computed(() => [
      `notification-${props.notification.type}`,
      'notification-enter'
    ])

    const handleClick = () => {
      if (props.notification.onClick) {
        props.notification.onClick()
      }
    }

    const handleAction = (action) => {
      if (action.action) {
        action.action()
      }
      emit('remove')
    }

    return {
      iconComponent,
      notificationClasses,
      handleClick,
      handleAction
    }
  }
}
</script>

<style scoped>
.notification-toast {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  min-width: 400px;
  max-width: 500px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.notification-toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15), 0 8px 30px rgba(0, 0, 0, 0.1);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 2px;
}

.notification-main {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a1a1a;
  line-height: 1.4;
}

.notification-message {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.notification-action-btn {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  transition: all 0.2s ease;
}

.notification-action-btn:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
  color: #333;
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: #f0f0f0;
  color: #666;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: progress-bar linear forwards;
}

/* Type-specific styles */
.notification-success {
  border-left-color: #10b981;
}

.notification-success .notification-icon {
  color: #10b981;
}

.notification-success .notification-progress {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-error .notification-progress {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.notification-warning {
  border-left-color: #f59e0b;
}

.notification-warning .notification-icon {
  color: #f59e0b;
}

.notification-warning .notification-progress {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.notification-info {
  border-left-color: #3b82f6;
}

.notification-info .notification-icon {
  color: #3b82f6;
}

.notification-info .notification-progress {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

/* Animations */
.notification-enter {
  animation: slideInRight 0.4s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes progress-bar {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .notification-toast {
    min-width: 320px;
    max-width: calc(100vw - 32px);
    margin-left: 16px;
    margin-right: 16px;
  }
  
  .notification-content {
    padding: 16px;
  }
  
  .notification-title {
    font-size: 15px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style>