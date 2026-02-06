// src/store/modules/productos.js
import { productoService } from '@/services/index.service';

const state = {
  productos: [],
  productoActual: null,
  cargando: false,
  error: null,
  lastUpdated: null
};

// ✅ Función helper para normalizar productos de forma segura
const normalizarProducto = (producto) => {
  if (!producto) return null;
  
  try {
    return {
      ...producto,
      // ✅ Manejo seguro de campos que pueden ser null
      categoria_id: producto.categoria_id || producto.categoriaId || null,
      categoria: producto.categoria ? {
        id: producto.categoria.id || null,
        nombre: producto.categoria.nombre || 'Sin categoría',
        descripcion: producto.categoria.descripcion || ''
      } : null,
      
      // ✅ Asegurar que campos numéricos sean números
      stock_actual: parseInt(producto.stock_actual) || 0,
      stock_minimo: parseInt(producto.stock_minimo) || 0,
      precio_unitario: parseFloat(producto.precio_unitario || producto.precio) || 0,
      
      // ✅ Asegurar campo activo
      activo: producto.activo !== false
    };
  } catch (error) {
    console.warn('⚠️ Error normalizando producto:', error, producto);
    return producto; // Devolver original si falla la normalización
  }
};

const getters = {
  productosActivos: state => state.productos.filter(p => p.activo),
  productosInactivos: state => state.productos.filter(p => !p.activo),
  totalProductos: state => state.productos.length,
  
  productosPorCategoria: state => categoriaId => {
    return state.productos.filter(p => p.categoria_id === categoriaId);
  },
  
  productosPorProveedor: state => proveedorId => {
    return state.productos.filter(p => p.proveedor_id === proveedorId);
  },
  
  productosEnStock: state => {
    return state.productos.filter(p => p.stock_actual > 0);
  },
  
  // ✅ CORREGIDO: Incluir productos agotados en bajo stock
  productosBajoStock: state => {
    return state.productos.filter(p => {
      // Incluir productos agotados (stock_actual = 0) o con bajo stock
      return p.stock_actual === 0 || 
             (p.stock_actual > 0 && p.stock_actual <= (p.stock_minimo || 10));
    }).sort((a, b) => {
      // Agotados primero, luego por stock actual
      if (a.stock_actual === 0 && b.stock_actual > 0) return -1;
      if (b.stock_actual === 0 && a.stock_actual > 0) return 1;
      return a.stock_actual - b.stock_actual;
    });
  },
  
  productosAgotados: state => {
    return state.productos.filter(p => p.stock_actual <= 0);
  },

  // ✅ MEJORADO: Valor total del inventario
  valorInventario: state => {
    return state.productos
      .filter(p => p.activo && p.stock_actual > 0)
      .reduce((total, p) => {
        const precio = p.precio_unitario || p.precio || 0;
        return total + (p.stock_actual * precio);
      }, 0);
  },

  // ✅ NUEVOS GETTERS para el dashboard
  obtenerProductoPorId: (state) => (id) => {
    return state.productos.find(p => p.id === id);
  },

  estadisticasCompletas: (state, getters) => ({
    total: getters.totalProductos,
    activos: getters.productosActivos.length,
    inactivos: getters.productosInactivos.length,
    bajoStock: getters.productosBajoStock.length,
    agotados: getters.productosAgotados.length,
    valorInventario: getters.valorInventario
  }),

  // ✅ GETTER específico para el dashboard (compatibilidad)
  todosProductos: (state) => state.productos,

  // ✅ Estado de carga y errores
  isLoading: (state) => state.cargando,
  hasError: (state) => !!state.error,
  errorMessage: (state) => state.error,
  lastUpdated: (state) => state.lastUpdated
};

