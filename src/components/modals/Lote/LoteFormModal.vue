<template>
  <BaseModal 
    v-model="isOpen" 
    :title="esEdicion ? 'Editar Lote' : 'Nuevo Lote'"
    size="large"
    @close="$emit('close')"
  >
    <form @submit.prevent="guardarLote">
      <div class="form-grid">
        <div class="form-group">
          <label>Producto <span class="required">*</span></label>
          <select v-model="formData.producto_id" required>
            <option value="">Seleccionar producto</option>
            <option v-for="producto in productos" :key="producto.id" :value="producto.id">
              {{ producto.nombre }} - {{ producto.categoria }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Cantidad <span class="required">*</span></label>
          <input 
            type="number" 
            v-model="formData.cantidad" 
            min="1"
            required
          />
        </div>

        <!-- <div class="form-group">
          <label>Precio por Unidad <span class="required">*</span></label>
          <input 
            type="number" 
            step="0.01"
            v-model="formData.precio_unitario" 
            min="0"
            required
          />
        </div> -->

        <div class="form-group">
          <label>Proveedor (Opcional)</label>
          <select v-model="formData.proveedor_id" required>
            <option value="">Seleccionar proveedor</option>
            <option v-for="proveedor in proveedores" :key="proveedor.id" :value="proveedor.id">
              {{ proveedor.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Fecha de Vencimiento <span class="required">*</span></label>
          <input 
            type="date" 
            v-model="formData.fecha_vencimiento" 
            required
          />
        </div>

        <!-- <div class="form-group full-width">
          <label>Notas</label>
          <textarea 
            v-model="formData.notas" 
            placeholder="Información adicional sobre el lote..."
            rows="3"
          ></textarea>
        </div> -->
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-outline" @click="$emit('close')">
        Cancelar
      </button>
      <button 
        type="submit" 
        class="btn-primary"
        :disabled="cargando"
        @click="guardarLote"
      >
        <span v-if="cargando" class="loading-spinner"></span>
        {{ esEdicion ? 'Actualizar' : 'Crear' }} Lote
      </button>
    </template>
  </BaseModal>
</template>

<script>
import { ref, watch, computed } from 'vue'
import BaseModal from '../BaseModal.vue'

export default {
  name: 'LoteFormModal',
  components: {
    BaseModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    lote: {
      type: Object,
      default: null
    },
    productos: {
      type: Array,
      default: () => []
    },
    proveedores: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'close', 'save'],
  setup(props, { emit }) {
    const cargando = ref(false)
    const error = ref('')
    
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    const esEdicion = computed(() => !!props.lote?.id)
    
    const formData = ref({
      id: null,
      producto_id: '',
      cantidad: 1,
      proveedor_id: '',
      fecha_vencimiento: '',
    })

    // Resetear formulario cuando se abre/cierra el modal
    watch([() => props.modelValue, () => props.lote], ([isOpen, lote]) => {
      if (isOpen) {
        if (lote && esEdicion.value) {
          // Cargar datos para edición
          formData.value = {
            id: lote.id,
            producto_id: lote.producto_id,
            cantidad: lote.cantidad_inicial,
            proveedor_id: lote.proveedor_id,
            fecha_vencimiento: lote.fecha_caducidad?.split('T')[0],
          }
        } else {
          // Resetear para nuevo lote
          formData.value = {
            id: null,
            producto_id: '',
            cantidad: 1,
            proveedor_id: '',
            fecha_vencimiento: '',
          }
        }
        error.value = ''
      }
    })

    const guardarLote = async () => {
      cargando.value = true
      error.value = ''

      try {
        if (!formData.value.producto_id || !formData.value.cantidad || 
            !formData.value.fecha_vencimiento) {
          throw new Error('Por favor completa todos los campos obligatorios')
        }

        // Crear el objeto base
        const loteData = {
          producto_id: formData.value.producto_id,
          cantidad_inicial: parseInt(formData.value.cantidad),
          fecha_caducidad: formData.value.fecha_vencimiento,
        }

        // Solo agregar proveedor_id si tiene valor
        if (formData.value.proveedor_id && formData.value.proveedor_id.trim() !== '') {
          loteData.proveedor_id = formData.value.proveedor_id
        }

        emit('save', {
          data: loteData,
          isEdit: esEdicion.value,
          id: formData.value.id
        })
        
      } catch (err) {
        error.value = err.message || 'Error al guardar el lote'
      } finally {
        cargando.value = false
      }
    }

    return {
      isOpen,
      esEdicion,
      formData,
      cargando,
      error,
      guardarLote
    }
  }
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
}

.btn-primary, .btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>