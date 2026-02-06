<template>
  <div class="access-cards" :class="gridClass">
    <component
      v-for="(card, index) in tarjetas"
      :key="index"
      :is="card.esExterno ? 'a' : 'router-link'"
      :to="card.esExterno ? undefined : card.ruta"
      :href="card.esExterno ? card.ruta : undefined"
      :target="card.esExterno ? '_blank' : undefined"
      :rel="card.esExterno ? 'noopener noreferrer' : undefined"
      class="access-card"
      :class="{ 'disabled': card.deshabilitado }"
      @click="manejarClick(card, $event)"
    >
      <div 
        class="card-icon" 
        :class="card.claseIcono || 'default-icon'"
        :style="card.colorIcono ? { backgroundColor: card.colorIcono } : {}"
      >
        <!-- Icono SVG personalizado -->
        <div 
          v-if="card.iconoSvg" 
          class="icon-svg" 
          v-html="card.iconoSvg"
        ></div>
        
        <!-- Icono de texto/emoji -->
        <span 
          v-else-if="card.iconoTexto" 
          class="icon-text"
          :style="{ fontSize: card.tamanoIcono || '28px' }"
        >
          {{ card.iconoTexto }}
        </span>
        
        <!-- Icono por defecto -->
        <svg 
          v-else
          xmlns="http://www.w3.org/2000/svg" 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      </div>
      
      <div class="card-content">
        <h3>{{ card.titulo }}</h3>
        <p>{{ card.descripcion }}</p>
        
        <!-- Badge opcional -->
        <div v-if="card.badge" class="card-badge" :class="card.badge.clase">
          {{ card.badge.texto }}
        </div>
        
        <!-- Estadística condicional -->
        <div 
          v-if="card.estadistica && mostrarEstadistica(card)"
          class="card-stat"
        >
          <div 
            class="stat-value"
            :title="card.estadistica.tooltip"
          >
            {{ formatearValor(card.estadistica.valor, card.estadistica.formato) }}
          </div>
          <div 
            class="stat-label"
            :title="card.estadistica.labelTooltip"
          >
            {{ card.estadistica.label || 'Total' }}
          </div>
          
        </div>
        
        <!-- Indicador de carga -->
        <!-- <div v-if="card.cargando" class="card-loading">
          <div class="loading-spinner-mini"></div>
          <span>Cargando...</span>
        </div> -->
      </div>
      
      <!-- Overlay de deshabilitado -->
      <div v-if="card.deshabilitado" class="card-overlay">
        <span class="overlay-text">
          {{ card.mensajeDeshabilitado || 'No disponible' }}
        </span>
      </div>
    </component>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'AccessCards',
  emits: ['card-click'],
  props: {
    // Array principal de tarjetas
    tarjetas: {
      type: Array,
      required: true,
      validator: (tarjetas) => {
        return Array.isArray(tarjetas) && tarjetas.every(card => 
          card && 
          typeof card === 'object' && 
          'titulo' in card && 
          'descripcion' in card &&
          'ruta' in card
        )
      }
    },
    
    // Configuración de layout
    columnas: {
      type: [Number, String],
      default: 'auto',
      validator: (value) => {
        return value === 'auto' || (!isNaN(value) && value > 0)
      }
    },
    
    minAncho: {
      type: String,
      default: '350px'
    },
    
    // Configuración de permisos
    verificarPermisos: {
      type: Function,
      default: () => true
    },
    
    // Configuración de estadísticas
    mostrarEstadisticasCondicional: {
      type: Function,
      default: () => true
    },
    
    // Debug mode
    mostrarDebug: {
      type: Boolean,
      default: false
    },
    
    // Configuración de formato
    locale: {
      type: String,
      default: 'es-MX'
    }
  },
  
  setup(props, { emit }) {
    
    // Computed para la clase del grid
    const gridClass = computed(() => {
      if (props.columnas === 'auto') {
        return 'grid-auto'
      }
      return `grid-${props.columnas}`
    })
    
    // Función para verificar si mostrar estadística
    const mostrarEstadistica = (card) => {
      if (!card.estadistica) return false
      if (card.estadistica.condicional === false) return false
      return props.mostrarEstadisticasCondicional(card)
    }
    
    // Función para formatear valores
    const formatearValor = (valor, formato = 'numero') => {
      try {
        const num = Number(valor) || 0
        
        switch (formato) {
          case 'moneda':
            return new Intl.NumberFormat(props.locale, {
              style: 'currency',
              currency: 'MXN'
            }).format(num)
            
          case 'porcentaje':
            return new Intl.NumberFormat(props.locale, {
              style: 'percent',
              minimumFractionDigits: 1
            }).format(num / 100)
            
          case 'numero':
          default:
            return new Intl.NumberFormat(props.locale).format(num)
        }
      } catch (error) {
        console.warn('Error al formatear valor:', valor, error)
        return valor?.toString() || '0'
      }
    }
    
    // Handler para clicks
    const manejarClick = (card, event) => {
      if (card.deshabilitado) {
        event.preventDefault()
        return
      }
      
      // Si tiene handler personalizado, ejecutarlo
      if (card.onClick && typeof card.onClick === 'function') {
        const resultado = card.onClick(card, event)
        // Si el handler retorna false, prevenir navegación
        if (resultado === false) {
          event.preventDefault()
        }
      }
      
      // Emitir evento para el padre
      emit('card-click', {
        card,
        event,
        index: props.tarjetas.indexOf(card)
      })
    }
    
    return {
      gridClass,
      mostrarEstadistica,
      formatearValor,
      manejarClick
    }
  }
}
</script>

