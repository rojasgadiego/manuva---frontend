import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

async function bootstrap() {

  const app = createApp(App)

  app.use(store)
  app.use(router)

  try {
    await store.dispatch('auth/initAuth')
    console.log('Auth inicializada')
  } catch (error) {
    console.error('Error inicializando auth', error)
  }

  app.mount('#app')
}

bootstrap()