<template>
  <div class="ramo-form">
    <!-- ✅ INFORMACIÓN BÁSICA DEL RAMO -->
    <div class="form-section">
      <h4>📝 Información del Ramo</h4>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">Nombre del Ramo</label>
          <input
            v-model="formData.nombre"
            type="text"
            class="form-input"
            placeholder="Ej: Ramo Primaveral"
            :class="{ 'error': errors.nombre }"
            @blur="validarFormulario"
          />
          <span v-if="errors.nombre" class="error-message">{{ errors.nombre }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">Precio de Venta</label>
          <input
            v-model.number="formData.precio_venta"
            type="number"
            step="0.01"
            min="0"
            class="form-input"
            placeholder="0.00"
            :class="{ 'error': errors.precio_venta }"
          />
          <span v-if="errors.precio_venta" class="error-message">{{ errors.precio_venta }}</span>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Costo Estimado</label>
          <div class="input-with-button">
            <input
              v-model.number="formData.costo_estimado"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              placeholder="0.00"
              :class="{ 'error': errors.costo_estimado }"
            />
            <button 
              type="button" 
              class="btn-auto-calc"
              @click="formData.costo_estimado = calcularCostoTotal()"
              title="Calcular automáticamente"
            >
              🔄
            </button>
          </div>
          <span v-if="errors.costo_estimado" class="error-message">{{ errors.costo_estimado }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">Stock Inicial</label>
          <input
            v-model.number="formData.stock_actual"
            type="number"
            min="0"
            class="form-input"
            placeholder="0"
            :class="{ 'error': errors.stock_actual }"
          />
          <span v-if="errors.stock_actual" class="error-message">{{ errors.stock_actual }}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea
          v-model="formData.descripcion"
          class="form-textarea"
          placeholder="Describe este hermoso ramo..."
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">URL de Imagen</label>
        <input
          v-model="formData.imagen_url"
          type="url"
          class="form-input"
          placeholder="https://ejemplo.com/imagen.jpg"
          :class="{ 'error': errors.imagen_url }"
        />
        <span v-if="errors.imagen_url" class="error-message">{{ errors.imagen_url }}</span>
      </div>
      
      <div class="form-row">
        <div class="checkbox-group">
          <input
            v-model="formData.personalizado"
            type="checkbox"
            id="personalizado"
            class="form-checkbox"
          />
          <label for="personalizado" class="checkbox-label">
            🎨 Ramo Personalizado
          </label>
        </div>
        
        <div class="checkbox-group">
          <input
            v-model="formData.valor_rebaja"
            type="checkbox"
            id="valor_rebaja"
            class="form-checkbox"
          />
          <label for="valor_rebaja" class="checkbox-label">
            💰 Aplicar Descuento
          </label>
        </div>
      </div>
    </div>

    <!-- ✅ COMPONENTES DEL RAMO - NUEVA ESTRUCTURA MEJORADA -->
    <div class="form-section">
      <div class="section-header">
        <h4>🌸 Componentes del Ramo</h4>
        <span class="component-count">{{ formData.componentes.length }} productos</span>
      </div>
      
      <!-- ✅ PRODUCTOS ACTUALES EN EL RAMO (solo en edición) -->
      <div v-if="isEditing && formData.componentes.length > 0" class="productos-en-ramo">
        <h5 class="subsection-title">
          <span class="title-icon">✅</span>
          Productos actualmente en el ramo
        </h5>
        
        <div class="componentes-list current-productos">
          <div
            v-for="(componente, index) in formData.componentes"
            :key="`current-${componente.producto_id}-${index}`"
            class="componente-item current"
            :class="{ 'error': errors[`componente_${index}_cantidad`] }"
          >
            <div class="componente-info">
              <span class="componente-nombre">
                {{ obtenerNombreProducto(componente.producto_id) }}
              </span>
              <span class="componente-categoria">
                {{ obtenerCategoriaProducto(componente.producto_id) }}
              </span>
            </div>
            
            <!-- ✅ CANTIDAD CON VALIDACIÓN DE STOCK -->
            <div class="componente-cantidad">
              <label>Cantidad:</label>
              <div class="cantidad-controls">
                <button 
                  type="button" 
                  class="btn-cantidad" 
                  @click="ajustarCantidad(index, componente.cantidad - 1)"
                  :disabled="componente.cantidad <= 1"
                >
                  -
                </button>
                <input
                  v-model.number="componente.cantidad"
                  type="number"
                  min="1"
                  :max="getMaxCantidadPermitida(componente.producto_id) + componente.cantidad"
                  class="cantidad-input"
                  :class="{ 'error': errors[`componente_${index}_cantidad`] }"
                  @blur="validarFormulario"
                  @input="ajustarCantidad(index, $event.target.value)"
                />
                <button 
                  type="button" 
                  class="btn-cantidad" 
                  @click="ajustarCantidad(index, componente.cantidad + 1)"
                  :disabled="componente.cantidad >= (getMaxCantidadPermitida(componente.producto_id) + componente.cantidad)"
                >
                  +
                </button>
              </div>
              <div class="cantidad-info">
                <span class="max-disponible">
                  Máx: {{ getMaxCantidadPermitida(componente.producto_id) + componente.cantidad }}
                </span>
              </div>
              <span v-if="errors[`componente_${index}_cantidad`]" class="error-message">
                {{ errors[`componente_${index}_cantidad`] }}
              </span>
            </div>
            
            <div class="componente-subtotal">
              <span class="subtotal-label">Subtotal:</span>
              <span class="subtotal-value">
                {{ formatCurrency(calcularSubtotalComponente(componente)) }}
              </span>
            </div>
            
            <div class="componente-acciones">
              <button
                type="button"
                class="btn-icon btn-remove"
                title="Eliminar producto del ramo"
                @click="eliminarComponente(index)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <!-- ✅ RESUMEN DEL RAMO -->
        <div class="ramo-resumen">
          <div class="resumen-row">
            <span>Total de productos:</span>
            <span class="valor">{{ formData.componentes.length }}</span>
          </div>
          <div class="resumen-row">
            <span>Cantidad total de unidades:</span>
            <span class="valor">{{ calcularTotalUnidades() }}</span>
          </div>
          <div class="resumen-row total">
            <span>Costo estimado calculado:</span>
            <span class="valor">{{ formatCurrency(calcularCostoTotal()) }}</span>
          </div>
        </div>
      </div>
      
      <!-- ✅ AGREGAR PRODUCTOS AL RAMO -->
      <div class="agregar-productos-section">
        <h5 class="subsection-title">
          <span class="title-icon">➕</span>
          {{ isEditing ? 'Agregar más productos al ramo' : 'Agregar productos al ramo' }}
        </h5>
        
        <!-- ✅ SELECTOR DE PRODUCTOS -->
        <div class="product-selector">
          <div class="selector-filters">
            <div class="filter-group">
              <input
                v-model="filtroProductos.busqueda"
                type="text"
                placeholder="Buscar productos..."
                class="form-input"
                @input="aplicarFiltroProductos"
              />
            </div>
            
            <div class="filter-group">
              <select 
                v-model="filtroProductos.categoriaId" 
                class="form-select"
                @change="aplicarFiltroProductos"
              >
                <option value="">Todas las categorías</option>
                <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>
            
            <button 
              type="button" 
              class="btn-secondary small" 
              @click="limpiarFiltroProductos"
              :disabled="loadingProductos"
            >
              🗑️ Limpiar
            </button>
          </div>
          
          <!-- ✅ LOADING DE PRODUCTOS -->
          <div v-if="loadingProductos" class="loading-productos">
            <div class="spinner"></div>
            <span>Cargando productos...</span>
          </div>
          
          <!-- ✅ ERROR AL CARGAR PRODUCTOS -->
          <div v-else-if="errorProductos" class="error-productos">
            <span>{{ errorProductos }}</span>
            <button type="button" class="btn-link" @click="cargarProductos">
              🔄 Reintentar
            </button>
          </div>
          
          <!-- ✅ LISTA DE PRODUCTOS DISPONIBLES PARA AGREGAR -->
          <div v-else class="productos-disponibles">
            <div class="productos-grid">
              <div
                v-for="producto in productosDisponiblesParaAgregar"
                :key="producto.id"
                class="producto-item available"
                :class="{ 'sin-stock': !puedeAgregarProducto(producto) }"
              >
                <div class="producto-info">
                  <span class="producto-nombre">{{ producto.nombre }}</span>
                  <span class="producto-categoria">{{ producto.categoria?.nombre || 'Sin categoría' }}</span>
                  <span class="producto-precio">{{ formatCurrency(producto.precio_unitario) }}</span>
                </div>
                
                <!-- ✅ STOCK SIMPLIFICADO PARA PRODUCTOS DISPONIBLES -->
                <div class="producto-stock">
                  <span class="stock-badge" :class="getStockClass(producto.stock_actual)">
                    Stock: {{ producto.stock_actual || 0 }}
                  </span>
                </div>
                
                <!-- ✅ BOTÓN PARA AGREGAR -->
                <div class="producto-action">
                  <button
                    type="button"
                    class="btn-add-product"
                    :disabled="!puedeAgregarProducto(producto)"
                    @click="agregarProducto(producto)"
                    :title="!puedeAgregarProducto(producto) ? 'Sin stock disponible' : 'Agregar al ramo'"
                  >
                    <span v-if="!puedeAgregarProducto(producto)">✗</span>
                    <span v-else>+</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="productosDisponiblesParaAgregar.length === 0" class="no-productos">
              <div class="no-productos-icon">📦</div>
              <p>{{ productosFiltrados.length === 0 ? 'No se encontraron productos' : 'Todos los productos disponibles ya están en el ramo' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ✅ MENSAJE PARA RAMOS VACÍOS (solo para nuevos ramos) -->
      <div v-if="!isEditing && formData.componentes.length === 0" class="no-componentes">
        <div class="no-componentes-icon">📦</div>
        <p>No hay productos agregados al ramo</p>
        <p class="help-text">Selecciona productos de la lista superior para agregarlos</p>
      </div>
      
      <!-- ✅ VALIDACIÓN DE COMPONENTES -->
      <div v-if="errors.componentes" class="error-message">
        {{ errors.componentes }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { useRamoProductos } from '@/composables/useRamoProductos'

export default {
  name: 'RamoForm',
  props: {
    ramo: {
      type: Object,
      default: () => ({})
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'validation-change'],
  
  setup(props, { emit }) {
    const store = useStore()
    
    // ✅ USAR COMPOSABLE PARA PRODUCTOS (solo lectura)
    const {
      productos,
      categorias,
      loadingProductos,
      errorProductos,
      filtroProductos,
      productosFiltrados,
      cargarProductos,
      aplicarFiltroProductos,
      limpiarFiltroProductos,
      buscarProductoPorId,
      inicializar
    } = useRamoProductos()

    // ✅ FORMULARIO SIMPLE - SIN WATCHERS COMPLEJOS
    const formData = ref({
      nombre: '',
      descripcion: '',
      imagen_url: '',
      precio_venta: 0,
      costo_estimado: 0,
      personalizado: false,
      activo: true,
      stock_actual: 0,
      valor_rebaja: false,
      componentes: [] // Array simple: [{producto_id, cantidad}]
    })

    // ✅ ERRORES SIMPLES
    const errors = ref({})
    
    // ✅ ESTADO DE INICIALIZACIÓN
    const inicializado = ref(false)

    // ✅ COMPUTED: Productos disponibles para agregar (excluyendo los ya agregados)
    const productosDisponiblesParaAgregar = computed(() => {
      if (!productosFiltrados.value) return []
      
      return productosFiltrados.value.filter(producto => {
        return !estaProductoAgregado(producto.id)
      })
    })

    // ✅ INICIALIZAR CON MEJOR MANEJO DE TIMING
    const inicializarFormulario = () => {
      console.log('🔧 Inicializando formulario...', { isEditing: props.isEditing, ramo: props.ramo })
      
      if (props.isEditing && props.ramo) {
        console.log('📝 Datos del ramo a editar:', props.ramo)
        console.log('🧩 Componentes del ramo:', props.ramo.componentes)
        
        // ✅ MAPEAR COMPONENTES CON VALIDACIÓN MEJORADA PARA API RESPONSE
        const componentesValidos = []
        if (props.ramo.componentes && Array.isArray(props.ramo.componentes)) {
          props.ramo.componentes.forEach((comp, index) => {
            console.log(`🔍 Procesando componente ${index + 1}:`, comp)
            
            // ✅ MANEJAR ESTRUCTURA DE API: comp.producto.id
            let productoId = null
            let cantidad = parseInt(comp.cantidad) || parseInt(comp.qty) || 1
            
            if (comp.producto && comp.producto.id) {
              // Estructura de API: { producto: { id: "...", nombre: "..." }, cantidad: 8 }
              productoId = comp.producto.id
              console.log(`📦 Estructura API detectada - ID del producto: ${productoId}`)
            } else if (comp.producto_id) {
              // Estructura directa: { producto_id: "...", cantidad: 8 }
              productoId = comp.producto_id
              console.log(`📦 Estructura directa detectada - ID del producto: ${productoId}`)
            } else if (comp.id_producto) {
              // Estructura alternativa: { id_producto: "...", cantidad: 8 }
              productoId = comp.id_producto
              console.log(`📦 Estructura alternativa detectada - ID del producto: ${productoId}`)
            }
            
            if (productoId) {
              const producto = buscarProductoPorId(productoId)
              if (producto) {
                componentesValidos.push({
                  producto_id: productoId,
                  cantidad: cantidad
                })
                console.log(`✅ Componente válido agregado:`, { 
                  productoId, 
                  cantidad, 
                  nombreProducto: producto.nombre,
                  estructuraOriginal: comp.producto ? 'API' : 'Directa'
                })
              } else {
                console.warn(`⚠️ Producto no encontrado en store para ID: ${productoId}`)
                // ✅ AGREGAR INFORMACIÓN ADICIONAL PARA DEBUG
                console.warn(`📊 Productos disponibles en store:`, productos.value.map(p => ({ id: p.id, nombre: p.nombre })))
              }
            } else {
              console.warn(`⚠️ Componente sin producto_id válido en ninguna estructura:`, comp)
            }
          })
        }
        
        // ✅ ASIGNAR DATOS CON COMPONENTES VALIDADOS
        Object.assign(formData.value, {
          nombre: props.ramo.nombre || '',
          descripcion: props.ramo.descripcion || '',
          imagen_url: props.ramo.imagen_url || '',
          precio_venta: props.ramo.precio_venta || 0,
          costo_estimado: props.ramo.costo_estimado || 0,
          personalizado: props.ramo.personalizado || false,
          activo: props.ramo.activo !== false,
          stock_actual: props.ramo.stock_actual || 0,
          valor_rebaja: props.ramo.valor_rebaja || false,
          componentes: componentesValidos
        })
        
        console.log('✅ Formulario inicializado con:', formData.value)
        console.log(`📊 ${componentesValidos.length} componentes válidos cargados`)
      } else {
        console.log('🆕 Inicializando formulario para nuevo ramo')
      }
      
      inicializado.value = true
    }

    // ✅ MÉTODO AUXILIAR PARA RE-MAPEAR COMPONENTES DESDE DATOS DEL API
    const remapearComponentesDesdeAPI = (componentesAPI) => {
      if (!componentesAPI || !Array.isArray(componentesAPI)) {
        return []
      }
      
      const componentesValidos = []
      
      componentesAPI.forEach((comp, index) => {
        console.log(`🔄 Re-mapeando componente ${index + 1}:`, comp)
        
        let productoId = null
        let cantidad = parseInt(comp.cantidad) || 1
        
        // Manejar estructura de API response
        if (comp.producto && comp.producto.id) {
          productoId = comp.producto.id
        } else if (comp.producto_id) {
          productoId = comp.producto_id
        } else if (comp.id_producto) {
          productoId = comp.id_producto
        }
        
        if (productoId) {
          const producto = buscarProductoPorId(productoId)
          if (producto) {
            componentesValidos.push({
              producto_id: productoId,
              cantidad: cantidad
            })
            console.log(`✅ Componente re-mapeado:`, { 
              productoId, 
              cantidad, 
              nombreProducto: producto.nombre 
            })
          } else {
            console.warn(`⚠️ Producto ${productoId} no encontrado en re-mapeo`)
          }
        }
      })
      
      return componentesValidos
    }

    // ✅ WATCH PARA RE-INICIALIZAR SI CAMBIAN LOS PROPS Y YA TENEMOS PRODUCTOS
    watch([() => props.ramo, productos], ([newRamo, newProductos]) => {
      if (props.isEditing && newRamo && newProductos.length > 0 && !inicializado.value) {
        console.log('🔄 Re-inicializando formulario por cambio en props/productos')
        
        // Si tenemos componentes del API pero no productos anteriormente, re-mapear
        if (newRamo.componentes && newRamo.componentes.length > 0) {
          const componentesRemapeados = remapearComponentesDesdeAPI(newRamo.componentes)
          if (componentesRemapeados.length > 0) {
            console.log(`🔄 ${componentesRemapeados.length} componentes re-mapeados exitosamente`)
            formData.value.componentes = componentesRemapeados
          }
        }
        
        inicializarFormulario()
        nextTick(() => validarFormulario())
      }
    }, { deep: true })

    // ✅ FUNCIONES DE STOCK (sin cambios)
    const getCantidadUsadaEnRamo = (productoId) => {
      const componente = formData.value.componentes.find(comp => comp.producto_id === productoId)
      return componente ? componente.cantidad || 0 : 0
    }

    const getStockDisponible = (producto) => {
      const stockOriginal = parseInt(producto.stock_actual) || 0
      const cantidadUsada = getCantidadUsadaEnRamo(producto.id)
      return Math.max(0, stockOriginal - cantidadUsada)
    }

    const getStockInfo = (producto) => {
      const stockOriginal = parseInt(producto.stock_actual) || 0
      const cantidadUsada = getCantidadUsadaEnRamo(producto.id)
      const stockDisponible = Math.max(0, stockOriginal - cantidadUsada)
      
      return {
        original: stockOriginal,
        usado: cantidadUsada,
        disponible: stockDisponible
      }
    }

    const puedeAgregarProducto = (producto) => {
      if (estaProductoAgregado(producto.id)) return false
      return getStockDisponible(producto) > 0
    }

    const getMaxCantidadPermitida = (productoId) => {
      const producto = buscarProductoPorId(productoId)
      if (!producto) return 0
      return getStockDisponible(producto)
    }

    // ✅ VALIDACIÓN CON MEJOR MANEJO DE STOCK
    const validarFormulario = () => {
      const nuevosErrores = {}
      
      if (!formData.value.nombre?.trim()) {
        nuevosErrores.nombre = 'El nombre es requerido'
      }
      
      if (formData.value.componentes.length === 0) {
        nuevosErrores.componentes = 'Debe agregar al menos un producto'
      }
      
      // ✅ VALIDAR CANTIDADES Y STOCK CON MEJOR MANEJO
      formData.value.componentes.forEach((comp, index) => {
        const producto = buscarProductoPorId(comp.producto_id)
        if (!producto) {
          nuevosErrores[`componente_${index}_cantidad`] = 'Producto no encontrado'
          return
        }
        
        const stockOriginal = parseInt(producto.stock_actual) || 0
        const cantidad = parseInt(comp.cantidad) || 0
        
        if (!cantidad || cantidad < 1) {
          nuevosErrores[`componente_${index}_cantidad`] = 'Cantidad mínima: 1'
        } else if (cantidad > stockOriginal) {
          nuevosErrores[`componente_${index}_cantidad`] = `Stock insuficiente. Máximo: ${stockOriginal}`
        }
      })
      
      errors.value = nuevosErrores
      const esValido = Object.keys(nuevosErrores).length === 0
      
      emit('validation-change', esValido)
      return esValido
    }

    // ✅ FUNCIONES SIMPLES PARA PRODUCTOS (sin cambios significativos)
    const estaProductoAgregado = (productoId) => {
      return formData.value.componentes.some(comp => comp.producto_id === productoId)
    }

    const agregarProducto = (producto) => {
      if (estaProductoAgregado(producto.id)) {
        console.warn('Producto ya agregado')
        return
      }
      
      if (!puedeAgregarProducto(producto)) {
        console.warn('Sin stock disponible')
        return
      }
      
      formData.value.componentes.push({
        producto_id: producto.id,
        cantidad: 1
      })
      
      console.log('➕ Producto agregado:', { id: producto.id, nombre: producto.nombre })
      validarFormulario()
    }

    const eliminarComponente = (index) => {
      const componente = formData.value.componentes[index]
      console.log('🗑️ Eliminando componente:', componente)
      formData.value.componentes.splice(index, 1)
      validarFormulario()
    }

    const ajustarCantidad = (index, nuevaCantidad) => {
      const componente = formData.value.componentes[index]
      const producto = buscarProductoPorId(componente.producto_id)
      const stockOriginal = parseInt(producto?.stock_actual) || 0
      
      // ✅ VALIDAR LÍMITES
      const cantidadFinal = Math.max(1, Math.min(nuevaCantidad, stockOriginal))
      componente.cantidad = cantidadFinal
      
      console.log('📊 Cantidad ajustada:', { index, nuevaCantidad: cantidadFinal, stockOriginal })
      validarFormulario()
    }

    const obtenerNombreProducto = (productoId) => {
      const producto = buscarProductoPorId(productoId)
      const nombre = producto?.nombre || 'Producto no encontrado'
      if (!producto) {
        console.warn(`⚠️ Producto no encontrado para ID: ${productoId}`)
      }
      return nombre
    }

    const obtenerCategoriaProducto = (productoId) => {
      const producto = buscarProductoPorId(productoId)
      return producto?.categoria?.nombre || 'Sin categoría'
    }

    // ✅ CÁLCULOS SIMPLES - SIN SIDE EFFECTS (sin cambios)
    const calcularSubtotalComponente = (componente) => {
      const producto = buscarProductoPorId(componente.producto_id)
      if (!producto) return 0
      return (producto.precio_unitario || 0) * (componente.cantidad || 0)
    }

    const calcularTotalUnidades = () => {
      return formData.value.componentes.reduce((total, comp) => total + (comp.cantidad || 0), 0)
    }

    const calcularCostoTotal = () => {
      return formData.value.componentes.reduce((total, comp) => {
        return total + calcularSubtotalComponente(comp)
      }, 0)
    }

    // ✅ FUNCIÓN PARA ENVIAR AL BACKEND (sin cambios)
    const prepararDatosParaEnvio = () => {
      return {
        nombre: formData.value.nombre.trim(),
        descripcion: formData.value.descripcion?.trim() || undefined,
        imagen_url: formData.value.imagen_url?.trim() || undefined,
        precio_venta: parseFloat(formData.value.precio_venta) || undefined,
        costo_estimado: parseFloat(formData.value.costo_estimado) || undefined,
        personalizado: Boolean(formData.value.personalizado),
        usuario_id: store.state.auth?.usuario?.id,
        activo: Boolean(formData.value.activo),
        stock_actual: parseInt(formData.value.stock_actual) || undefined,
        valor_rebaja: Boolean(formData.value.valor_rebaja),
        componentes: formData.value.componentes.map(comp => ({
          producto_id: comp.producto_id,
          cantidad: parseInt(comp.cantidad)
        }))
      }
    }

    // ✅ SUBMIT SIMPLE (sin cambios)
    const submitFormulario = () => {
      if (!validarFormulario()) return
      
      const datosParaEnvio = prepararDatosParaEnvio()
      emit('submit', datosParaEnvio)
    }

    // ✅ FUNCIONES DE UTILIDAD (sin cambios)
    const formatCurrency = (value) => {
      const numero = parseFloat(value) || 0
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero)
    }

    const getStockClass = (stockInfo) => {
      if (typeof stockInfo === 'number') {
        // Compatibilidad con llamada original
        const stockNum = parseInt(stockInfo) || 0
        if (stockNum <= 0) return 'out-of-stock'
        if (stockNum <= 10) return 'low-stock'
        return 'in-stock'
      }
      
      // Nueva lógica con info de stock
      const disponible = stockInfo.disponible || 0
      if (disponible <= 0) return 'out-of-stock'
      if (disponible <= 3) return 'low-stock'
      return 'in-stock'
    }

    // ✅ FUNCIÓN VACÍA PARA COMPATIBILIDAD
    const calcularCostoEstimado = () => {
      // No hace nada - solo compatibilidad con template
    }

    // ✅ INICIALIZACIÓN MEJORADA CON MEJOR TIMING Y DEBUGGING
    onMounted(async () => {
      console.log('🚀 RamoForm montado')
      console.log('📋 Props recibidos:', { 
        isEditing: props.isEditing, 
        ramoId: props.ramo?.id,
        ramoNombre: props.ramo?.nombre,
        componentesCount: props.ramo?.componentes?.length || 0
      })
      
      // ✅ DEBUG: Mostrar estructura completa del ramo si estamos editando
      if (props.isEditing && props.ramo) {
        console.log('🔍 Estructura completa del ramo para edición:')
        console.log('   - ID:', props.ramo.id)
        console.log('   - Nombre:', props.ramo.nombre)
        console.log('   - Precio:', props.ramo.precio_venta)
        console.log('   - Componentes:', props.ramo.componentes)
        
        if (props.ramo.componentes && props.ramo.componentes.length > 0) {
          console.log('🧩 Detalle de componentes:')
          props.ramo.componentes.forEach((comp, index) => {
            console.log(`   ${index + 1}. Cantidad: ${comp.cantidad}`)
            if (comp.producto) {
              console.log(`      - Producto: ${comp.producto.nombre} (ID: ${comp.producto.id})`)
              console.log(`      - Precio: ${comp.producto.precio_unitario}`)
              console.log(`      - Categoría: ${comp.producto.categoria?.nombre}`)
            } else {
              console.log(`      - Producto ID directo: ${comp.producto_id || comp.id_producto || 'No encontrado'}`)
            }
          })
        }
      }
      
      try {
        // 1. PRIMERO: Cargar productos
        console.log('📦 Cargando productos...')
        await inicializar()
        console.log('✅ Productos cargados:', productos.value.length)
        
        // 2. DESPUÉS: Inicializar formulario si tenemos productos
        if (productos.value.length > 0) {
          console.log('🔧 Inicializando formulario con productos disponibles')
          inicializarFormulario()
          await nextTick()
          validarFormulario()
        } else {
          console.warn('⚠️ No se cargaron productos, el formulario se inicializará cuando estén disponibles')
        }
        
      } catch (error) {
        console.error('❌ Error al inicializar RamoForm:', error)
      }
    })

    return {
      // Estados simples
      formData,
      errors,
      inicializado,
      
      // Productos (readonly)
      productos,
      categorias,
      loadingProductos,
      errorProductos,
      filtroProductos,
      productosFiltrados,
      productosDisponiblesParaAgregar,
      
      // ✅ FUNCIONES DE STOCK
      getCantidadUsadaEnRamo,
      getStockDisponible,
      getStockInfo,
      puedeAgregarProducto,
      getMaxCantidadPermitida,
      
      // Métodos simples
      validarFormulario,
      cargarProductos,
      aplicarFiltroProductos,
      limpiarFiltroProductos,
      estaProductoAgregado,
      agregarProducto,
      eliminarComponente,
      ajustarCantidad,
      obtenerNombreProducto,
      obtenerCategoriaProducto,
      calcularSubtotalComponente,
      calcularTotalUnidades,
      calcularCostoTotal,
      calcularCostoEstimado, // Para compatibilidad
      submitFormulario,
      formatCurrency,
      getStockClass
    }
  }
}
</script>

<style scoped>
.ramo-form {
  padding: 20px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 8px;
}

/* ✅ NUEVOS ESTILOS PARA SUBSECCIONES */
.subsection-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0 15px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  padding: 10px;
  background-color: #e3f2fd;
  border-radius: 6px;
  border-left: 4px solid #2196f3;
}

.title-icon {
  font-size: 1.1rem;
}

.productos-en-ramo {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f0f8f0;
  border-radius: 8px;
  border: 1px solid #c8e6c9;
}

.agregar-productos-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f3f4f6;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.component-count {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #495057;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #42b983;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}

/* ✅ INPUT CON BOTÓN AUTO-CALC MEJORADO */
.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-with-button .form-input {
  flex: 1;
}

.btn-auto-calc {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #6c757d;
  background-color: #f8f9fa;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.btn-auto-calc:hover {
  background-color: #e9ecef;
  border-color: #5a6268;
  color: #42b983;
}

/* ✅ SELECTOR DE PRODUCTOS SIN SCROLL LIMITADO */
.product-selector {
  margin-bottom: 30px;
}

.selector-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.loading-productos,
.error-productos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ✅ PRODUCTOS DISPONIBLES SIN RESTRICCIÓN DE ALTURA */
.productos-disponibles {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background-color: white;
  /* ✅ SIN max-height ni overflow-y para evitar doble scroll */
}

.productos-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* ✅ PRODUCTO ITEM MEJORADO CON MEJOR DISTINCIÓN */
.producto-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s;
  align-items: center;
}

.producto-item:hover {
  background-color: #f8f9fa;
}

/* ✅ ESTILOS DIFERENCIADOS PARA PRODUCTOS ACTUALES VS DISPONIBLES */
.producto-item.available {
  background-color: white;
  border-left: 4px solid #e3f2fd;
}

.producto-item.available:hover {
  background-color: #f8faff;
  border-left-color: #2196f3;
}

.producto-item.sin-stock {
  background-color: #fef2f2;
  opacity: 0.8;
  border-left-color: #fca5a5;
}

.producto-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.producto-nombre {
  font-weight: 500;
  color: #495057;
}

.producto-categoria {
  font-size: 0.8rem;
  color: #6c757d;
}

.producto-precio {
  font-size: 0.9rem;
  color: #42b983;
  font-weight: 500;
}

/* ✅ STOCK INFO SIMPLIFICADO PARA PRODUCTOS DISPONIBLES */
.producto-stock {
  display: flex;
  align-items: center;
  min-width: 120px;
}

.stock-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.stock-badge.in-stock {
  background-color: #d1fae5;
  color: #065f46;
}

.stock-badge.low-stock {
  background-color: #fef3c7;
  color: #92400e;
}

.stock-badge.out-of-stock {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* ✅ BOTÓN AGREGAR MEJORADO */
.producto-action {
  display: flex;
  justify-content: center;
}

.btn-add-product {
  width: 32px;
  height: 32px;
  border: 2px solid #42b983;
  background-color: white;
  color: #42b983;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-add-product:hover:not(:disabled) {
  background-color: #42b983;
  color: white;
  transform: scale(1.05);
}

.btn-add-product:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: #6c757d;
  color: #6c757d;
}

.btn-add-product:disabled:hover {
  transform: none;
}

.no-productos {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.no-productos-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

/* ✅ COMPONENTES ACTUALES MEJORADOS */
.componentes-list {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background-color: white;
  overflow: hidden;
}

.componentes-list.current-productos {
  border-color: #c8e6c9;
}

.componente-item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f1f3f4;
  align-items: center;
}

.componente-item.current {
  background-color: #f0f8f0;
  border-left: 4px solid #4caf50;
}

.componente-item:last-child {
  border-bottom: none;
}

.componente-item.error {
  background-color: #fef2f2;
  border-left: 4px solid #dc3545;
}

.componente-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.componente-nombre {
  font-weight: 500;
  color: #495057;
}

.componente-categoria {
  font-size: 0.8rem;
  color: #6c757d;
}

/* ✅ CONTROLES DE CANTIDAD MEJORADOS */
.componente-cantidad {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  min-width: 120px;
}

.componente-cantidad label {
  font-size: 0.8rem;
  color: #6c757d;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-cantidad {
  width: 24px;
  height: 24px;
  border: 1px solid #ced4da;
  background-color: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.btn-cantidad:hover:not(:disabled) {
  background-color: #42b983;
  border-color: #42b983;
  color: white;
}

.btn-cantidad:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cantidad-input {
  width: 50px;
  padding: 4px 6px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}

.cantidad-input.error {
  border-color: #dc3545;
}

.cantidad-info {
  font-size: 0.7rem;
  color: #6c757d;
  text-align: center;
}

.max-disponible {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 2px 6px;
  border-radius: 8px;
}

.componente-subtotal {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.subtotal-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.subtotal-value {
  font-weight: 500;
  color: #42b983;
}

.componente-acciones {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove {
  background-color: #fee2e2;
  color: #b91c1c;
}

.btn-remove:hover {
  background-color: #fecaca;
  color: #991b1b;
}

/* Resumen del ramo */
.ramo-resumen {
  margin-top: 20px;
  padding: 16px;
  background-color: #e8f5e8;
  border-radius: 6px;
  border: 1px solid #c8e6c9;
}

.resumen-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.resumen-row.total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2e7d32;
  border-top: 1px solid #a5d6a7;
  padding-top: 8px;
  margin-top: 12px;
}

.valor {
  font-weight: 500;
}

/* ✅ ESTADO VACÍO MEJORADO */
.no-componentes {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
  margin: 20px 0;
}

.help-text {
  font-size: 0.9rem;
  margin-top: 8px;
}

/* Botones auxiliares */
.btn-secondary.small {
  padding: 6px 12px;
  font-size: 0.8rem;
  background-color: #6c757d;
  color: white;
  border: 1px solid #6c757d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary.small:hover:not(:disabled) {
  background-color: #5a6268;
  border-color: #5a6268;
}

.btn-secondary.small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-link {
  background: none;
  border: none;
  color: #42b983;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-link:hover {
  color: #3aa876;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .selector-filters {
    flex-direction: column;
  }
  
  .producto-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .componente-item {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .componente-cantidad,
  .componente-subtotal {
    align-items: flex-start;
  }
  
  .cantidad-controls {
    align-self: center;
  }
}

/* ✅ ANIMACIONES SUAVES */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.componente-item {
  animation: fadeIn 0.3s ease-out;
}

/* ✅ TOOLTIPS MEJORADOS */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}
</style>

<!-- ✅ CSS GLOBAL PARA FIX DE SCROLL EN MODALES -->
<style>
/* Modal principal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* ✅ CLAVE: Sin overflow en container */
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto; /* ✅ ÚNICO SCROLL PERMITIDO */
  padding: 20px;
  min-height: 0;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

/* ✅ ELIMINAR SCROLLS INTERNOS EN MODALES */
.modal-body .ramo-detalle,
.modal-body .componentes-seccion,
.modal-body .componentes-table-container,
.modal-body .productos-disponibles {
  max-height: none !important;
  overflow: visible !important;
}

/* ✅ TABLA STICKY HEADER EN MODALES */
.modal-body .componentes-table thead th {
  position: sticky;
  top: 0;
  background-color: #f8fafc;
  z-index: 5;
  border-bottom: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

/* ✅ SCROLL SUAVE PARA EL MODAL */
.modal-body {
  scroll-behavior: smooth;
}

/* ✅ INDICADOR VISUAL DE SCROLL */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ✅ OVERRIDE ESPECÍFICO PARA ELEMENTOS PROBLEMÁTICOS */
.modal-container .table-container,
.modal-container .scroll-container,
.modal-container .content-scroll,
.modal-container .productos-grid,
.modal-container .componentes-list {
  max-height: none !important;
  overflow: visible !important;
}

/* ✅ RESPONSIVE PARA MODALES */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-body {
    padding: 15px;
  }
  
  .modal-header,
  .modal-footer {
    padding: 15px;
  }
}
</style>