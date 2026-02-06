<template>
  <div class="producto-detalle">
    <div class="detalle-principal">
      <div class="detalle-imagen">
        <img 
          :src="producto.imagen_url || '/api/placeholder/400/400'" 
          :alt="producto.nombre" 
        />
      </div>
      
      <div class="detalle-info">
        <h3 class="detalle-nombre">{{ producto.nombre }}</h3>
        
        <div class="detalle-categoria">
          <span class="categoria-label">Categoría:</span>
          <span class="category-badge" :class="'category-' + producto.categoria?.nombre?.toLowerCase().replace(/\s/g, '-')">
            {{ producto.categoria?.nombre || 'Sin categoría' }}
          </span>
        </div>
        
        <div class="detalle-precios">
          <div class="precio-item">
            <span class="precio-label">Precio Unitario:</span>
            <span class="precio-valor">{{ formatCurrency(producto.precio_unitario) }}</span>
          </div>
          
          <div class="precio-item">
            <span class="precio-label">Precio Ramo:</span>
            <span class="precio-valor">{{ formatCurrency(producto.precio_ramo) }}</span>
          </div>
        </div>
        
        <div class="detalle-stock-estado">
          <div class="stock-item">
            <span class="stock-label">Stock:</span>
            <span class="stock-badge" :class="getStockClass(producto.stock_actual)">
              {{ producto.stock_actual }}
            </span>
          </div>
          
          <div class="estado-item">
            <span class="estado-label">Estado:</span>
            <span :class="producto.activo ? 'estado-activo' : 'estado-inactivo'">
              {{ producto.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="producto.descripcion" class="detalle-descripcion">
      <h4>Descripción</h4>
      <p>{{ producto.descripcion }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductoDetalleSimplificado',
  props: {
    producto: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatCurrency(value) {
      const numero = parseFloat(value);
      if (isNaN(numero)) return '$0.00';
      
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero);
    },
    
    getStockClass(stock) {
      if (stock <= 0) return 'out-of-stock';
      if (stock <= 10) return 'low-stock';
      return 'in-stock';
    }
  }
};
</script>

<style scoped>
.producto-detalle {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detalle-principal {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.detalle-imagen {
  width: 40%;
  max-width: 400px;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #f8fafc;
}

.detalle-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.detalle-imagen:hover img {
  transform: scale(1.03);
}

.detalle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detalle-nombre {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.detalle-categoria,
.precio-item,
.stock-item,
.estado-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detalle-precios {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detalle-stock-estado {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.categoria-label,
.precio-label,
.stock-label,
.estado-label {
  font-weight: 500;
  color: #64748b;
  min-width: 120px;
}

.precio-valor {
  font-weight: 600;
  font-size: 1.15rem;
  color: #42b983;
}

.category-badge {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: #f1f5f9;
  color: #334155;
}

.category-flores {
  background-color: #e9f5e9;
  color: #166534;
}

.category-maceteros {
  background-color: #f3e8ff;
  color: #6b21a8;
}

.category-accesorios {
  background-color: #eff6ff;
  color: #1e40af;
}

.stock-badge {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 40px;
  justify-content: center;
}

.in-stock {
  background-color: #d1fae5;
  color: #065f46;
}

.low-stock {
  background-color: #fef3c7;
  color: #92400e;
}

.out-of-stock {
  background-color: #fee2e2;
  color: #b91c1c;
}

.estado-activo {
  color: #10b981;
  font-weight: 600;
}

.estado-inactivo {
  color: #ef4444;
  font-weight: 600;
}

.detalle-descripcion {
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.detalle-descripcion h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #334155;
  font-size: 1.2rem;
  font-weight: 600;
}

.detalle-descripcion p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 1.05rem;
}

/* Responsive */
@media (max-width: 768px) {
  .detalle-principal {
    flex-direction: column;
    gap: 20px;
  }
  
  .detalle-imagen {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .detalle-nombre {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .categoria-label,
  .precio-label,
  .stock-label,
  .estado-label {
    min-width: 100px;
  }
  
  .detalle-categoria,
  .precio-item,
  .stock-item,
  .estado-item {
    justify-content: space-between;
  }
  
  .detalle-stock-estado {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .detalle-info {
    gap: 16px;
  }
  
  .categoria-label,
  .precio-label,
  .stock-label,
  .estado-label {
    min-width: auto;
    flex: 1;
  }
  
  .precio-valor {
    font-size: 1.05rem;
  }
  
  .detalle-descripcion {
    padding: 16px;
  }
  
  .detalle-descripcion h4 {
    font-size: 1.1rem;
  }
  
  .detalle-descripcion p {
    font-size: 1rem;
  }
}
</style>