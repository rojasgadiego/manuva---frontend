import axios from 'axios'
import router from '@/router'
import store from '@/store'

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

//ruta bd prod
//https://colibri-app-backend-develop.up.railway.app/

//ruta dev
//http://localhost:3000/api


// Interceptor para peticiones salientes
axiosInstance.interceptors.request.use(
  config => {
    // Agregar indicador de petición AJAX
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    
    // Si la petición ya tiene un header de autorización, lo respetamos
    if (config.headers.Authorization) {
      return config
    }
    
    // Obtener token del store o localStorage
    const token = store.getters['auth/token'] || localStorage.getItem('token')
    
    // Si hay token, agregarlo al header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor para respuestas
axiosInstance.interceptors.response.use(
  // Respuesta exitosa
  response => response,
  
  // Error en la respuesta
  async error => {
    const originalRequest = error.config
    
    // Si es error de autenticación (401)
    if (error.response?.status === 401) {
      // Si es una petición de login que falló, simplemente rechazamos
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error)
      }
      
      // Para cualquier otro endpoint, si recibimos 401, cerramos sesión
      console.warn('Token inválido o expirado, cerrando sesión...')
      await store.dispatch('auth/logout')
      router.push('/login')
    }
    
    // Manejar otros errores HTTP
    switch (error.response?.status) {
      case 403:
        // Acceso prohibido
        router.push('/forbidden')
        break
        
      case 404:
        // Recurso no encontrado
        // Si no es una ruta de API específica que puede fallar normalmente
        if (!originalRequest.url.includes('/check/')) {
          console.error('Recurso no encontrado:', originalRequest.url)
        }
        break
        
      case 500:
        // Error del servidor
        console.error('Error interno del servidor:', error.response.data)
        break
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance