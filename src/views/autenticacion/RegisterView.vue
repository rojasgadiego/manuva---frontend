<template>
  <AuthCard :titulo="paso === 'datos' ? 'Únete al club' : 'Verifica tu correo'" subtitulo="Registro de socios" :ancha="paso === 'datos'">

    <!-- Paso 1: datos -->
    <form v-if="paso === 'datos'" class="af-form" novalidate @submit.prevent="registrar">
      <div v-if="errorGeneral" class="af-alert" role="alert">{{ errorGeneral }}</div>

      <div class="af-grid">
        <label class="af-field">
          <span class="af-label">Nombres</span>
          <input v-model.trim="form.nombres" class="af-input" autocomplete="given-name" :aria-invalid="!!errores.nombres" />
          <span v-if="errores.nombres" class="af-error">{{ errores.nombres }}</span>
        </label>
        <label class="af-field">
          <span class="af-label">Apellido paterno</span>
          <input v-model.trim="form.apellidoPaterno" class="af-input" autocomplete="family-name" :aria-invalid="!!errores.apellidoPaterno" />
          <span v-if="errores.apellidoPaterno" class="af-error">{{ errores.apellidoPaterno }}</span>
        </label>
        <label class="af-field">
          <span class="af-label">Apellido materno <span class="af-hint">(opcional)</span></span>
          <input v-model.trim="form.apellidoMaterno" class="af-input" />
        </label>
        <label class="af-field">
          <span class="af-label">RUT</span>
          <input v-model.trim="form.rut" class="af-input" placeholder="12.345.678-9" :aria-invalid="!!errores.rut" @blur="validarCampo('rut')" />
          <span v-if="errores.rut" class="af-error">{{ errores.rut }}</span>
        </label>
        <label class="af-field">
          <span class="af-label">Fecha de nacimiento</span>
          <input v-model="form.fechaNacimiento" type="date" class="af-input" :max="maxNacimiento" :aria-invalid="!!errores.fechaNacimiento" />
          <span v-if="errores.fechaNacimiento" class="af-error">{{ errores.fechaNacimiento }}</span>
        </label>
        <label class="af-field">
          <span class="af-label">Género</span>
          <select v-model="form.genero" class="af-input">
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="O">Otro</option>
          </select>
        </label>
        <label class="af-field">
          <span class="af-label">Email</span>
          <input v-model.trim="form.email" type="email" class="af-input" autocomplete="email" :aria-invalid="!!errores.email" @blur="validarCampo('email')" />
          <span v-if="errores.email" class="af-error">{{ errores.email }}</span>
        </label>
        <label class="af-field">
          <span class="af-label">Teléfono <span class="af-hint">(opcional)</span></span>
          <input v-model.trim="form.telefono" type="tel" class="af-input" autocomplete="tel" placeholder="+569…" />
        </label>
        <label class="af-field af-full">
          <span class="af-label">Usuario</span>
          <input v-model.trim="form.username" class="af-input" autocomplete="username" :aria-invalid="!!errores.username" @blur="validarCampo('username')" />
          <span v-if="errores.username" class="af-error">{{ errores.username }}</span>
          <span v-else class="af-hint">Con este nombre iniciarás sesión.</span>
        </label>
        <label class="af-field">
          <span class="af-label">Contraseña</span>
          <input v-model="form.password" type="password" class="af-input" autocomplete="new-password" :aria-invalid="!!errores.password" @blur="validarCampo('password')" />
          <span v-if="errores.password" class="af-error">{{ errores.password }}</span>
          <span v-else class="af-hint">Mínimo 8 caracteres, con letras y números.</span>
        </label>
        <label class="af-field">
          <span class="af-label">Repite la contraseña</span>
          <input v-model="form.confirmacion" type="password" class="af-input" autocomplete="new-password" :aria-invalid="!!errores.confirmacion" @blur="validarCampo('confirmacion')" />
          <span v-if="errores.confirmacion" class="af-error">{{ errores.confirmacion }}</span>
        </label>
      </div>

      <button type="submit" class="af-submit" :disabled="enviando">{{ enviando ? 'Creando cuenta…' : 'Crear cuenta' }}</button>
    </form>

    <!-- Paso 2: código -->
    <form v-else class="af-form" @submit.prevent="verificar">
      <p class="af-hint af-center">Enviamos un código de 6 dígitos a <strong>{{ form.email }}</strong>. Ingrésalo para activar tu cuenta.</p>
      <div v-if="errorGeneral" class="af-alert" role="alert">{{ errorGeneral }}</div>
      <div v-if="aviso" class="af-alert af-alert--ok" role="status">{{ aviso }}</div>
      <label class="af-field">
        <span class="af-label">Código de verificación</span>
        <input v-model.trim="codigo" class="af-input af-codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required />
      </label>
      <button type="submit" class="af-submit" :disabled="enviando || codigo.length < 4">{{ enviando ? 'Verificando…' : 'Activar cuenta' }}</button>
      <button type="button" class="af-link af-center" :disabled="espera > 0" @click="reenviar">
        {{ espera > 0 ? `Puedes pedir otro código en ${espera} s` : '¿No te llegó? Reenviar código' }}
      </button>
    </form>

    <template #pie>
      ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
    </template>
  </AuthCard>
