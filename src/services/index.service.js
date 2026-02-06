import authService from './auth.service'
import clienteService from './cliente.service'
import proveedorService from './proveedor.service'
import usuarioService from './usuarios.service'
import facturaService from './factura.service'
import productoService from './producto.service'
import movimientoService from './movimiento.service';
import ramoService from './ramo.service'
import ventaService from './venta.service'

export {
  authService,
  clienteService,
  proveedorService,
  usuarioService,
  facturaService,
  productoService,
  movimientoService,
  ventaService,
  ramoService
}

export default {
  auth: authService,
  cliente: clienteService,
  proveedor: proveedorService,
  usuario: usuarioService,
  factura: facturaService,
  producto: productoService,
  movimiento: movimientoService,
  ramo: ramoService,
  venta: ventaService
}