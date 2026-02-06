// store/modules/dashboard.js

const state = {
  resumen: {
    clientes: {
      total: 0,
      activos: 0,
      nuevos: 0
    },
    proveedores: {
      total: 0,
      activos: 0,
      nuevos: 0
    },
    usuarios: {
      total: 0,
      activos: 0,
      roles: 0
    },
    productos: {
      total: 0,
      activos: 0,
      bajoStock: 0,
      agotados: 0,
      valorInventario: 0
    }
  },
  actividadesRecientes: [],
  loading: false,
  error: null,
  lastUpdated: null
};

const mutations = {
  SET_RESUMEN(state, resumen) {
    state.resumen = { ...state.resumen, ...resumen };
    state.lastUpdated = new Date().toISOString();
  },
  
  SET_ACTIVIDADES(state, actividades) {
    state.actividadesRecientes = actividades || [];
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  RESET_ERROR(state) {
    state.error = null;
  }
};

const getters = {
  resumenCompleto: (state) => state.resumen,
  
  totalEntidades: (state) => {
    return state.resumen.clientes.total + 
           state.resumen.proveedores.total + 
           state.resumen.usuarios.total + 
           state.resumen.productos.total;
  },
  
  isLoading: (state) => state.loading,
  hasError: (state) => !!state.error,
  lastUpdated: (state) => state.lastUpdated
};

const actions = {
  async cargarResumenDashboard({ commit, rootState, dispatch }) {
    commit('SET_LOADING', true);
    commit('RESET_ERROR');
    
    try {
      
      // Crear objeto resumen con valores por defecto
      const resumen = {
        clientes: { total: 0, activos: 0, nuevos: 0 },
        proveedores: { total: 0, activos: 0, nuevos: 0 },
        usuarios: { total: 0, activos: 0, roles: 0 },
        productos: { total: 0 }
      };

      // ✅ CARGAR DATOS DE CLIENTES
      if (rootState.clientes) {
        try {
          await dispatch('clientes/cargarClientes', null, { root: true });
          
          const clientes = rootState.clientes.clientes || [];
          resumen.clientes = {
            total: clientes.length,
            activos: clientes.filter(c => c.activo !== false).length,
            nuevos: calculateNewClients(clientes)
          };
          
        } catch (error) {
          const clientes = rootState.clientes.clientes || [];
          if (clientes.length > 0) {
            resumen.clientes = {
              total: clientes.length,
              activos: clientes.filter(c => c.activo !== false).length,
              nuevos: calculateNewClients(clientes)
            };
          }
        }
      } else {
        console.warn('⚠️ Módulo clientes no disponible');
      }

      // ✅ CARGAR DATOS DE PROVEEDORES
      if (rootState.proveedores) {
        try {
          // Cargar proveedores si no están cargados
          if (!rootState.proveedores.proveedores || rootState.proveedores.proveedores.length === 0) {
            await dispatch('proveedores/cargarProveedores', null, { root: true });
          }
          
          const proveedores = rootState.proveedores.proveedores || [];
          resumen.proveedores = {
            total: proveedores.length,
            activos: proveedores.filter(p => p.activo !== false).length,
            nuevos: calculateNewProveedores(proveedores)
          };
          
        } catch (error) {
          console.warn('⚠️ Error al cargar proveedores:', error.message);
        }
      } else {
        console.warn('⚠️ Módulo proveedores no disponible');
      }

      // ✅ CARGAR DATOS DE USUARIOS
      if (rootState.usuarios) {
        try {
          // Cargar usuarios si no están cargados
          if (!rootState.usuarios.usuarios || rootState.usuarios.usuarios.length === 0) {
            await dispatch('usuarios/cargarUsuarios', null, { root: true });
          }
          
          const usuarios = rootState.usuarios.usuarios || [];
          resumen.usuarios = {
            total: usuarios.length,
            activos: usuarios.filter(u => u.activo !== false).length,
            roles: [...new Set(usuarios.map(u => u.rol || u.role).filter(Boolean))].length
          };
          
        } catch (error) {
          console.warn('⚠️ Error al cargar usuarios:', error.message);
        }
      } else {
        console.warn('⚠️ Módulo usuarios no disponible');
      }

      // ✅ CARGAR DATOS DE PRODUCTOS (adaptado a tu estructura)
      // if (rootState.productos) {
      //   try {
      //     // Siempre intentar cargar productos desde el servicio
      //     console.log('📊 Cargando productos desde servicio...');
      //     await dispatch('productos/cargarProductos', null, { root: true });
          
      //     const productos = rootState.productos.productos || [];
          
      //     // Usar getters del store para estadísticas
      //     const estadisticasProductos = rootState.productos ? {
      //       total: productos.length,
      //       activos: productos.filter(p => p.activo).length,
      //       bajoStock: productos.filter(p => {
      //         return p.stock_actual === 0 || 
      //                (p.stock_actual > 0 && p.stock_actual <= (p.stock_minimo || 10));
      //       }).length,
      //       agotados: productos.filter(p => p.stock_actual <= 0).length,
      //       valorInventario: productos
      //         .filter(p => p.activo && p.stock_actual > 0)
      //         .reduce((total, p) => {
      //           const precio = p.precio_unitario || p.precio || 0;
      //           return total + (p.stock_actual * precio);
      //         }, 0)
      //     } : { total: 0, activos: 0, bajoStock: 0, agotados: 0, valorInventario: 0 };
          
      //     resumen.productos = estadisticasProductos;
      //     console.log('✅ Datos de productos cargados:', resumen.productos);
          
      //   } catch (error) {
      //     console.warn('⚠️ Error al cargar productos:', error.message);
      //     // Intentar usar datos que ya estén en el store como fallback
      //     const productos = rootState.productos.productos || [];
      //     if (productos.length > 0) {
      //       console.log('📋 Usando productos existentes del store:', productos.length);
      //       resumen.productos = {
      //         total: productos.length,
      //         activos: productos.filter(p => p.activo).length,
      //         bajoStock: productos.filter(p => {
      //           return p.stock_actual === 0 || 
      //                  (p.stock_actual > 0 && p.stock_actual <= (p.stock_minimo || 10));
      //         }).length,
      //         agotados: productos.filter(p => p.stock_actual <= 0).length,
      //         valorInventario: productos
      //           .filter(p => p.activo && p.stock_actual > 0)
      //           .reduce((total, p) => {
      //             const precio = p.precio_unitario || p.precio || 0;
      //             return total + (p.stock_actual * precio);
      //           }, 0)
      //       };
      //     }
      //   }
      // } else {
      //   console.warn('⚠️ Módulo productos no disponible');
      // }

      // Actualizar estado
      commit('SET_RESUMEN', resumen);
      
      // Cargar actividades recientes (opcional)
      try {
        await dispatch('cargarActividadesRecientes');
      } catch (error) {
        console.warn('⚠️ Error al cargar actividades recientes:', error.message);
      }
      
      return resumen;
      
    } catch (error) {
      console.error('❌ Error general al cargar resumen dashboard:', error);
      commit('SET_ERROR', error.message || 'Error al cargar datos del dashboard');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async cargarActividadesRecientes({ commit }) {
    try {
      // Aquí puedes implementar la carga de actividades desde una API
      // const actividades = await actividadService.obtenerRecientes();
      const actividades = []; // Placeholder
      commit('SET_ACTIVIDADES', actividades);
    } catch (error) {
      console.warn('⚠️ Error al cargar actividades recientes:', error);
    }
  },

  // Acción para forzar recarga de datos
  async recargarDatos({ dispatch }) {
    return await dispatch('cargarResumenDashboard');
  }
};

// ✅ FUNCIONES HELPER MEJORADAS

function calculateNewClients(clientes) {
  if (!Array.isArray(clientes)) return 0;
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 30); // Últimos 30 días
  
  return clientes.filter(cliente => {
    if (!cliente.createdAt && !cliente.fecha_creacion && !cliente.created_at) return false;
    
    const fechaCreacion = new Date(
      cliente.createdAt || 
      cliente.fecha_creacion || 
      cliente.created_at
    );
    
    return !isNaN(fechaCreacion.getTime()) && fechaCreacion >= fechaLimite;
  }).length;
}

function calculateNewProveedores(proveedores) {
  if (!Array.isArray(proveedores)) return 0;
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 30); // Últimos 30 días
  
  return proveedores.filter(proveedor => {
    if (!proveedor.createdAt && !proveedor.fecha_creacion && !proveedor.created_at) return false;
    
    const fechaCreacion = new Date(
      proveedor.createdAt || 
      proveedor.fecha_creacion || 
      proveedor.created_at
    );
    
    return !isNaN(fechaCreacion.getTime()) && fechaCreacion >= fechaLimite;
  }).length;
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};