</template>

<script>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '@/components/auth/AuthCard.vue'
import authService from '@/services/auth.service'
import { useToast } from '@/utils/useToast'
import { mensajeError } from '@/utils/apiError'
import { rutValido, normalizarRut, problemaPassword, emailValido, usernameValido } from '@/utils/validators'
import '@/assets/styles/auth-form.css'

export default {
  name: 'RegisterView',
  components: { AuthCard },

  setup() {
    const router = useRouter()
    const { mostrarToast } = useToast()

    const paso = ref('datos')
    const enviando = ref(false)
    const errorGeneral = ref('')
    const aviso = ref('')
    const codigo = ref('')
    const espera = ref(0)
    let temporizador = null

    const hoy = new Date()
    const maxNacimiento = new Date(hoy.getFullYear() - 8, hoy.getMonth(), hoy.getDate()).toISOString().slice(0, 10)

    const form = reactive({
      nombres: '', apellidoPaterno: '', apellidoMaterno: '', rut: '', fechaNacimiento: '',
      genero: 'F', email: '', telefono: '', username: '', password: '', confirmacion: '',
    })
    const errores = reactive({})

    const reglas = {
      nombres:         () => (form.nombres ? '' : 'Ingresa tus nombres.'),
      apellidoPaterno: () => (form.apellidoPaterno ? '' : 'Ingresa tu apellido.'),
      rut:             () => (rutValido(form.rut) ? '' : 'RUT inválido: revisa el dígito verificador.'),
      fechaNacimiento: () => (form.fechaNacimiento ? '' : 'Ingresa tu fecha de nacimiento.'),
      email:           () => (emailValido(form.email) ? '' : 'Ingresa un email válido.'),
      username:        () => (usernameValido(form.username) ? '' : 'Entre 3 y 30 caracteres: letras, números, punto o guion.'),
      password:        () => problemaPassword(form.password) ?? '',
      confirmacion:    () => (form.confirmacion === form.password ? '' : 'Las contraseñas no coinciden.'),
    }

    const validarCampo = (campo) => { errores[campo] = reglas[campo]() }
    const validarTodo = () => {
      Object.keys(reglas).forEach(validarCampo)
      return Object.values(errores).every(e => !e)
    }

    const iniciarEspera = () => {
      espera.value = 30
      clearInterval(temporizador)
      temporizador = setInterval(() => { if (--espera.value <= 0) clearInterval(temporizador) }, 1000)
    }
    onUnmounted(() => clearInterval(temporizador))

    const registrar = async () => {
      errorGeneral.value = ''
      if (!validarTodo()) return
      enviando.value = true
      try {
        await authService.registro({
          username: form.username,
          password: form.password,
          rut: normalizarRut(form.rut),
          nombres: form.nombres,
          apellidoPaterno: form.apellidoPaterno,
          apellidoMaterno: form.apellidoMaterno || null,
          fechaNacimiento: form.fechaNacimiento,
          genero: form.genero,
          email: form.email,
          telefono: form.telefono || null,
        })
        paso.value = 'codigo'
        iniciarEspera()
      } catch (e) {
        errorGeneral.value = mensajeError(e, 'No se pudo crear la cuenta.')
      } finally {
        enviando.value = false
      }
    }

    const verificar = async () => {
      errorGeneral.value = ''
      enviando.value = true
      try {
        await authService.verificarEmail(form.email, codigo.value)
        mostrarToast('¡Cuenta activada! Ya puedes iniciar sesión.', 'success', 5000)
        router.push('/login')
      } catch (e) {
        errorGeneral.value = mensajeError(e, 'No se pudo verificar el código.')
      } finally {
        enviando.value = false
      }
    }

    const reenviar = async () => {
      errorGeneral.value = ''
      aviso.value = ''
      try {
        await authService.reenviarCodigo(form.email)
        aviso.value = 'Te enviamos un nuevo código.'
        iniciarEspera()
      } catch (e) {
        errorGeneral.value = mensajeError(e, 'No se pudo reenviar el código.')
      }
    }

    return { paso, form, errores, enviando, errorGeneral, aviso, codigo, espera, maxNacimiento, validarCampo, registrar, verificar, reenviar }
  },
}
</script>
