<template>
  <div class="ramo-detalle">
    <!-- ✅ HEADER CON INFORMACIÓN PRINCIPAL -->
    <div class="ramo-header">
      <div class="ramo-titulo">
        <h3>{{ ramo.nombre }}</h3>
        <div class="ramo-badges">
          <span class="badge badge-success" v-if="ramo.activo">✅ Activo</span>
          <span class="badge badge-secondary" v-else>❌ Inactivo</span>
          
          <span class="badge badge-warning" v-if="ramo.personalizado">🎨 Personalizado</span>
          <span class="badge badge-info" v-else>📋 Estándar</span>
          
          <span class="badge badge-info" v-if="ramo.disponible_catalogo">📖 En Catálogo</span>
          
          <span class="badge badge-warning" v-if="ramo.valor_rebaja">💰 Con Descuento</span>
        </div>
      </div>
      
      <!-- ✅ IMAGEN DEL RAMO -->
      <div class="ramo-imagen" v-if="ramo.imagen_url">
        <img :src="ramo.imagen_url" :alt="ramo.nombre" />
      </div>
    </div>

    <!-- ✅ MÉTRICAS PRINCIPALES EN CUADROS COMPACTOS -->
    <div class="metricas-principales">
      <!-- Precio de Venta -->
      <div class="metrica-card precio-venta">
        <div class="metrica-content">
          <div class="metrica-icon">💰</div>
          <div class="metrica-info">
            <div class="metrica-label">Precio Venta</div>
            <div class="metrica-value">{{ formatCurrency(ramo.precio_venta) }}</div>
          </div>
        </div>
      </div>

      <!-- Costo Estimado -->
      <div class="metrica-card costo-estimado">
        <div class="metrica-content">
          <div class="metrica-icon">📦</div>
          <div class="metrica-info">
            <div class="metrica-label">Costo Estimado</div>
            <div class="metrica-value">{{ formatCurrency(ramo.costo_estimado) }}</div>
            <div class="metrica-extra" v-if="diferenciaCosto !== 0">
              <span :class="diferenciaCosto > 0 ? 'diferencia-positiva' : 'diferencia-negativa'">
                {{ diferenciaCosto > 0 ? '+' : '' }}{{ formatCurrency(diferenciaCosto) }} vs calculado
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Margen -->
      <div class="metrica-card margen" :class="getMargenClass()">
        <div class="metrica-content">
          <div class="metrica-icon">{{ getMargenIcon() }}</div>
          <div class="metrica-info">
            <div class="metrica-label">Margen</div>
            <div class="metrica-value">{{ porcentajeMargen }}%</div>
            <div class="metrica-extra">{{ getMargenText() }}</div>
          </div>
        </div>
      </div>

      <!-- Stock -->
      <div class="metrica-card stock" :class="getStockClass(ramo.stock_actual)">
        <div class="metrica-content">
          <div class="metrica-icon">{{ getStockIcon() }}</div>
          <div class="metrica-info">
            <div class="metrica-label">Stock</div>
            <div class="metrica-value">{{ ramo.stock_actual || 0 }}</div>
            <div class="metrica-extra">{{ getStockText() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ INFORMACIÓN ADICIONAL DEL RAMO -->
    <!-- <div class="ramo-info-adicional">
      <div class="info-item" v-if="ramo.usuario">
        <span class="info-label">👤 Creado por:</span>
        <span class="info-value">{{ ramo.usuario.nombre }}</span>
      </div>
      
      <div class="info-item">
        <span class="info-label">🗓️ Fecha de Creación:</span>
        <span class="info-value">{{ formatFecha(ramo.fechaCreacion) }}</span>
      </div>
      
      <div class="info-item" v-if="ramo.updatedAt !== ramo.fechaCreacion">
        <span class="info-label">⏰ Última Actualización:</span>
        <span class="info-value">{{ formatFecha(ramo.updatedAt) }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">🆔 ID:</span>
        <span class="info-value">{{ ramo.id }}</span>
      </div>
    </div> -->

    <!-- ✅ DESCRIPCIÓN -->
    <div class="ramo-descripcion" v-if="ramo.descripcion">
      <h4>📝 Descripción</h4>
      <p>{{ ramo.descripcion }}</p>
    </div>

    <!-- ✅ COMPONENTES DEL RAMO -->
    <div class="componentes-seccion">
      <h4>🌸 Componentes del Ramo ({{ totalComponentes }})</h4>
      
      <div v-if="!ramo.componentes || ramo.componentes.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>No hay componentes registrados para este ramo</p>
      </div>
      
      <div v-else class="componentes-container">
        <!-- ✅ LISTA DE COMPONENTES MEJORADA -->
        <div class="componentes-lista">
          <div 
            v-for="(componente, index) in ramo.componentes" 
            :key="`${componente.id}-${index}`"
            class="componente-item"
          >
            <div class="componente-info">
              <div class="cantidad-badge">
                {{ componente.cantidad }}
              </div>
              <div class="producto-detalle">
                <div class="producto-nombre">
                  {{ componente.producto?.nombre || 'Producto no encontrado' }}
                </div>
                <div class="producto-categoria">
                  <span class="categoria-badge" v-if="componente.producto?.categoria">
                    {{ componente.producto.categoria.nombre }}
                  </span>
                  <span v-else class="categoria-badge sin-categoria">Sin categoría</span>
                </div>
              </div>
            </div>
            <div class="componente-precios">
              <div class="precio-unitario">
                <span v-if="componente.producto">
                  {{ formatCurrency(componente.producto.precio_unitario || 0) }} c/u
                </span>
                <span v-else class="text-muted">N/A</span>
              </div>
              <div class="subtotal">
                {{ formatCurrency(calcularSubtotal(componente)) }}
              </div>
            </div>
          </div>
          
          <!-- Total Calculado -->
          <div class="total-calculado">
            <div class="total-info">
              <span class="total-label">Total Calculado</span>
              <span class="total-unidades">{{ totalUnidades }} unidades</span>
            </div>
            <div class="total-valor">
              {{ formatCurrency(totalCalculado) }}
            </div>
          </div>
        </div>

        <!-- ✅ RESUMEN FINANCIERO -->
        <div class="resumen-financiero">
          <div class="resumen-card">
            <h5>💰 Resumen Financiero</h5>
            
            <div class="resumen-item">
              <span class="label">Costo Total (calculado):</span>
              <span class="value">{{ formatCurrency(totalCalculado) }}</span>
            </div>
            
            <div class="resumen-item">
              <span class="label">Costo Estimado (registrado):</span>
              <span class="value">{{ formatCurrency(ramo.costo_estimado) }}</span>
            </div>
            
            <div class="resumen-item diferencia" :class="getDiferenciaClass()">
              <span class="label">Diferencia:</span>
              <span class="value">{{ formatCurrency(Math.abs(diferenciaCosto)) }} {{ diferenciaCosto > 0 ? '↑' : diferenciaCosto < 0 ? '↓' : '' }}</span>
            </div>
            
            <div class="resumen-item total">
              <span class="label">Precio de Venta:</span>
              <span class="value">{{ formatCurrency(ramo.precio_venta) }}</span>
            </div>
            
            <div class="resumen-item margen" :class="getMargenClass()">
              <span class="label">Margen Estimado:</span>
              <span class="value">{{ formatCurrency(margenEstimado) }} ({{ porcentajeMargen }}%)</span>
            </div>
          </div>
        </div>

        <!-- ✅ ESTADÍSTICAS ADICIONALES -->
        <div class="estadisticas-componentes">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <span class="stat-label">Productos Únicos</span>
              <span class="stat-value">{{ productosUnicos }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <span class="stat-label">Total Unidades</span>
              <span class="stat-value">{{ totalUnidades }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <span class="stat-label">Stock Disponible</span>
              <span class="stat-value" :class="getStockClass(ramo.stock_actual)">
                {{ ramo.stock_actual || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'RamoDetalleSimplificado',
  props: {
    ramo: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  
  setup(props) {
    // ✅ COMPUTED PROPERTIES PARA CÁLCULOS
    const totalComponentes = computed(() => {
      return props.ramo.componentes?.length || 0
    })
    
    const totalUnidades = computed(() => {
      if (!props.ramo.componentes) return 0
      return props.ramo.componentes.reduce((total, comp) => total + (comp.cantidad || 0), 0)
    })
    
    const totalCalculado = computed(() => {
      if (!props.ramo.componentes) return 0
      return props.ramo.componentes.reduce((total, comp) => {
        return total + calcularSubtotal(comp)
      }, 0)
    })
    
    const diferenciaCosto = computed(() => {
      return totalCalculado.value - (props.ramo.costo_estimado || 0)
    })
    
    const margenEstimado = computed(() => {
      return (props.ramo.precio_venta || 0) - (props.ramo.costo_estimado || 0)
    })
    
    const porcentajeMargen = computed(() => {
      if (!props.ramo.precio_venta || props.ramo.precio_venta === 0) return 0
      return Math.round((margenEstimado.value / props.ramo.precio_venta) * 100)
    })
    
    const productosUnicos = computed(() => {
      if (!props.ramo.componentes) return 0
      const productosUnicosSet = new Set(props.ramo.componentes.map(comp => comp.producto_id))
      return productosUnicosSet.size
    })

    // ✅ MÉTODOS HELPER
    const calcularSubtotal = (componente) => {
      if (!componente.producto) return 0
      return (componente.producto.precio_unitario || 0) * (componente.cantidad || 0)
    }

    const formatCurrency = (value) => {
      const numero = parseFloat(value) || 0
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero)
    }

    const formatFecha = (fechaStr) => {
      if (!fechaStr) return 'No disponible'
      
      const fecha = new Date(fechaStr)
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(fecha)
    }

    const getStockClass = (stock) => {
      const stockNum = parseInt(stock) || 0
      if (stockNum <= 0) return 'stock-agotado'
      if (stockNum <= 10) return 'stock-bajo'
      return 'stock-bueno'
    }

    const getStockIcon = () => {
      const stockNum = parseInt(props.ramo.stock_actual) || 0
      if (stockNum <= 0) return '🚫'
      if (stockNum <= 10) return '⚠️'
      return '✅'
    }

    const getStockText = () => {
      const stockNum = parseInt(props.ramo.stock_actual) || 0
      if (stockNum <= 0) return 'Agotado'
      if (stockNum <= 10) return 'Stock Bajo'
      return 'Stock Bueno'
    }

    const getDiferenciaClass = () => {
      const diff = diferenciaCosto.value
      if (diff > 0) return 'diferencia-positiva'
      if (diff < 0) return 'diferencia-negativa'
      return 'diferencia-neutral'
    }

    const getMargenClass = () => {
      const margen = porcentajeMargen.value
      if (margen >= 30) return 'margen-excelente'
      if (margen >= 15) return 'margen-bueno'
      if (margen >= 0) return 'margen-bajo'
      return 'margen-negativo'
    }

    const getMargenIcon = () => {
      const margen = porcentajeMargen.value
      if (margen >= 30) return '📈'
      if (margen >= 15) return '📊'
      if (margen >= 0) return '📉'
      return '⚠️'
    }

    const getMargenText = () => {
      const margen = porcentajeMargen.value
      if (margen >= 30) return 'Excelente'
      if (margen >= 15) return 'Bueno'
      if (margen >= 0) return 'Bajo'
      return 'Pérdida'
    }

    return {
      // Computed properties
      totalComponentes,
      totalUnidades,
      totalCalculado,
      diferenciaCosto,
      margenEstimado,
      porcentajeMargen,
      productosUnicos,
      
      // Métodos
      calcularSubtotal,
      formatCurrency,
      formatFecha,
      getStockClass,
      getStockIcon,
      getStockText,
      getDiferenciaClass,
      getMargenClass,
      getMargenIcon,
      getMargenText
    }
  }
}
</script>

<style scoped>
.ramo-detalle {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.ramo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.ramo-titulo h3 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #2d3748;
  font-weight: 600;
}

.ramo-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-success {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-secondary {
  background-color: #f1f5f9;
  color: #64748b;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-info {
  background-color: #dbeafe;
  color: #1e40af;
}

.ramo-imagen {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.ramo-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ✅ NUEVOS ESTILOS PARA MÉTRICAS COMPACTAS */
.metricas-principales {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

@media (min-width: 640px) {
  .metricas-principales {
    flex-direction: row;
    gap: 12px;
  }
}

.metrica-card {
  flex: 1;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  background-color: white;
  transition: all 0.2s ease;
}

.metrica-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.metrica-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metrica-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.metrica-info {
  flex: 1;
}

.metrica-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: #64748b;
  margin-bottom: 4px;
}

.metrica-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.metrica-extra {
  font-size: 0.7rem;
  margin-top: 4px;
  color: #64748b;
}

/* Colores específicos para cada métrica */
.precio-venta {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

.precio-venta .metrica-value {
  color: #1e40af;
}

.costo-estimado {
  background-color: #f3e8ff;
  border-color: #8b5cf6;
}

.costo-estimado .metrica-value {
  color: #7c3aed;
}

.diferencia-positiva {
  color: #dc2626 !important;
}

.diferencia-negativa {
  color: #059669 !important;
}

/* Estados de margen */
.margen.margen-excelente {
  background-color: #d1fae5;
  border-color: #10b981;
}

.margen.margen-excelente .metrica-value {
  color: #059669;
}

.margen.margen-bueno {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

.margen.margen-bueno .metrica-value {
  color: #1e40af;
}

.margen.margen-bajo {
  background-color: #fef3c7;
  border-color: #f59e0b;
}

.margen.margen-bajo .metrica-value {
  color: #d97706;
}

.margen.margen-negativo {
  background-color: #fee2e2;
  border-color: #ef4444;
}

.margen.margen-negativo .metrica-value {
  color: #dc2626;
}

/* Estados de stock */
.stock.stock-bueno {
  background-color: #d1fae5;
  border-color: #10b981;
}

.stock.stock-bueno .metrica-value {
  color: #059669;
}

.stock.stock-bajo {
  background-color: #fef3c7;
  border-color: #f59e0b;
}

.stock.stock-bajo .metrica-value {
  color: #d97706;
}

.stock.stock-agotado {
  background-color: #fee2e2;
  border-color: #ef4444;
}

.stock.stock-agotado .metrica-value {
  color: #dc2626;
}

/* ✅ INFORMACIÓN ADICIONAL COMPACTA */
.ramo-info-adicional {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.ramo-descripcion {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.ramo-descripcion h4 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 1rem;
}

.ramo-descripcion p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.componentes-seccion h4 {
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 2px dashed #cbd5e1;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* ✅ COMPONENTES LISTA MEJORADA */
.componentes-lista {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.componente-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.componente-item:hover {
  background-color: #f8fafc;
}

.componente-item:last-child {
  border-bottom: none;
}

.componente-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.cantidad-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ec4899, #f97316);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.producto-detalle {
  flex: 1;
}

.producto-nombre {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.categoria-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #e0f2fe;
  color: #0277bd;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.categoria-badge.sin-categoria {
  background-color: #f3f4f6;
  color: #6b7280;
}

.componente-precios {
  text-align: right;
  flex-shrink: 0;
}

.precio-unitario {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
}

.subtotal {
  font-weight: 700;
  color: #059669;
  font-size: 1rem;
}

.total-calculado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f1f5f9;
  border-top: 2px solid #e2e8f0;
  font-weight: 600;
}

.total-info {
  display: flex;
  flex-direction: column;
}

.total-label {
  color: #1e293b;
  font-size: 1rem;
}

.total-unidades {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
}

.total-valor {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.text-muted {
  color: #9ca3af;
}

/* Resumen financiero */
.resumen-financiero {
  margin-bottom: 24px;
}

.resumen-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.resumen-card h5 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.resumen-item:last-child {
  border-bottom: none;
}

.resumen-item.diferencia {
  font-weight: 500;
}

.diferencia-positiva .value {
  color: #dc2626;
}

.diferencia-negativa .value {
  color: #059669;
}

.diferencia-neutral .value {
  color: #6b7280;
}

.resumen-item.total {
  font-size: 1.1rem;
  font-weight: 600;
  border-top: 2px solid #e2e8f0;
  margin-top: 8px;
  padding-top: 12px;
}

.resumen-item.margen {
  font-weight: 600;
}

.margen-excelente .value {
  color: #059669;
}

.margen-bueno .value {
  color: #d97706;
}

.margen-bajo .value {
  color: #dc2626;
}

.margen-negativo .value {
  color: #dc2626;
  font-weight: 700;
}

/* Estadísticas */
.estadisticas-componentes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

/* Responsive */
@media (max-width: 768px) {
  .ramo-header {
    flex-direction: column;
  }
  
  .ramo-imagen {
    width: 100%;
    height: 200px;
  }
  
  .ramo-info-adicional {
    grid-template-columns: 1fr;
  }
  
  .componente-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .componente-precios {
    text-align: left;
    width: 100%;
  }
  
  .estadisticas-componentes {
    grid-template-columns: 1fr;
  }
}
</style>