const mutations = {
  SET_PRODUCTOS(state, productos) {
    // ✅ Normalizar todos los productos antes de guardarlos
    state.productos = Array.isArray(productos) 
      ? productos.map(p => normalizarProducto(p)).filter(Boolean)
      : [];
    state.lastUpdated = new Date().toISOString();
  },
  
  SET_PRODUCTO_ACTUAL(state, producto) {
    state.productoActual = producto ? normalizarProducto(producto) : null;
  },
  
  SET_CARGANDO(state, valor) {
    state.cargando = valor;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  RESET_ERROR(state) {
    state.error = null;
  },
  
  ACTUALIZAR_PRODUCTO(state, productoActualizado) {
    const productoNormalizado = normalizarProducto(productoActualizado);
    if (!productoNormalizado) return;
    
    const index = state.productos.findIndex(p => p.id === productoNormalizado.id);
    if (index !== -1) {
      state.productos.splice(index, 1, productoNormalizado);
    }
  },
  
  AGREGAR_PRODUCTO(state, nuevoProducto) {
    const productoNormalizado = normalizarProducto(nuevoProducto);
    if (productoNormalizado) {
      state.productos.push(productoNormalizado);
    }
  },
  
  REMOVE_PRODUCTO(state, productoId) {
    const index = state.productos.findIndex(p => p.id === productoId);
    if (index !== -1) {
      state.productos.splice(index, 1);
    }
  }
};

const actions = {
  async cargarProductos({ commit }, filtros = {}) {
    commit('SET_CARGANDO', true);
    commit('RESET_ERROR');
    
    try {
      
      const response = await productoService.getAll(filtros);
      
      // ✅ Manejo flexible de la respuesta
      let productos;
      if (response.data && Array.isArray(response.data)) {
        productos = response.data;
      } else if (Array.isArray(response)) {
        productos = response;
      } else if (response.data && Array.isArray(response.data.data)) {
        productos = response.data.data;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        productos = [];
      }

      commit('SET_PRODUCTOS', productos);
      
      return productos;
    } catch (error) {
      console.error('❌ Error en cargarProductos:', error);
      commit('SET_ERROR', error.message || 'Error al cargar los productos');
      
      // ✅ En caso de error, asegurar array vacío
      commit('SET_PRODUCTOS', []);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async obtenerProducto({ commit }, id) {
    commit('SET_CARGANDO', true);
    commit('RESET_ERROR');
    
    try {
      const response = await productoService.getById(id);
      const producto = response.data || response || null;
      commit('SET_PRODUCTO_ACTUAL', producto);
      return producto;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al obtener el producto ${id}`);
      console.error('Error en obtenerProducto:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async crearProducto({ commit }, productoData) {
    commit('SET_CARGANDO', true);
    commit('RESET_ERROR');

    // ✅ Limpiar datos antes de enviar
    const datosLimpios = { ...productoData };
    if (datosLimpios.proveedor_id === null || 
        datosLimpios.proveedor_id === undefined || 
        datosLimpios.proveedor_id === '') {
      delete datosLimpios.proveedor_id;
    }
    
    try {
      const response = await productoService.create(datosLimpios);
      const nuevoProducto = response.data || response || null;
      if (nuevoProducto) {
        commit('AGREGAR_PRODUCTO', nuevoProducto);
      }
      return nuevoProducto;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al crear el producto');
      console.error('Error en crearProducto:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async actualizarProducto({ commit }, { id, productoData }) {
    commit('SET_CARGANDO', true);
    commit('RESET_ERROR');

    // ✅ Limpiar datos antes de enviar
    const datosLimpios = { ...productoData };
    if (datosLimpios.proveedor_id === null || 
        datosLimpios.proveedor_id === undefined || 
        datosLimpios.proveedor_id === '') {
        delete datosLimpios.proveedor_id;
    }
    
    try {
      const response = await productoService.update(id, datosLimpios);
      const productoActualizado = response.data || response || null;
      if (productoActualizado) {
        commit('ACTUALIZAR_PRODUCTO', productoActualizado);
      }
      return productoActualizado;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al actualizar el producto ${id}`);
      console.error('Error en actualizarProducto:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async eliminarProducto({ commit, state }, id) {
    commit('SET_CARGANDO', true);
    commit('RESET_ERROR');
    
    try {
      await productoService.remove(id);
      
      // Actualizar localmente el producto
      const producto = state.productos.find(p => p.id === id);
      if (producto) {
        const productoActualizado = {
          ...producto,
          activo: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        };
        commit('ACTUALIZAR_PRODUCTO', productoActualizado);
      }
      
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al eliminar el producto ${id}`);
      console.error('Error en eliminarProducto:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },
  
  async restaurarProducto({ commit, state }, id) {
    commit('SET_CARGANDO', true);
    commit('RESET_ERROR');
    
    try {
      const response = await productoService.restore(id);
      const productoRestaurado = response.data || response || null;
      
      // Si tenemos respuesta de la API, usamos esa data
      if (productoRestaurado) {
        commit('ACTUALIZAR_PRODUCTO', productoRestaurado);
        return productoRestaurado;
      }
      
      // Si no, actualizamos localmente
      const producto = state.productos.find(p => p.id === id);
      if (producto) {
        const productoActualizado = {
          ...producto, 
          activo: true,
          deletedAt: null,
          updatedAt: new Date()
        };
        commit('ACTUALIZAR_PRODUCTO', productoActualizado);
        return productoActualizado;
      }
      
      return null;
    } catch (error) {
      commit('SET_ERROR', error.message || `Error al restaurar el producto ${id}`);
      console.error('Error en restaurarProducto:', error);
      throw error;
    } finally {
      commit('SET_CARGANDO', false);
    }
  },

  // ✅ NUEVAS ACCIONES para compatibilidad con dashboard
  async recargarProductos({ dispatch }) {
    return await dispatch('cargarProductos');
  },

  async cargarProductosBajoStock({ getters }) {
    // Simplemente devolver los productos bajo stock del getter
    return getters.productosBajoStock;
  },

  // ✅ Limpiar estado
  limpiarEstado({ commit }) {
    commit('SET_PRODUCTOS', []);
    commit('SET_PRODUCTO_ACTUAL', null);
    commit('RESET_ERROR');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};