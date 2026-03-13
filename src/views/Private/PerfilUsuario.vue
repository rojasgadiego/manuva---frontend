<template>
  <AppLayout>
    <div class="perfil">

      <!-- Carga -->
      <div v-if="cargando" class="perfil__estado">
        <div class="spinner"></div>
        <span>Cargando perfil…</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="perfil__estado perfil__estado--error">
        <span>⚠ {{ error }}</span>
      </div>

      <!-- Contenido -->
      <template v-else-if="usuario">
        <div class="perfil__inner">

          <!-- ── Header + stats en una sola fila ── -->
          <header class="perfil__header">
            <div class="avatar">
              <img v-if="usuario.remador?.fotoUrl" :src="usuario.remador.fotoUrl" class="avatar__img" />
              <div v-else class="avatar__initials">{{ iniciales }}</div>
              <span class="avatar__dot" :class="usuario.activo ? 'dot--on' : 'dot--off'"></span>
            </div>

            <div class="header__identity">
              <h1 class="identity__nombre">
                {{ usuario.remador?.nombreCompleto ?? usuario.username }}
              </h1>
              <p class="identity__user">@{{ usuario.username }}</p>
              <div class="identity__tags">
                <span class="tag tag--cyan">{{ usuario.rol }}</span>
                <span v-if="usuario.remador" class="tag tag--indigo">
                  {{ usuario.remador.categoria }}
                </span>
              </div>
            </div>

            <div class="header__stats">
              <div class="stat-cell">
                <span class="stat-cell__label">Estado</span>
                <span class="stat-cell__value" :class="usuario.activo ? 'val--green' : 'val--red'">
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="stat-cell">
                <span class="stat-cell__label">Email</span>
                <span class="stat-cell__value" :class="usuario.emailVerificado ? 'val--green' : 'val--red'">
                  {{ usuario.emailVerificado ? 'Verificado' : 'Sin verificar' }}
                </span>
              </div>
              <div class="stat-cell">
                <span class="stat-cell__label">Miembro desde</span>
                <span class="stat-cell__value">{{ formatFecha(usuario.fechaCreacion) }}</span>
              </div>
              <div class="stat-cell stat-cell--last">
                <span class="stat-cell__label">Último acceso</span>
                <span class="stat-cell__value">{{ formatFechaHora(usuario.ultimoAcceso) }}</span>
              </div>
            </div>
          </header>

          <!-- ── Grid de cards ── -->
          <div v-if="usuario.remador" class="cards-grid">

            <div class="card card--cyan">
              <div class="card__accent"></div>
              <div class="card__body">
                <div class="card__head">
                  <span class="card__icon">👤</span>
                  <h3>Datos personales</h3>
                </div>
                <div class="card__rows">
                  <div class="row">
                    <span>RUT</span>
                    <b>{{ usuario.remador.rut }}</b>
                  </div>
                  <div class="row">
                    <span>Nacimiento</span>
                    <b>{{ formatFechaSimple(usuario.remador.fechaNacimiento) }}</b>
                  </div>
                  <div class="row">
                    <span>Género</span>
                    <b>{{ usuario.remador.genero === 'M' ? 'Masculino' : 'Femenino' }}</b>
                  </div>
                  <div class="row">
                    <span>Ingreso al club</span>
                    <b>{{ formatFechaSimple(usuario.remador.fechaIngreso) }}</b>
                  </div>
                </div>
              </div>
            </div>

            <div class="card card--indigo">
              <div class="card__accent"></div>
              <div class="card__body">
                <div class="card__head">
                  <span class="card__icon">📞</span>
                  <h3>Contacto</h3>
                </div>
                <div class="card__rows">
                  <div class="row">
                    <span>Email</span>
                    <b>{{ usuario.remador.email }}</b>
                  </div>
                  <div class="row">
                    <span>Teléfono</span>
                    <b>{{ usuario.remador.telefono ?? '—' }}</b>
                  </div>
                  <div class="row">
                    <span>Dirección</span>
                    <b>{{ usuario.remador.direccion ?? '—' }}</b>
                  </div>
                </div>
              </div>
            </div>

            <div class="card card--amber">
              <div class="card__accent"></div>
              <div class="card__body">
                <div class="card__head">
                  <span class="card__icon">🚨</span>
                  <h3>Emergencia</h3>
                </div>
                <div class="card__rows">
                  <div class="row">
                    <span>Contacto</span>
                    <b>{{ usuario.remador.nombreContactoEmergencia ?? '—' }}</b>
                  </div>
                  <div class="row">
                    <span>Teléfono</span>
                    <b>{{ usuario.remador.telefonoEmergencia ?? '—' }}</b>
                  </div>
                </div>
              </div>
            </div>

            <div class="card card--green">
              <div class="card__accent"></div>
              <div class="card__body">
                <div class="card__head">
                  <span class="card__icon">🛶</span>
                  <h3>Equipamiento</h3>
                </div>
                <div class="card__rows">
                  <div class="row">
                    <span>Remo propio</span>
                    <b :class="usuario.remador.tieneRemoPropio ? 'val--green' : 'val--red'">
                      {{ usuario.remador.tieneRemoPropio ? 'Sí' : 'No' }}
                    </b>
                  </div>
                  <div class="row">
                    <span>Salvavidas</span>
                    <b :class="usuario.remador.tieneSalvavidasPropio ? 'val--green' : 'val--red'">
                      {{ usuario.remador.tieneSalvavidasPropio ? 'Sí' : 'No' }}
                    </b>
                  </div>
                  <div class="row">
                    <span>Cert. médica</span>
                    <b>{{ usuario.remador.certMedicaVence
                      ? formatFechaSimple(usuario.remador.certMedicaVence)
                      : '—' }}</b>
                  </div>
                </div>
              </div>
            </div>

            <div class="card card--wide card--cyan" v-if="usuario.remador.observaciones">
              <div class="card__accent"></div>
              <div class="card__body">
                <div class="card__head">
                  <span class="card__icon">📝</span>
                  <h3>Observaciones</h3>
                </div>
                <p class="card__obs">{{ usuario.remador.observaciones }}</p>
              </div>
            </div>

          </div>

        </div>
      </template>

    </div>
  </AppLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import usuarioService from '@/services/usuario.service'

