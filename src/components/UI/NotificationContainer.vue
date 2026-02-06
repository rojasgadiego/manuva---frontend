<template>
  <teleport to="body">
    <div class="notification-container">
      <transition-group name="notification" tag="div">
        <NotificationToast
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @remove="removeNotification(notification.id)"
        />
      </transition-group>
    </div>
  </teleport>
</template>

<script>
import { useNotifications } from '@/composables/useNotifications'
import NotificationToast from './NotificationToast.vue'

export default {
  name: 'NotificationContainer',
  components: {
    NotificationToast
  },
  setup() {
    const { notifications, removeNotification } = useNotifications()

    return {
      notifications,
      removeNotification
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.4s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>