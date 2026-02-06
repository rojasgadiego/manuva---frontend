import { computed } from 'vue'

export function useStatsSections({
  valorInventario,
}) {
  
  const estadisticasParaComponente = computed(() => {
    try {
      
      return [
        {
          // ✅ CORREGIDO: Mostrar tasa de merma real
          titulo: 'Tasa de Mermas',
          valor: stats.tasaMerma?.porcentaje || 0,
          className: 'mermas',
          tendencia: stats.tendenciaTasaMerma || { valor: '0.0', tipo: 'positive', icono: '↑' },
          tooltip: `Porcentaje: ${stats.tasaMerma?.porcentaje || 0}% | Valor perdido: $${stats.tasaMerma?.valorPerdido || 0}`,
          descripcion: 'Productos perdidos por deterioro',
          unidad: '%'
        },
        {
          // ✅ CORREGIDO: Mostrar lotes próximos a vencer reales
          titulo: 'Lotes Próximos a Vencer',
          valor: stats.proximosVencer?.cantidad || 0,
          className: 'salidas vencimiento',
          tendencia: stats.tendenciaProximosVencer || { valor: '0.0', tipo: 'positive', icono: '↑' },
          tooltip: `Productos: ${stats.proximosVencer?.cantidad || 0} | Valor expuesto: $${stats.proximosVencer?.valorExpuesto || 0}`,
          descripcion: 'Productos que vencen pronto',
          unidad: 'productos'
        },
        {
          // ✅ CORREGIDO: Mostrar stock crítico real
          titulo: 'Productos con Stock Crítico',
          valor: stats.stockCritico?.cantidad || 0,
          className: 'critico',
          tendencia: stats.tendenciaStockCritico || { valor: '0.0', tipo: 'positive', icono: '↑' },
          tooltip: `Productos críticos: ${stats.stockCritico?.cantidad || 0} | Valor en riesgo: $${stats.stockCritico?.valorRiesgo || 0}`,
          descripcion: 'Productos con stock bajo',
          unidad: 'productos'
        },
        {
          // ✅ CORREGIDO: Usar valor de inventario correcto
          titulo: 'Valor Total del Inventario',
          valor: stats.valorInventario || valorInventario.value || 0,
          className: 'inventario',
          esDinero: true,
          tendencia: stats.tendenciaValor || { valor: '0.0', tipo: 'positive', icono: '↑' },
          tooltip: `Valor total: $${stats.valorInventario || valorInventario.value || 0} | Total productos: ${stats.cantidadProductos || 0}`,
          descripción: 'Valor total en inventario',
          unidad: 'CLP'
        },
      ]
    } catch (error) {
      console.error('Error al preparar estadísticas para componente:', error)
      return []
    }
  })
  
  return {
    estadisticasParaComponente
  }
}