export default defineComponent({
  name: 'PerfilUsuario',
  components: { AppLayout },

  setup() {
    const usuario  = ref(null)
    const cargando = ref(false)
    const error    = ref(null)

    const cargarPerfil = async () => {
      cargando.value = true
      error.value = null
      try {
        const res = await usuarioService.me()
        usuario.value = res.data?.data ?? null
      } catch (e) {
        error.value = e.response?.data?.message ?? e.message ?? 'Error al cargar el perfil.'
      } finally {
        cargando.value = false
      }
    }

    onMounted(cargarPerfil)

    const iniciales = computed(() => {
      const n = usuario.value?.remador?.nombreCompleto ?? usuario.value?.username ?? ''
      return n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    })

    const formatFecha = (iso) => {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('es-CL', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    }
    const formatFechaHora = (iso) => {
      if (!iso) return '—'
      return new Date(iso).toLocaleString('es-CL', {
        dateStyle: 'short', timeStyle: 'short',
      })
    }
    const formatFechaSimple = (val) => {
      if (!val) return '—'
      const [y, m, d] = val.toString().substring(0, 10).split('-')
      return `${d}/${m}/${y}`
    }

    return {
      usuario, cargando, error, iniciales,
      formatFecha, formatFechaHora, formatFechaSimple,
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ─────────────────────────────────────────────────────
   Variables de estado — fijas en ambos temas
   Los colores de superficie se heredan del AppLayout
───────────────────────────────────────────────────── */
.perfil {
  font-family: 'Inter', sans-serif;
  height: 100%;
  width: 100%;
  display: flex;
  background: var(--content-bg, #f8fafc);
  overflow: hidden;
  transition: background 0.25s ease;

  --cyan:       #38bdf8;
  --indigo:     #818cf8;
  --amber:      #f59e0b;
  --green:      #22c55e;
  --red:        #ef4444;
}

/* ── Estados ───────────────────────────────────────── */
.perfil__estado {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  color: var(--text-secondary, #64748b);
  font-size: 0.875rem;
}
.perfil__estado--error { color: var(--red); }

.spinner {
  width: 26px; height: 26px;
  border: 2.5px solid var(--surface-border, #e2e8f0);
  border-top-color: var(--cyan);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Layout interior ───────────────────────────────── */
/* ── Layout interior ───────────────────────────────── */
.perfil__inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-border, #e2e8f0) transparent;
}

.perfil__inner > header,
.perfil__inner > .cards-grid {
  width: 100%;
}

/* ── Header unificado (identidad + stats en una fila) ── */
.perfil__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  flex-shrink: 0;
  transition: background 0.25s ease, border-color 0.25s ease;
}

/* Avatar */
.avatar { position: relative; flex-shrink: 0; }

.avatar__img,
.avatar__initials {
  width: 48px; height: 48px;
  border-radius: 12px;
}
.avatar__img { object-fit: cover; }

.avatar__initials {
  background: linear-gradient(135deg, var(--cyan), var(--indigo));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0c1017;
}

.avatar__dot {
  position: absolute;
  bottom: -2px; right: -2px;
  width: 11px; height: 11px;
  border-radius: 50%;
  border: 2px solid var(--surface-bg, #ffffff);
  transition: border-color 0.25s ease;
}
.dot--on  { background: var(--green); }
.dot--off { background: var(--red); }

/* Identity — bloque izquierdo compacto */
.header__identity {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-shrink: 0;
  padding-right: 16px;
  border-right: 0.5px solid var(--surface-border, #e2e8f0);
}

.identity__nombre {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  letter-spacing: -0.2px;
  line-height: 1.2;
  white-space: nowrap;
  transition: color 0.25s ease;
}

.identity__user {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  margin: 2px 0 7px;
}

.identity__tags { display: flex; gap: 4px; flex-wrap: wrap; }

.tag {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
}
.tag--cyan   { background: rgba(56, 189, 248, 0.12); color: #0ea5d9; }
.tag--indigo { background: rgba(129, 140, 248, 0.12); color: #7c87e8; }

/* Stats — bloque derecho que ocupa el resto */
.header__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  flex: 1;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 14px;
  border-right: 0.5px solid var(--surface-border, #e2e8f0);
}
.stat-cell--last { border-right: none; }

.stat-cell__label {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
  font-weight: 500;
  font-family: 'Plus Jakarta Sans', sans-serif;
  white-space: nowrap;
}

.stat-cell__value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  transition: color 0.25s ease;
}

/* ── Valores con color semántico ───────────────────── */
.val--green { color: var(--green) !important; }
.val--red   { color: var(--red)   !important; }

/* ── Grid de cards ─────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0;
  align-content: start;
}

/* ── Cards ─────────────────────────────────────────── */
.card {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.card--wide { grid-column: 1 / -1; }

/* Tope de color por categoría */
.card__accent {
  height: 3px;
  flex-shrink: 0;
}
.card--cyan   .card__accent { background: var(--cyan); }
.card--indigo .card__accent { background: var(--indigo); }
.card--amber  .card__accent { background: var(--amber); }
.card--green  .card__accent { background: var(--green); }

.card__body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.card__head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 9px;
  border-bottom: 0.5px solid var(--surface-border, #e2e8f0);
}

.card__icon { font-size: 0.9rem; line-height: 1; }

.card__head h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
}

/* Filas de datos */
.card__rows {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-around;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 0.5px solid var(--surface-border, #e2e8f0);
  gap: 8px;
}
.row:last-child { border-bottom: none; }

.row span {
  font-size: 0.72rem;
  color: var(--text-secondary, #64748b);
  font-weight: 400;
  flex-shrink: 0;
}

.row b {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  text-align: right;
  max-width: 55%;
  word-break: break-word;
  transition: color 0.25s ease;
}

/* Observaciones */
.card__obs {
  font-size: 0.82rem;
  color: var(--text-secondary, #64748b);
  line-height: 1.65;
}

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 780px) {
  .perfil__header { flex-wrap: wrap; }
  .header__identity { border-right: none; padding-right: 0; }
  .header__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    border-top: 0.5px solid var(--surface-border, #e2e8f0);
    padding-top: 10px;
  }
  .stat-cell { padding: 4px 8px; }
  .stat-cell--last { border-right: none; }
  .stat-cell:nth-child(2) { border-right: none; }

  .cards-grid { grid-template-columns: 1fr; }
  .card--wide { grid-column: 1; }
}

@media (max-width: 480px) {
  .perfil__header { padding: 12px 14px; gap: 12px; }
  .avatar__img,
  .avatar__initials { width: 42px; height: 42px; border-radius: 10px; }
  .avatar__initials { font-size: 0.9rem; }
}
</style>