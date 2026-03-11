import axios from 'axios'
import router from '@/router'
import store from '@/store'

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://localhost:7001/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para peticiones salientes
axiosInstance.interceptors.request.use(
  config => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    return config
  },
  error => Promise.reject(error)
)

// Interceptor para respuestas
axiosInstance.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401) {
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error)
      }

      console.warn('Token inválido o expirado, cerrando sesión...')
      await store.dispatch('auth/logout')
      router.push('/login')
    }

    switch (error.response?.status) {
      case 403:
        router.push('/forbidden')
        break

      case 404:
        if (!originalRequest.url.includes('/check/')) {
          console.error('Recurso no encontrado:', originalRequest.url)
        }
        break

      case 500:
        console.error('Error interno del servidor:', error.response.data)
        break
    }

    return Promise.reject(error)
  }
)

export default axiosInstance