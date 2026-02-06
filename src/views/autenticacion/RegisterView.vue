<template>
  <div class="register-container">
    <!-- Elementos decorativos de flores -->
    <div class="flower flower-1"></div>
    <div class="flower flower-2"></div>
    <div class="flower flower-3"></div>
    <div class="flower flower-4"></div>
    <div class="flower flower-5"></div>
    <div class="flower flower-6"></div>
    
    <div class="register-card">
      <!-- Logo y nombre de la florería -->
      <div class="brand-logo">
        <div class="colibri-icon">
          <div class="hummingbird"></div>
        </div>
        <h1 class="brand-name">Colibrí</h1>
      </div>
      <h2 class="register-title">Crear Cuenta</h2>
      
      <form @submit.prevent="handleSubmit" class="register-form">
        <!-- Alerta de error -->
        <div v-if="errorMessage" class="alert-error">
          <p>{{ errorMessage }}</p>
        </div>
        
        <!-- Nombre completo -->
        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            :class="{ 'input-error': errors.name }"
            required
            autocomplete="name"
          />
          <div v-if="errors.name" class="error-message">
            <p>{{ errors.name }}</p>
          </div>
        </div>
        
        <!-- Campo de email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            :class="{ 'input-error': errors.email }"
            required
            autocomplete="email"
          />
          <div v-if="errors.email" class="error-message">
            <p>{{ errors.email }}</p>
          </div>
        </div>
        
        <!-- Campo de contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="formData.password" 
              :class="{ 'input-error': errors.password }"
              required
              autocomplete="new-password"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <div v-if="errors.password" class="error-message">
            <p>{{ errors.password }}</p>
          </div>
        </div>
        
        <!-- Confirmar contraseña -->
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="formData.confirmPassword" 
              :class="{ 'input-error': errors.confirmPassword }"
              required
              autocomplete="new-password"
            />
          </div>
          <div v-if="errors.confirmPassword" class="error-message">
            <p>{{ errors.confirmPassword }}</p>
          </div>
        </div>
        
        <!-- Aceptar términos -->
        <div class="form-check">
          <input type="checkbox" id="terms" v-model="formData.terms" />
          <label for="terms">Acepto los <a href="#" class="terms-link">términos y condiciones</a></label>
          <div v-if="errors.terms" class="error-message-inline">
            <p>{{ errors.terms }}</p>
          </div>
        </div>
        
        <!-- Botón de envío -->
        <button 
          type="submit" 
          :disabled="isSubmitting" 
          class="register-button"
        >
          <span v-if="isSubmitting">
            <span class="spinner"></span>
            Creando cuenta...
          </span>
          <span v-else>Registrarse</span>
        </button>
      </form>
      
      <!-- Enlaces adicionales -->
      <div class="additional-links">
        <span>¿Ya tienes una cuenta?</span>
        <router-link to="/login">Iniciar Sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterView',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // Estado del formulario
    const formData = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    })
    
    // Estado de errores
    const errors = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: ''
    })
    
    // Estado de UI
    const isSubmitting = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')
    
    // Función para ajustar el tamaño de fuente según la altura de la ventana
    const adjustFontSize = () => {
      const vh = window.innerHeight;
      const root = document.documentElement;
      
      // Ajustar tamaños de fuente y espaciado basados en la altura de la ventana
      if (vh < 600) {
        root.style.setProperty('--font-scale', '0.8');
        root.style.setProperty('--spacing-scale', '0.75');
      } else if (vh < 700) {
        root.style.setProperty('--font-scale', '0.85');
        root.style.setProperty('--spacing-scale', '0.85');
      } else if (vh < 800) {
        root.style.setProperty('--font-scale', '0.9');
        root.style.setProperty('--spacing-scale', '0.9');
      } else {
        root.style.setProperty('--font-scale', '1');
        root.style.setProperty('--spacing-scale', '1');
      }
    }
    
    // Escuchar cambios de tamaño de ventana
    onMounted(() => {
      adjustFontSize();
      window.addEventListener('resize', adjustFontSize);
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', adjustFontSize);
    })
    
    // Validar el formulario
    const validateForm = () => {
      let isValid = true
      
      // Restablecer errores
      Object.keys(errors).forEach(key => {
        errors[key] = ''
      })
      errorMessage.value = ''
      
      // Validar nombre
      if (!formData.name.trim()) {
        errors.name = 'El nombre es obligatorio'
        isValid = false
      } else if (formData.name.trim().length < 3) {
        errors.name = 'El nombre debe tener al menos 3 caracteres'
        isValid = false
      }
      
      // Validar email
      if (!formData.email) {
        errors.email = 'El email es obligatorio'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Debe ser un email válido'
        isValid = false
      }
      
      // Validar contraseña
      if (!formData.password) {
        errors.password = 'La contraseña es obligatoria'
        isValid = false
      } else if (formData.password.length < 6) {
        errors.password = 'Debe tener al menos 6 caracteres'
        isValid = false
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Debe incluir al menos una letra mayúscula'
        isValid = false
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Debe incluir al menos un número'
        isValid = false
      }
      
      // Validar confirmación de contraseña
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Por favor confirma tu contraseña'
        isValid = false
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden'
        isValid = false
      }
      
      // Validar términos
      if (!formData.terms) {
        errors.terms = 'Debes aceptar los términos'
        isValid = false
      }
      
      return isValid
    }
    
    // Manejar envío del formulario
    const handleSubmit = async () => {
      // Validar el formulario
      if (!validateForm()) return
      
      // Indicar carga
      isSubmitting.value = true
      errorMessage.value = ''
      
      try {
        // Preparar datos para el registro
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
        
        // Llamar a la acción de registro en el store
        await store.dispatch('auth/register', userData)
        
        // Si el registro es exitoso, redirigir al dashboard o login según configuración
        router.push('/dashboard')
      } catch (error) {
        // Manejar error de registro
        console.error('Error en registro:', error)
        
        // Extraer mensaje de error
        if (error.response?.data) {
          errorMessage.value = error.response.data.message || 'Error en el registro'
          
          // Manejar errores específicos de campos
          if (error.response.data.errors) {
            const serverErrors = error.response.data.errors
            Object.keys(serverErrors).forEach(field => {
              if (errors[field] !== undefined) {
                errors[field] = serverErrors[field]
              }
            })
          }
        } else {
          errorMessage.value = error.message || 'Error al comunicarse con el servidor'
        }
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      formData,
      errors,
      isSubmitting,
      showPassword,
      errorMessage,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* Variables CSS para escalado responsivo */
:root {
  --font-scale: 1;
  --spacing-scale: 1;
}

/* Reset de altura y eliminación de scrollbars */
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

/* Estilo base para el contenedor de registro */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f5ff;
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(to bottom right, #f0f6ff, #fef4ff);
}

/* Estilos para las flores decorativas */
.flower {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.7;
  z-index: 0;
}

.flower-1 {
  top: 5%;
  left: 5%;
  width: calc(100px * var(--spacing-scale));
  height: calc(100px * var(--spacing-scale));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm-20 20c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm40 0c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm-20 20c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10z' fill='%23ff86d9'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23ffde7d'/%3E%3C/svg%3E");
  transform: rotate(15deg);
  animation: floatAnimation 15s ease-in-out infinite alternate;
}

.flower-2 {
  top: 8%;
  right: 10%;
  width: calc(85px * var(--spacing-scale));
  height: calc(85px * var(--spacing-scale));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8zm-25 15c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8zm50 0c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8zm-25 35c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8z' fill='%23c19bff'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23ffd952'/%3E%3C/svg%3E");
  transform: rotate(-10deg);
  animation: floatAnimation 12s ease-in-out infinite alternate-reverse;
}

.flower-3 {
  bottom: 10%;
  left: 15%;
  width: calc(70px * var(--spacing-scale));
  height: calc(70px * var(--spacing-scale));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15zm-25 25c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15zm50 0c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15zm-25 25c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z' fill='%2386D9B4'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23ffde7d'/%3E%3C/svg%3E");
  transform: rotate(25deg);
  animation: floatAnimation 20s ease-in-out infinite alternate;
}

.flower-4 {
  bottom: 7%;
  right: 7%;
  width: calc(90px * var(--spacing-scale));
  height: calc(90px * var(--spacing-scale));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10c-8 0-15 8-15 20s7 20 15 20 15-8 15-20-7-20-15-20zm-25 25c-8 0-15 8-15 20s7 20 15 20 15-8 15-20-7-20-15-20zm50 0c-8 0-15 8-15 20s7 20 15 20 15-8 15-20-7-20-15-20z' fill='%23ff9b90'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23ffde7d'/%3E%3C/svg%3E");
  transform: rotate(-20deg);
  animation: floatAnimation 25s ease-in-out infinite alternate-reverse;
}

.flower-5 {
  top: 40%;
  left: 3%;
  width: calc(60px * var(--spacing-scale));
  height: calc(60px * var(--spacing-scale));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm-20 20c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm40 0c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm-40 40c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm40 0c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10z' fill='%23b4a7d6'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23ffde7d'/%3E%3C/svg%3E");
  transform: rotate(35deg);
  animation: floatAnimation 18s ease-in-out infinite alternate;
}

.flower-6 {
  top: 35%;
  right: 3%;
  width: calc(75px * var(--spacing-scale));
  height: calc(75px * var(--spacing-scale));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8zm-25 15c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8zm50 0c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8zm-25 35c-3 0-7 3-10 8s-3 10 0 15 7 8 10 8 7-3 10-8 3-10 0-15-7-8-10-8z' fill='%23d5a6bd'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23ffd952'/%3E%3C/svg%3E");
  transform: rotate(-15deg);
  animation: floatAnimation 16s ease-in-out infinite alternate-reverse;
}

@keyframes floatAnimation {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(-10px, 5px) rotate(5deg);
  }
  66% {
    transform: translate(10px, -5px) rotate(-5deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

/* Estilos para la tarjeta de registro */
.register-card {
  width: 100%;
  max-width: calc(420px * var(--spacing-scale));
  padding: calc(25px * var(--spacing-scale));
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(190, 150, 230, 0.1);
  backdrop-filter: blur(5px);
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95));
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
}

/* Estilizar scrollbar de la tarjeta si es necesario */
.register-card::-webkit-scrollbar {
  width: 6px;
}

.register-card::-webkit-scrollbar-track {
  background-color: rgba(240, 240, 240, 0.5);
  border-radius: 10px;
}

.register-card::-webkit-scrollbar-thumb {
  background-color: rgba(116, 60, 250, 0.3);
  border-radius: 10px;
}

/* Logo y nombre de la florería */
.brand-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: calc(10px * var(--spacing-scale));
}

.colibri-icon {
  width: calc(50px * var(--spacing-scale));
  height: calc(50px * var(--spacing-scale));
  margin-bottom: calc(5px * var(--spacing-scale));
  position: relative;
}

.hummingbird {
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M60 20c-5 0-20 5-30 15s-15 25-15 30c0 5 5 5 10 0s10-15 20-20c10-5 20-5 25-10c5-5 0-15-10-15z' fill='%23a073ff'/%3E%3Cpath d='M70 25c-5 5-15 5-25 10c-10 5-15 15-20 20c-5 5-10 5-10 0' stroke='%23743cfa' stroke-width='2' fill='none'/%3E%3Ccircle cx='70' cy='30' r='5' fill='white'/%3E%3Cpath d='M80 20l-15 5' stroke='%23333' stroke-width='1' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  animation: hoverAnimation 3s ease-in-out infinite;
}

@keyframes hoverAnimation {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(0, -5px);
  }
}

