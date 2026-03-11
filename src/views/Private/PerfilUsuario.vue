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

          <!-- ── Panel izquierdo ── -->
          <aside class="panel-id">
            <div class="avatar">
              <img v-if="usuario.remador?.fotoUrl" :src="usuario.remador.fotoUrl" class="avatar__img" />
              <div v-else class="avatar__initials">{{ iniciales }}</div>
              <span class="avatar__dot" :class="usuario.activo ? 'dot--on' : 'dot--off'"></span>
            </div>

            <p class="id__nombre">{{ usuario.remador?.nombreCompleto ?? usuario.username }}</p>
            <p class="id__user">@{{ usuario.username }}</p>

            <div class="id__tags">
              <span class="tag tag--blue">{{ usuario.rol }}</span>
              <span v-if="usuario.remador" class="tag tag--purple">{{ usuario.remador.categoria }}</span>
            </div>

            <div class="id__stats">
              <div class="stat">
                <span class="stat__label">Estado</span>
                <span class="stat__val" :class="usuario.activo ? 'val--green' : 'val--red'">
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="stat">
                <span class="stat__label">Email</span>
                <span class="stat__val" :class="usuario.emailVerificado ? 'val--green' : 'val--red'">
                  {{ usuario.emailVerificado ? 'Verificado' : 'Sin verificar' }}
                </span>
              </div>
              <div class="stat">
                <span class="stat__label">Miembro desde</span>
                <span class="stat__val">{{ formatFecha(usuario.fechaCreacion) }}</span>
              </div>
              <div class="stat">
                <span class="stat__label">Último acceso</span>
                <span class="stat__val">{{ formatFechaHora(usuario.ultimoAcceso) }}</span>
              </div>
            </div>
          </aside>

          <!-- ── Panel derecho: cards ── -->
          <div class="panel-data" v-if="usuario.remador">
            <div class="grid">

              <div class="card">
                <div class="card__head">
                  <span class="card__icon">👤</span>
                  <h3>Datos personales</h3>
                </div>
                <div class="card__rows">
                  <div class="row"><span>RUT</span><b>{{ usuario.remador.rut }}</b></div>
                  <div class="row"><span>Nacimiento</span><b>{{ formatFechaSimple(usuario.remador.fechaNacimiento) }}</b></div>
                  <div class="row"><span>Género</span><b>{{ usuario.remador.genero === 'M' ? 'Masculino' : 'Femenino' }}</b></div>
                  <div class="row"><span>Ingreso al club</span><b>{{ formatFechaSimple(usuario.remador.fechaIngreso) }}</b></div>
                </div>
              </div>

              <div class="card">
                <div class="card__head">
                  <span class="card__icon">📞</span>
                  <h3>Contacto</h3>
                </div>
                <div class="card__rows">
                  <div class="row"><span>Email</span><b>{{ usuario.remador.email }}</b></div>
                  <div class="row"><span>Teléfono</span><b>{{ usuario.remador.telefono ?? '—' }}</b></div>
                  <div class="row"><span>Dirección</span><b>{{ usuario.remador.direccion ?? '—' }}</b></div>
                </div>
              </div>

              <div class="card">
                <div class="card__head">
                  <span class="card__icon">🚨</span>
                  <h3>Emergencia</h3>
                </div>
                <div class="card__rows">
                  <div class="row"><span>Contacto</span><b>{{ usuario.remador.nombreContactoEmergencia ?? '—' }}</b></div>
                  <div class="row"><span>Teléfono</span><b>{{ usuario.remador.telefonoEmergencia ?? '—' }}</b></div>
                </div>
              </div>

              <div class="card">
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
                    <b>{{ usuario.remador.certMedicaVence ? formatFechaSimple(usuario.remador.certMedicaVence) : '—' }}</b>
                  </div>
                </div>
              </div>

              <div class="card card--wide" v-if="usuario.remador.observaciones">
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
      return new Date(iso).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const formatFechaHora = (iso) => {
      if (!iso) return '—'
      return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
    }
    const formatFechaSimple = (val) => {
      if (!val) return '—'
      const [y, m, d] = val.toString().substring(0, 10).split('-')
      return `${d}/${m}/${y}`
    }

    return { usuario, cargando, error, iniciales, formatFecha, formatFechaHora, formatFechaSimple }
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.perfil {
  font-family: 'Plus Jakarta Sans', sans-serif;
  height: 100%;
  width: 100%;
  display: flex;
  background: #f0f2f5;
  overflow: hidden;
}

/* ── Estados ─────────────────────────────────── */
.perfil__estado {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  color: #6b7280;
  font-size: 0.9rem;
}
.perfil__estado--error { color: #ef4444; }

.spinner {
  width: 28px; height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Layout ──────────────────────────────────── */
.perfil__inner {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 16px;
  padding: 20px;
}

/* ── Panel izquierdo ─────────────────────────── */
.panel-id {
  width: 230px;
  min-width: 230px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e9f0;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* Avatar */
.avatar {
  position: relative;
  margin-bottom: 14px;
}
.avatar__img,
.avatar__initials {
  width: 80px; height: 80px;
  border-radius: 50%;
}
.avatar__img { object-fit: cover; border: 3px solid #e5e9f0; }
.avatar__initials {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  border: 3px solid #e5e9f0;
}
.avatar__dot {
  position: absolute;
  bottom: 3px; right: 3px;
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 2.5px solid #fff;
}
.dot--on  { background: #22c55e; }
.dot--off { background: #f87171; }

.id__nombre {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 3px;
}
.id__user {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 12px;
}

.id__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  margin-bottom: 20px;
}
.tag {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 20px;
}
.tag--blue   { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.tag--purple { background: #faf5ff; color: #7c3aed; border: 1px solid #ddd6fe; }

.id__stats {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e9f0;
}
.stat__label {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}
.stat__val {
  font-size: 0.73rem;
  font-weight: 600;
  color: #374151;
}
.val--green { color: #16a34a; }
.val--red   { color: #dc2626; }

/* ── Panel derecho ───────────────────────────── */
.panel-data {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 1fr;
  gap: 14px;
  height: 100%;
}

/* ── Cards ───────────────────────────────────── */
.card {
  background: #fff;
  border: 1px solid #e5e9f0;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 0.18s, border-color 0.18s;
}
.card:hover {
  box-shadow: 0 4px 16px rgba(59,130,246,0.1);
  border-color: #bfdbfe;
}
.card--wide { grid-column: 1 / -1; }

.card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}
.card__icon { font-size: 1rem; }
.card__head h3 {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: #6b7280;
}

.card__rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  justify-content: space-around;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #f8fafc;
}
.row:last-child { border-bottom: none; }

.row span {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}
.row b {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
  max-width: 55%;
  word-break: break-word;
}

.card__obs {
  font-size: 0.82rem;
  color: #6b7280;
  line-height: 1.6;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 860px) {
  .perfil__inner    { flex-direction: column; overflow-y: auto; padding: 14px; }
  .panel-id         { width: 100%; min-width: unset; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 16px; padding: 16px; }
  .avatar           { margin-bottom: 0; }
  .id__nombre,
  .id__user,
  .id__tags         { text-align: left; }
  .id__stats        { flex-direction: row; flex-wrap: wrap; }
  .stat             { flex: 1 1 130px; }
  .grid             { grid-template-columns: 1fr; grid-auto-rows: auto; }
}

@media (max-width: 500px) {
  .grid { grid-template-columns: 1fr; }
  .id__stats { flex-direction: column; }
}
</style>