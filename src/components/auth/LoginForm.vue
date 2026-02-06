<template>
  <form @submit.prevent="handleSubmit" class="login-form" novalidate>
    <!-- Error global -->
    <div
      v-if="errorMessage"
      class="alert-error"
      role="alert"
      aria-live="assertive"
    >
      <span class="error-icon">⚠️</span>
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Email -->
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        v-model.trim="formData.email"
        :disabled="isSubmitting"
        :class="{ 'input-error': errors.email }"
        placeholder="navegante@email.com"
        autocomplete="email"
        aria-required="true"
        :aria-invalid="!!errors.email"
        aria-describedby="email-error"
        @blur="validateEmail"
        @input="errors.email = ''"
      />
      <p v-if="errors.email" id="email-error" class="error-message">
        {{ errors.email }}
      </p>
    </div>

    <!-- Password -->
    <div class="form-group">
      <label for="password">Contraseña</label>
      <div class="password-input">
        <input
          id="password"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.password"
          :disabled="isSubmitting"
          :class="{ 'input-error': errors.password }"
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
          class="toggle-password"
          @click="togglePassword"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          👁
        </button>
      </div>
      <p v-if="errors.password" id="password-error" class="error-message">
        {{ errors.password }}
      </p>
    </div>

    <!-- Remember -->
    <!-- <div class="form-check">
      <input
        id="remember"
        type="checkbox"
        v-model="formData.remember"
        :disabled="isSubmitting"
      />
      <label for="remember">Mantener sesión activa</label>
    </div> -->

    <!-- Submit -->
    <button
      type="submit"
      class="login-button"
      :disabled="isSubmitting || !isFormValid"
      aria-busy="isSubmitting"
    >
      <span v-if="isSubmitting">
        <span class="spinner"></span>
        Zarpando…
      </span>
      <span v-else>
        Zarpar
      </span>
    </button>
  </form>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'LoginForm',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const formData = reactive({
      email: '',
      password: '',
    })

    const errors = reactive({
      email: '',
      password: ''
    })

    const isSubmitting = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')

    /* ========= VALIDATION ========= */

    const validateEmail = () => {
      if (!formData.email) {
        errors.email = 'El email es obligatorio'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Ingresa un email válido'
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
      formData.email &&
      formData.password &&
      !errors.email &&
      !errors.password
    )

    /* ========= ACTIONS ========= */

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

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
          error.response?.data?.message ||
          'Email o contraseña incorrectos'
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
      isFormValid,
      validateEmail,
      validatePassword,
      togglePassword,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* ===== FORM ===== */
.login-form {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ===== GROUP ===== */
.form-group {
  display: flex;
  flex-direction: column;
}

/* ===== LABEL ===== */
label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #1e3a5f;
}

/* ===== INPUT ===== */
input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: 10px;
  border: 2px solid #b8d4e8;
  font-size: 1rem;
  transition: border-color .2s, box-shadow .2s;
}

input:focus {
  outline: none;
  border-color: #3282b8;
  box-shadow: 0 0 0 4px rgba(50,130,184,.15);
}

input:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.input-error {
  border-color: #d32f2f;
  background: #fdecea;
}

/* ===== PASSWORD ===== */
.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  opacity: .6;
}

.toggle-password:hover {
  opacity: 1;
}

/* ===== ERROR ===== */
.error-message {
  margin-top: 6px;
  font-size: .85rem;
  color: #d32f2f;
}

/* ===== ALERT ===== */
.alert-error {
  display: flex;
  gap: 10px;
  padding: 14px;
  border-radius: 8px;
  background: #fdecea;
  color: #b71c1c;
}

/* ===== CHECK ===== */
.form-check {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-check label {
  cursor: pointer;
}

/* ===== BUTTON ===== */
.login-button {
  width: 100%;
  height: 56px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #0f4c75, #3282b8);
  color: white;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(15,76,117,.4);
}

.login-button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* ===== SPINNER ===== */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