.brand-name {
  font-family: 'Pacifico', cursive, sans-serif;
  color: #743cfa;
  font-size: calc(2rem * var(--font-scale));
  margin: 0;
  text-shadow: 1px 1px 2px rgba(116, 60, 250, 0.3);
}

.register-title {
  text-align: center;
  margin-bottom: calc(15px * var(--spacing-scale));
  color: #4a4a4a;
  font-size: calc(1.3rem * var(--font-scale));
  font-weight: 500;
}

/* Estilos del formulario */
.register-form {
  display: flex;
  flex-direction: column;
  gap: calc(12px * var(--spacing-scale));
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

label {
  margin-bottom: calc(5px * var(--spacing-scale));
  font-weight: 600;
  color: #5d5d5d;
  font-size: calc(0.9rem * var(--font-scale));
  text-align: left;
}

input {
  padding: calc(10px * var(--spacing-scale));
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: calc(0.95rem * var(--font-scale));
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.9);
}

input:focus {
  outline: none;
  border-color: #a073ff;
  box-shadow: 0 0 0 2px rgba(160, 115, 255, 0.2);
}

.input-error {
  border-color: #f44336;
}

.password-input {
  position: relative;
  display: flex;
}

.password-input input {
  flex: 1;
  padding-right: calc(80px * var(--spacing-scale));
}

