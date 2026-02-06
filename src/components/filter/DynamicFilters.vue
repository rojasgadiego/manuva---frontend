<template>
  <div class="filtros-container">
    <div class="card filtros-card">
      <!-- Header opcional con contador de filtros aplicados -->
      <!-- <div v-if="showHeader" class="filtros-header">
        <h3>{{ title }}</h3>
        <div class="filtros-header-right">
          <div v-if="filtrosAplicados > 0" class="filtros-badge">
            {{ filtrosAplicados }}
          </div>
        </div>
      </div> -->
      
      <!-- Cuerpo de filtros con diseño moderno -->
      <div class="card-body filtros-body">
        <div class="filtros-content">
          <div class="filtros-grid">
            <!-- Renderizado dinámico de campos -->
            <div 
              v-for="field in fields" 
              :key="field.key"
              class="form-group" 
              :class="{ active: modelValue[field.key] }"
            >
              <label :for="`filtro-${field.key}`">{{ field.label }}</label>
              
              <!-- Campo de texto -->
              <input 
                v-if="field.type === 'text'"
                :id="`filtro-${field.key}`"
                type="text"
                :placeholder="field.placeholder || ''"
                :value="modelValue[field.key]"
                @input="updateFilter(field.key, $event.target.value)"
                @keyup.enter="$emit('apply')"
              >
              
              <!-- Campo de fecha -->
              <input 
                v-else-if="field.type === 'date'"
                :id="`filtro-${field.key}`"
                type="date"
                :placeholder="field.placeholder || 'Seleccionar fecha'"
                :value="modelValue[field.key]"
                @input="updateFilter(field.key, $event.target.value)"
                @change="autoApply && $emit('apply')"
              >
              
              <!-- Campo de número -->
              <input 
                v-else-if="field.type === 'number'"
                :id="`filtro-${field.key}`"
                type="number"
                :placeholder="field.placeholder || ''"
                :min="field.min"
                :max="field.max"
                :step="field.step || '1'"
                :value="modelValue[field.key]"
                @input="updateFilter(field.key, $event.target.value)"
                @change="autoApply && $emit('apply')"
              >
              
              <!-- Campo select -->
              <select 
                v-else-if="field.type === 'select'"
                :id="`filtro-${field.key}`"
                :value="modelValue[field.key]"
                @change="updateFilter(field.key, $event.target.value); autoApply && $emit('apply')"
              >
                <option value="">{{ field.placeholder || `Todos los ${field.label.toLowerCase()}` }}</option>
                <option 
                  v-for="option in field.options" 
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              
              <!-- Campo de rango de fecha -->
              <div v-else-if="field.type === 'daterange'" class="date-range-container">
                <input 
                  type="date"
                  :placeholder="field.startPlaceholder || 'Fecha inicio'"
                  :value="modelValue[field.startKey || `${field.key}_inicio`]"
                  @input="updateFilter(field.startKey || `${field.key}_inicio`, $event.target.value)"
                  @change="autoApply && $emit('apply')"
                >
                <span class="date-range-separator">-</span>
                <input 
                  type="date"
                  :placeholder="field.endPlaceholder || 'Fecha fin'"
                  :value="modelValue[field.endKey || `${field.key}_fin`]"
                  @input="updateFilter(field.endKey || `${field.key}_fin`, $event.target.value)"
                  @change="autoApply && $emit('apply')"
                >
              </div>
            </div>
          </div>
          
          <!-- Botones de acción -->
          <div class="filtros-actions">
            <button 
              v-if="showClearButton"
              class="btn btn-outline" 
              @click="clearFilters"
              :title="clearButtonText"
            >
              <span class="btn-icon">🔄</span>
              <span v-if="showButtonText">{{ clearButtonText }}</span>
            </button>
            
            <button 
              v-if="showApplyButton && !autoApply"
              class="btn btn-primary" 
              @click="$emit('apply')"
              :title="applyButtonText"
            >
              <span class="btn-icon">🔍</span>
              <span v-if="showButtonText">{{ applyButtonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DynamicFilters',
  emits: ['update:modelValue', 'apply', 'clear'],
  props: {
    // Valor del modelo (filtros actuales)
    modelValue: {
      type: Object,
      default: () => ({})
    },
    
    // Configuración de campos
    fields: {
      type: Array,
      required: true,
      validator: (fields) => {
        return fields.every(field => 
          field.key && 
          field.label && 
          ['text', 'date', 'number', 'select', 'daterange'].includes(field.type)
        )
      }
    },
    
    // Configuración de la UI
    title: {
      type: String,
      default: 'Filtros'
    },
    
    showHeader: {
      type: Boolean,
      default: false
    },
    
    showClearButton: {
      type: Boolean,
      default: true
    },
    
    showApplyButton: {
      type: Boolean,
      default: true
    },
    
    showButtonText: {
      type: Boolean,
      default: false
    },
    
    clearButtonText: {
      type: String,
      default: 'Limpiar'
    },
    
    applyButtonText: {
      type: String,
      default: 'Aplicar'
    },
    
    // Auto aplicar filtros al cambiar
    autoApply: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props, { emit }) {
    // Contador de filtros aplicados
    const filtrosAplicados = computed(() => {
      return Object.values(props.modelValue).filter(value => 
        value !== null && value !== undefined && value !== ''
      ).length
    })
    
    // Actualizar un filtro específico
    const updateFilter = (key, value) => {
      const newFilters = { ...props.modelValue }
      newFilters[key] = value
      emit('update:modelValue', newFilters)
    }
    
    // Limpiar todos los filtros
    const clearFilters = () => {
      const clearedFilters = {}
      
      // Inicializar todos los campos como vacíos
      props.fields.forEach(field => {
        if (field.type === 'daterange') {
          clearedFilters[field.startKey || `${field.key}_inicio`] = ''
          clearedFilters[field.endKey || `${field.key}_fin`] = ''
        } else {
          clearedFilters[field.key] = ''
        }
      })
      
      emit('update:modelValue', clearedFilters)
      emit('clear')
      
      // Auto aplicar si está habilitado
      if (props.autoApply) {
        emit('apply')
      }
    }
    
    return {
      filtrosAplicados,
      updateFilter,
      clearFilters
    }
  }
}
</script>

<style scoped>
.filtros-container {
  flex-shrink: 0;
  margin-bottom: 30px;
}

.filtros-container {
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

.filtros-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  border-bottom: 1px solid #e5e7eb;
}

.filtros-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filtros-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filtros-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #743cfa 0%, #6030d8 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  height: 22px;
  min-width: 22px;
  border-radius: 11px;
  padding: 0 8px;
  box-shadow: 0 2px 4px rgba(116, 60, 250, 0.3);
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.filtros-body {
  padding: 20px;
  background: white;
}

.filtros-content {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  justify-content: space-between;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: white;
  transition: all 0.2s ease;
  height: 44px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #743cfa;
  box-shadow: 0 0 0 3px rgba(116, 60, 250, 0.1);
  transform: translateY(-1px);
}

.form-group input:hover,
.form-group select:hover {
  border-color: #d1d5db;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
  padding-right: 40px;
}

.form-group select:focus {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23743cfa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
}

.form-group input[type="date"] {
  position: relative;
  color: #374151;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
  margin-left: 8px;
}

.form-group input[type="date"]:focus::-webkit-calendar-picker-indicator {
  filter: invert(0.3) sepia(1) saturate(2) hue-rotate(240deg);
}

/* Rango de fechas */
.date-range-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range-container input {
  flex: 1;
  margin: 0;
}

.date-range-separator {
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

.filtros-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.85rem;
  border: none;
  gap: 6px;
}

.btn-outline {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #743cfa 0%, #6030d8 100%);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(116, 60, 250, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #6030d8 0%, #5b21b6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(116, 60, 250, 0.3);
}

.form-group.active input,
.form-group.active select {
  border-color: #743cfa;
  background-color: #faf5ff;
}

.form-group.active label {
  color: #743cfa;
  font-weight: 600;
}

.form-group input:not(:placeholder-shown),
.form-group select:not([value=""]) {
  border-color: #d3dad7;
  background-color: #fcfaff;
}

/* Responsive */
@media (max-width: 1024px) {
  .filtros-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
  }
  
  .filtros-body {
    padding: 16px;
  }
  
  .filtros-header {
    padding: 14px 16px;
  }
  
  .filtros-content {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .filtros-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filtros-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .filtros-actions {
    align-self: flex-end;
    gap: 8px;
  }
  
  .form-group input,
  .form-group select {
    padding: 10px 12px;
    min-height: 40px;
  }
  
  .date-range-container {
    flex-direction: column;
    gap: 6px;
  }
  
  .date-range-separator {
    display: none;
  }
}

@media (max-width: 480px) {
  .filtros-body {
    padding: 12px;
  }
  
  .filtros-header {
    padding: 12px;
  }
  
  .filtros-header h3 {
    font-size: 1rem;
  }
  
  .filtros-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .filtros-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .filtros-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .form-group input,
  .form-group select {
    padding: 8px 10px;
    min-height: 36px;
    font-size: 0.85rem;
  }
  
  .form-group label {
    font-size: 0.8rem;
    margin-bottom: 4px;
  }
}
</style>