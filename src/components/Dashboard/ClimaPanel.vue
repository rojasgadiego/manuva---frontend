<template>
  <div class="clima-panel">

          <!-- Skeleton de carga -->
          <div v-if="climaCargando" class="weather-grid weather-skeleton">
            <div class="days-card">
              <div class="day-col" v-for="i in 6" :key="i">
                <div class="sk sk--label"></div>
                <div class="sk sk--day"></div>
                <div class="sk sk--icon"></div>
                <div class="sk-temps">
                  <div class="sk sk--temp"></div>
                  <div class="sk sk--temp-min"></div>
                </div>
              </div>
            </div>
            <div class="weather-cells">
              <div class="wcell" v-for="i in 3" :key="i">
                <div class="sk sk--cell-label"></div>
                <div class="sk sk--cell-value"></div>
                <div class="sk sk--cell-sub"></div>
                <div v-if="i === 1" class="sk sk--cell-bar"></div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="climaError" class="clima-estado clima-estado--error">
            <span class="clima-estado__text">No se pudo cargar el clima.</span>
            <button class="clima-estado__retry" @click="cargarClima">Reintentar</button>
          </div>

          <!-- Datos cargados -->
          <div v-else-if="diaActual" class="weather-grid weather-grid--loaded">

            <!-- Días seleccionables -->
            <div class="days-card">
              <button
                v-for="(dia, i) in forecast"
                :key="i"
                type="button"
                class="day-col"
                :class="{ active: diaSeleccionado === i }"
                :aria-pressed="diaSeleccionado === i"
                :aria-label="`${dia.label} ${dia.dia}: ${dia.desc}, máxima ${dia.tempMax} grados, mar ${dia.mar.apto ? 'apto' : 'no apto'}`"
                @click="diaSeleccionado = i"
              >
                <span class="day-col__label">{{ dia.label }}</span>
                <span class="day-col__dia">{{ dia.dia }}</span>
                <span class="day-col__icon">{{ dia.icono }}</span>
                <div class="day-col__temps">
                  <span class="day-col__max">{{ dia.tempMax }}°</span>
                  <span class="day-col__min">{{ dia.tempMin }}°</span>
                </div>
              </button>
            </div>

            <!-- Celdas de condición del día seleccionado -->
            <div class="weather-cells">
              <div class="wcell">
                <span class="wcell__label">Oleaje</span>
                <span class="wcell__value">{{ diaActual.mar.oleaje }} m</span>
                <span class="wcell__sub">{{ diaActual.mar.descripcion }} · Dir. {{ diaActual.mar.direccion }}</span>
                <div class="tide-bar">
                  <div class="tide-bar__fill" :style="{ width: diaActual.mar.barPorcentaje + '%' }"></div>
                </div>
              </div>
              <div class="wcell">
                <span class="wcell__label">Viento</span>
                <span class="wcell__value">{{ diaActual.viento.direccion }} · {{ diaActual.viento.velocidad }} km/h</span>
                <span class="wcell__sub">Ráfagas hasta {{ diaActual.viento.rafagas }} km/h</span>
              </div>
              <div class="wcell">
                <span class="wcell__label">Estado del mar</span>
                <span class="wcell__value" :class="diaActual.mar.apto ? 'val--green' : 'val--red'">
                  {{ diaActual.mar.apto ? 'Apto' : 'No apto' }}
                </span>
                <span class="wcell__sub">Oleaje {{ diaActual.mar.oleaje }} m · {{ diaActual.mar.descripcion }}</span>
              </div>
            </div>

          </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { cargarPronostico } from '@/utils/clima'

/** Pronóstico de 6 días (Open-Meteo) con oleaje, viento y si el mar está apto. */
export default {
  name: 'ClimaPanel',

  setup() {
    const diaSeleccionado = ref(0)
    const forecast        = ref([])
    const climaCargando   = ref(true)
    const climaError      = ref(false)

    const cargarClima = async () => {
      climaCargando.value = true
      climaError.value    = false
      try {
        forecast.value = (await cargarPronostico()).slice(0, 6)
      } catch (e) {
        climaError.value = true
      } finally {
        climaCargando.value = false
      }
    }

    const diaActual = computed(() => forecast.value[diaSeleccionado.value] ?? null)

    onMounted(cargarClima)

    return { forecast, diaSeleccionado, diaActual, climaCargando, climaError, cargarClima }
  },
}
</script>