.toggle-password {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  padding: 0 15px;
  background: transparent;
  border: none;
  border-left: 1px solid #ddd;
  cursor: pointer;
  font-size: calc(0.85rem * var(--font-scale));
  color: #555;
  transition: all 0.3s;
}

.toggle-password:hover {
  background-color: #f5f5f5;
}

.form-check {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
}

.form-check input[type="checkbox"] {
  width: calc(16px * var(--spacing-scale));
  height: calc(16px * var(--spacing-scale));
  margin-top: 3px;
  accent-color: #a073ff;
}

.form-check label {
  margin-bottom: 0;
  font-size: calc(0.85rem * var(--font-scale));
  font-weight: normal;
  flex: 1;
}

.terms-link {
  color: #743cfa;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.error-message-inline {
  color: #f44336;
  font-size: calc(0.75rem * var(--font-scale));
  margin-left: calc(24px * var(--spacing-scale));
}

.register-button {
  padding: calc(10px * var(--spacing-scale));
  background-color: #743cfa;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: calc(0.95rem * var(--font-scale));
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(42px * var(--spacing-scale));
  margin-top: calc(5px * var(--spacing-scale));
  box-shadow: 0 4px 8px rgba(116, 60, 250, 0.2);
}

.register-button:hover:not(:disabled) {
  background-color: #6230e0;
  box-shadow: 0 6px 12px rgba(116, 60, 250, 0.3);
}

