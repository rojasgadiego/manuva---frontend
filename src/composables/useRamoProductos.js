// composables/useRamoProductos.js
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export function useRamoProductos() {
  const store = useStore()
  
  // Estados
  const loadingProductos = ref(false)
  const errorProductos = ref(null)
  
  // Filtros para productos
  const filtroProductos = ref({
    busqueda: '',
    categoriaId: '',
    soloActivos: true
  })

  // ✅ OBTENER PRODUCTOS DIRECTAMENTE DEL STORE (MISMA LÓGICA QUE EL COMPONENTE PRINCIPAL)
  const productos = computed(() => store.state.productos?.productos || [])
  
  const categorias = computed(() => {
    // Extraer categorías de los productos (misma lógica que el componente principal)
    const categoriasMap = new Map()
    productos.value.forEach(producto => {
      if (producto.categoria && !categoriasMap.has(producto.categoria.id)) {
        categoriasMap.set(producto.categoria.id, producto.categoria)
      }
    })
    return Array.from(categoriasMap.values())
  })

  // ✅ CARGAR PRODUCTOS USANDO LA MISMA LÓGICA QUE EL COMPONENTE PRINCIPAL
  const cargarProductos = async () => {
    loadingProductos.value = true
    errorProductos.value = null
    
    try {
      // ✅ USAR EXACTAMENTE LA MISMA LÓGICA QUE GestionCatalogoView.vue
      const apiFilters = {
        categoriaId: filtroProductos.value.categoriaId || '',
        activo: filtroProductos.value.soloActivos ? true : undefined,
        busqueda: filtroProductos.value.busqueda || ''
      }
      
      // Usar la acción que usa el componente principal
      await store.dispatch('productos/cargarProductos', apiFilters)
      
    } catch (error) {
      console.error('Error al cargar productos para ramos:', error)
      errorProductos.value = 'Error al cargar productos'
    } finally {
      loadingProductos.value = false
    }
  }

  // ✅ PRODUCTOS FILTRADOS PARA EL SELECTOR
  const productosFiltrados = computed(() => {
    let resultado = [...productos.value]
    
    // Filtro de búsqueda
    if (filtroProductos.value.busqueda) {
      const termino = filtroProductos.value.busqueda.toLowerCase()
      resultado = resultado.filter(producto => 
        producto.nombre.toLowerCase().includes(termino) ||
        (producto.categoria?.nombre && producto.categoria.nombre.toLowerCase().includes(termino))
      )
    }
    
    // Filtro de categoría
    if (filtroProductos.value.categoriaId) {
      resultado = resultado.filter(producto => 
        producto.categoria_id === filtroProductos.value.categoriaId
      )
    }
    
    // Solo productos activos
    if (filtroProductos.value.soloActivos) {
      resultado = resultado.filter(producto => producto.activo !== false)
    }
    
    return resultado
  })

  // ✅ BUSCAR PRODUCTO POR ID
  const buscarProductoPorId = (id) => {
    return productos.value.find(p => p.id === id) || null
  }

  // ✅ APLICAR FILTROS DE PRODUCTOS
  const aplicarFiltroProductos = async () => {
    await cargarProductos()
  }

  // ✅ LIMPIAR FILTROS
  const limpiarFiltroProductos = async () => {
    filtroProductos.value = {
      busqueda: '',
      categoriaId: '',
      soloActivos: true
    }
    await cargarProductos()
  }

  // ✅ INICIALIZACIÓN
  const inicializar = async () => {
    await cargarProductos()
  }

  return {
    // Estados
    productos,
    categorias,
    loadingProductos: computed(() => loadingProductos.value),
    errorProductos: computed(() => errorProductos.value),
    
    // Filtros
    filtroProductos,
    productosFiltrados,
    
    // Métodos
    cargarProductos,
    buscarProductoPorId,
    aplicarFiltroProductos,
    limpiarFiltroProductos,
    inicializar
  }
}