// composables/Inventario/useAccessCards.js - ACTUALIZADO
import { computed } from 'vue'

export function useAccessCards({
  esAdministrador,
  store
}) {
  
  const estadisticasInventario = computed(() => 
    store.getters['inventario/estadisticas'] || {}
  )
  
  const totalProductos = computed(() => 
    estadisticasInventario.value.cantidad_productos || 0
  )
  
  const totalRamos = computed(() => 
    estadisticasInventario.value.cantidad_ramos || 0
  )

  const tarjetasAcceso = computed(() => [
    {
      titulo: 'Accesorios / Flores / Eventos',
      descripcion: 'Gestión completa de productos, categorías y control de stock disponible',
      ruta: '/inventory/products',
      claseIcono: 'productos',
      iconoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="8" x2="8" y2="8"/>
        <line x1="16" y1="12" x2="8" y2="12"/>
        <line x1="16" y1="16" x2="8" y2="16"/>
      </svg>`,
      estadistica: esAdministrador.value ? {
        valor: totalProductos.value,
        label: 'Productos',
        formato: 'numero',
        condicional: true,
        tooltip: `Total de productos registrados: ${totalProductos.value}`,
      } : null
    },
    // {
    //   titulo: 'Ramos Pre-Armados',
    //   descripcion: 'Registro y edición de ramos, configuración de productos especiales',
    //   ruta: '/inventory/ramos',
    //   claseIcono: 'movimientos',
    //   iconoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    //     <circle cx="12" cy="12" r="3"/>
    //   </svg>`,
    //   estadistica: esAdministrador.value ? {
    //     valor: totalRamos.value,
    //     label: 'Ramos',
    //     formato: 'numero',
    //     condicional: true,
    //     tooltip: `Total de ramos pre-armados: ${totalRamos.value}`,
    //   } : null
    // },
    {
      titulo: 'Inventario por Lotes',
      descripcion: 'Control detallado de inventario, trazabilidad y gestión de lotes',
      ruta: '/inventory/lotes',
      claseIcono: 'inventario',
      iconoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>`,
      // badge: {
      //   texto: 'Próximamente',
      //   clase: 'pronto'
      // },
      // deshabilitado: true,
      // mensajeDeshabilitado: 'Función en desarrollo'
    }
  ])
  
  const verificarPermisos = (card) => {
    if (card.requiereAdmin && !esAdministrador.value) {
      return false
    }
    return true
  }
  
  const mostrarEstadisticas = (card) => {
    return esAdministrador.value && card.estadistica && card.estadistica.condicional
  }
  
  const manejarClickTarjeta = ({ card, index }) => {
    try {
      // Tracking opcional si tienes analytics configurado
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'navigation', {
          event_category: 'access_cards',
          event_label: card.titulo,
          value: index
        })
      }
    } catch (error) {
      console.error('Error al manejar click de tarjeta:', error)
    }
  }
  
  return {
    tarjetasAcceso,
    verificarPermisos,
    mostrarEstadisticas,
    manejarClickTarjeta,
    
    // Exponer datos para debug
    totalProductos,
    totalRamos,
    estadisticasInventario
  }
}