.register-button:disabled {
  background-color: #b9a4e6;
  cursor: not-allowed;
  box-shadow: none;
}

.spinner {
  display: inline-block;
  width: calc(18px * var(--spacing-scale));
  height: calc(18px * var(--spacing-scale));
  margin-right: calc(8px * var(--spacing-scale));
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert-error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #d32f2f;
  padding: calc(10px * var(--spacing-scale));
  border-radius: 4px;
  margin-bottom: calc(5px * var(--spacing-scale));
  font-size: calc(0.85rem * var(--font-scale));
}

.error-message {
  color: #f44336;
  font-size: calc(0.75rem * var(--font-scale));
  margin-top: calc(4px * var(--spacing-scale));
  text-align: left;
}

.error-message p {
  margin: 2px 0;
}

.additional-links {
  margin-top: calc(15px * var(--spacing-scale));
  text-align: center;
  font-size: calc(0.85rem * var(--font-scale));
}

.additional-links a {
  color: #743cfa;
  text-decoration: none;
  margin-left: 5px;
  transition: color 0.3s;
}

.additional-links a:hover {
  color: #6230e0;
  text-decoration: underline;
}

/* Media queries para diferentes tamaños de pantalla */
@media (max-height: 700px) {
  .brand-logo {
    margin-bottom: 3px;
  }
  
  .colibri-icon {
    width: 35px;
    height: 35px;
    margin-bottom: 0;
  }
  
  .brand-name {
    font-size: 1.6rem;
  }
  
  .register-title {
    margin-bottom: 8px;
    font-size: 1rem;
  }
  
  .register-form {
    gap: 8px;
  }
  
  .form-group {
    margin-bottom: 0;
  }
  
  .additional-links {
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .register-card {
    max-width: 90%;
    padding: 15px;
  }
  
  .flower {
    opacity: 0.3;
    transform: scale(0.6);
  }
}
</style>