import { ref } from 'vue'

export function useErrorHandling() {
  const errorCarga = ref(null)
  
  const validateError = (error, context = '') => {
    if (!error) return null
    const errorMessage = error.message || error.toString() || 'Error desconocido'
    const contextMessage = context ? `${context}: ` : ''
    return `${contextMessage}${errorMessage}`
  }
  
  const handleError = (error, context = '') => {
    const errorMsg = validateError(error, context)
    console.error(errorMsg)
    errorCarga.value = errorMsg
  }
  
  const clearError = () => {
    errorCarga.value = null
  }
  
  return {
    errorCarga,
    validateError,
    handleError,
    clearError
  }
}