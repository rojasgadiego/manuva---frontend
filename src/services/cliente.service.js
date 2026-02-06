// src/services/cliente.service.js
import axios from '@/plugins/axios';

const clienteService = {
  esIdValido(id) {
    if (!id) return false;
    const idStr = String(id).trim();
    if (idStr === '' || idStr === 'undefined' || idStr === 'null') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(idStr);
  },

  // ✅ CORREGIDO: Búsqueda específica con estructura de respuesta simplificada
  async buscarEspecifico(termino, limite = 10) {
    try {
      if (!termino || !termino.trim()) {
        throw new Error('Término de búsqueda requerido');
      }

      console.log('🔍 Búsqueda específica de clientes:', termino);
      
      const params = {
        q: termino.trim(),
        limite: limite
      };

      const response = await axios.get('/clientes/buscar', { params });
      
      // El backend ahora devuelve: { status: "success", message: "...", data: [...] }
      const wrapper = response.data;
      
      if (wrapper.status !== 'success') {
        throw new Error('Error en la respuesta del servidor');
      }
      
      // ✅ SIMPLIFICADO: Los clientes están directamente en wrapper.data
      const clientes = wrapper.data || [];
      
      // Validar que todos los clientes tengan ID válido
      const clientesValidos = clientes.filter(cliente => {
        if (!cliente.id || !this.esIdValido(cliente.id)) {
          console.warn('⚠️ Cliente con ID inválido encontrado:', cliente);
          return false;
        }
        return true;
      });

      
      return {
        clientes: clientesValidos,
        total: clientesValidos.length,
        termino: termino
      };

    } catch (error) {
      
      if (error.response?.status === 400) {
        throw new Error('Parámetros de búsqueda inválidos');
      }
      
      if (error.response?.status === 404) {
        // No encontró resultados - esto no debería ser un error
        return {
          clientes: [],
          total: 0,
          termino: termino
        };
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error en la búsqueda de clientes');
    }
  },

  // ✅ ACTUALIZADO: Obtener todos los clientes (usando filtro opcional)
  async getAll(filtro = '') {
    try {
      const params = {};
      if (filtro && filtro.trim()) {
        params.filtro = filtro.trim();
      }

      const response = await axios.get('/clientes', { params });
      
      // ✅ SIMPLIFICADO: Estructura estándar del backend
      const wrapper = response.data;
      let clientes;
      
      if (wrapper.status === 'success' && Array.isArray(wrapper.data)) {
        clientes = wrapper.data;
      } else if (Array.isArray(response.data)) {
        // Fallback para formato directo
        clientes = response.data;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response.data);
        clientes = [];
      }

      // Validar que todos los clientes tengan ID válido
      const clientesValidos = clientes.filter(cliente => {
        if (!cliente.id || !this.esIdValido(cliente.id)) {
          console.warn('⚠️ Cliente con ID inválido encontrado:', cliente);
          return false;
        }
        return true;
      });

      return clientesValidos;

    } catch (error) {
      
      if (error.response?.status === 404) {
        console.log('📭 No se encontraron clientes');
        return [];
      }
      
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver los clientes');
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener clientes');
    }
  },

  // ✅ ACTUALIZADO: Obtener un cliente por ID
  async obtenerPorId(id) {
    try {
      if (!this.esIdValido(id)) {
        throw new Error('ID de cliente inválido');
      }
      
      const response = await axios.get(`/clientes/${id}`);
      
      // ✅ SIMPLIFICADO: Estructura estándar del backend
      const wrapper = response.data;
      const cliente = wrapper.status === 'success' ? wrapper.data : wrapper;

      if (!cliente || !this.esIdValido(cliente.id)) {
        throw new Error('Cliente no encontrado o datos inválidos');
      }

      return cliente;

    } catch (error) {
      
      if (error.response?.status === 404) {
        throw new Error('Cliente no encontrado');
      }
      
      throw error;
    }
  },

  // ✅ CORREGIDO: Actualizar cliente (usa POST en lugar de PUT)
  async actualizar(id, clienteData) {
    try {
      if (!this.esIdValido(id)) {
        throw new Error('ID de cliente inválido');
      }

      console.log('📝 Actualizando cliente:', id);

      const updateClienteDto = {
        nombre: clienteData.nombre?.trim(),
        apellido: clienteData.apellido?.trim() || undefined,
        email: clienteData.email?.trim() || undefined,
        telefono: clienteData.telefono?.trim() || undefined,
        activo: clienteData.activo
      };

      // Remover campos undefined
      Object.keys(updateClienteDto).forEach(key => 
        updateClienteDto[key] === undefined && delete updateClienteDto[key]
      );

      const response = await axios.post(`/clientes/${id}`, updateClienteDto);
      
      // ✅ SIMPLIFICADO: Estructura estándar del backend
      const wrapper = response.data;
      const cliente = wrapper.status === 'success' ? wrapper.data : wrapper;

      return cliente;

    } catch (error) {
      
      if (error.response?.status === 404) {
        throw new Error('Cliente no encontrado');
      }
      
      if (error.response?.status === 409) {
        throw new Error('Ya existe un cliente con ese email');
      }
      
      throw error;
    }
  },

  // ✅ ACTUALIZADO: Crear cliente
  async crear(clienteData) {
    try {
      console.log('🏗️ Creando cliente:', clienteData);

      const createClienteDto = {
        nombre: clienteData.nombre.trim(),
        apellido: clienteData.apellido?.trim() || undefined,
        email: clienteData.email?.trim() || undefined,
        telefono: clienteData.telefono?.trim() || undefined,
        activo: clienteData.activo !== undefined ? clienteData.activo : true
      };

      const response = await axios.post('/clientes', createClienteDto);
      
      // ✅ SIMPLIFICADO: Estructura estándar del backend
      const wrapper = response.data;
      const cliente = wrapper.status === 'success' ? wrapper.data : wrapper;

      if (!cliente || !cliente.id || !this.esIdValido(cliente.id)) {
        throw new Error('No se recibió un cliente válido del servidor');
      }

      return cliente;

    } catch (error) {
      
      if (error.response?.status === 400) {
        throw new Error('Datos inválidos para crear el cliente');
      }
      
      if (error.response?.status === 409) {
        throw new Error('Ya existe un cliente con ese email');
      }
      
      throw error;
    }
  },

  // ✅ ACTUALIZADO: Eliminar cliente (soft delete)
  async eliminar(id) {
    try {
      if (!this.esIdValido(id)) {
        throw new Error('ID de cliente inválido');
      }

      const response = await axios.delete(`/clientes/${id}`);
      
      // ✅ SIMPLIFICADO: Para DELETE puede retornar confirmación simple
      const resultado = response.data;
      
      return resultado;

    } catch (error) {
      
      if (error.response?.status === 404) {
        throw new Error('Cliente no encontrado');
      }
      
      throw error;
    }
  },

  // ✅ NUEVO: Restaurar cliente eliminado
  async restaurar(id) {
    try {
      if (!this.esIdValido(id)) {
        throw new Error('ID de cliente inválido');
      }

      console.log('♻️ Restaurando cliente:', id);
      
      const response = await axios.post(`/clientes/${id}/restore`);
      
      // ✅ SIMPLIFICADO: Estructura estándar del backend
      const wrapper = response.data;
      const cliente = wrapper.status === 'success' ? wrapper.data : wrapper;

      console.log('✅ Cliente restaurado exitosamente');
      return cliente;

    } catch (error) {
      console.error('❌ Error restaurando cliente:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Cliente no encontrado');
      }
      
      throw error;
    }
  },

  // ✅ ACTUALIZADO: Buscar o crear cliente
  async buscarOCrear(datosCliente) {
    if (datosCliente.email) {
        const resultadoBusqueda = await this.buscarEspecifico(datosCliente.email);
          const clienteExistente = resultadoBusqueda.clientes.find(c => 
            c.email?.toLowerCase() === datosCliente.email.toLowerCase()
          );
          
          if (clienteExistente) {
            console.log('✅ Cliente encontrado:', clienteExistente.id);
            return clienteExistente.id;
          }
      }
      
      // Si no se encuentra, crear nuevo
      const cliente = await this.crear(datosCliente);
      
      return cliente.id;
  },

  // ✅ ACTUALIZADO: Buscar clientes (alias mejorado)
  async buscar(filtro) {
    // Si el filtro parece ser un término específico, usar búsqueda específica
    if (filtro && filtro.trim().length >= 2) {
      try {
        const resultado = await this.buscarEspecifico(filtro);
        return resultado.clientes;
      } catch (error) {
        return await this.getAll(filtro);
      }
    }
    
    // Para filtros vacíos o muy cortos, usar getAll
    return await this.getAll(filtro);
  },

  // ✅ ACTUALIZADO: Obtener estadísticas de clientes
  async obtenerEstadisticas() {
    try {
      const clientes = await this.getAll();
      
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      
      const estadisticas = {
        total: clientes.length,
        activos: clientes.filter(c => c.activo !== false).length,
        nuevos: clientes.filter(c => {
          const fechaCreacion = new Date(c.createdAt || c.created_at || c.fecha_creacion);
          return !isNaN(fechaCreacion.getTime()) && fechaCreacion >= fechaLimite;
        }).length
      };
      
      return estadisticas;
      
    } catch (error) {
      return { total: 0, activos: 0, nuevos: 0 };
    }
  }
};

export default clienteService;