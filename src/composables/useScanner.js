// composables/useScanner.js
import { ref, onUnmounted } from 'vue'
import scannerService from '@/services/scanner.service'

export function useScanner() {
  const isActive = ref(false)
  const lastScannedCode = ref('')
  const scanCount = ref(0)

  // Callback que se ejecuta cuando se detecta un escaneo
  const handleScan = (code) => {
    lastScannedCode.value = code
    scanCount.value++
    console.log('Scan detected in composable:', code)
  }

  // Activar el scanner
  const activate = (options = {}) => {
    if (isActive.value) return

    // Configurar el scanner si se proporcionan opciones
    if (Object.keys(options).length > 0) {
      scannerService.configure(options)
    }

    scannerService.onScan(handleScan)
    scannerService.startListening()
    isActive.value = true
    console.log('Scanner activated')
  }

  // Desactivar el scanner
  const deactivate = () => {
    if (!isActive.value) return

    scannerService.offScan(handleScan)
    scannerService.stopListening()
    isActive.value = false
    console.log('Scanner deactivated')
  }

  // Simular un escaneo (útil para testing)
  const simulateScan = (code) => {
    scannerService.simulateScan(code)
  }

  // Auto-cleanup cuando el componente se desmonta
  onUnmounted(() => {
    deactivate()
  })

  return {
    isActive,
    lastScannedCode,
    scanCount,
    activate,
    deactivate,
    simulateScan
  }
}