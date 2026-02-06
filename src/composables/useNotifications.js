import { ref } from 'vue'

const notifications = ref([])
let notificationId = 0

export const useNotifications = () => {
  const addNotification = (notification) => {
    const id = ++notificationId
    const newNotification = {
      id,
      type: 'success', // 'success', 'error', 'warning', 'info'
      title: '',
      message: '',
      duration: 5000,
      showProgress: true,
      actions: [],
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Convenience methods
  const success = (title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Error messages stay longer
      ...options
    })
  }

  const warning = (title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  // Special method for sales success
  const ventaExitosa = (venta, cliente) => {
    return addNotification({
      type: 'success',
      title: '🎉 ¡Venta Creada Exitosamente!',
      message: `Venta ${venta.id.slice(0, 8)}... registrada para ${cliente}`,
      duration: 6000,
      actions: [
        {
          label: 'Ver Detalles',
          action: () => {
            // Navigate to venta details or show modal
            console.log('Ver detalles de venta:', venta.id)
          }
        },
        {
          label: 'Nueva Venta',
          action: () => {
            // Reset form or navigate to new sale
            window.location.reload()
          }
        }
      ]
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    ventaExitosa
  }
}