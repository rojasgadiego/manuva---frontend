<template>
  <form @submit.prevent="handleSubmit" class="login-form" novalidate>

    <!-- Error global -->
    <div v-if="errorMessage" class="alert-error" role="alert" aria-live="assertive">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Email -->
    <div class="form-group" :class="{ 'has-error': errors.email }">
      <label for="email">Correo electrónico</label>
      <div class="input-wrap">
        <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
        <input
          id="email"
          type="email"
          v-model.trim="formData.email"
          :disabled="isSubmitting"
          placeholder="tu@correo.cl"
          autocomplete="email"
          aria-required="true"
          :aria-invalid="!!errors.email"
          aria-describedby="email-error"
          @blur="validateEmail"
          @input="errors.email = ''"
        />
      </div>
      <p v-if="errors.email" id="email-error" class="error-msg">{{ errors.email }}</p>
    </div>

    <!-- Password -->
    <div class="form-group" :class="{ 'has-error': errors.password }">
      <div class="label-row">
        <label for="password">Contraseña</label>
        <a href="#" class="forgot-link" @click.prevent="$emit('forgot')">¿Olvidaste tu contraseña?</a>
      </div>
      <div class="input-wrap">
        <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <input
          id="password"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.password"
          :disabled="isSubmitting"
          placeholder="••••••••"
          autocomplete="current-password"
          aria-required="true"
          :aria-invalid="!!errors.password"
          aria-describedby="password-error"
          @blur="validatePassword"
          @input="errors.password = ''"
        />
        <button
          type="button"
          class="toggle-pw"
          @click="togglePassword"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          <!-- Ojo abierto -->
          <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <!-- Ojo tachado -->
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>
      </div>
      <p v-if="errors.password" id="password-error" class="error-msg">{{ errors.password }}</p>
    </div>

    <!-- Recordarme -->
    <div class="remember-row">
      <label class="checkbox-label">
        <input type="checkbox" v-model="formData.remember" :disabled="isSubmitting" />
        <span class="checkbox-custom"></span>
        Recordarme
      </label>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      class="submit-btn"
      :disabled="isSubmitting || !isFormValid"
      :aria-busy="isSubmitting"
    >
      <span v-if="isSubmitting" class="btn-loading">
        <span class="spinner"></span>
        Zarpando…
      </span>
      <span v-else>Ingresar</span>
    </button>

  </form>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'LoginForm',
  emits: ['forgot'],

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const formData = reactive({ email: '', password: '', remember: false })
    const errors = reactive({ email: '', password: '' })
    const isSubmitting = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')

    const validateEmail = () => {
      if (!formData.email) {
        errors.email = 'El correo es obligatorio'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Ingresa un correo válido'
      } else {
        errors.email = ''
      }
    }

    const validatePassword = () => {
      if (!formData.password) {
        errors.password = 'La contraseña es obligatoria'
      } else if (formData.password.length < 6) {
        errors.password = 'Debe tener al menos 6 caracteres'
      } else {
        errors.password = ''
      }
    }

    const isFormValid = computed(() =>
      formData.email && formData.password && !errors.email && !errors.password
    )

    const togglePassword = () => { showPassword.value = !showPassword.value }

    const handleSubmit = async () => {
      validateEmail()
      validatePassword()
      if (!isFormValid.value) return

      isSubmitting.value = true
      errorMessage.value = ''

      try {
        await store.dispatch('auth/login', {
          email: formData.email,
          password: formData.password,
          remember: formData.remember
        })
        router.push(route.query.redirect || '/dashboard')
      } catch (error) {
        showPassword.value = false
        errorMessage.value =
          error.response?.data?.message || 'Correo o contraseña incorrectos'
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      formData, errors, isSubmitting, showPassword,
      errorMessage, isFormValid,
      validateEmail, validatePassword, togglePassword, handleSubmit
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

/* ── Form ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Alert global ── */
.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 100, 100, 0.1);
  border: 1px solid rgba(239, 100, 100, 0.25);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fca5a5;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 400;
}

.alert-error p { margin: 0; }

/* ── Grupos ── */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
  letter-spacing: 0.3px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  color: rgba(116, 232, 160, 0.7);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover { color: #74e8a0; }

/* ── Input ── */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: rgba(255, 255, 255, 0.25);
  pointer-events: none;
  transition: color 0.25s;
}

.input-wrap input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 42px;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  outline: none;
  transition: all 0.25s ease;
}

.input-wrap input::placeholder { color: rgba(255, 255, 255, 0.2); }

.input-wrap input:focus {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(116, 232, 160, 0.45);
  box-shadow: 0 0 0 3px rgba(116, 232, 160, 0.08);
}

.input-wrap input:focus ~ .input-icon,
.input-wrap:focus-within .input-icon {
  color: rgba(116, 232, 160, 0.7);
}

.input-wrap input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error en input */
.has-error .input-wrap input {
  border-color: rgba(239, 100, 100, 0.5);
}

/* Toggle contraseña */
.toggle-pw {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-pw:hover { color: rgba(255, 255, 255, 0.6); }

/* Error de campo */
.error-msg {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  color: #f87171;
  margin: 0;
}

/* ── Recordarme ── */
.remember-row { margin-top: -4px; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 300;
  user-select: none;
}

.checkbox-label input[type="checkbox"] { display: none; }

.checkbox-custom {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-label input:checked + .checkbox-custom {
  background: #1d7850;
  border-color: #1d7850;
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '';
  width: 5px;
  height: 9px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg) translateY(-1px);
  display: block;
}

/* ── Botón ── */
.submit-btn {
  width: 100%;
  min-height: 46px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #1d7850, #0d4a5c);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(29, 120, 80, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(29, 120, 80, 0.45);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Spinner ── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: block;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>