<style scoped>
.access-cards {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
  flex-shrink: 0;
}

/* ===== CONFIGURACIONES DE GRID ===== */
.grid-auto {
  grid-template-columns: repeat(auto-fill, minmax(var(--min-width, 350px), 1fr));
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-5 { grid-template-columns: repeat(5, 1fr); }
.grid-6 { grid-template-columns: repeat(6, 1fr); }

/* ===== TARJETA INDIVIDUAL ===== */
.access-card {
  display: flex;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  min-height: 120px;
  cursor: pointer;
}

.access-card:hover:not(.disabled) {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.access-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== ICONO DE LA TARJETA ===== */
.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  padding: 20px;
  color: white;
  flex-shrink: 0;
}

/* Clases de iconos predefinidas */
.card-icon.default-icon { background-color: #805ad5; }
.card-icon.productos { background-color: #805ad5; }
.card-icon.movimientos { background-color: #3182ce; }
.card-icon.inventario { background-color: #38a169; }
.card-icon.reportes { background-color: #d69e2e; }
.card-icon.configuracion { background-color: #718096; }
.card-icon.ventas { background-color: #38a169; }
.card-icon.compras { background-color: #3182ce; }
.card-icon.clientes { background-color: #805ad5; }
.card-icon.proveedores { background-color: #d69e2e; }

.icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-svg :deep(svg) {
  width: 28px;
  height: 28px;
}

.icon-text {
  font-size: 28px;
  line-height: 1;
}

/* ===== CONTENIDO DE LA TARJETA ===== */
.card-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.card-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
  line-height: 1.3;
}

.card-content p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  flex-grow: 1;
}

/* ===== BADGE ===== */
.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-badge.nuevo {
  background-color: #48bb78;
  color: white;
}

.card-badge.popular {
  background-color: #ed8936;
  color: white;
}

.card-badge.beta {
  background-color: #805ad5;
  color: white;
}

.card-badge.pronto {
  background-color: #718096;
  color: white;
}

/* ===== ESTADÍSTICAS ===== */
.card-stat {
  display: flex;
  align-items: baseline;
  margin-top: auto;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-right: 8px;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
}

/* ===== LOADING ===== */
.card-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  color: #666;
  font-size: 0.85rem;
}

.loading-spinner-mini {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #805ad5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== OVERLAY DE DESHABILITADO ===== */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.overlay-text {
  background-color: #f56565;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* ===== DEBUG ===== */
.debug-mini {
  font-size: 0.7rem;
  color: #6c757d;
  margin-top: 4px;
  padding: 2px 4px;
  background-color: #f8f9fa;
  border-radius: 3px;
  align-self: flex-start;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1200px) {
  .grid-4,
  .grid-5,
  .grid-6 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .access-cards {
    grid-template-columns: 1fr !important;
  }
  
  .access-card {
    min-width: 100%;
  }
  
  .card-content h3 {
    font-size: 1.1rem;
  }
  
  .card-content p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 15px;
  }
  
  .card-content h3 {
    font-size: 1rem;
  }
  
  .card-content p {
    font-size: 0.8rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .card-icon {
    width: 60px;
    padding: 15px;
  }
  
  .icon-svg :deep(svg),
  .icon-text {
    width: 24px;
    height: 24px;
    font-size: 24px;
  }
}

/* ===== ANIMACIONES ===== */
.access-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== ACCESIBILIDAD ===== */
.access-card:focus {
  outline: 2px solid #805ad5;
  outline-offset: 2px;
}

.access-card:focus:not(:focus-visible) {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .access-card,
  .loading-spinner-mini {
    animation: none;
  }
  
  .access-card {
    transition: none;
  }
}
</style>