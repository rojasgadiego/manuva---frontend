import { ref } from 'vue';

// Estado global para las notificaciones/toasts
const toasts = ref([]);
let toastCounter = 0;

/**
 * Composable para gestionar notificaciones tipo toast en la aplicación
 */
export function useToast() {
  /**
   * Muestra una notificación toast
   * @param {String} mensaje - Mensaje a mostrar
   * @param {String} tipo - Tipo de notificación ('success', 'error', 'warning', 'info')
   * @param {Number} duracion - Duración en milisegundos (por defecto 3000ms)
   */
  const mostrarToast = (mensaje, tipo = 'info', duracion = 3000) => {
    const id = `toast-${toastCounter++}`;
    
    // Añadir toast a la lista
    toasts.value.push({
      id,
      mensaje,
      tipo,
      duracion
    });

    // Eliminar el toast después de la duración especificada
    setTimeout(() => {
      removerToast(id);
    }, duracion);
  };

  /**
   * Elimina un toast específico
   * @param {String} id - ID del toast a eliminar
   */
  const removerToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  /**
   * Elimina todos los toasts activos
   */
  const limpiarToasts = () => {
    toasts.value = [];
  };

  return {
    toasts,
    mostrarToast,
    removerToast,
    limpiarToasts
  };
}

// Exportamos también el composable como singleton para uso global
export default useToast();