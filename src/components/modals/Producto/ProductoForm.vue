<template>
    <div class="producto-form">
      <form @submit.prevent class="form-grid">
        <!-- Nombre del producto -->
        <div class="form-group">
          <label for="nombre" class="form-label">Nombre <span class="required">*</span></label>
          <input 
            id="nombre"
            v-model="formData.nombre" 
            type="text" 
            class="form-control"
            :class="{ 'is-invalid': errors.nombre }"
            placeholder="Nombre del producto"
          />
          <div v-if="errors.nombre" class="error-message">{{ errors.nombre }}</div>
        </div>
        
        <!-- Descripción -->
        <div class="form-group">
          <label for="descripcion" class="form-label">Descripción</label>
          <textarea 
            id="descripcion"
            v-model="formData.descripcion" 
            class="form-control"
            :class="{ 'is-invalid': errors.descripcion }"
            placeholder="Descripción del producto"
            rows="3"
          ></textarea>
          <div v-if="errors.descripcion" class="error-message">{{ errors.descripcion }}</div>
        </div>
        
        <!-- URL de imagen -->
        <div class="form-group">
          <label for="imagen_url" class="form-label">URL de imagen</label>
          <input 
            id="imagen_url"
            v-model="formData.imagen_url" 
            type="text" 
            class="form-control"
            :class="{ 'is-invalid': errors.imagen_url }"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <div v-if="errors.imagen_url" class="error-message">{{ errors.imagen_url }}</div>
        </div>
        
        <!-- Precios: fila con dos columnas -->
        <div class="form-row">
          <div class="form-group">
            <label for="precio_unitario" class="form-label">Precio Unitario <span class="required">*</span></label>
            <input 
              id="precio_unitario"
              v-model.number="formData.precio_unitario" 
              type="number" 
              min="0"
              step="0.01"
              class="form-control"
              :class="{ 'is-invalid': errors.precio_unitario }"
              placeholder="0.00"
            />
            <div v-if="errors.precio_unitario" class="error-message">{{ errors.precio_unitario }}</div>
          </div>
          
          <div class="form-group">
            <label for="precio_ramo" class="form-label">Precio Ramo <span class="required">*</span></label>
            <input 
              id="precio_ramo"
              v-model.number="formData.precio_ramo" 
              type="number" 
              min="0"
              step="0.01"
              class="form-control"
              :class="{ 'is-invalid': errors.precio_ramo }"
              placeholder="0.00"
            />
            <div v-if="errors.precio_ramo" class="error-message">{{ errors.precio_ramo }}</div>
          </div>
        </div>
        
        <!-- Categoría -->
        <div class="form-group">
          <label for="categoria_id" class="form-label">Categoría <span class="required">*</span></label>
          <select 
            id="categoria_id"
            v-model="formData.categoria_id" 
            class="form-control"
            :class="{ 'is-invalid': errors.categoria_id }"
          >
            <option value="" disabled>Selecciona una categoría</option>
            <option 
              v-for="categoria in categorias" 
              :key="categoria.id" 
              :value="categoria.id"
            >
              {{ categoria.nombre }}
            </option>
          </select>
          <div v-if="errors.categoria_id" class="error-message">{{ errors.categoria_id }}</div>
        </div>
        
        <!-- Proveedor (opcional) -->
        <div class="form-group">
          <label for="proveedor_id" class="form-label">Proveedor</label>
          <select 
            id="proveedor_id"
            v-model="formData.proveedor_id" 
            class="form-control"
            :class="{ 'is-invalid': errors.proveedor_id }"
          >
            <option value="">Sin proveedor</option>
            <option 
              v-for="proveedor in proveedores" 
              :key="proveedor.id" 
              :value="proveedor.id"
            >
              {{ proveedor.nombre }}
            </option>
          </select>
          <div v-if="errors.proveedor_id" class="error-message">{{ errors.proveedor_id }}</div>
        </div>
        
        <!-- Stock actual -->
        <div class="form-group">
          <label for="stock_actual" class="form-label">Stock Actual</label>
          <input 
            id="stock_actual"
            v-model.number="formData.stock_actual" 
            type="number" 
            min="0"
            class="form-control"
            :class="{ 'is-invalid': errors.stock_actual }"
            placeholder="0"
          />
          <div v-if="errors.stock_actual" class="error-message">{{ errors.stock_actual }}</div>
        </div>
        
        <!-- Estado (activo/inactivo) -->
        <div class="form-group form-switch">
          <div class="switch-container">
            <label for="activo" class="switch-label">Estado:</label>
            <div class="toggle-switch">
              <input 
                id="activo"
                v-model="formData.activo" 
                type="checkbox"
                class="switch-input"
              />
              <label for="activo" class="switch-toggle">
                <span class="toggle-on">Activo</span>
                <span class="toggle-off">Inactivo</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { reactive, watch, onMounted, toRefs } from 'vue';
  
  export default {
    name: 'ProductoForm',
    props: {
      producto: {
        type: Object,
        default: () => ({})
      },
      categorias: {
        type: Array,
        default: () => []
      },
      proveedores: {
        type: Array,
        default: () => []
      },
      isEditing: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue', 'validationChange'],
    setup(props, { emit }) {
      const { producto } = toRefs(props);
      
      // Formulario reactivo
      const formData = reactive({
        nombre: '',
        descripcion: '',
        imagen_url: '',
        precio_unitario: 0,
        precio_ramo: 0,
        categoria_id: '',
        proveedor_id: '',
        stock_actual: 0,
        activo: true
      });
      
      // Errores de validación
      const errors = reactive({
        nombre: '',
        descripcion: '',
        imagen_url: '',
        precio_unitario: '',
        precio_ramo: '',
        categoria_id: '',
        proveedor_id: '',
        stock_actual: ''
      });
      
      // Inicializar con los datos del producto si está en modo edición
      const inicializarFormulario = () => {
        if (producto.value && Object.keys(producto.value).length > 0) {
          formData.nombre = producto.value.nombre || '';
          formData.descripcion = producto.value.descripcion || '';
          formData.imagen_url = producto.value.imagen_url || '';
          formData.precio_unitario = producto.value.precio_unitario || 0;
          formData.precio_ramo = producto.value.precio_ramo || 0;
          formData.categoria_id = producto.value.categoria_id || '';
          formData.proveedor_id = producto.value.proveedor_id || '';
          formData.stock_actual = producto.value.stock_actual || 0;
          formData.activo = producto.value.activo !== undefined ? producto.value.activo : true;
        }
      };
      
      // Validación del formulario
      const validarFormulario = () => {
        let esValido = true;
        
        // Limpiar errores previos
        Object.keys(errors).forEach(key => errors[key] = '');
        
        // Validar campos obligatorios
        if (!formData.nombre.trim()) {
          errors.nombre = 'El nombre es requerido';
          esValido = false;
        }
        
        if (formData.precio_unitario <= 0) {
          errors.precio_unitario = 'El precio unitario debe ser mayor a 0';
          esValido = false;
        }
        
        if (formData.precio_ramo <= 0) {
          errors.precio_ramo = 'El precio ramo debe ser mayor a 0';
          esValido = false;
        }
        
        if (!formData.categoria_id) {
          errors.categoria_id = 'La categoría es requerida';
          esValido = false;
        }
        
        // Validar URL de imagen si se proporciona
        if (formData.imagen_url && !validarURL(formData.imagen_url)) {
          errors.imagen_url = 'La URL de imagen no es válida';
          esValido = false;
        }
        
        // Validar que el stock no sea negativo
        if (formData.stock_actual < 0) {
          errors.stock_actual = 'El stock no puede ser negativo';
          esValido = false;
        }
        
        // Emitir el resultado de la validación
        emit('validationChange', esValido);
        
        return esValido;
      };
      
      // Función auxiliar para validar URLs
      const validarURL = (url) => {
        try {
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      };
      
      // Cuando el form data cambia, validar y emitir evento
      watch(formData, () => {
        validarFormulario();
        emit('update:modelValue', { ...formData });
      }, { deep: true });
      
      // Cuando el producto prop cambia, actualizar el form data
      watch(producto, () => {
        inicializarFormulario();
      }, { deep: true });
      
      // Al montar el componente
      onMounted(() => {
        inicializarFormulario();
        validarFormulario();
      });
      
      return {
        formData,
        errors,
        validarFormulario
      };
    }
  };
  </script>
  
  <style scoped>
  .producto-form {
    width: 100%;
  }
  
  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .form-label {
    font-weight: 500;
    color: #334155;
    margin-bottom: 4px;
    font-size: 0.95rem;
  }
  
  .required {
    color: #ef4444;
    margin-left: 2px;
  }
  
  .form-control {
    padding: 8px 12px;
    font-size: 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background-color: #ffffff;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .form-control:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
  
  .form-control.is-invalid {
    border-color: #ef4444;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 4px;
  }
  
  .form-switch {
    margin-top: 8px;
  }
  
  .switch-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .switch-label {
    font-weight: 500;
    color: #334155;
    margin-bottom: 0;
    font-size: 0.95rem;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-block;
  }
  
  .switch-input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }
  
  .switch-toggle {
    position: relative;
    display: inline-block;
    width: 90px;
    height: 32px;
    background-color: #e2e8f0;
    border-radius: 16px;
    transition: all 0.3s;
    cursor: pointer;
    overflow: hidden;
  }
  
  .switch-input:checked + .switch-toggle {
    background-color: #d1fae5;
  }
  
  .switch-input:focus + .switch-toggle {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
  
  .switch-toggle::after {
    content: '';
    position: absolute;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: white;
    top: 2px;
    left: 2px;
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .switch-input:checked + .switch-toggle::after {
    transform: translateX(58px);
    background-color: #10b981;
  }
  
  .toggle-on,
  .toggle-off {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    font-weight: 500;
    transition: opacity 0.3s;
  }
  
  .toggle-on {
    left: 10px;
    color: #047857;
    opacity: 0;
  }
  
  .toggle-off {
    right: 10px;
    color: #64748b;
    opacity: 1;
  }
  
  .switch-input:checked + .switch-toggle .toggle-on {
    opacity: 1;
  }
  
  .switch-input:checked + .switch-toggle .toggle-off {
    opacity: 0;
  }
  
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
  </style>