<style scoped>
.clima-panel {
  --cyan:  var(--ui-cyan);
  --green: var(--ui-green);
  --red:   var(--ui-red);
  --amber: var(--ui-amber);
}

/* Los días son <button>: anular estilos del navegador */
button.day-col {
  font: inherit;
  color: inherit;
  background: none;
  border-top: none;
  border-bottom: none;
  border-left: none;
}
button.day-col:focus-visible { outline: 2px solid var(--ui-cyan); outline-offset: -2px; }

/* ── Clima ────────────────────────────────────── */
.weather-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* ─── Skeleton shimmer ──────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}

.sk {
  border-radius: 5px;
  background: linear-gradient(
    90deg,
    var(--content-bg, #f1f5f9) 25%,
    var(--surface-bg, #ffffff) 50%,
    var(--content-bg, #f1f5f9) 75%
  );
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
  flex-shrink: 0;
}

/* Tamaños de los bloques skeleton */
.sk--label     { width: 28px;  height: 10px; }
.sk--day       { width: 22px;  height: 28px; border-radius: 5px; }
.sk--icon      { width: 24px;  height: 24px; border-radius: 50%; }
.sk--temp      { width: 20px;  height: 12px; }
.sk--temp-min  { width: 14px;  height: 12px; opacity: 0.6; }

.sk--cell-label { width: 50px;  height: 10px; }
.sk--cell-value { width: 110px; height: 16px; margin-top: 2px; }
.sk--cell-sub   { width: 140px; height: 10px; opacity: 0.7; }
.sk--cell-bar   { width: 100%;  height: 4px;  border-radius: 2px; margin-top: 4px; }

/* Contenedor de temperaturas en skeleton */
.sk-temps {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* El skeleton reutiliza las mismas clases days-card / day-col / weather-cells / wcell
   del estado cargado, pero los hijos son bloques .sk en lugar de texto */
.weather-skeleton .day-col {
  cursor: default;
  pointer-events: none;
}

.weather-skeleton .wcell {
  min-height: 68px;
}

/* ─── Fade-in al aparecer los datos reales ─────── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.weather-grid--loaded {
  animation: fadeInUp 0.4s ease both;
}

/* ─────────────────────────────────────────────── */

.days-card {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.day-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 6px;
  cursor: pointer;
  border-right: 0.5px solid var(--surface-border, #e2e8f0);
  border-bottom: 3px solid transparent;
  user-select: none;
}
.day-col:last-child { border-right: none; }
.day-col:hover { background: var(--content-bg, #f8fafc); }
.day-col.active {
  background: #fdf6ec;
  border-bottom-color: #d4922a;
}

.day-col__label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
}
.day-col.active .day-col__label { color: #92622a; }

.day-col__dia {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-primary, #0f172a);
}
.day-col.active .day-col__dia { color: #7a4f1e; }

.day-col__icon { font-size: 18px; line-height: 1; }

.day-col__temps { display: flex; align-items: baseline; gap: 4px; }

.day-col__max {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}
.day-col.active .day-col__max { color: #7a4f1e; }

.day-col__min { font-size: 0.7rem; color: var(--text-secondary, #64748b); }

/* Celdas de condición */
.weather-cells {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wcell {
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  justify-content: center;
}

.wcell__label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary, #64748b);
}

.wcell__value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  margin-top: 2px;
}

.wcell__sub { font-size: 0.68rem; color: var(--text-secondary, #64748b); }

.val--green { color: var(--green) !important; }
.val--red   { color: var(--red)   !important; }

/* Estado error */
.clima-estado {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: var(--surface-bg, #ffffff);
  border: 0.5px solid var(--surface-border, #e2e8f0);
  border-radius: 10px;
}
.clima-estado--error { border-color: var(--red, #ef4444); }
.clima-estado__text  { font-size: 0.8rem; color: var(--text-secondary, #64748b); }
.clima-estado__retry {
  background: none;
  border: 0.5px solid var(--cyan, #38bdf8);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cyan, #38bdf8);
  cursor: pointer;
}

/* Barra de marea */
.tide-bar {
  height: 4px;
  background: var(--surface-border, #e2e8f0);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}
.tide-bar__fill {
  height: 100%;
  border-radius: 2px;
  background: var(--cyan);
  transition: width 0.6s ease;
}


@media (max-width: 860px) {
  .weather-grid { grid-template-columns: 1fr; }
}
</style>
