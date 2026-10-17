<template>
  <AuthCard titulo="Recupera tu acceso" subtitulo="Club Canotaje">

    <!-- Paso 1: email -->
    <form v-if="paso === 'email'" class="af-form" @submit.prevent="solicitar">
      <p class="af-hint af-center">Ingresa el email con que te registraste y te enviaremos un código.</p>
      <div v-if="error" class="af-alert" role="alert">{{ error }}</div>
      <label class="af-field">
        <span class="af-label">Email</span>
        <input v-model.trim="email" type="email" class="af-input" autocomplete="email" required />
      </label>
      <button type="submit" class="af-submit" :disabled="enviando || !emailValido(email)">{{ enviando ? 'Enviando…' : 'Enviar código' }}</button>
    </form>

    <!-- Paso 2: código + nueva contraseña -->
    <form v-else class="af-form" @submit.prevent="restablecer">
      <div class="af-alert af-alert--ok" role="status">
        Si <strong>{{ email }}</strong> está registrado, te llegará un código válido por 30 minutos.
      </div>
      <div v-if="error" class="af-alert" role="alert">{{ error }}</div>
      <label class="af-field">
        <span class="af-label">Código</span>
        <input v-model.trim="codigo" class="af-input af-codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required />
      </label>
      <label class="af-field">
        <span class="af-label">Nueva contraseña</span>
        <input v-model="password" type="password" class="af-input" autocomplete="new-password" :aria-invalid="!!problema" required />
        <span v-if="password && problema" class="af-error">{{ problema }}</span>
        <span v-else class="af-hint">Mínimo 8 caracteres, con letras y números.</span>
      </label>
      <label class="af-field">
        <span class="af-label">Repite la contraseña</span>
        <input v-model="confirmacion" type="password" class="af-input" autocomplete="new-password" required />
        <span v-if="confirmacion && confirmacion !== password" class="af-error">Las contraseñas no coinciden.</span>
      </label>
      <button type="submit" class="af-submit" :disabled="enviando || !puedeEnviar">{{ enviando ? 'Guardando…' : 'Cambiar contraseña' }}</button>
      <button type="button" class="af-link af-center" @click="paso = 'email'">Usar otro email</button>
    </form>
  </AuthCard>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '@/components/auth/AuthCard.vue'
import authService from '@/services/auth.service'
import { useToast } from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'
import { problemaPassword, emailValido } from '@/utils/validators'
import '@/assets/styles/auth-form.css'

export default {
  name: 'RecuperarPasswordView',
  components: { AuthCard },

  setup() {
    const router = useRouter()
    const { mostrarToast } = useToast()

    const paso = ref('email')
    const email = ref('')
    const codigo = ref('')
    const password = ref('')
    const confirmacion = ref('')
    const enviando = ref(false)
    const error = ref('')

    const problema = computed(() => problemaPassword(password.value))
    const puedeEnviar = computed(() => codigo.value.length >= 4 && !problema.value && confirmacion.value === password.value)

    const solicitar = async () => {
      error.value = ''
      enviando.value = true
      try {
        // La API responde OK aunque el email no exista (no revela qué cuentas hay)
        await authService.recuperarPassword(email.value)
        paso.value = 'codigo'
      } catch (e) {
        error.value = mensajeError(e, 'No se pudo enviar el código.')
      } finally {
        enviando.value = false
      }
    }

    const restablecer = async () => {
      error.value = ''
      enviando.value = true
      try {
        await authService.resetPassword(email.value, codigo.value, password.value)
        mostrarToast('Contraseña actualizada. Inicia sesión con la nueva.', 'success', 5000)
        router.push('/login')
      } catch (e) {
        error.value = mensajeError(e, 'No se pudo cambiar la contraseña.')
      } finally {
        enviando.value = false
      }
    }

    return { paso, email, codigo, password, confirmacion, enviando, error, problema, puedeEnviar, solicitar, restablecer, emailValido }
  },
}
</script>
