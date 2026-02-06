// services/phomemoService.js
class PhomemoService {
  constructor() {
    this.device = null;
    this.characteristic = null;
  }

  // Conectar via Bluetooth
  async conectar() {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth no soportado en este navegador');
      }

      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'M221' },
          { namePrefix: 'Phomemo' }
        ],
        optionalServices: [
          '0000ff00-0000-1000-8000-00805f9b34fb', // Servicio principal Phomemo
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // Servicio alternativo
        ]
      });

      const server = await this.device.gatt.connect();
      const service = await server.getPrimaryService('0000ff00-0000-1000-8000-00805f9b34fb');
      this.characteristic = await service.getCharacteristic('0000ff02-0000-1000-8000-00805f9b34fb');
      
      return true;
    } catch (error) {
      console.error('Error conectando a Phomemo M221:', error);
      throw error;
    }
  }

  // Enviar comandos ESC/POS a la impresora
  async enviarComando(comando) {
    if (!this.characteristic) {
      throw new Error('Impresora no conectada');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(comando);
    
    // Dividir en chunks de 20 bytes (limitación Bluetooth)
    for (let i = 0; i < data.length; i += 20) {
      const chunk = data.slice(i, i + 20);
      await this.characteristic.writeValue(chunk);
      await new Promise(resolve => setTimeout(resolve, 10)); // Pequeña pausa
    }
  }

  // Imprimir código de barras específicamente
  async imprimirCodigoBarras(lote) {
    try {
      if (!this.characteristic) {
        await this.conectar();
      }

      // Comandos ESC/POS para la M221
      let comandos = '';
      
      // Inicializar impresora
      comandos += '\x1B\x40'; // ESC @
      
      // Configurar densidad de impresión
      comandos += '\x1B\x2D\x32'; // Densidad media
      
      // Centrar texto
      comandos += '\x1B\x61\x01'; // ESC a 1 (centrar)
      
      // Título
      comandos += '\x1B\x21\x30'; // Texto grande
      comandos += `${lote.producto.nombre}\n`;
      comandos += '\x1B\x21\x00'; // Texto normal
      
      // Código interno
      comandos += `Código: ${lote.codigo_interno}\n`;
      
      // Código de barras CODE128
      comandos += '\x1D\x6B\x49'; // GS k I (CODE128)
      comandos += String.fromCharCode(lote.codigo_interno.length);
      comandos += lote.codigo_interno;
      comandos += '\n';
      
      // Información adicional
      comandos += `Precio: $${lote.precio_venta_unitario}\n`;
      comandos += `Vence: ${this.formatearFecha(lote.fecha_caducidad)}\n`;
      comandos += `Proveedor: ${lote.proveedor.nombre}\n`;
      
      // Alimentar papel
      comandos += '\n\n\n';
      
      // Cortar papel (si la impresora lo soporta)
      comandos += '\x1D\x56\x42\x00'; // GS V B 0
      
      await this.enviarComando(comandos);
      return true;
      
    } catch (error) {
      console.error('Error imprimiendo:', error);
      throw error;
    }
  }

  // Imprimir múltiples códigos
  async imprimirMultiplesCodigos(lotes) {
    for (const lote of lotes) {
      await this.imprimirCodigoBarras(lote);
      await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre impresiones
    }
  }

  formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES');
  }

  // Desconectar
  desconectar() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}

export default new PhomemoService;