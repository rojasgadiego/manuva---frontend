// services/scannerService.js
class ScannerService {
  constructor() {
    this.isListening = false
    this.scanBuffer = ''
    this.scanTimeout = null
    this.scanDelay = 100 // ms entre caracteres para detectar scanner
    this.minScanLength = 8 // longitud mínima del código
    this.maxScanLength = 50 // longitud máxima del código
    this.callbacks = []
    this.lastScanTime = 0
    this.scanCooldown = 1000 // ms entre escaneos
    this.boundKeyDown = this.handleKeyDown.bind(this)
    this.boundKeyPress = this.handleKeyPress.bind(this)
  }

  // Iniciar la escucha de eventos de scanner
  startListening() {
    if (this.isListening) return

    this.isListening = true
    document.addEventListener('keydown', this.boundKeyDown)
    document.addEventListener('keypress', this.boundKeyPress)
    console.log('Scanner service: Listening started')
  }

  // Detener la escucha
  stopListening() {
    if (!this.isListening) return

    this.isListening = false
    document.removeEventListener('keydown', this.boundKeyDown)
    document.removeEventListener('keypress', this.boundKeyPress)
    this.clearScanBuffer()  
    console.log('Scanner service: Listening stopped')
  }

  // Manejar eventos de teclado
  handleKeyDown(event) {
    // Ignorar si el usuario está escribiendo en un input
    if (this.isUserTyping(event.target)) return

    // Enter indica fin de escaneo
    if (event.key === 'Enter') {
      event.preventDefault()
      this.processScan()
      return
    }

    // Escape para cancelar
    if (event.key === 'Escape') {
      this.clearScanBuffer()
      return
    }
  }

  handleKeyPress(event) {
    // Ignorar si el usuario está escribiendo
    if (this.isUserTyping(event.target)) return

    // Solo procesar caracteres alfanuméricos y algunos especiales
    if (this.isValidScanCharacter(event.key)) {
      event.preventDefault()
      this.addToBuffer(event.key)
    }
  }

  // Verificar si el usuario está escribiendo en un campo de entrada
  isUserTyping(target) {
    const typingElements = ['INPUT', 'TEXTAREA', 'SELECT']
    return typingElements.includes(target.tagName) || 
           target.contentEditable === 'true' ||
           target.closest('[contenteditable="true"]')
  }

  // Verificar si es un caracter válido para código de barras
  isValidScanCharacter(char) {
    return /^[a-zA-Z0-9\-_]$/.test(char)
  }

  // Agregar caracter al buffer
  addToBuffer(char) {
    this.scanBuffer += char

    // Limpiar timeout anterior
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout)
    }

    // Si el buffer es muy largo, probablemente no es un scanner
    if (this.scanBuffer.length > this.maxScanLength) {
      this.clearScanBuffer()
      return
    }

    // Configurar timeout para detectar fin de escaneo
    this.scanTimeout = setTimeout(() => {
      this.processScan()
    }, this.scanDelay)
  }

  // Procesar el código escaneado
  processScan() {
    const code = this.scanBuffer.trim()
    
    if (code.length >= this.minScanLength && code.length <= this.maxScanLength) {
      const now = Date.now()
      
      // Verificar cooldown para evitar escaneos duplicados
      if (now - this.lastScanTime > this.scanCooldown) {
        this.lastScanTime = now
        this.notifyCallbacks(code)
        console.log('Scanner detected code:', code)
      }
    }
    
    this.clearScanBuffer()
  }

  // Limpiar el buffer
  clearScanBuffer() {
    this.scanBuffer = ''
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout)
      this.scanTimeout = null
    }
  }

  // Registrar callback para cuando se detecte un escaneo
  onScan(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback)
    }
  }

  // Remover callback
  offScan(callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  // Notificar a todos los callbacks
  notifyCallbacks(code) {
    this.callbacks.forEach(callback => {
      try {
        callback(code)
      } catch (error) {
        console.error('Error in scan callback:', error)
      }
    })
  }

  // Configurar parámetros del scanner
  configure(options = {}) {
    this.scanDelay = options.scanDelay || this.scanDelay
    this.minScanLength = options.minScanLength || this.minScanLength
    this.maxScanLength = options.maxScanLength || this.maxScanLength
    this.scanCooldown = options.scanCooldown || this.scanCooldown
  }

  // Simular un escaneo (para testing)
  simulateScan(code) {
    console.log('Simulating scan:', code)
    this.notifyCallbacks(code)
  }
}

// Crear instancia singleton
const scannerService = new ScannerService()

export default scannerService