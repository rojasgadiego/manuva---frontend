import { computed } from 'vue'
import { useStore } from 'vuex'

export function useInventoryData(periodoSeleccionado, handleError) {
  const store = useStore()
  
  // Estados de carga
  const cargandoEstadisticas = computed(() => store.getters['inventario/cargandoEstadisticas'])
  
  // Computed properties básicos
  const esAdministrador = computed(() => {
    try {
      // Primero intentar desde inventario, luego desde auth
      return store.getters['inventario/esAdministrador'] || 
             (Array.isArray(store.getters['auth/userRoles']) && 
              store.getters['auth/userRoles'].includes('admin'))
    } catch (error) {
      console.warn('Error al verificar rol de administrador:', error)
      return false
    }
  })
  
  // ✅ DATOS DESDE EL MÓDULO DE INVENTARIO (no productos)
  const valorInventario = computed(() => {
    try {
      return store.getters['inventario/valorInventario'] || 0
    } catch (error) {
      console.warn('Error al obtener valor de inventario:', error)
      return 0
    }
  })
  
  // ✅ ESTADÍSTICAS DESDE EL MÓDULO DE INVENTARIO (no movimientos)
  const estadisticasMovimientos = computed(() => {
    try {
      const stats = store.getters['inventario/estadisticas']
      
      if (!stats) {
        return getDefaultStats()
      }
      
      return {
        // Mapear las estadísticas de inventario a la estructura esperada
        valorInventario: stats.valor_inventario || 0,
        stockCritico: {
          cantidad: stats.stock_critico?.cantidad || 0,
          valorRiesgo: stats.stock_critico?.valor_riesgo || 0
        },
        proximosVencer: {
          cantidad: stats.proximos_vencer?.cantidad || 0,
          valorExpuesto: stats.proximos_vencer?.valor_expuesto || 0
        },
        tasaMerma: {
          porcentaje: stats.tasa_merma?.porcentaje || 0,
          valorPerdido: stats.tasa_merma?.valor_perdido || 0
        },
        cantidadProductos: stats.cantidad_productos || 0,
        cantidadRamos: stats.cantidad_ramos || 0,
        periodo: stats.periodo || {},
        
        // Tendencias por defecto (hasta que se implementen reales)
        tendenciaValor: { valor: '0.0', tipo: 'positive', icono: '↑' },
        tendenciaStockCritico: { valor: '0.0', tipo: 'positive', icono: '↑' },
        tendenciaProximosVencer: { valor: '0.0', tipo: 'positive', icono: '↑' },
        tendenciaTasaMerma: { valor: '0.0', tipo: 'positive', icono: '↑' }
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de inventario:', error)
      return getDefaultStats()
    }
  })
  
  // Funciones auxiliares
  const getDefaultStats = () => ({
    valorInventario: 0,
    stockCritico: { cantidad: 0, valorRiesgo: 0 },
    proximosVencer: { cantidad: 0, valorExpuesto: 0 },
    tasaMerma: { porcentaje: 0, valorPerdido: 0 },
    cantidadProductos: 0,
    cantidadRamos: 0,
    periodo: {},
    tendenciaValor: { valor: '0.0', tipo: 'positive', icono: '↑' },
    tendenciaStockCritico: { valor: '0.0', tipo: 'positive', icono: '↑' },
    tendenciaProximosVencer: { valor: '0.0', tipo: 'positive', icono: '↑' },
    tendenciaTasaMerma: { valor: '0.0', tipo: 'positive', icono: '↑' }
  })
  
  // Gestión de datos
  const cargarDatos = async () => {
    try {
      if (esAdministrador.value) {
        // ✅ LLAMAR AL MÓDULO DE INVENTARIO, NO MOVIMIENTOS
        await store.dispatch('inventario/obtenerEstadisticas')
      }
    } catch (error) {
      handleError(error, 'Error al cargar datos')
    } 
  }
  
  const cambiarPeriodo = async (periodo) => {
    // Comparar con el store, no con el ref local
    const periodoActualStore = store.getters['inventario/periodoActivo']
    
    if (periodo === periodoActualStore) {
      console.log(`📅 Período ${periodo} ya está activo en el store, no se realiza cambio`)
      return
    }
    
    console.log(`📅 Composable: Cambiando período de ${periodoActualStore} a ${periodo}`)
    
    try {
      // Llamar al store PRIMERO
      await store.dispatch('inventario/cambiarPeriodo', periodo)
      
      // Sincronizar el ref local con el store DESPUÉS
      periodoSeleccionado.value = store.getters['inventario/periodoActivo']
      
      console.log(`✅ Composable: Período cambiado exitosamente a ${periodo}`)
      console.log(`📊 Estado sincronizado:`, {
        refLocal: periodoSeleccionado.value,
        store: store.getters['inventario/periodoActivo'],
        cargando: store.getters['inventario/cargandoEstadisticas']
      })
      
    } catch (error) {
      console.error(`❌ Error al cambiar período a ${periodo}:`, error)
      handleError(error, 'Error al cambiar período')
      // Sincronizar con el store en caso de error
      periodoSeleccionado.value = store.getters['inventario/periodoActivo']
    }
  }
  
  const forzarActualizacion = async () => {
    try {
      // ✅ USAR EL MÓDULO DE INVENTARIO
      await store.dispatch('inventario/obtenerEstadisticas')
    } catch (error) {
      handleError(error, 'Error en actualización forzada')
    }
  }
  
  return {
    // Estados de carga
    cargandoEstadisticas,
    
    // Computed
    esAdministrador,
    valorInventario,
    estadisticasMovimientos,
    
    // Métodos
    cargarDatos,
    cambiarPeriodo,
    forzarActualizacion
  }
}
