import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Crear la instancia de la aplicación
const app = createApp(App)

// Configurar plugins
app.use(store)
app.use(router)

// Inicializar estado de autenticación antes de montar la aplicación
store.dispatch('auth/initAuth')
  .then(isAuthenticated => {
    console.log('Estado de autenticación inicializado:', isAuthenticated ? 'Autenticado' : 'No autenticado')
  })
  .catch(error => {
    console.error('Error al inicializar autenticación:', error)
  })
  .finally(() => {
    // Montar la aplicación después de intentar inicializar
    app.mount('#app')
  })